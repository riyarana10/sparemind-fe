import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

const setAuthToken = (token) => localStorage.setItem("access_token", token);
const getAuthToken = () => localStorage.getItem("access_token");

const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(window.atob(base64))));
  } catch {
    return null;
  }
};

const LoginPage = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(getAuthToken() || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false); // 👈 Loader state

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true); // 👈 Start loading

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await axios.post("http://localhost:8000/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      setToken(res.data.access_token);
      setAuthToken(res.data.access_token);
      navigate("/");
    } catch {
      setLoginError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-bg">
        <div className="login-modal">
          <h1>
            Welcome to <span className="highlight">PartsGENIE</span>
          </h1>
          <p>Powered by SHORTHILLS AI STUDIO</p>
          <form onSubmit={handleLogin}>
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />

            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            {loginError && <p className="error-message">{loginError}</p>}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
              onClick={handleLogin}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
