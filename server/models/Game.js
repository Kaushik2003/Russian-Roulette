const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  gameId: {
    type: String,
    required: true,
    unique: true
  },
  players: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String,
    isAlive: {
      type: Boolean,
      default: true
    }
  }],
  revolver: {
    type: [Boolean],
    default: []
  },
  currentTurn: {
    type: Number,
    default: 0
  },
  stake: {
    type: Number,
    default: 0.005
  },
  status: {
    type: String,
    enum: ['WAITING', 'ACTIVE', 'COMPLETED'],
    default: 'WAITING'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Game', GameSchema);