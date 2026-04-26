const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");

dotenv.config();

const app = express();

// DB
connectDB();

// middleware
app.use(cors({
  origin: [
    "*"
  ],
  credentials: true
}));
app.use(express.json());

// routes
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/auctions", require("./src/routes/auctionRoutes"));
app.use("/api/bids", require("./src/routes/bidRoutes"));
app.use("/api/activity", require("./src/routes/activityRoutes"));

app.get("/", (req, res) => {
  res.send("API Running");
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// make io global
app.set("io", io);

// socket connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});