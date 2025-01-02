import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./App.css";
import { useWallet } from "./WalletContext";

const API_URL = "http://localhost:3001/api";

function GamePage() {
  const [socket, setSocket] = useState(null);
  // const [walletConnected, setWalletConnected] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [playerList, setPlayerList] = useState([]);
  const [waitingForPlayer, setWaitingForPlayer] = useState(false);
  console.log("playerList", playerList);
  console.log("PlayerName", playerName);
  const {
    walletAddress,
    walletConnected,
    connectWallet,
    setWalletConnected,
    handleConnectWallet,
  } = useWallet();

  // Socket connection on component mount
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    // Clean up socket on unmount
    return () => newSocket.close();
  }, []);

  const handleCreateGame = async () => {
    const token = localStorage.getItem("token");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    if (!walletConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    const username = prompt("Enter your name:");
    if (!username) return;

    try {
      const response = await axios.post(
        `${API_URL}/game/create`,
        {
          player: username,
        },
        config
      );

      setGameId(response.data.gameId);
      setPlayerName(username);
      setGameActive(true);
      setCurrentTurn(true);

      document.getElementById("gameStatus").textContent =
        "Status: Game Created";
      document.getElementById("spinButton").disabled = false;
      document.getElementById("skipButton").disabled = false;
      document.getElementById("forfeitButton").disabled = false;

      setPlayerList([username]);

      // Emit game creation event to socket
      socket.emit("createGame", {
        gameId: response.data.gameId,
        hostPlayer: username,
      });

      setWaitingForPlayer(true);
    } catch (error) {
      console.error("Error creating game:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        alert(`Failed to create game: ${error.response.data}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.log("No response received");
        alert("No response received from the server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error setting up the request", error.message);
        alert("An error occurred while setting up the request");
      }
      alert("Failed to create game");
    }
  };

  const handleJoinGame = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    const lobbyId = document.querySelector(
      'input[placeholder="Enter Lobby ID"]'
    ).value;
    const name = prompt("Enter your name:");
    if (!lobbyId || !name) return;
    const token = localStorage.getItem("token");

    try {
      const response = await axios.post(
        `${API_URL}/game/join`,
        {
          gameId: lobbyId,
          player: name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(response.data);

      setGameId(lobbyId);
      setPlayerName(name);
      setGameActive(true);

      // Fetch game details to get player list
      const gameDetails = await axios.get(`${API_URL}/game/${lobbyId}`);
      console.log("Game details:", gameDetails.data);
      setPlayerList(gameDetails.data.players.map((p) => p.username));

      document.getElementById("gameStatus").textContent = "Status: Game Joined";
      document.getElementById("spinButton").disabled = false;
      document.getElementById("skipButton").disabled = false;
      document.getElementById("forfeitButton").disabled = false;

      // Emit join game event to socket
      socket.emit("joinGame", {
        gameId: lobbyId,
        playerName: name,
      });
    } catch (error) {
      console.error("Error joining game:", error);
      alert("Failed to join game");
    }
  };

  const handleSpinButton = async () => {
    if (!gameActive || !currentTurn) return;

    const revolver = document.querySelector(".revolver-chamber");
    revolver.classList.add("spin");

    document.getElementById("spinButton").disabled = true;
    document.getElementById("skipButton").disabled = true;
    document.getElementById("forfeitButton").disabled = true;

    try {
      const response = await axios.post(`${API_URL}/game/play`, {
        gameId,
        player: playerName,
      });

      setTimeout(() => {
        revolver.classList.remove("spin");

        if (response.data.result === "lost") {
          alert("BANG! You're out!");
          setGameActive(false);
        } else {
          alert("Click! You survived!");
          // Re-enable buttons for the next turn
          document.getElementById("spinButton").disabled = false;
          document.getElementById("skipButton").disabled = false;
          document.getElementById("forfeitButton").disabled = false;
        }
      }, 2000);
    } catch (error) {
      console.error("Error playing turn:", error);
      alert("Failed to play turn");
    }
  };

  const handleSkipButton = () => {
    if (!gameActive || !currentTurn) return;
    alert("Turn skipped! -0.1 ETH");
    setCurrentTurn(false);
  };

  const handleForfeitButton = () => {
    if (!gameActive) return;
    if (
      window.confirm(
        "Are you sure you want to forfeit? You will lose your stake."
      )
    ) {
      setGameActive(false);
      setCurrentTurn(false);
      alert("Game forfeited!");
    }
  };

  return (
    <div id="app" className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-2 px-4">
        <div className="header">
          <div className="flex justify-end">
            <div>
              <img width={65} height={65} src="/logo.png" alt="logo" />
            </div>
            <div className="font-pixel flex-1 text-2xl font-bold text-gray-800">
              &nbsp; Russian Roulette
            </div>
          </div>
          <div>
            <button
              id="connectWallet"
              className="font-pixel pixel-border bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition"
              onClick={handleConnectWallet}
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div
            id="gameArea"
            className="font-pixel bg-white p-6 rounded-lg pixel-border min-h-[400px] flex flex-col items-center justify-center"
          >
            <div id="revolver" className="mb-8 relative w-64 h-64">
              <div className="w-64 h-64 border-8 border-gray-800 rounded-full flex items-center justify-center">
                <div className="revolver-chamber w-48 h-48 bg-gray-300 rounded-full relative">
                  <div
                    className="absolute w-8 h-8 bg-gray-600 rounded-full"
                    style={{
                      top: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  ></div>
                  <div
                    className="absolute w-8 h-8 bg-gray-600 rounded-full"
                    style={{
                      top: "50%",
                      right: "20px",
                      transform: "translateY(-50%)",
                    }}
                  ></div>
                  <div
                    className="absolute w-8 h-8 bg-gray-600 rounded-full"
                    style={{
                      bottom: "20px",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  ></div>
                  <div
                    className="absolute w-8 h-8 bg-gray-600 rounded-full"
                    style={{
                      top: "50%",
                      left: "20px",
                      transform: "translateY(-50%)",
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <button
              id="spinButton"
              className="font-pixel game-button bg-red-600 text-white px-8 py-4 rounded pixel-border mb-4"
              onClick={handleSpinButton}
              disabled
            >
              Spin & Fire
            </button>
            <div className="flex gap-4">
              <button
                id="skipButton"
                className="font-pixel game-button bg-yellow-500 text-white px-4 py-2 rounded pixel-border"
                onClick={handleSkipButton}
                disabled
              >
                Skip Turn (-0.1 ETH)
              </button>
              <button
                id="forfeitButton"
                className="game-button bg-gray-500 text-white px-4 py-2 rounded pixel-border"
                onClick={handleForfeitButton}
                disabled
              >
                Forfeit Game
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar for game info */}
        <div className="font-pixel md:w-80">
          <div className="bg-white p-4 rounded-lg pixel-border mb-4">
            <h3 className="text-lg mb-4">Game Info</h3>
            <div id="gameStatus" className="mb-4">
              Status: Waiting for players
            </div>
            <div id="stake" className="mb-4">
              Stake: 0.005 EDU
            </div>
            <div id="players" className="mb-4">
              <div className="font-bold mb-2">Players:</div>
              <div id="playerList" className="space-y-2">
                {playerList.map((player, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {player}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div id="lobbyArea" className="bg-white p-6 rounded-lg pixel-border">
            <h2 className="font-pixel text-xl text-gray-800">
              Join/Create game
            </h2>
            <div className="font-pixel text-gray-800 mt-4">
              {/* <label htmlFor="lobbyId" className="block text-sm">Enter Lobby ID</label> */}
              <input
                type="text"
                id="lobbyId"
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter Lobby ID"
              />
            </div>
            <div className="mt-4 flex justify-center gap-4">
              <button
                id="createGame"
                className="font-pixel bg-green-500 text-white px-6 py-2 rounded text-sm pixel-border mb-4"
                onClick={handleCreateGame}
                disabled={!walletConnected}
              >
                Create Game
              </button>
              <button
                id="joinGame"
                className="font-pixel bg-blue-500 text-white px-6 py-2 rounded text-sm pixel-border"
                onClick={handleJoinGame}
                disabled={!walletConnected}
              >
                Join Game
              </button>
            </div>

            <div
              id="gameStatus"
              className="mt-4 font-pixel text-xl font-bold text-gray-800"
            >
              Status: Waiting...
            </div>
          </div>
        </div>
      </main>

      <footer className="font-pixel bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>⚠️ Play responsibly. This is a game of chance.</p>
          <div className="mt-2">
            <a href="/" className="mx-2">
              Terms
            </a>
            <a href="/" className="mx-2">
              Privacy
            </a>
            <a href="/" className="mx-2">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default GamePage;
