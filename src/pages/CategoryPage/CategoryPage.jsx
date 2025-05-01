import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatBot from "../../components/Chatbot/ConversationBot";
import "../../App.css";

export default function CategoryPage() {
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
  };

  return (
    <div className={`all-page-style`} style={{ position: "relative" }}>
      {isChatOpen && window.innerWidth <= 1400 && (
        <div className="chat-overlay-active"></div>
      )}
      <div
        className={`app-container ${
          isChatOpen ? "chat-split-screen-transition" : "screen-transition"
        }`}
      >
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h2>
          Original Parts for{" "}
          <em>
            {name
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")}
          </em>
        </h2>
        {isLoading ? (
          <p>Loading parts…</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : results.length === 0 ? (
          <p>No parts found in this category.</p>
        ) : (
          <div className="replacement-cards">
            {results
              .filter((r) => r.original_part_item_code)
              .map((r, i) => (
                <div key={i} className="replacement-card">
                  <h3>{r.original_part_name}</h3>
                  <p>
                    <strong>Item Code:</strong> {r.original_part_item_code}
                  </p>
                  <p>
                    <strong>Location:</strong> {r.original_part_location}
                  </p>
                  <p>
                    <strong>Stock:</strong> {r.original_part_stock}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹
                    {formatPrice(r.original_part_price)}
                  </p>
                  <p>
                    <strong>Part Description:</strong>{" "}
                    {r.original_part_name_breakdown_definition}
                  </p>
                  <p>
                    <strong>Brand:</strong> {r.brand}
                  </p>
                  <button onClick={() => handleView(r, "original")}>
                    View Full Details
                  </button>
                </div>
              ))}
          </div>
        )}

        <h2>
          Replacement Parts for{" "}
          <em>
            {name
              .split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ")}
          </em>
        </h2>
        {isLoading ? (
          <p>Loading parts…</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : results.length === 0 ? (
          <p>No parts found in this category.</p>
        ) : (
          <div className="replacement-cards">
            {results
              .filter((r) => r.replacement_part_item_code)
              .map((r, i) => (
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
                  <p
                    className={
                      r.price_difference > 0 ? "savings-profit" : "savings-loss"
                    }
                  >
                    <strong>Savings: </strong>₹{formatPrice(r.price_difference)}
                  </p>
                  <button onClick={() => handleView(r, "replacement")}>
                    View Full Details
                  </button>
                </div>
              ))}
          </div>
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
          onClick={() => setIsChatOpen(true)}
        >
          Interact with Category PDF
        </button>
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
}
