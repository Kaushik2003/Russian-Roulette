import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import './App.css';

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [gameActive, setGameActive] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleSpin = () => {
    if (!gameActive || !currentTurn) return;
    
    setIsSpinning(true);
    
    setTimeout(() => {
      const result = Math.random() > 0.8;
      setIsSpinning(false);
      
      if (result) {
        alert('BANG! You\'re out!');
        setGameActive(false);
      } else {
        alert('Click! You survived!');
      }
    }, 2000);
  };

  const createGame = () => {
    if (!walletConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    setGameActive(true);
    setCurrentTurn(true);
  };

  const skipTurn = () => {
    if (!gameActive || !currentTurn) return;
    alert('Turn skipped! -0.1 ETH');
    setCurrentTurn(false);
  };

  const forfeitGame = () => {
    if (!gameActive) return;
    if (window.confirm('Are you sure you want to forfeit? You will lose your stake.')) {
      setGameActive(false);
      setCurrentTurn(false);
      alert('Game forfeited!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-lg p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-xl">🎲 Web3 Roulette</div>
          <Button 
            onClick={connectWallet}
            variant="default"
            className="pixel-border"
          >
            {walletConnected ? 'Connected' : 'Connect Wallet'}
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[400px]">
            <div className="mb-8 relative w-64 h-64">
              <div className="w-64 h-64 border-8 border-gray-800 rounded-full flex items-center justify-center">
                <div className={`revolver-chamber w-48 h-48 bg-gray-300 rounded-full relative ${isSpinning ? 'spin' : ''}`}>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{top: '20px', left: '50%', transform: 'translateX(-50%)'}}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{top: '50%', right: '20px', transform: 'translateY(-50%)'}}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{bottom: '20px', left: '50%', transform: 'translateX(-50%)'}}></div>
                  <div className="absolute w-8 h-8 bg-gray-600 rounded-full" style={{top: '50%', left: '20px', transform: 'translateY(-50%)'}}></div>
                </div>
              </div>
            </div>
            
            <Button
              onClick={handleSpin}
              disabled={!gameActive || !currentTurn || isSpinning}
              className="game-button bg-red-600 mb-4"
              size="lg"
            >
              Spin & Fire
            </Button>
            
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

        <div className="md:w-80">
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
                    {gameActive ? 'You (Active)' : 'Waiting...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Join/Create Game</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                placeholder="Enter Lobby ID"
                className="mb-4"
              />
              <Button
                disabled={!walletConnected}
                className="game-button w-full mb-4"
                variant="default"
              >
                Join Game
              </Button>
              <Button
                onClick={createGame}
                disabled={!walletConnected}
                className="game-button w-full"
                variant="default"
              >
                Create New Game
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

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