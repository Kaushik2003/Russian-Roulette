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

  // Enables game-related buttons after wallet connection
  const enableGameButtons = () => {
    document.getElementById('joinGame').disabled = false;
    document.getElementById('createGame').disabled = false;
  };

  // Handles the spin button logic
  const handleSpinButton = () => {
    if (!gameActive || !currentTurn) return; // Prevent action if game isn't active or it's not the player's turn

    const revolver = document.querySelector('.revolver-chamber'); // Select the revolver's chamber element
    revolver.classList.add('spin'); // Add spinning animation

    // Disable all buttons during the spin
    document.getElementById('spinButton').disabled = true;
    document.getElementById('skipButton').disabled = true;
    document.getElementById('forfeitButton').disabled = true;

    // Simulate game outcome logic
    setTimeout(() => {
      revolver.classList.remove('spin'); // Remove spinning animation
      const result = Math.random() > 0.8; // Randomly determine the outcome (20% chance of "Bang!")

      if (result) {
        alert("BANG! You're out!"); // Notify the player of the outcome
        setGameActive(false); // Deactivate the game
      } else {
        alert('Click! You survived!'); // Notify the player of survival
        // Re-enable buttons for the next turn
        document.getElementById('spinButton').disabled = false;
        document.getElementById('skipButton').disabled = false;
        document.getElementById('forfeitButton').disabled = false;
      }
    }, 2000); // 2-second delay to simulate the spin
  };

  // Handles creating a new game
  const handleCreateGame = async () => {
    if (!walletConnected) { // Prevent game creation if wallet is not connected
      alert('Please connect your wallet first!');
      return;
    }

    try {
      setGameActive(true); // Activate the game
      setCurrentTurn(true); // Set the current turn to the player
      document.getElementById('gameStatus').textContent = 'Status: Game Created'; // Update game status
      // Enable game-related buttons
      document.getElementById('spinButton').disabled = false;
      document.getElementById('skipButton').disabled = false;
      document.getElementById('forfeitButton').disabled = false;

      // Update the player list
      document.getElementById('playerList').innerHTML = `
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          You (Active)
        </div>
      `;
    } catch (error) {
      console.error('Error creating game:', error); // Log any error encountered
    }
  };

  // Handles skipping the turn
  const handleSkipButton = () => {
    if (!gameActive || !currentTurn) return; // Prevent action if the game is inactive or not the player's turn
    alert('Turn skipped! -0.1 ETH'); // Notify the player about skipping the turn
    setCurrentTurn(false); // Set turn to inactive
  };

  // Handles forfeiting the game
  const handleForfeitButton = () => {
    if (!gameActive) return; // Prevent action if the game isn't active
    if (window.confirm('Are you sure you want to forfeit? You will lose your stake.')) {
      setGameActive(false); // Deactivate the game
      setCurrentTurn(false); // Reset the turn
      alert('Game forfeited!'); // Notify the player
    }
  };

  return (
    <div id="app" className="min-h-screen flex flex-col">
     
        <header className="bg-white shadow-md py-2 px-4">
         
          <div className="header">
              {/* Logo or title */}
            {/* <div className="font-pixel flex-1 text-2xl font-bold text-gray-800">
              🎲 Russian Roulette
            </div> */}
            <div className='flex justify-end'>
              
              <div>
                <img width={65} height={65}  className="" src="/logo.png" alt='logo'/>
              </div>

              <div className="font-pixel flex-1 text-2xl font-bold text-gray-800">
              &nbsp; Russian Roulette
              </div>
            </div>
                {/* Wallet connect button */}
                <div>
                    <button id="connectWallet" className=" font-pixel pixel-border bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded text-sm transition" onClick={handleConnectWallet}>Connect Wallet</button>
                </div>
                
           </div>
        </header>


      {/* Main content area */}
      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Game area */}
        <div className="flex-1">
          <div id="gameArea" className="font-pixel bg-white p-6 rounded-lg pixel-border min-h-[400px] flex flex-col items-center justify-center">
            {/* Revolver visualization */}
            <div id="revolver" className="mb-8 relative w-64 h-64">
              <div className="w-64 h-64 border-8 border-gray-800 rounded-full flex items-center justify-center">
                <div className="revolver-chamber w-48 h-48 bg-gray-300 rounded-full relative">
                  {/* Chamber slots */}
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)' }}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ top: '50%', right: '20px', transform: 'translateY(-50%)' }}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ bottom: '20px', left: '50%', transform: 'translateX(-50%)' }}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{ top: '50%', left: '20px', transform: 'translateY(-50%)' }}></div>
                </div>
              </div>
            </div>
            {/* Spin button */}
            <button id="spinButton" className="font-pixel game-button bg-red-600 text-white px-8 py-4 rounded pixel-border mb-4" onClick={handleSpinButton} disabled>
              Spin & Fire
            </button>
            {/* Skip and Forfeit buttons */}
            <div className="flex gap-4">
              <button id="skipButton" className="font-pixel game-button bg-yellow-500 text-white px-4 py-2 rounded pixel-border" onClick={handleSkipButton} disabled>
                Skip Turn (-0.1 ETH)
              </button>
              <button id="forfeitButton" className="game-button bg-gray-500 text-white px-4 py-2 rounded pixel-border" onClick={handleForfeitButton} disabled>
                Forfeit Game
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar for game info */}
        <div className="font-pixel md:w-80">
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

          {/* Join/Create Game section */}
          <div className="font-pixel bg-white p-4 rounded-lg pixel-border">
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

      {/* Footer section */}
      <footer className="font-pixel bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <p>⚠️ Play responsibly. This is a game of chance.</p>
          <div className="mt-2">
            <a href="/" className="mx-2">Terms</a>
            <a href="/" className="mx-2">Privacy</a>
            <a href="/" className="mx-2">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App; // Export the App component as the default export
