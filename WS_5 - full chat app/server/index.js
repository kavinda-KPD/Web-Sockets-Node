import express from "express";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ADMIN = "admin";

const app = express();

app.use(express.static(path.join(__dirname, "public")));

const expressServer = app.listen(8080, () => {
  console.log("Server running on port 8080");
});

//state
const UsersState = {
  users: [],
  setUsers: (newUsersArray) => {
    UsersState.users = newUsersArray;
  },
};

const io = new Server(expressServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("Client connected ===> ", socket.id);

  // upon connection only to user
  socket.emit("message", buildMsg(ADMIN, `welcome to the server`));

  socket.on("enterRoom", ({ name, room }) => {
    //leave previous room if user already in one
    const previousRoom = getUser(socket.id)?.room;

    if (previousRoom) {
      socket.leave(previousRoom);
      io.to(previousRoom).emit(
        "message",
        buildMsg(ADMIN, `${name} left the room`)
      );
    }

    const user = activateUser(socket.id, name, room);

    //cannot update previous room list until after the state update in activate user
    if (previousRoom) {
      io.to(previousRoom).emit("userList", {
        users: getRoomUsers(previousRoom),
      });
    }

    //join new room
    socket.join(user.room);

    // to user who joined
    socket.emit(
      "message",
      buildMsg(ADMIN, `welcome to ${user.room} chat room`)
    );

    // to all users in the room
    socket.broadcast
      .to(user.room)
      .emit("message", buildMsg(ADMIN, `${name} joined the room`));

    //update user list
    io.to(user.room).emit("userList", {
      users: getRoomUsers(user.room),
    });

    //update room list
    io.emit("roomList", {
      rooms: getAllActiveRooms(),
    });
  });

  //when user disconnects - to all others
  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    usersLeavesApp(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        buildMsg(ADMIN, `${user.name} left the room`)
      );

      io.to(user.room).emit("userList", {
        users: getRoomUsers(user.room),
      });

      io.emit("roomList", {
        rooms: getAllActiveRooms(),
      });

      console.log("user", user);
      socket.broadcast.emit(
        "message",
        buildMsg(ADMIN, `${user.name} left the room`)
      );
      console.log(`${socket.id} disconnected`);
    }
  });

  //Listen for messages coming from the client
  socket.on("message", ({ name, text }) => {
    const room = getUser(socket.id)?.room;

    if (room) {
      io.to(room).emit("message", buildMsg(name, text));
    }
  });

  // listen for activity coming from the client and broadcast to all
  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;

    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", { timeStyle: "short" }).format(
      new Date()
    ),
  };
}

function activateUser(id, name, room) {
  const user = { id, name, room };

  UsersState.setUsers([...UsersState.users.filter((u) => u.id !== id), user]);

  return user;
}

function usersLeavesApp(id) {
  UsersState.setUsers(UsersState.users.filter((u) => u.id !== id));
}

function getUser(id) {
  return UsersState.users.find((u) => u.id === id);
}

function getRoomUsers(room) {
  return UsersState.users.filter((u) => u.room === room);
}

function getAllActiveRooms() {
  return [...new Set(UsersState.users.map((u) => u.room))];
}
