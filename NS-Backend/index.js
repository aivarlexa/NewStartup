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
const Notification = require("./models/Notification");

const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const clientRoutes = require("./routes/clientRoutes");
const developerRoutes = require("./routes/developerRoutes");
const messageRoutes = require("./routes/messageRoutes");
const adminRoutes = require("./routes/adminRoutes");

const errorHandler = require("./middleware/errorHandler");
const { getClientOrigin } = require("./config/env");
const { requireAuth } = require("./middleware/authMiddleware");

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

// 1. GLOBAL MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

// 2. INLINE API ENDPOINTS
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

// 3. FEATURE ROUTERS (Cleaned & Mounted at Correct Singular Paths)
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/client", clientRoutes);     // 👑 FIXED: Singular /api/client matches frontend calls perfectly!
app.use("/api/developer", developerRoutes);
app.use("/api/messages", messageRoutes); 
app.use("/api/admin", adminRoutes);

// 4. ERROR HANDLER MIDDLEWARE
app.use(errorHandler);

// =========================================================================
//  ⚡ WEB SOCKET LAYER WITH ROOM & NOTIFICATION SUPPORT
// =========================================================================

const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });
const activeDevelopers = new Set();
const activeClients = new Set();

function broadcastOnlineStatus(ioInstance) {
  ioInstance.emit("developers:count_update", activeDevelopers.size);
  ioInstance.emit("developers:online_list", [
    ...Array.from(activeDevelopers),
    ...Array.from(activeClients)
  ]);
}

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required."));
    }
    
    if (token === "demo-token" && process.env.NODE_ENV !== "production") {
      socket.user = { id: "demo-developer", name: "Demo User", role: "Developer" };
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userIdToFind = decoded.userId || decoded.id;
    
    if (!userIdToFind) {
      return next(new Error("Invalid token payload structure."));
    }

    const user = await User.findById(userIdToFind).select("name role");
    if (!user) {
      return next(new Error("User not found."));
    }
    
    socket.user = { id: String(user._id), name: user.name, role: user.role };
    next();
  } catch (error) {
    next(new Error("Invalid or expired token."));
  }
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

  if (socket.user.role === "Developer") {
    activeDevelopers.add(socket.user.id);
  } else if (socket.user.role === "Client") {
    activeClients.add(socket.user.id);
  }

  broadcastOnlineStatus(io);

  // Join Personal User Notification Room
  socket.join(`user:${socket.user.id}`);

  // Automatically Join Role-Based Room (e.g., "role:Admin", "role:Developer")
  if (socket.user.role) {
    socket.join(`role:${socket.user.role}`);
  }

  // 👑 FIXED: Listen for explicit room join requests (e.g. Admin Notifications Room)
  socket.on("room:join", (roomName) => {
    if (roomName) {
      socket.join(roomName);
    }
  });

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

      // 1. Broadcast to active chat room
      io.to(`conversation:${conversationKey}`).emit("message:new", populatedMessage);

      // 2. Broadcast to recipient user room
      const recipientId = socket.user.role === "Client" ? developer : client;
      if (recipientId) {
        io.to(`user:${recipientId}`).emit("message:new", populatedMessage);
      }

      // 3. Broadcast to Admin role room if sent to Admin
      if (socket.user.role !== "Admin") {
        io.to("role:Admin").emit("message:new", populatedMessage);
      }
      
    } catch (error) {
      console.error("Failed to process message:", error.message);
      socket.emit("message:error", { error: "Message could not be saved." });
    }
  });

  socket.on("disconnect", () => {
    if (socket.user.role === "Developer") {
      const matchingSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.user?.id === socket.user.id
      );
      if (matchingSockets.length === 0) activeDevelopers.delete(socket.user.id);
    } else if (socket.user.role === "Client") {
      const matchingSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.user?.id === socket.user.id
      );
      if (matchingSockets.length === 0) activeClients.delete(socket.user.id);
    }

    broadcastOnlineStatus(io);
    console.log(`User disconnected: ${socket.user.name}`);
  });
});

app.set("io", io);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});