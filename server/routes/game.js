const express = require("express");
const router = express.Router();
const Game = require("../models/Game");
const authMiddleware = require("../middlewares/auth");

// Create Game
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const game = new Game({
      gameId: `game_${Date.now()}`,
      players: [
        {
          userId: req.user._id,
          username: req.user.username,
        },
      ],
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(500).json({ error: "Game creation failed" });
  }
});

router.post("/join", authMiddleware, async (req, res) => {
  try {
    const { gameId, player } = req.body;
    console.log("Game joined by person: ", req.body);
    const game = await Game.findOne({ gameId });
    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }
    if (game.players.some((p) => p.name === player)) {
      return res.status(400).json({ error: "Player already in game" });
    }
    game.players.push({
      gameId: gameId,
      name: player,
    });
    await game.save();
    console.log("Game found: ", game);
    // const io = socket.g
    res.status(200).json({ message: "Game joined successfully", game });
  } catch (error) {
    res.status(500).json({ error: "Game join failed" });
  }
});

router.get("/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findOne({ gameId });

    if (!game) {
      return res.status(404).json({ error: "Game not found" });
    }

    console.log("Game found: ", game);
    res.status(200).json(game);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch game details" });
  }
});

module.exports = router;
