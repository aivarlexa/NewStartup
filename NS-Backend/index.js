const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("./models/user");
const Message = require("./models/Message"); 
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const clientRoutes = require("./routes/clientRoutes");
const developerRoutes = require("./routes/developerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const errorHandler = require("./middleware/errorHandler");
const { getClientOrigin } = require("./config/env");
const Notification = require("./models/Notification");
const {  requireAuth, requireRole } = require("./middleware/authMiddleware");
const adminRoutes = require("./routes/adminRoutes");


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const connectDB = require("./config/db");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is not set.");
  process.exit(1);
}

connectDB().catch((error) => {
  console.error(`Database unavailable: ${error.message}`);
});

const allowedOrigins = getClientOrigin();
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// 1. GLOBAL MIDDLEWARES FIRST
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// 2. GLOBAL INLINE API ENTRANCES
app.get("/api/notifications", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});



// NEW: Role-Agnostic Profile Sync Route (Resolves Cross-Role 403 Crashes)
app.get("/api/profile/me", requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    res.json({ success: true, profile: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error resolving identity context." });
  }
});

app.get("/", (req, res) => {
  res.send("HI");
});

// 3. FEATURE ROUTER ROUTING MODULES
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/developer", developerRoutes);
app.use("/api/messages", messageRoutes); 
app.use("/api/admin", adminRoutes);

// 4. ERROR LOGGER LEAVES LAST
app.use(errorHandler);

// WEB SOCKET LAYER
const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });
const activeDevelopers = new Set();
const activeClients = new Set(); // 👈 Track online clients securely

// FIX: Combined broadcast engine maps all online footprints to the same event channel matrix
function broadcastOnlineStatus(ioInstance) {
  ioInstance.emit("developers:count_update", activeDevelopers.size);
  ioInstance.emit("developers:online_list", [
    ...Array.from(activeDevelopers),
    ...Array.from(activeClients) // 👈 Emit all online developer and client IDs together
  ]);
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.warn("[Socket Auth] Connection blocked: No token attached.");
      return next(new Error("Authentication required."));
    }
    
    if (token === "demo-token" && process.env.NODE_ENV !== "production") {
      socket.user = { id: "demo-developer", name: "Demo User", role: "Developer" };
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIdToFind = decoded.userId || decoded.id;
    
    if (!userIdToFind) {
      console.error("[Socket Auth] Token payload missing structural keys:", decoded);
      return next(new Error("Invalid token payload structure."));
    }

    const user = await User.findById(userIdToFind).select("name role");
    if (!user) {
      console.warn(`[Socket Auth] Database mismatch: No user found with ID ${userIdToFind}`);
      return next(new Error("User not found."));
    }
    
    socket.user = { id: String(user._id), name: user.name, role: user.role };
    next();
  } catch (error) {
    console.error(`[Socket Auth] JWT Verification Failure: ${error.message}`);
    next(new Error("Invalid or expired token."));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

  // FIX: Route identity records to their accurate global tracking arrays
  if (socket.user.role === "Developer") {
    activeDevelopers.add(socket.user.id);
  } else if (socket.user.role === "Client") {
    activeClients.add(socket.user.id); // 👈 Track online clients
  }

  // Push immediate synchronization broadcast
  broadcastOnlineStatus(io);

  // Join self personal notification room pipeline channel
  socket.join(`user:${socket.user.id}`);

  socket.on("conversation:join", (conversationKey) => {
    if (conversationKey) {
      socket.join(`conversation:${conversationKey}`);
    }
  });

  socket.on("typing:start", (conversationKey) => {
    socket.to(`conversation:${conversationKey}`).emit("typing:start", { user: socket.user });
  });

  socket.on("typing:stop", (conversationKey) => {
    socket.to(`conversation:${conversationKey}`).emit("typing:stop", { user: socket.user });
  });

  socket.on("message:new", async ({ conversationKey, text, client, developer, attachments }) => {
    if (!conversationKey || (!text && !attachments?.length)) return;

    try {
      const newMessage = new Message({
        conversationKey,
        client: client || null,
        developer: developer || null,
        sender: socket.user.id, 
        text: text || "",
        attachments: attachments || [],
        seenBy: [socket.user.id] 
      });

      await newMessage.save();

      const populatedMessage = await Message.findById(newMessage._id)
        .populate("sender", "name role");

      // 1. Emit to active chat room window view channel
      io.to(`conversation:${conversationKey}`).emit("message:new", populatedMessage);

      // 2. WHATSAPP BACKGROUND NOTIFICATION BADGE PUMP:
      const recipientId = socket.user.role === "Client" ? developer : client;
      if (recipientId) {
        io.to(`user:${recipientId}`).emit("message:new", populatedMessage);
      }
      
    } catch (error) {
      console.error("Failed to process message:", error.message);
      socket.emit("message:error", { error: "Message could not be saved." });
    }
  });

  socket.on("disconnect", () => {
    // FIX: Symmetrical teardown of active developer and client connections on socket drop
    if (socket.user.role === "Developer") {
      const matchingSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.user?.id === socket.user.id
      );
      
      if (matchingSockets.length === 0) {
        activeDevelopers.delete(socket.user.id);
      }
    } else if (socket.user.role === "Client") {
      const matchingSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.user?.id === socket.user.id
      );
      
      if (matchingSockets.length === 0) {
        activeClients.delete(socket.user.id); // 👈 Remove client on true disconnect
      }
    }

    // Refresh active status indicators down to the layout templates
    broadcastOnlineStatus(io);
    console.log(`User disconnected: ${socket.user.name}`);
  });
});

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});