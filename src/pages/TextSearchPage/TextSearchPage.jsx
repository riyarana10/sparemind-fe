import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import baseUrl from "../../services/base-url";

export default function TextSearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const q = params.get("query") || "";

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      setError("");
      try {
        const resp = await axios.get(
          `${baseUrl}/search_text?q=${encodeURIComponent(q)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResults(resp.data.results || []);
      } catch (e) {
        console.error(e);
        setError("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [q, token]);

  const fmt = (n) =>
    isNaN(parseFloat(n))
      ? "N/A"
      : Math.round(parseFloat(n)).toLocaleString("en-IN");

  const goBack = () => navigate(-1);
  const viewCat = (cat) =>
    navigate(`/category/${encodeURIComponent(cat.toLowerCase())}`);

  const categories = Array.from(
    new Set(results.map((r) => r.category).filter(Boolean))
  );

  if (loading) return <p className="app-container">Loading…</p>;
  if (error) return <p className="app-container error-message">{error}</p>;
  if (results.length === 0)
    return <p className="app-container">No matches for “{q}”.</p>;

  return (
    <div className="app-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>
      <h1>Search: “{q}”</h1>

      <h2>Matching Categories</h2>
      <div className="category-cards">
        {categories.map((c, i) => (
          <div key={i} className="category-card" onClick={() => viewCat(c)}>
            <h3>{c}</h3>
          </div>
        ))}
      </div>

      <h2>Matching Parts</h2>
      <div className="replacement-cards">
        {results.map((r, i) => {
          const diff = r.price_difference || 0;
          const cls = diff > 0 ? "price-positive" : "price-negative";
          return (
            <div key={i} className="replacement-card">
              <h3>{r.replacement_part_name}</h3>
              <p>
                <strong>Code:</strong> {r.replacement_part_item_code}
              </p>
              <p>
                <strong>Category:</strong> {r.category}
              </p>
              <p>
                <strong>Brand:</strong> {r.brand}
              </p>
              <p>
                <strong>Price:</strong> ₹{fmt(r.replacement_part_price)}
              </p>
              <p>
                <strong>Part Description:</strong>{" "}
                {r.replacement_part_name_breakdown_definition}
              </p>
              <p>
                <strong>Savings:</strong>{" "}
                <span className={cls}>
                  ₹{Math.round(diff).toLocaleString("en-IN")}
                </span>
              </p>
              <button
                onClick={() =>
                  navigate("/replacement", {
                    state: { replacement: r, query: q, results },
                  })
                }
              >
                View Details
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
