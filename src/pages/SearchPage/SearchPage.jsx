import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import noImage from "../../assets/img/No_image1.png";
import axios from "axios";
import "./SearchPage.css";

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
      .get(`/api/search_exact?q=${encodeURIComponent(q)}`, {
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
          `/api/search_all?query=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      })
      .then((fuzzyRes) => {
        if (fuzzyRes && fuzzyRes.data) {
          setOriginals(fuzzyRes.data.originals || []);
          setCategories(fuzzyRes.data.categories || []);
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
  if (loading) return <p>Searching for “{q}”…</p>;
  if (error) return <p className="error-message">{error}</p>;

  const topOriginals = originals.slice(0, 8);
  const topCategories = categories.slice(0, 8);
  const topReplacements = replacements.slice(0, 8);

  const handleView = (part, page) => {
    const code =
      page === "original"
        ? part.original_part_item_code
        : part.replacement_part_item_code;
    navigate(`/${page}/${code}`, {
      state: { query: q, results: replacements },
    });
  };

  return (
    // <div className="home-container">
    //   {topOriginals.length > 0 && (
    //     <section className="cards-section">
    //       <h2>Original Parts</h2>
    //       <div className="cards-grid">
    //         {topOriginals.map((o, i) => (
    //           <div key={i} className="replacement-card">
    //             <h3>{o.original_part_name}</h3>
    //             <p>
    //               <strong>Item Code:</strong> {o.original_part_item_code}
    //             </p>
    //             <p>
    //               <strong>Location:</strong> {o.original_part_location}
    //             </p>
    //             <p>
    //               <strong>Stock:</strong> {o.original_part_stock} Unit
    //             </p>
    //             <p>
    //               <strong>Price:</strong> ₹
    //               {Math.round(o.original_part_price).toLocaleString("en-IN")}
    //             </p>
    //             <p>
    //               <strong>Part Description:</strong>
    //               <br />
    //               {o.original_part_name_breakdown_definition}
    //             </p>
    //             <p>
    //               <strong>Brand:</strong> {o.brand}
    //             </p>
    //             <button onClick={() => handleView(o, "original")}>
    //               View Details
    //             </button>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //   )}
    //   {topCategories.length > 0 && (
    //     <section className="cards-section">
    //       <h2>Matched Categories</h2>
    //       <div className="cards-grid">
    //         {topCategories.map((c, i) => (
    //           <div key={i} className="category-card-search">
    //             <h3>{c}</h3>
    //             <button
    //               onClick={() => navigate(`/category/${encodeURIComponent(c)}`)}
    //             >
    //               View Category
    //             </button>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //   )}
    //   {topReplacements.length > 0 && (
    //     <section className="cards-section">
    //       <h2>Replacements</h2>
    //       <div className="cards-grid">
    //         {topReplacements.map((r, i) => (
    //           <div key={i} className="replacement-card">
    //             <h3>{r.replacement_part_name}</h3>
    //             <p>
    //               <strong>Item Code:</strong> {r.replacement_part_item_code}
    //             </p>
    //             <p>
    //               <strong>Location:</strong> {r.replacement_part_location}
    //             </p>
    //             <p>
    //               <strong>Stock:</strong> {r.replacement_part_stock} Unit
    //             </p>
    //             <p>
    //               <strong>Price:</strong> ₹
    //               {Math.round(r.replacement_part_price).toLocaleString("en-IN")}
    //             </p>
    //             <p>
    //               <strong>Part Description:</strong>
    //               <br />
    //               {r.replacement_part_name_breakdown_definition}
    //             </p>
    //             <p>
    //               <strong>Savings:</strong> ₹
    //               {Math.round(r.price_difference).toLocaleString("en-IN")}
    //             </p>
    //             <button onClick={() => handleView(r, "replacement")}>
    //               View Details
    //             </button>
    //           </div>
    //         ))}
    //       </div>
    //     </section>
    //   )}
    //   {topOriginals.length === 0 &&
    //     topCategories.length === 0 &&
    //     topReplacements.length === 0 && <p>No results found for “{q}”.</p>}
    // </div>

    <div>
      <div className="new-arrivals-container">
        <div className="new-arrivals-header">
          <h2>Original Parts</h2>
        </div>
        {isLoadingProduct ? (
          <p>Loading products…</p>
        ) : (
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
                    navigate(`/category/${encodeURIComponent(cat)}`)
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
                  {/* <strong>PartsGenie Category : </strong>
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
                  <strong>MSIL Category :</strong> {cat.msil_category.toUpperCase()}
                </p> */}
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
