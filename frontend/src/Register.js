import { useState } from "react";
import { useNavigate } from "react-router";

export default function Register({ onRegister }) {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isError, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const checkData = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const account = accounts[0];
      console.log("Account: ", account);

      // Send registration data
      const response = await fetch("http://localhost:3001/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
          walletAddress: account,
        }),
      });

      // Handle response
      if (response.ok) {
        const data = await response.json();
        console.log("Registration successful:", data);
        localStorage.setItem("token", data.token);
        navigate("/game");
      } else {
        const errorData = await response.json();
        console.error("Registration failed:", errorData);
        throw new Error(errorData.error || "Failed to register");
      }
    } catch (error) {
      console.error("Error during registration:", error);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-xl px-4">
        <div className="bg-white rounded shadow-2xl p-7 sm:p-10">
          <form
            onSubmit={async (evt) => {
              evt.preventDefault();
              setError(false);
              setIsLoading(true);

              try {
                await checkData();
                console.log("Registration successful");
              } catch (err) {
                console.error("Registration failed:", err);
                setError(true);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <div className="mb-1 sm:mb-2">
              {isError ? (
                <h2 className="text-red-600">Something bad happened!</h2>
              ) : null}
              <label
                htmlFor="firstName"
                className="inline-block mb-1 font-medium"
              >
                Full Name
              </label>
              <input
                placeholder="John"
                required
                onChange={(evt) => {
                  setUsername(evt.target.value);
                }}
                type="text"
                className="flex-grow w-full h-12 px-4 mb-2 transition duration-200 bg-white border border-gray-300 rounded shadow-sm appearance-none focus:border-theme-primary focus:outline-none focus:shadow-outline"
                id="firstName"
                name="firstName"
              />
            </div>
            <div className="mb-1 sm:mb-2">
              <label htmlFor="email" className="inline-block mb-1 font-medium">
                E-mail
              </label>
              <input
                placeholder="john.doe@example.org"
                required
                type="email"
                minLength={5}
                onChange={(evt) => {
                  setEmail(evt.target.value);
                }}
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
                onChange={(evt) => {
                  setPassword(evt.target.value);
                }}
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
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
