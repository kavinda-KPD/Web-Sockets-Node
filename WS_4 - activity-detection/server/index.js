import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(8080, () => {
  console.log("Server running on port 8080");
});

const io = new Server(expressServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected ===> ", socket.id);

  // upon connection only to user
  socket.emit("message", `${socket.id} welcome to the server`);

  //upon connection to all users
  socket.broadcast.emit("message", `${socket.id} joined the server`);

  //Listen for messages coming from the client
  socket.on("message", (message) => {
    //send to all the users in the room including the sender
    io.emit("message", `${message} from server & ${socket.id}`);

    //send to all the users in the room excluding the sender
    socket.broadcast.emit(
      "message",
      `===> ${message} from server & ${socket.id}`
    );
  });

  // upon disconnection
  socket.on("disconnect", () => {
    //send to all the users in the room excluding the sender
    socket.broadcast.emit("message", `${socket.id} left the server`);
  });

  // listen for activity coming from the client and broadcast to all
  socket.on("activity", (name) => {
    socket.broadcast.emit("activity", name);
  });
});
