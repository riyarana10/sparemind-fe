import React, { useEffect, useState, useRef } from "react";
import "./SearchBar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import baseUrl from "../../services/base-url";
import searchIcon from "../../assets/img/searchIcon.svg"

const SearchBar = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const token = localStorage.getItem("access_token");
  const wrapperRef = useRef(null);
  const [placeholderText, setPlaceholderText] = useState(
    "Search by part name, code, machine type, issue etc.."
  );

  // Responsive placeholder text
  useEffect(() => {
    const updatePlaceholder = () => {
      setPlaceholderText(
        window.innerWidth < 768
          ? "Search parts"
          : "Search by part name, code, machine type, issue etc.."
      );
    };

    updatePlaceholder(); // run initially
    window.addEventListener("resize", updatePlaceholder);
    return () => window.removeEventListener("resize", updatePlaceholder);
  }, []);

  // Autocomplete suggestions
  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const url = `${baseUrl}/autocomplete?query=${encodeURIComponent(
          searchTerm
        )}`;
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const { data } = await axios.get(url, config);
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, token]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="search-container" ref={wrapperRef}>
      <div className="search-input-wrapper">
        <img style={{width : "24px", height:"24px"}} src={searchIcon}  alt="saerch-img"/>
        <input
          type="text"
          placeholder={placeholderText}
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
        />
        {showSuggestions && suggestions.length > 0 && (
          <div className="suggestions-dropdown">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="suggestion-item"
                onClick={() => {
                  setSearchTerm(suggestion.original_part_item_code);
                  setShowSuggestions(false);
                  navigate(
                    `/original/${suggestion.original_part_item_code}`
                  );
                }}
              >
                <strong>{suggestion.original_part_item_code}</strong> —{" "}
                <small>{suggestion.original_part_name}</small>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="search-button" onClick={handleSearch}>
        FIND
      </button>
    </div>
  );
};

export default SearchBar;
