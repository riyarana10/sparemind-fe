import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import noImage from "../../assets/img/No_image1.png";
import "./NewArrivalParts.css";
import { Spin } from "antd";
import baseUrl from "../../services/base-url";

const formatPrice = (price) => {
  const num = typeof price === "string" ? parseFloat(price) : price;
  return Math.round(num).toLocaleString("en-IN");
};

const NewArrivalParts = ({ token }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);
  const [recentCategories, setRecentCategories] = useState([]);
  const [recentCodeResults, setRecentCodeResults] = useState([]);
  const initialQuery = location.state?.query || "";
  const initialResults = location.state?.results || [];
  const [query] = useState(initialQuery);
  const [results] = useState(initialResults);
  const [expandedCardIndex, setExpandedCardIndex] = useState(null);

  // Fetch top‐5 categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        setIsLoadingCategory(true);
        const resp = await axios.get(`${baseUrl}/categories?size=5`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecentCategories(resp.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCategory(false);
      }
    };
    if (token) fetchCats();
  }, [token]);

  // ── Fetch “popular” parts
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setIsLoadingProduct(true);
      try {
        const responses = await axios.get(`${baseUrl}/popular-parts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let topProducts = [];
        responses.data.featured_parts.forEach((item) => {
          topProducts.push(item.original[0]);
        });

        setRecentCodeResults(topProducts);
      } catch (err) {
        console.error("[DEBUG popular] error fetching popular parts:", err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    fetchData();
  }, [token]);

  const handleClickViewDetails = (product) => {
    localStorage.setItem("categoryId", product.category);
    navigate(`/original/${product.original_part_item_code}`, {
      state: { query, results },
    });
  };

  return (
    <div style={{ background: "#ffffff" }}>
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2>SPARE PARTS</h2>
        </div>
        {isLoadingProduct ? (
          <>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <Spin size="large" />
            </div>
            <p style={{ textAlign: "center" }}>Loading spare parts</p>
          </>
        ) : (
          <div className="card-list">
            {recentCodeResults.map((product, index) => {
              return (
                <div
                  className="card"
                  key={index}
                  onClick={() => handleClickViewDetails(product)}
                >
                  <span className="tag">New</span>
                  <div className="card-image">
                    <img
                      src={
                        product.original_part_image === null
                          ? noImage
                          : product.original_part_image
                      }
                      alt={product.title}
                      style={{
                        width: "100px",
                        height: "auto",
                        margin: "0.5rem 0",
                      }}
                    />
                  </div>
                  <div className="product-details">
                    <h3>
                      {product.original_part_name},{" "}
                      {product.category.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                      , {product.brand}
                    </h3>
                    <div>
                      <p className="item-code">Item Code</p>
                      <p className="item-value">
                        {product.original_part_item_code}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Location</p>
                      <p className="item-value">
                        {product.original_part_location}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Stock</p>
                      <p className="item-value">
                        {product.original_part_stock}{" "}
                        {product.original_part_stock > 1 ? "Units" : "Unit"}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Price</p>
                      <p className="price">
                        ₹{formatPrice(product.original_part_price)}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Brand</p>
                      <span className="price">{product.brand}</span>
                    </div>
                    <div className="read-more">
                      <p className="item-code">Parts Description</p>
                      <p
                        className={`price description ${
                          expandedCardIndex === index ? "expanded" : ""
                        }`}
                      >
                        {product.original_part_name_breakdown_definition}
                      </p>
                      {product.original_part_name_breakdown_definition.length >
                        60 && (
                        <button
                          className="read-more-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCardIndex(
                              expandedCardIndex === index ? null : index
                            );
                          }}
                        >
                          {expandedCardIndex === index
                            ? "Show Less"
                            : "Read More"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <section className="popular-categories">
        <div className="new-arrivals-header">
          <h2>CATEGORIES</h2>
        </div>
        {isLoadingCategory ? (
          <>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <Spin size="large" />
            </div>
            <p style={{ textAlign: "center" }}>Loading categories</p>
          </>
        ) : (
          <div className="category-grid">
            {recentCategories.map((cat, index) => (
              <div
                className="category-card"
                key={index}
                onClick={() =>
                  navigate(`/category/${cat.name.toLowerCase()}`, {
                    state: { query, results },
                  })
                }
              >
                <div className="category-card-details">
                  <div>
                    <img
                      style={{
                        width: "120px",
                        height: "100px",
                        border: "1px solid lightgray",
                        borderRadius: "4px",
                      }}
                      src={cat.image === "" ? noImage : cat.image}
                      alt="category=img"
                    />
                  </div>
                  <div>
                    <p className="item-code">PartsGenie Category</p>
                    <p className="item-value">
                      {cat.name
                        .split(" ")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() +
                            word.slice(1).toLowerCase()
                        )
                        .join(" ")}
                    </p>
                  </div>
                  <div>
                    <p className="item-code">MSIL Category</p>
                    <p className="item-value">{cat.msil_category}</p>
                  </div>
                </div>
                <div className="view-all-spare-parts">
                  <p>
                    <strong>View all spare parts</strong>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NewArrivalParts;
