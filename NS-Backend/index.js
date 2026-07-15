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

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });

// Track unique online developers globally
const activeDevelopers = new Set();

function broadcastDeveloperCount(ioInstance) {
  ioInstance.emit("developers:count_update", activeDevelopers.size);
}

// Socket authentication middleware
// Socket authentication middleware
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
    
    // CATCH-ALL: Check decoded.userId OR decoded.id to match your controller payload
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

// SINGLE io.on("connection") block handling all events cleanly
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user.name} (${socket.user.role})`);

  // 1. Manage Developer Availability Count
  if (socket.user.role === "Developer") {
    activeDevelopers.add(socket.user.id);
    broadcastDeveloperCount(io);
  }

  // Send initial count immediately to the connected client
  socket.emit("developers:count_update", activeDevelopers.size);

  // 2. Room Join Management
  socket.join(`user:${socket.user.id}`);

  socket.on("conversation:join", (conversationKey) => {
    if (conversationKey) {
      socket.join(`conversation:${conversationKey}`);
    }
  });

  // 3. Typing Status Broadcasting
  socket.on("typing:start", (conversationKey) => {
    socket.to(`conversation:${conversationKey}`).emit("typing:start", { user: socket.user });
  });

  socket.on("typing:stop", (conversationKey) => {
    socket.to(`conversation:${conversationKey}`).emit("typing:stop", { user: socket.user });
  });

  // 4. Real-Time Messaging & MongoDB Persistence
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

      io.to(`conversation:${conversationKey}`).emit("message:new", populatedMessage);
    } catch (error) {
      console.error("Failed to process message:", error.message);
      socket.emit("message:error", { error: "Message could not be saved." });
    }
  });

  // 5. Clean Disconnect Handling
  socket.on("disconnect", () => {
    if (socket.user.role === "Developer") {
      const matchingSockets = Array.from(io.sockets.sockets.values()).filter(
        (s) => s.user?.id === socket.user.id
      );
      
      if (matchingSockets.length === 0) {
        activeDevelopers.delete(socket.user.id);
        broadcastDeveloperCount(io);
      }
    }
    console.log(`User disconnected: ${socket.user.name}`);
  });
});

app.set("io", io);

app.get("/", (req, res) => {
  res.send("HI");
});

// API Routes
app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/developer", developerRoutes);
app.use("/api/messages", messageRoutes); 

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});