import React, { useEffect, useState, useRef } from "react";
import { AutoComplete, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import lightImg from "../../assets/img/lightImg.svg";
import searchIcon from "../../assets/img/searchIcon.svg";
import "./FindParts.css";

const FindParts = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const token = localStorage.getItem("access_token");
  const wrapperRef = useRef(null);
  const [placeholderText, setPlaceholderText] = useState(
    "Search by part name, code, machine type, issue etc.."
  );

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

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const url = `/api/autocomplete?query=${encodeURIComponent(
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
    setIsLoading(true);
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    setShowSuggestions(false);
    setIsLoading(false);
  };

  return (
    <div className="find-parts-section">
      <div className="search-box-home-page">
        <h1>FIND SPARE PARTS</h1>
        <div className="search-input-wrapper-home-page">
          {/* <SearchOutlined className="search-icon" /> */}
          <img className="search-icon-home-page" src={searchIcon} />
          <AutoComplete
            className="search-input-home-page"
            style={{ flex: 1 }}
            options={suggestions.map((s) => ({
              value: s.original_part_item_code,
              label: (
                <div>
                  <strong>{s.original_part_item_code}</strong> —{" "}
                  <small>{s.original_part_name}</small>
                  <small style={{ marginLeft: "10px" }}>{s.category}</small>
                </div>
              ),
            }))}
            value={searchTerm}
            onChange={(value) => setSearchTerm(value)}
            onSelect={(value) => {
              setSearchTerm(value);
              setShowSuggestions(false);
              navigate(`/search?query=${encodeURIComponent(value)}`);
            }}
            onSearch={(value) => setSearchTerm(value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch(e);
              }
            }}
            placeholder={placeholderText}
          />
        </div>
        <button className="search-button-home-page" onClick={handleSearch}>
          FIND
        </button>
        <p className="powered-by">
          <img src={lightImg} alt="lightning" className="lightning-icon" />
          Powered by SHORTHILLS AI STUDIO
        </p>
      </div>
    </div>
  );
};

export default FindParts;
