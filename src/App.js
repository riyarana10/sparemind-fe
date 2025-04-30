import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { useNavigate, useLocation } from "react-router-dom";
import ChatBot from "./components/Chatbot/Chatbot";

const formatPrice = (price) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return Math.round(num).toLocaleString("en-IN");
};

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

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // — Authentication state —
  const [token, setToken] = useState(getAuthToken() || "");
  const [showLoginModal, setShowLoginModal] = useState(token === "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // — Admin “Create User” modal —
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [createUserError, setCreateUserError] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState("");

  // — Search state —
  const initialQuery = location.state?.query || "";
  const initialResults = location.state?.results || [];
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // --- “Most Recent Categories” fetched from ES ---
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [recentCategories, setRecentCategories] = useState([]);
  const [recentCodeResults, setRecentCodeResults] = useState([]);

  // Fetch top‐5 categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setIsLoadingCategory(true);
        const resp = await axios.get(
          "http://localhost:8000/categories?size=8",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRecentCategories(resp.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCategory(false);
      }
    };
    if (token) fetchCats();
  }, [token]);

  // Hide login once token is set
  useEffect(() => {
    if (token) setShowLoginModal(false);
  }, [token]);

  // ── Fetch “popular” parts after login ──
  useEffect(() => {
    if (!token) return;
    const codes = [
      "MA0OT00300B",
      "MA0OT05Q001",
      "MA0UQ00E000",
      "MA0UM02I000",
      "MA6UU00D000",
    ];
    console.log("[DEBUG popular] token =", token);
    console.log("[DEBUG popular] codes to fetch:", codes);

    const fetchData = async () => {
      setIsLoadingProduct(true);
      try {
        const responses = await Promise.all(
          codes.map((code) => {
            console.log(`[DEBUG popular] fetching code ${code}`);
            return axios.get(
              `http://localhost:8000/search?original_part_item_code=${encodeURIComponent(
                code
              )}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          })
        );
        console.log("[DEBUG popular] raw responses:", responses);
        const all = responses.flatMap((r) => r.data.results || []);
        console.log("[DEBUG popular] flattened parts:", all);
        const sorted = all.sort(
          (a, b) => (b.price_difference || 0) - (a.price_difference || 0)
        );
        console.log("[DEBUG popular] sorted parts:", sorted);
        setRecentCodeResults(sorted.slice(0, 5));
      } catch (err) {
        console.error("[DEBUG popular] error fetching popular parts:", err);
      } finally {
        setIsLoadingProduct(false);
      }
    };
    fetchData();
  }, [token]);

  useEffect(() => {
    console.log("App render:", { query, results });
  }, [query, results]);

  // Decode current user
  const currentUser = token ? decodeJwt(token) : null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const params = new URLSearchParams();
      params.append("username", username);
      params.append("password", password);
      const res = await axios.post("http://localhost:8000/login", params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setToken(res.data.access_token);
      setAuthToken(res.data.access_token);
    } catch {
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setToken("");
    setShowLoginModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError("");
    setCreateUserSuccess("");
    try {
      await axios.post(
        "http://localhost:8000/users",
        { username: newUsername, password: newPassword, role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCreateUserSuccess("User created successfully");
      setNewUsername("");
      setNewPassword("");
      setNewRole("user");
    } catch {
      setCreateUserError("Failed to create user");
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return setResults([]);
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `http://localhost:8000/search?original_part_item_code=${encodeURIComponent(
          query
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const hits = res.data.results || [];
      if (hits.length) {
        setResults(
          [...hits].sort(
            (a, b) => (b.price_difference || 0) - (a.price_difference || 0)
          )
        );
      } else {
        setError("No parts found for this code.");
      }
    } catch {
      setError("Failed to fetch search results.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickViewDetails = (replacement) => {
    navigate(`/original/${replacement.replacement_part_item_code}`, {
      state: { query, results },
    });
  };

  return (
    <div className="app-container">
      {!showLoginModal && <ChatBot />}

      {/* Login Modal */}
      {showLoginModal && (
        <>
          <div className="blur-backdrop" />

          <div className="modal-overlay">
            <div className="modal login-modal">
              <div className="modal-header">
                <img
                  src="https://static.wixstatic.com/media/0b32fd_b9ee0246c836473ea1342c30fce5021d~mv2.png/v1/crop/x_0,y_1,w_2800,h_436/fill/w_202,h_30,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Text%20Black_edited_edited.png"
                  alt="Company Logo"
                  className="modal-logo"
                />
                <h2>
                  Welcome to <span className="highlight">PartsGenie</span>
                </h2>
              </div>

              <div className="modal-body">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                />

                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />

                {loginError && <p className="error-message">{loginError}</p>}
              </div>

              <div className="modal-footer">
                <button className="login-button" onClick={handleLogin}>
                  Log In
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {!showLoginModal && !isLoading && results.length === 0 && (
        <>
          <h2>Popular Categories</h2>
          {isLoadingCategory ? (
            <p>Loading categories…</p>
          ) : (
            <div className="replacement-cards">
              {recentCategories.map((cat, idx) => (
                <div
                  key={idx}
                  className="category-card"
                  style={{ cursor: "pointer" }}
                  onClick={() =>
                    navigate(`/category/${cat.name.toLowerCase()}`, {
                      state: { query, results },
                    })
                  }
                >
                  <h3>{cat.name}</h3>
                  <p>
                    <strong>View parts from this category</strong>
                  </p>
                </div>
              ))}
            </div>
          )}

          <h2 className="mt-5">Popular Part Recommendations</h2>
          {isLoadingProduct ? (
            <div className="loader-container">
              <div className="loader">Loading parts…</div>
            </div>
          ) : (
            <div className="replacement-cards">
              {recentCodeResults.map((r, i) => {
                const diff = r.price_difference ?? 0;
                const diffClass =
                  diff > 0
                    ? "price-positive"
                    : diff < 0
                    ? "price-negative"
                    : "";
                return (
                  <div key={i} className="replacement-card">
                    <h3>{r.replacement_part_name}</h3>
                    <p>
                      <strong>Item Code:</strong> {r.replacement_part_item_code}
                    </p>
                    <p>
                      <strong>Location:</strong> {r.replacement_part_location}
                    </p>
                    <p>
                      <strong>Stock:</strong> {r.replacement_part_stock}
                    </p>
                    <p>
                      <strong>Price:</strong> ₹
                      {formatPrice(r.replacement_part_price)}
                    </p>
                    <p>
                      <strong>Part Description:</strong>{" "}
                      {r.replacement_part_name_breakdown_definition}
                    </p>
                    <p>
                      <strong>Brand: </strong>{" "}
                      <span className={`diff-value ${diffClass}`}>
                        {r.brand}
                      </span>
                    </p>
                    <button onClick={() => handleClickViewDetails(r)}>
                      View Full Details
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Error message */}
      {!showLoginModal && error && <p className="error-message">{error}</p>}

      {/* Search results: original + replacements */}
      {!showLoginModal && results.length > 0 && (
        <>
          <h2>Original Product</h2>
          <div className="original-card">
            <div className="original-info-left">
              <h3>{results[0].original_part_name}</h3>
              <p>
                <strong>Item Code:</strong> {results[0].original_part_item_code}
              </p>
              <p>
                <strong>Category:</strong> {results[0].category}
              </p>
              <p>
                <strong>Brand:</strong> {results[0].brand}
              </p>
              <p>
                <strong>Price:</strong> ₹
                {formatPrice(results[0].original_part_price)}
              </p>
              <p>
                <strong>Part Description:</strong>{" "}
                {results[0].original_part_name_breakdown_definition}
              </p>
            </div>
            <div className="original-info-right">
              {results[0].original_part_stock === 0 ? (
                <div className="circular-out-of-stock">OUT OF STOCK</div>
              ) : (
                <>
                  <p className="in-stock-badge">
                    In Stock: {results[0].original_part_stock}
                  </p>
                  <p className="highlighted-location">
                    <strong>Location:</strong>{" "}
                    {results[0].original_part_location}
                  </p>
                </>
              )}
            </div>
          </div>

          <h2>Alternate Part Recommendation</h2>
          <div className="replacement-cards">
            {results.map((r, i) => {
              const diff = r.price_difference ?? 0;
              const diffClass =
                diff > 0 ? "price-positive" : diff < 0 ? "price-negative" : "";
              return (
                <div key={i} className="replacement-card">
                  <h3>{r.replacement_part_name}</h3>
                  <p>
                    <strong>Item Code:</strong> {r.replacement_part_item_code}
                  </p>
                  <p>
                    <strong>Location:</strong> {r.replacement_part_location}
                  </p>
                  <p>
                    <strong>In Stock:</strong> {r.replacement_part_stock}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹
                    {formatPrice(r.replacement_part_price)}
                  </p>
                  <p>
                    <strong>Part Description:</strong>{" "}
                    {r.replacement_part_name_breakdown_definition}
                  </p>
                  <p>
                    <strong>Savings:₹</strong>{" "}
                    <span className={`diff-value ${diffClass}`}>
                      {Math.round(diff).toLocaleString("en-IN")}
                    </span>
                  </p>
                  <button onClick={() => handleClickViewDetails(r)}>
                    View Full Details
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
