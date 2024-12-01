// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // In-memory data storage for simplicity
// let games = {};

// // Utility function to generate a random revolver state
// const generateRevolver = (chambers = 6) => {
//   const revolver = Array(chambers).fill(false);
//   revolver[Math.floor(Math.random() * chambers)] = true;
//   return revolver;
// };

// // Route to create a new game
// app.post('/api/game/create', (req, res) => {
//   const { player } = req.body;
//   if (!player) {
//     return res.status(400).json({ error: 'Player name is required.' });
//   }

//   const gameId = `game_${Date.now()}`;
//   games[gameId] = {
//     players: [player],
//     currentTurn: 0,
//     revolver: generateRevolver(),
//     active: true,
//   };

//   res.status(201).json({ gameId, message: 'Game created successfully!' });
// });

// // Route to join an existing game
// app.post('/api/game/join', (req, res) => {
//   const { gameId, player } = req.body;
//   if (!gameId || !player) {
//     return res.status(400).json({ error: 'Game ID and player name are required.' });
//   }

//   const game = games[gameId];
//   if (!game) {
//     return res.status(404).json({ error: 'Game not found.' });
//   }

//   if (!game.active) {
//     return res.status(400).json({ error: 'Game is no longer active.' });
//   }

//   game.players.push(player);
//   res.status(200).json({ message: 'Joined game successfully!' });
// });

// // Route to play a turn (spin and pull trigger)
// app.post('/api/game/play', (req, res) => {
//   const { gameId, player } = req.body;
//   if (!gameId || !player) {
//     return res.status(400).json({ error: 'Game ID and player name are required.' });
//   }

//   const game = games[gameId];
//   if (!game) {
//     return res.status(404).json({ error: 'Game not found.' });
//   }

//   if (!game.active) {
//     return res.status(400).json({ error: 'Game is no longer active.' });
//   }

//   const currentPlayer = game.players[game.currentTurn];
//   if (currentPlayer !== player) {
//     return res.status(400).json({ error: 'Not your turn.' });
//   }

//   const triggerPulled = game.revolver.shift();
//   game.revolver.push(false); // Revolver rotates

//   if (triggerPulled) {
//     game.active = false;
//     return res.status(200).json({ result: 'lost', message: `${player} lost the game!` });
//   }

//   game.currentTurn = (game.currentTurn + 1) % game.players.length;
//   res.status(200).json({ result: 'safe', message: `${player} survived this turn.` });
// });

// // Route to get game details
// app.get('/api/game/:gameId', (req, res) => {
//   const { gameId } = req.params;
//   const game = games[gameId];
//   if (!game) {
//     return res.status(404).json({ error: 'Game not found.' });
//   }

//   res.status(200).json({ game });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });




require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
// const io = socketIo(server);

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);

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

const io = require('socket.io')(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Existing game tracking
const gameWaitingRoom = {};

io.on('connection', (socket) => {
  console.log('New client connected');

  // Game creation event
  socket.on('createGame', (gameData) => {
    const { gameId, hostPlayer } = gameData;
    
    // Store game in waiting room
    gameWaitingRoom[gameId] = {
      hostPlayer,
      waitingSocket: socket.id
    };

    // Broadcast game creation
    socket.emit('gameCreated', { gameId });
  });

  // Join game event
  socket.on('joinGame', (gameData) => {
    const { gameId, joiningPlayer } = gameData;
    const waitingGame = gameWaitingRoom[gameId];

    if (waitingGame) {
      // Notify host that a player joined
      io.to(waitingGame.waitingSocket).emit('playerJoined', { 
        joinedPlayer: joiningPlayer 
      });

      // Remove game from waiting room
      delete gameWaitingRoom[gameId];
    }
  });

  socket.on('disconnect', () => {
    // Clean up any waiting games
    Object.keys(gameWaitingRoom).forEach(gameId => {
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