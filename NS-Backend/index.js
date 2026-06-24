const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const contactRoutes = require("./routes/contactRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT;

const connectDB = require("./config/db");

connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("HI");
});

app.use("/api/contact", contactRoutes);

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});