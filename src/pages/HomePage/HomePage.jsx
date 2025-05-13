import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import ChatBot from "../../components/Chatbot/ConversationBot";
import FindParts from "../../components/FindPartsComp/FindParts";
import HomePageImg from "../../assets/img/homePageBG.svg";
import NewArrivalParts from "../../components/NewArrivals/NewArrivalParts";

const getAuthToken = () => localStorage.getItem("access_token");

function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [token, setToken] = useState(getAuthToken() || "");

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return setResults([]);
    setIsLoading(true);
    setError("");
    try {
      const res = await axios.get(
        `/api/search?original_part_item_code=${encodeURIComponent(
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
      <FindParts token={token} />
      <NewArrivalParts token={token} />
    </>
  );
}

export default HomePage;
