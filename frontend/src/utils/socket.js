import React, { useState, useEffect } from 'react';
import axios from 'axios';
import socket from '../utils/socket';
import API_URL from '../constants/api'; // You might need to create this file

const useSocket = () => {
  const [connected, setConnected] = useState(socket.connected);
  const [gameId, setGameId] = useState(null);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);

  useEffect(() => {
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  const createGame = async (playerName) => {
    try {
      const response = await axios.post(`${API_URL}/game/create`, { player: playerName });
      setGameId(response.data.gameId);
      socket.emit('createGame', { gameId: response.data.gameId, hostPlayer: { name: playerName } });
      setWaitingForPlayer(true);
    } catch (error) {
      console.error('Game creation failed', error);
    }
  };

  const joinGame = async (gameId, playerName) => {
    try {
      await axios.post(`${API_URL}/game/join`, { gameId, player: playerName });
      setGameId(gameId);
      socket.emit('joinGame', { gameId, player: playerName });
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  return { connected, gameId, waitingForPlayer, createGame, joinGame };
};

export default useSocket;
