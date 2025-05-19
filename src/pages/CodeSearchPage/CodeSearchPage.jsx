import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import baseUrl from "../../services/base-url";

export default function CodeSearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const query = params.get("query") || "";

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
          `${baseUrl}/search?original_part_item_code=${encodeURIComponent(
            query
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const hits = resp.data.results || [];
        setResults(
          hits.sort(
            (a, b) => (b.price_difference || 0) - (a.price_difference || 0)
          )
        );
      } catch (e) {
        console.error(e);
        setError("Search failed. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [query, token]);

  const fmt = (n) =>
    isNaN(parseFloat(n))
      ? "N/A"
      : Math.round(parseFloat(n)).toLocaleString("en-IN");

  const goBack = () => navigate(-1);
  const view = (r) =>
    navigate("/replacement", { state: { replacement: r, query, results } });

  if (loading) return <p className="app-container">Loading…</p>;
  if (error) return <p className="app-container error-message">{error}</p>;
  if (results.length === 0)
    return <p className="app-container">No parts found for “{query}”.</p>;

  const original = results[0];
  const rest = results.slice(1);

  return (
    <div className="app-container">
      <button className="back-button" onClick={goBack}>
        ← Back
      </button>
      <h1>Search Results for “{query}”</h1>

      <h2>Original Product</h2>
      <div className="original-card">
        <div>
          <h3>{original.original_part_name}</h3>
          <p>
            <strong>Item Code:</strong> {original.original_part_item_code}
          </p>
          <p>
            <strong>Location:</strong> {original.replacement_part_location}
          </p>
          <p>
            <strong>Category:</strong> {original.category}
          </p>
          <p>
            <strong>Brand:</strong> {original.brand}
          </p>
          <p>
            <strong>Price:</strong> ₹{fmt(original.original_part_price)}
          </p>
          <p>
            <strong>Part Description:</strong>{" "}
            {original.replacement_part_name_breakdown_definition}
          </p>
        </div>
        <div>
          {original.original_part_stock === 0 ? (
            <div className="out-of-stock">OUT OF STOCK</div>
          ) : (
            <>
              <p className="in-stock">
                In Stock: {original.original_part_stock}{" "}
                {original.original_part_stock > 1 ? "Units" : "Unit"}
              </p>
              <p>
                <strong>Location:</strong> {original.original_part_location}
              </p>
            </>
          )}
        </div>
      </div>

      <h2>Alternate Recommendations</h2>
      <div className="replacement-cards">
        {rest.map((r, i) => {
          const diff = r.price_difference || 0;
          const cls = diff > 0 ? "price-positive" : "price-negative";
          return (
            <div key={i} className="replacement-card">
              <h3>{r.replacement_part_name}</h3>
              <p>
                <strong>Item Code:</strong> {r.replacement_part_item_code}
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
              <button onClick={() => view(r)}>View Details</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
