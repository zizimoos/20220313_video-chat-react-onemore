import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

io.on("connection", (socket) => {
  console.log("someone connected", socket.id);

  socket.on("join_room", (roomName, wellcomMessage) => {
    console.log(`${socket.id} joined`, roomName);
    socket.join(roomName);
    wellcomMessage();
    socket.to(roomName).emit("welcome", socket.id);
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });

  socket.on("disconnection", () => {});
  socket.on("disconnect", () => {
    console.log("disconnected");
  });
});

server.listen(process.env.PORT || 3003, () => {
  console.log("✅  Server is running on port 3003");
});
