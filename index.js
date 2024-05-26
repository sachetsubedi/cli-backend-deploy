import cors from "cors";
import express from "express";
import { Server } from "socket.io";
import generateRandomRoomName from "./src/scripts/randomRoomGenerator.js";

const app = express();

// Set up CORS options
const corsOptions = {
  origin: "https://cli.sachetsubedi001.com.np",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Apply CORS middleware with the options
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Response");
});

const httpServer = app.listen(3000, () => {
  console.log("Server running at 3000");
});

const io = new Server(httpServer, {
  cors: {
    origin: "https://cli.sachetsubedi001.com.np",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  const defaultNames = [
    "Anonymous Monkey",
    "Captain Quirk",
    "Luna Stardust",
    "Sunny Sideup",
    "Pixel Pajamas",
    "Whispering Willow",
    "Captain Noodle",
    "Mystic Muffin",
    "Jazzberry Jam",
    "Dizzy Dinosaur",
    "Cheesequake Cactus",
    "Moonlight Marmalade",
    "Sir Snugglekins",
    "Chuckleberry Finn",
    "Bubbles McFluff",
    "Doodlebug Daffodil",
    "Spaghetti Supernova",
    "Giggles McGee",
    "Scribble Scribble",
    "Twinkle Toes",
  ];

  let userName;
  let roomId = "master";
  socket.join(roomId);

  socket.on("joinRoom", (currentRoom, room) => {
    socket.broadcast.to(currentRoom).emit("leftCustomRoom", userName);
    socket.leave(currentRoom);
    socket.join(room);
    socket.emit("roomJoined", room);
    socket.broadcast.to(room).emit("join", userName);
    roomId = room;
  });

  socket.on("createRoom", (currentRoom) => {
    const room = generateRandomRoomName();
    socket.broadcast.to(currentRoom).emit("leftCustomRoom", userName);
    socket.leave(currentRoom);
    socket.join(room);
    socket.emit("roomCreated", room);
    socket.emit("roomJoined", room);
    roomId = room;
  });

  socket.on("createConnection", (name) => {
    userName =
      name != null
        ? name
        : defaultNames[Math.floor(Math.random() * defaultNames.length)];
    socket.broadcast.to(roomId).emit("connected", userName);
    socket.emit("connectionSuccess", userName);
  });

  socket.on("message", (mess) => {
    console.log(mess);
    io.to(roomId).emit("message", { userName, message: mess });
  });

  socket.on("rename", (newUserName) => {
    const oldUsername = userName;
    userName = newUserName;
    socket.broadcast.to(roomId).emit("rename", { oldUsername, userName });
    socket.emit("renamed", { oldUsername, userName });
  });

  socket.on("disconnect", () => {
    socket.broadcast.to(roomId).emit("disconnected", userName);
  });
});
