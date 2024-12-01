const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const authMiddleware = require('../middlewares/auth');

// Create Game
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const game = new Game({
      gameId: `game_${Date.now()}`,
      players: [{
        userId: req.user._id,
        username: req.user.username
      }]
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: 'Game creation failed' });
  }
});

// Add more game-related routes here

module.exports = router;