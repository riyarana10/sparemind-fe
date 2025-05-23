import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import noImage from "../../assets/img/No_image1.png";
import "./CategoryPage.css";
import ChatBot from "../../components/Chatbot/ConversationBot";
import baseUrl from "../../services/base-url";
import { Spin } from "antd";
import { formatPrice } from "../../utils/utils";

const CategoryPage = () => {
  const { name } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stage, setStage] = useState("choose");
  const [isOpen, setIsOpen] = useState(false);

  const token = localStorage.getItem("access_token");
  localStorage.setItem("categoryId", name);

  useEffect(() => {
    const fetchByCategory = async () => {
      setIsLoading(true);
      setError("");
      try {
        const resp = await axios.get(
          `${baseUrl}/search_by_category?category=${encodeURIComponent(
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

  const handleView = (r, page) => {
    const path =
      page === "replacement"
        ? `/replacement/${r.replacement_part_item_code}`
        : `/original/${r.original_part_item_code}`;
    navigate(path, { state: { query: name, results } });
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setIsOpen(!isOpen);
    setStage("choose");
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        className="category-product-container"
        style={{ width: isOpen ? "70%" : "100%", transition: "width 0.3s" }}
      >
        <h2 className="category-title">
          {name
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")}{" "}
          – Original Parts
        </h2>
        {isLoading ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              {" "}
              <Spin size="large" />{" "}
            </div>
            <p style={{ textAlign: "center" }}>Loading original parts</p>
          </>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : results.length === 0 ? (
          <p>No parts found in this category.</p>
        ) : (
          <>
            {results
              .filter((r) => r.original_part_item_code)
              .map((item, i) => (
                <div key={i} className="category-product-card">
                  <img
                    src={
                      item.original_part_image === null
                        ? noImage
                        : item.original_part_image
                    }
                    alt={item.original_part_name}
                    className="category-product-image"
                  />
                  <div className="category-product-details">
                    <div className="category-product-main">
                      <h3 className="category-product-name">
                        <div style={{ width: "100%" }}>
                          {item.original_part_name},{" "}
                        </div>
                        <div style={{ width: "100%" }}>
                          {item.category
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")}
                          , {item.brand}
                        </div>
                      </h3>
                      <div className="stock-replacement">
                        <span
                          className={`stock-tag ${
                            item.original_part_stock > 20
                              ? "stock-green"
                              : "stock-yellow"
                          }`}
                        >
                          In stock: {item.original_part_stock}{" "}
                          {item.original_part_stock > 1 ? "Units" : "Unit"}
                        </span>
                        {item.total_replacement > 0 && (
                          <span className="category-product-replacement-tag">
                            {item.total_replacement}{" "}
                            {item.total_replacement > 1
                              ? "replacements"
                              : "replacement"}{" "}
                            available
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="product-info-title">Parts Description</p>
                      <p className="product-info-value">
                        {item.original_part_name_breakdown_definition}
                      </p>
                    </div>

                    <div className="category-product-status-details">
                      <div>
                        <p className="product-info-title">Price</p>
                        <p className="product-info-value">
                          ₹{formatPrice(item.original_part_price)}
                        </p>
                      </div>

                      <div>
                        <p className="product-info-title">Item Code</p>
                        <p className="product-info-value">
                          {item.original_part_item_code}
                        </p>
                      </div>

                      <div>
                        <p className="product-info-title">Location</p>
                        <p className="product-info-value">
                          {item.original_part_location}
                        </p>
                      </div>

                      <div>
                        <p className="product-info-title">Brand</p>
                        <p className="product-info-value">{item.brand}</p>
                      </div>

                      <div className="category-product-status">
                        <button
                          className="view-details-button"
                          onClick={() => handleView(item, "original")}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}

        {/* replacement parts of the category */}

        <br />

        <h2 className="category-title" style={{ marginTop: "20px" }}>
          {name
            .split(" ")
            .map(
              (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            )
            .join(" ")}{" "}
          – Replacement Parts
        </h2>
        {isLoading ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                padding: "2rem",
              }}
            >
              {" "}
              <Spin size="large" />{" "}
            </div>
            <p style={{ textAlign: "center" }}>Loading replacement parts</p>
          </>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : results.length === 0 ? (
          <p>No parts found in this category.</p>
        ) : (
          <>
            {results
              .filter((r) => r.replacement_part_item_code)
              .map((item, i) => (
                <div key={i} className="category-product-card">
                  <img
                    src={
                      item.replacement_part_image === null
                        ? noImage
                        : item.replacement_part_image
                    }
                    alt={item.replacement_part_name}
                    className="category-product-image"
                  />
                  <div className="category-product-details">
                    <div className="category-product-main">
                      <h3 className="category-product-name">
                        <div style={{ width: "100%" }}>
                          {item.replacement_part_name},{" "}
                        </div>
                        <div style={{ width: "100%" }}>
                          {item.category
                            .split(" ")
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase()
                            )
                            .join(" ")}
                          , {item.replacement_brand}
                        </div>
                      </h3>
                      <div className="stock-replacement">
                        <span
                          className={`stock-tag ${
                            item.replacement_part_stock > 20
                              ? "stock-green"
                              : "stock-yellow"
                          }`}
                        >
                          In stock: {item.replacement_part_stock}{" "}
                          {item.replacement_part_stock > 1 ? "Units" : "Unit"}
                        </span>
                        {item.total_replacement > 0 && (
                          <span className="category-product-replacement-tag">
                            {item.total_replacement}{" "}
                            {item.total_replacement > 1
                              ? "replacements"
                              : "replacement"}{" "}
                            available
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="product-info-title">Parts Description</p>
                      <p className="product-info-value">
                        {item.replacement_part_name_breakdown_definition}
                      </p>
                    </div>

                    <div className="category-product-status-details">
                      <div>
                        <p className="product-info-title">Price</p>
                        <p className="product-info-value">
                          ₹{formatPrice(item.replacement_part_price)}
                        </p>
                      </div>

                      <div>
                        <p className="product-info-title">Item Code</p>
                        <p className="product-info-value">
                          {item.replacement_part_item_code}
                        </p>
                      </div>

                      <div>
                        <p className="product-info-title">Location</p>
                        <p className="product-info-value">
                          {item.replacement_part_location}
                        </p>
                      </div>

                      <div>
                        <p className="product-info-title">Brand</p>
                        <p className="product-info-value">{item.replacement_brand}</p>
                      </div>

                      <div className="category-product-status">
                        <button
                          className="view-details-button"
                          onClick={() => handleView(item, "replacement")}
                        >
                          View details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </>
        )}
      </div>
      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
          Know more about{" "}
          {name
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </button>
      )}
      <div
        style={{
          width: isOpen ? "30%" : "0",
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatBot
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          stage={stage}
          setStage={setStage}
          toggleChat={handleChatToggle}
        />
      </div>
    </div>
  );
};

export default CategoryPage;
