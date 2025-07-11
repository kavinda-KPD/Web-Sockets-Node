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

  socket.on("message", (message) => {
    console.log(message);
    io.emit("message", `${message} from server & ${socket.id}`);
  });
});
