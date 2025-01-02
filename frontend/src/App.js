import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Register from "./Register";
import GamePage from "./GamePage";
import Login from "./Login";
import { WalletProvider } from "./WalletContext";

const routes = [
  {
    path: "/",
    element: <Register />,
  },
  {
    path: "/game",
    element: <GamePage />,
  },
  {
    path: "/login",
    element: <Login />,
  },
];
const App = () => {
  return (
    <WalletProvider>
      <div className="app">
        <BrowserRouter>
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </BrowserRouter>
      </div>
    </WalletProvider>
  );
};
export default App;
