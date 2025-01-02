import React, { useState } from "react";
import { useNavigate } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const checkData = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
        const token = localStorage.getItem("token");
        if (token) {
          navigate("/game");
        }
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || "Failed to login");
        throw new Error(errorData.error || "Failed to login");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setIsError(true);
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    setIsError(false);
    setErrorMessage("");
    setIsLoading(true);

    try {
      await checkData();
    } catch {
      // Errors handled in checkData
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-xl px-4">
        <div className="bg-white rounded shadow-2xl p-7 sm:p-10">
          <form onSubmit={handleSubmit}>
            {isError && (
              <div className="mb-4 text-red-600">
                <strong>Error:</strong> {errorMessage}
              </div>
            )}
            <div className="mb-1 sm:mb-2">
              <label htmlFor="email" className="inline-block mb-1 font-medium">
                E-mail
              </label>
              <input
                placeholder="john.doe@example.org"
                required
                type="email"
                value={email}
                onChange={(evt) => setEmail(evt.target.value)}
                className="flex-grow w-full h-12 px-4 mb-2 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none focus:border-theme-primary focus:outline-none focus:shadow-outline"
                id="email"
                name="email"
              />
            </div>
            <div className="mb-1 sm:mb-2">
              <label
                htmlFor="password"
                className="inline-block mb-1 font-medium"
              >
                Password
              </label>
              <input
                placeholder="********"
                required
                type="password"
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
                className="flex-grow w-full h-12 px-4 mb-2 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none focus:border-theme-primary focus:outline-none focus:shadow-outline"
                id="password"
                minLength={8}
                name="password"
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 px-6 font-medium tracking-wide text-white rounded shadow-md transition duration-200 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-theme-primary hover:bg-deep-purple-accent-700"
                }`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
