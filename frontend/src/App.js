import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import Register from "./Register";
import GamePage from "./GamePage";

const routes = [
  {
    path: "/",
    element: <Register />,
  },
  {
    path: "/game",
    element: <GamePage />,
  },
];
const App = () => {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Routes>
      </BrowserRouter>
    </div>
  );
};
export default App;
