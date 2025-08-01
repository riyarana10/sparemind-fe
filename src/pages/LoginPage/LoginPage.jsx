import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import baseUrl from "../../services/base-url";

const setAuthToken = (token) => localStorage.setItem("access_token", token);

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);

      const res = await axios.post(`${baseUrl}/login`, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setAuthToken(res.data.access_token);
      navigate("/");
    } catch(error) {
      console.error("Login failed:", error);
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
            Welcome to{" "}
            <span className="highlight">
              <span style={{ color: "#2D3394" }}>Parts</span>
              <span style={{ color: "#FF0000" }}>GENIE</span>
            </span>
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
