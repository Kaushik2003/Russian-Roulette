import { createContext, useContext, useState } from "react";

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const account = accounts[0];
        setWalletConnected(true);
        setWalletAddress(account);
        console.log("Account: ", account);
      } catch (error) {
        if (error.code === 4001) {
          console.error("User denied account access");
          alert("Wallet connection request denied. Please try again.");
        } else {
          console.error("An error occurred during wallet connection:", error);
          alert("An error occurred. Please try again.");
        }
      }
    } else {
      alert(
        "MetaMask is not installed. Please install it to connect your wallet."
      );
    }
  };

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        walletConnected,
        handleConnectWallet,
        setWalletAddress,
        setWalletConnected,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  return useContext(WalletContext);
};
