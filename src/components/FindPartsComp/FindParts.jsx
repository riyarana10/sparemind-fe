import { useEffect, useState } from "react";
import { AutoComplete } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import rawLightImg from "../../assets/img/lightImg.svg";
import rawSearchIcon from "../../assets/img/searchIcon.svg";
import getCachedImageUrl from "../../utils/getCachedImageUrl";
import homeBg from "../../assets/img/homeBg.webp";
import "./FindParts.css";
import baseUrl from "../../services/base-url";

const FindParts = () => {
  const navigate = useNavigate();
  const homeBgUrl = getCachedImageUrl(homeBg);
  const lightImgUrl = getCachedImageUrl(rawLightImg);
  const searchIconUrl = getCachedImageUrl(rawSearchIcon);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const token = localStorage.getItem("access_token");
  const [placeholderText, setPlaceholderText] = useState(
    "Search by part name, code, machine type, issue etc.."
  );

  useEffect(() => {
    const updatePlaceholder = () => {
      setPlaceholderText(
        window.innerWidth < 768
          ? "Search parts..."
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
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, token]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  return (
    <div
      className="find-parts-section"
      style={{
        backgroundImage: `url(${homeBgUrl})`,
      }}
    >
      <div className="search-box-home-page">
        <h1>FIND SPARE PARTS</h1>
        <div className="search-input-wrapper-home-page">
          {/* <SearchOutlined className="search-icon" /> */}
          <img
            className="search-icon-home-page"
            src={searchIconUrl}
            alt="search-icon"
          />
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
              navigate(`/original/${value}`);
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
          <img src={lightImgUrl} alt="lightning-icon" className="lightning-icon" />
          Powered by SHORTHILLS AI STUDIO
        </p>
      </div>
    </div>
  );
};

export default FindParts;
