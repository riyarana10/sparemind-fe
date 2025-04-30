import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const nav = useNavigate();
  const token = localStorage.getItem("access_token");

  const [cats, setCats] = useState([]);
  const [parts, setParts] = useState([]);
  const [loadingCats, setLoadingCats] = useState(false);
  const [loadingParts, setLoadingParts] = useState(false);

  useEffect(() => {
    async function fetchCats() {
      setLoadingCats(true);
      try {
        const { data } = await axios.get(
          "/api/categories?size=5",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCats(data.categories || []);
      } finally {
        setLoadingCats(false);
      }
    }
    fetchCats();
  }, [token]);

  useEffect(() => {
    const codes = [
      "MA0BN03K000",
      "MA0BN03A001",
      "MA0BN03A001",
      "MA0BM00W000",
      "MA0P500G000",
    ];
    setLoadingParts(true);
    Promise.all(
      codes.map((c) =>
        axios.get(`/api/search?original_part_item_code=${c}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    )
      .then((resps) => {
        const all = resps.flatMap((r) => r.data.results || []);
        all.sort(
          (a, b) => (b.price_difference || 0) - (a.price_difference || 0)
        );
        setParts(all.slice(0, 5));
      })
      .finally(() => setLoadingParts(false));
  }, [token]);

  const fmt = (n) =>
    isNaN(parseFloat(n))
      ? "N/A"
      : Math.round(parseFloat(n)).toLocaleString("en-IN");

  return (
    <div className="app-container">
      <h2>Popular Categories</h2>
      {loadingCats ? (
        <p>Loading categories…</p>
      ) : (
        <div className="category-cards">
          {cats.map((c, i) => (
            <div
              key={i}
              className="category-card"
              onClick={() => nav(`/category/${c.name.toLowerCase()}`)}
            >
              <h3>{c.name}</h3>
              <p>View parts</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-5">Popular Part Recommendations</h2>
      {loadingParts ? (
        <p>Loading parts…</p>
      ) : (
        <div className="replacement-cards">
          {parts.map((r, i) => {
            const diff = r.price_difference || 0;
            const cls = diff > 0 ? "price-positive" : "price-negative";
            return (
              <div key={i} className="replacement-card">
                <h3>{r.replacement_part_name}</h3>
                <p>
                  <strong>Code:</strong> {r.replacement_part_item_code}
                </p>
                <p>
                  <strong>Price:</strong> ₹{fmt(r.replacement_part_price)}
                </p>
                <p>
                  <strong>Savings:</strong>{" "}
                  <span className={cls}>
                    ₹{Math.round(diff).toLocaleString("en-IN")}
                  </span>
                </p>
                <button
                  onClick={() =>
                    nav("/replacement", {
                      state: { replacement: r, results: parts },
                    })
                  }
                >
                  View Details
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
