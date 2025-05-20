import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import noImage from "../../assets/img/No_image1.png";
import axios from "axios";
import "./SearchPage.css";
import baseUrl from "../../services/base-url";
import { Spin } from "antd";

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("query") || "";
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  const [originals, setOriginals] = useState([]);
  const [replacements, setReplacements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingProduct, setIsLoadingProdct] = useState(false);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  const formatPrice = (price) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return Math.round(num).toLocaleString("en-IN");
  };

  const Description = ({ text }) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = (e) => {
      e.stopPropagation(); // prevents the card click
      setExpanded((prev) => !prev);
    };

    const isLong = text.length > 100; // adjust limit as needed

    return (
      <div>
        <p className="item-code">Parts Description</p>
        <p className={`price ${!expanded && isLong ? "truncate-line" : ""}`}>
          {text}
        </p>
        {isLong && (
          <button onClick={toggleExpand} className="toggle-btn">
            {expanded ? "Show less" : "Show more"}
          </button>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError("");

    axios
      .get(`${baseUrl}/search_exact?q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { original, category, replacements } = res.data;
        if (original) {
          setOriginals([original]);
          setCategories(category ? [category] : []);
          setReplacements(replacements || []);
          return null;
        }
        return axios.get(
          `${baseUrl}/search_all?query=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((fuzzyRes) => {
        if (fuzzyRes && fuzzyRes.data) {
          setOriginals(fuzzyRes.data.originals.slice(0, 5) || []);
          setCategories(fuzzyRes.data.categories.slice(0, 5) || []);
          setReplacements(fuzzyRes.data.replacements || []);
        }
      })
      .catch((err) => {
        console.error("Search error:", err);
        setError("Failed to fetch search results");
      })
      .finally(() => setLoading(false));
  }, [q, token]);

  if (!q) return <p>Please enter a search term.</p>;
  if (loading)
    return (
      <>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "2rem",
            marginTop: "50px",
          }}
        >
          {" "}
          <Spin size="large" />{" "}
        </div>
        <p style={{ textAlign: "center" }}>Searching for “{q}"</p>
      </>
    );
  if (error) return <p className="error-message">{error}</p>;

  const topOriginals = originals.slice(0, 8);
  const topCategories = categories.slice(0, 8);
  const topReplacements = replacements.slice(0, 8);

  const handleView = (part, page) => {
    localStorage.setItem("categoryId", part.category);
    const code =
      page === "original"
        ? part.original_part_item_code
        : part.replacement_part_item_code;
    navigate(`/${page}/${code}`, {
      state: { query: q, results: replacements },
    });
  };

  return (
    <div>
      <div className="new-arrivals-container">
        {isLoadingProduct ? (
          <p>Loading products…</p>
        ) : topOriginals.length > 0 ? (
          <>
            <div className="new-arrivals-header">
              <h2>Original Parts</h2>
            </div>
            <div className="card-list">
              {topOriginals.map((product, index) => (
                <div
                  className={`search-card ${
                    topOriginals.length === 1 ? "single-card" : ""
                  }`}
                  key={index}
                  onClick={() => handleView(product, "original")}
                >
                  <img
                    src={
                      product.original_part_image === null
                        ? noImage
                        : product.original_part_image
                    }
                    style={{ width: "100px", height: "100px" }}
                    alt={product.title}
                  />
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
                        Rs. {formatPrice(product.original_part_price)}
                      </p>
                    </div>
                    <Description
                      text={product.original_part_name_breakdown_definition}
                    />
                    <div>
                      <p className="item-code">Brand</p>
                      <span className="price">{product.brand}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>No parts found</p>
        )}
      </div>

      {topCategories.length > 0 && (
        <section className="popular-categories">
          <div className="new-arrivals-header">
            <h2>Matched Categories</h2>
          </div>
          {isLoadingCategory ? (
            <p>Loading Categories...</p>
          ) : (
            <div className="category-grid">
              {topCategories.map((cat, index) => (
                <div
                  className={`search-category-card ${
                    topCategories.length === 1 ? "single-card" : ""
                  }`}
                  key={index}
                  onClick={() =>
                    navigate(`/category/${encodeURIComponent(cat.name)}`)
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
                        src={cat.image === null ? noImage : cat.image}
                      />
                    </div>
                    <div>
                      <p className="item-code">PartsGenie Category</p>
                      <p className="item-value">
                        {cat.name.replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">MSIL Category</p>
                      <p className="item-value">
                        {cat.msil_category === null
                          ? "Not Available"
                          : cat.msil_category}
                      </p>
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
      )}
    </div>
  );
}
