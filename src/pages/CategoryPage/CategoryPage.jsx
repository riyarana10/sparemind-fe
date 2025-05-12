import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import noImage from "../../assets/img/no_image.jpg";
import ChatBot from "../../components/Chatbot/ConversationBot";
import './CategoryPage.css';

const CategoryPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stage, setStage] = useState("choose");

  const token = localStorage.getItem("access_token");
  localStorage.setItem("categoryId", name);

  useEffect(() => {
    const fetchByCategory = async () => {
      setIsLoading(true);
      setError("");
      try {
        const resp = await axios.get(
          `http://localhost:8000/search_by_category?category=${encodeURIComponent(
            name
          )}&size=100`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setResults(resp.data.results || []);
      } catch (err) {
        console.error("Category lookup failed:", err);
        setError("Failed to load parts for this category.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchByCategory();
  }, [name, token]);

  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return Math.round(num).toLocaleString("en-IN");
  };

  const handleView = (r, page) => {
    const path =
      page === "replacement"
        ? `/replacement/${r.replacement_part_item_code}`
        : `/original/${r.original_part_item_code}`;
    navigate(path, { state: { query: name, results } });
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setStage("choose");
    console.log("isChatOpen:", isChatOpen);
  };


  return (
    <div style={{
      display:"flex",
      flexDirection: "row",
      justifyContent: "flex-start",
      height: "90vh"
    }}>
      <div className={`category-product-container`} style={{ position: "relative" }}>
        {isChatOpen && window.innerWidth <= 1400 && (
          <div className="chat-overlay-active"></div>
        )}

        <div
          className={`app-container ${isChatOpen ? "chat-split-screen-transition" : "screen-transition"}`}
        >
          <h2 className="category-title">
            {name
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(" ")} – Original Parts
          </h2>

          {isLoading ? (
            <p>Loading parts...</p>
          ) : error ? (
            <p className="error-message">{error}</p>
          ) : results.length === 0 ? (
            <p>No parts found in this category.</p>
          ) : (
            results.filter((r) => r.original_part_item_code).map((item, i) => (
              <div key={i} className="category-product-card">
                <img
                  src={item.original_part_image === null ? noImage : item.original_part_image}
                  alt={item.original_part_name}
                  className="category-product-image"
                />
                <div className="category-product-details">
                  <div className="category-product-main">
                    <h3 className="category-product-name">{item.original_part_name}</h3>
                    <span
                      className={`stock-tag ${item.stock > 20 ? 'stock-green' : 'stock-yellow'}`}
                    >
                      In stock: {item.original_part_stock}
                    </span>
                    {item.replacements > 0 && (
                      <span className="category-product-replacement-tag">
                        {item.replacements} replacement available
                      </span>
                    )}
                  </div>
                  <div className='category-product-status-details'>
                    <div>
                      <p>Price</p>
                      <p>{formatPrice(item.original_part_price)}</p>
                    </div>
                    <div>
                      <p>Item Code</p>
                      <p>{item.original_part_item_code}</p>
                    </div>
                    <div>
                      <p>Location</p>
                      <p>{item.original_part_location}</p>
                    </div>
                    <div>
                      <p>Brand</p>
                      <p>{item.brand}</p>
                    </div>
                    <div className="category-product-status">
                      <button className="view-details-button" onClick={() => handleView(item, "original")}>
                        View details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <button
            style={{
              position: "fixed",
              bottom: "20px",
              right: "20px",
              padding: "12px 16px",
              fontSize: "16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              zIndex: 1000,
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              display: isChatOpen ? "none" : "block",
            }}
            onClick={handleChatToggle}
          >
            Know more about {name
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </button>
        </div>

      </div>
      <div className={isChatOpen ? "chatbot-split-view" : "chat-view"}>
        <ChatBot
          categoryId={name}
          isOpen={isChatOpen}
          toggleChat={handleChatToggle}
          stage={stage}
          setStage={setStage}
        />
      </div>
    </div>


  );
};

export default CategoryPage;
