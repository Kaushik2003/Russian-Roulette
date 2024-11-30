import React, { useState } from 'react';
import './App.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(false);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        document.getElementById('connectWallet').textContent = 'Connected';
        enableGameButtons();
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const enableGameButtons = () => {
    document.getElementById('joinGame').disabled = false;
    document.getElementById('createGame').disabled = false;
  };

  const handleSpinButton = () => {
    if (!gameActive || !currentTurn) return;

    const revolver = document.querySelector('.revolver-chamber');
    revolver.classList.add('spin');

    // Disable buttons during spin
    document.getElementById('spinButton').disabled = true;
    document.getElementById('skipButton').disabled = true;
    document.getElementById('forfeitButton').disabled = true;

    // Simulate game logic
    setTimeout(() => {
      revolver.classList.remove('spin');
      const result = Math.random() > 0.8;

      if (result) {
        alert("BANG! You're out!");
        setGameActive(false);
      } else {
        alert('Click! You survived!');
        document.getElementById('spinButton').disabled = false;
        document.getElementById('skipButton').disabled = false;
        document.getElementById('forfeitButton').disabled = false;
      }
    }, 2000);
  };

  const handleCreateGame = async () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }

    try {
      setGameActive(true);
      setCurrentTurn(true);
      document.getElementById('gameStatus').textContent = 'Status: Game Created';
      document.getElementById('spinButton').disabled = false;
      document.getElementById('skipButton').disabled = false;
      document.getElementById('forfeitButton').disabled = false;

      // Update player list
      document.getElementById('playerList').innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          You (Active)
        </div>
      `;
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };

  const handleSkipButton = () => {
    if (!gameActive || !currentTurn) return;
    alert('Turn skipped! -0.1 ETH');
    setCurrentTurn(false);
  };

  const handleForfeitButton = () => {
    if (!gameActive) return;
    if (window.confirm('Are you sure you want to forfeit? You will lose your stake.')) {
      setGameActive(false);
      setCurrentTurn(false);
      alert('Game forfeited!');
    }
  };

  return (
    <div id="app" className="min-h-screen flex flex-col">
      <header className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl">🎲 Web3 Roulette</div>
          <button id="connectWallet" className="pixel-border bg-blue-500 text-white px-4 py-2 text-sm" onClick={handleConnectWallet}>
            Connect Wallet
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div id="gameArea" className="bg-white p-6 rounded-lg pixel-border min-h-[400px] flex flex-col items-center justify-center">
            <div id="revolver" className="mb-8 relative w-64 h-64">
              <div className="w-64 h-64 border-8 border-gray-800 rounded-full flex items-center justify-center">
                <div className="revolver-chamber w-48 h-48 bg-gray-300 rounded-full relative">
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ top: '50%', right: '20px', transform: 'translateY(-50%)' }}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ top: '50%', left: '20px', transform: 'translateY(-50%)' }}></div>
                </div>
              </div>
            </div>
            <button id="spinButton" className="game-button bg-red-600 text-white px-8 py-4 rounded pixel-border mb-4" onClick={handleSpinButton} disabled>
              Spin & Fire
            </button>

            <div className="flex gap-4">
              <button id="skipButton" className="game-button bg-yellow-500 text-white px-4 py-2 rounded pixel-border" onClick={handleSkipButton} disabled>
                Skip Turn (-0.1 ETH)
              </button>
              <button id="forfeitButton" className="game-button bg-gray-500 text-white px-4 py-2 rounded pixel-border" onClick={handleForfeitButton} disabled>
                Forfeit Game
              </button>
            </div>
          </div>
        </div>

        <div className="md:w-80">
          <div className="bg-white p-4 rounded-lg pixel-border mb-4">
            <h3 className="text-lg mb-4">Game Info</h3>
            <div id="gameStatus" className="mb-4">Status: Waiting for players</div>
            <div id="stake" className="mb-4">Stake: 0.5 ETH</div>
            <div id="players" className="mb-4">
              <div className="font-bold mb-2">Players:</div>
              <div id="playerList" className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Waiting...
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg pixel-border">
            <h3 className="text-lg mb-4">Join/Create Game</h3>
            <input type="text" placeholder="Enter Lobby ID" className="w-full px-4 py-2 mb-4 border rounded" />
            <button id="joinGame" className="game-button bg-green-500 text-white px-4 py-2 rounded pixel-border w-full mb-4" onClick={handleCreateGame}>
              Join Game
            </button>
            <button id="createGame" className="game-button bg-blue-500 text-white px-4 py-2 rounded pixel-border w-full" onClick={handleCreateGame}>
              Create New Game
            </button>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>⚠️ Play responsibly. This is a game of chance.</p>
          <div className="mt-2">
          
            <a href="#" className="mx-2">Terms</a> 
            <a href="#" className="mx-2">Privacy</a>
            <a href="#" className="mx-2">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
