const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const User = require("./models/user");
const contactRoutes = require("./routes/contactRoutes");
const authRoutes = require("./routes/authRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const clientRoutes = require("./routes/clientRoutes");
const developerRoutes = require("./routes/developerRoutes");
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

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication required."));
    if (token === "demo-token" && process.env.NODE_ENV !== "production") {
      socket.user = { id: "demo-developer", name: "Demo User", role: "Developer" };
      return next();
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("name role");
    if (!user) return next(new Error("User not found."));
    socket.user = { id: String(user._id), name: user.name, role: user.role };
    next();
  } catch (error) {
    next(new Error("Invalid or expired token."));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.user.id}`);

  socket.on("conversation:join", (conversationKey) => {
    if (conversationKey) socket.join(`conversation:${conversationKey}`);
  });

  socket.on("typing:start", (conversationKey) => {
    socket.to(`conversation:${conversationKey}`).emit("typing:start", { user: socket.user });
  });

  socket.on("typing:stop", (conversationKey) => {
    socket.to(`conversation:${conversationKey}`).emit("typing:stop", { user: socket.user });
  });

  socket.on("message:new", ({ conversationKey, message }) => {
    if (conversationKey && message) io.to(`conversation:${conversationKey}`).emit("message:new", message);
  });
});

app.set("io", io);

app.get("/", (req, res) => {
  res.send("HI");
});

app.use("/api/contact", contactRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/developer", developerRoutes);

app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
