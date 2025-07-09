import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected ===> ", socket.id);

  socket.on("message", (message) => {
    console.log(message);
    io.emit("message", `${message} from server & ${socket.id}`);
  });
});

httpServer.listen(8080, () => {
  console.log("Server running on port 8080");
});
