import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import { useNavigate, useLocation } from "react-router-dom";
import ChatBot from "./components/Chatbot/ConversationBot";
import FindParts from "./components/FindPartsComp/FindParts";
import HomePageImg from "./assets/img/homePageBG.svg"
import NewArrivalParts from "./components/NewArrivals/NewArrivalParts";

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

    const fetchData = async () => {
      setIsLoadingProduct(true);
      try {
        const responses = await Promise.all(
          codes.map((code) => {
            return axios.get(
              `http://localhost:8000/search?original_part_item_code=${encodeURIComponent(
                code
              )}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
          })
        );
        const all = responses.flatMap((r) => r.data.results || []);
        const sorted = all.sort(
          (a, b) => (b.price_difference || 0) - (a.price_difference || 0)
        );
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
    <>
      <FindParts/>
      <NewArrivalParts/>
    </>
  );
}

export default App;
