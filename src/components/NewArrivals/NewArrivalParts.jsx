import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import noImage from "../../assets/img/no_image.jpg"
import "./NewArrivalParts.css";

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
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);

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

  // ── Fetch “popular” parts
  useEffect(() => {
    if (!token) return;
    const codes = [
      "MA0OT00300B",
      "MA0OT05Q001",
      "MA0UQ00E000",
      "MA0BG00D000",
      "MA0BN03J000",
      "MA0FF034000",
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

  const handleClickViewDetails = (replacement) => {
    navigate(`/original/${replacement.replacement_part_item_code}`, {
      state: { query, results },
    });
  };

  return (
    <div>
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2>NEWLY ARRIVED</h2>
          <a href="/new-arrivals">View All</a>
        </div>
        {isLoadingProduct ? (
          <p>Loading products…</p>
        ) : (
          <div className="card-list">
            {recentCodeResults.map((product, index) => {
              const diff = product.price_difference ?? 0;
              const diffClass =
                diff > 0 ? "price-positive" : diff < 0 ? "price-negative" : "";
              return (
                <div
                  className="card"
                  key={index}
                  onClick={() => handleClickViewDetails(product)}
                >
                  <span className="tag">New</span>
                  <img
                    src={product.original_part_image === null ? noImage : product.original_part_image}
                    style={{ width: "100px", height: "100px" }}
                    alt={product.title}
                  />
                  <div className="product-details">
                    <h3>{product.original_part_name}</h3>
                    <div>
                      <p className="item-code">Item Code</p>
                      <p className="item-value">
                        {product.original_part_item_code}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Location</p>
                      <p className="item-value">{product.original_part_location}</p>
                      </div>
                    <div>
                      <p className="item-code">Stock</p>
                      <p className="item-value">
                        {product.original_part_stock}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Price</p>
                      <p className="price">
                        {formatPrice(product.original_part_price)}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Parts Description</p>
                      <p className="price">
                        {product.original_part_name_breakdown_definition}
                      </p>
                    </div>
                    <div>
                      <p className="item-code">Brand</p>
                      <span className="price">
                        {product.brand}
                      </span>
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
          <h2>POPULAR CATEGORIES</h2>
          <a href="/new-arrivals">View All</a>
        </div>
        {isLoadingCategory ? (
          <p>Loading Categories...</p>
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
                <h3>
                  {cat.name
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </h3>
                <p style={{ fontSize: "14px" }}>
                  {cat.msil_category.toUpperCase()}
                </p>
                <p>
                  <strong>View parts from this category</strong>
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default NewArrivalParts;
