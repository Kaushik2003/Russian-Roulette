import { useState, useEffect} from 'react'; // Importing React hooks for managing state and side effects
import { Input } from "@/components/ui/input"; // Importing Input component for handling user input
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Importing Card components for displaying information in a card-like layout
import { Alert, AlertDescription } from "@/components/ui/alert"; // Importing Alert components to display warnings or messages
import './App.css'; // Importing external CSS file for custom styles

// Main App component
function App() {
  // States for managing various aspects of the game
  const [walletConnected, setWalletConnected] = useState(false); // Tracks whether the wallet is connected
  const [gameActive, setGameActive] = useState(false); // Tracks if the game is active
  const [currentTurn, setCurrentTurn] = useState(false); // Tracks if it's the user's turn
  const [isSpinning, setIsSpinning] = useState(false); // Tracks if the revolver chamber is spinning

  // Function to connect the wallet using MetaMask
  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') { // Check if the browser has MetaMask installed
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' }); // Request wallet connection
        setWalletConnected(true); // Set state to connected
      } catch (error) {
        console.error('User denied account access'); // Log if the user denies wallet connection
      }
    } else {
      alert('Please install MetaMask!'); // Alert if MetaMask is not installed
    }
  };

  // Function to handle the "spin" action, simulating the roulette effect
  const handleSpin = () => {
    if (!gameActive || !currentTurn) return; // Only proceed if the game is active and it's the user's turn
    
    setIsSpinning(true); // Start the spinning animation
    
    setTimeout(() => {
      const result = Math.random() > 0.8; // Random chance for the game result (80% survival, 20% failure)
      setIsSpinning(false); // Stop the spinning animation
      
      if (result) {
        alert('BANG! You\'re out!'); // If the result is "Bang", end the game for the player
        setGameActive(false); // End the game
      } else {
        alert('Click! You survived!'); // If the player survives, alert them
      }
    }, 2000); // Set a timeout of 2 seconds for the spin
  };

  // Function to create a new game
  const createGame = () => {
    if (!walletConnected) { // Ensure the user has connected their wallet
      alert('Please connect your wallet first!');
      return;
    }
    setGameActive(true); // Start the game
    setCurrentTurn(true); // Set the user's turn to active
  };

  // Function to skip the current turn
  const skipTurn = () => {
    if (!gameActive || !currentTurn) return; // Ensure the game is active and it's the user's turn
    alert('Turn skipped! -0.1 ETH'); // Alert for skipping turn
    setCurrentTurn(false); // End the user's turn
  };

  // Function to forfeit the game
  const forfeitGame = () => {
    if (!gameActive) return; // Ensure the game is active
    if (window.confirm('Are you sure you want to forfeit? You will lose your stake.')) { // Confirm forfeiture
      setGameActive(false); // End the game
      setCurrentTurn(false); // End the turn
      alert('Game forfeited!'); // Alert that the game was forfeited
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl">🎲 Web3 Roulette</div> {/* Game title */}
          <Button 
            onClick={connectWallet} // Connect wallet button
            variant="default"
            className="pixel-border"
          >
            {walletConnected ? 'Connected' : 'Connect Wallet'} {/* Button text depending on wallet connection status */}
          </Button>
        </div>
      </header>

      {/* Main Content Section */}
      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        {/* Game Controls Card */}
        <Card className="flex-1">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            {/* Revolver Chamber (Roulette) */}
            <div className="mb-8 relative w-64 h-64">
              <div className="w-64 h-64 border-8 border-gray-800 rounded-full flex items-center justify-center">
                <div className={`revolver-chamber w-48 h-48 bg-gray-300 rounded-full relative ${isSpinning ? 'spin' : ''}`}>
                  {/* Bullet positions */}
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{top: '20px', left: '50%', transform: 'translateX(-50%)'}}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{top: '50%', right: '20px', transform: 'translateY(-50%)'}}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{bottom: '20px', left: '50%', transform: 'translateX(-50%)'}}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{top: '50%', left: '20px', transform: 'translateY(-50%)'}}></div>
                </div>
              </div>
            </div>
            
            {/* Spin Button */}
            <Button
              onClick={handleSpin}
              disabled={!gameActive || !currentTurn || isSpinning} // Disable button if the game is inactive or not the user's turn
              className="game-button bg-red-600 mb-4"
              size="lg"
            >
              Spin & Fire
            </Button>
            
            {/* Skip and Forfeit Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={skipTurn}
                disabled={!gameActive || !currentTurn}
                className="game-button bg-yellow-500"
              >
                Skip Turn (-0.1 ETH)
              </Button>
              <Button
                onClick={forfeitGame}
                disabled={!gameActive}
                className="game-button bg-gray-500"
              >
                Forfeit Game
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Game Info and Join/Create Game Section */}
        <div className="md:w-80">
          {/* Game Info Card */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Game Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">Status: {gameActive ? 'Active' : 'Waiting for players'}</div>
              <div className="mb-4">Stake: 0.5 ETH</div>
              <div className="mb-4">
                <div className="font-bold mb-2">Players:</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    {gameActive ? 'You (Active)' : 'Waiting...'} {/* Display player status */}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join or Create Game Card */}
          <Card>
            <CardHeader>
              <CardTitle>Join/Create Game</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Enter Lobby ID" // Input for entering lobby ID to join a game
                className="mb-4"
              />
              <Button
                disabled={!walletConnected} // Disable button if wallet is not connected
                className="game-button w-full mb-4"
                variant="default"
              >
                Join Game
              </Button>
              <Button
                onClick={createGame} // Create a new game
                disabled={!walletConnected} // Disable if wallet is not connected
                className="game-button w-full"
                variant="default"
              >
                Create New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center text-sm">
          <Alert variant="warning">
            <AlertDescription>
              ⚠️ Play responsibly. This is a game of chance.
            </AlertDescription>
          </Alert>
          <div className="mt-2">
            <Button variant="link" className="text-white mx-2">Terms</Button>
            <Button variant="link" className="text-white mx-2">Privacy</Button>
            <Button variant="link" className="text-white mx-2">Support</Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
