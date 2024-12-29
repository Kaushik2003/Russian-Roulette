require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());

mongoose
  .connect(`${process.env.MONGO_URI}`, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

// Routes
const authRoutes = require("./routes/auth");
const gameRoutes = require("./routes/game");
app.use("/api/auth", authRoutes);
app.use("/api/game", gameRoutes);

// Socket.io Configuration
// io.on('connection', (socket) => {
//   console.log('New client connected');

//   socket.on('joinGame', (gameId) => {
//     socket.join(gameId);
//   });

//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Existing game tracking
const gameWaitingRoom = {};

io.on("connection", (socket) => {
  console.log("New client connected");

  // Game creation event
  socket.on("createGame", (gameData) => {
    const { gameId, hostPlayer } = gameData;

    // Store game in waiting room
    gameWaitingRoom[gameId] = {
      hostPlayer,
      waitingSocket: socket.id,
    };

    // Broadcast game creation
    socket.emit("gameCreated", { gameId });
  });

  // Join game event
  socket.on("joinGame", (gameData) => {
    const { gameId, joiningPlayer } = gameData;
    const waitingGame = gameWaitingRoom[gameId];

    if (waitingGame) {
      // Notify host that a player joined
      io.to(waitingGame.waitingSocket).emit("playerJoined", {
        joinedPlayer: joiningPlayer,
      });

      // Remove game from waiting room
      delete gameWaitingRoom[gameId];
    }
  });

  socket.on("disconnect", () => {
    // Clean up any waiting games
    Object.keys(gameWaitingRoom).forEach((gameId) => {
      if (gameWaitingRoom[gameId].waitingSocket === socket.id) {
        delete gameWaitingRoom[gameId];
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
