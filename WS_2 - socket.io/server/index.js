const ws = require("ws");
const server = new ws.Server({ port: 8080 });

server.on("connection", (socket) => {
  console.log("Client connected");

  socket.on("message", (message) => {
    const b = Buffer.from(message, "base64");
    console.log(b.toString());

    socket.send(`${message} from server`);
  });
});
