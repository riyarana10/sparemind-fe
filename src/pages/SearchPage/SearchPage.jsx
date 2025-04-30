import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../App.css";

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

  const topOriginals = originals.slice(0, 5);
  const topCategories = categories.slice(0, 5);
  const topReplacements = replacements.slice(0, 5);

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
    <div className="home-container">
      {topOriginals.length > 0 && (
        <section className="cards-section">
          <h2>Original Parts</h2>
          <div className="cards-grid">
            {topOriginals.map((o, i) => (
              <div key={i} className="replacement-card">
                <h3>{o.original_part_name}</h3>
                <p>
                  <strong>Item Code:</strong> {o.original_part_item_code}
                </p>
                <p>
                  <strong>Location:</strong> {o.original_part_location}
                </p>
                <p>
                  <strong>Stock:</strong> {o.original_part_stock}
                </p>
                <p>
                  <strong>Price:</strong> ₹
                  {Math.round(o.original_part_price).toLocaleString("en-IN")}
                </p>
                <p>
                  <strong>Part Description:</strong>
                  <br />
                  {o.original_part_name_breakdown_definition}
                </p>
                <p>
                  <strong>Brand:</strong> {o.brand}
                </p>
                <button onClick={() => handleView(o, "original")}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {topCategories.length > 0 && (
        <section className="cards-section">
          <h2>Matched Categories</h2>
          <div className="cards-grid">
            {topCategories.map((c, i) => (
              <div key={i} className="category-card-search">
                <h3>{c}</h3>
                <button
                  onClick={() => navigate(`/category/${encodeURIComponent(c)}`)}
                >
                  View Category
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {topReplacements.length > 0 && (
        <section className="cards-section">
          <h2>Replacements</h2>
          <div className="cards-grid">
            {topReplacements.map((r, i) => (
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
                  {Math.round(r.replacement_part_price).toLocaleString("en-IN")}
                </p>
                <p>
                  <strong>Part Description:</strong>
                  <br />
                  {r.replacement_part_name_breakdown_definition}
                </p>
                <p>
                  <strong>Savings:</strong> ₹
                  {Math.round(r.price_difference).toLocaleString("en-IN")}
                </p>
                <button onClick={() => handleView(r, "replacement")}>
                  View Details
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
      {topOriginals.length === 0 &&
        topCategories.length === 0 &&
        topReplacements.length === 0 && <p>No results found for “{q}”.</p>}
    </div>
  );
}
