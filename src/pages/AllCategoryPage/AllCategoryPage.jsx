import React, { useState, useEffect } from "react";
import { Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AllCategoryPage.css";

const { Title } = Typography;

const groupCategories = (categories) => {
  return categories.reduce((acc, category) => {
    const label = category.name || "";
    const key = /^[0-9]/.test(label[0]) ? "0-9" : label[0].toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(label);
    return acc;
  }, {});
};

const AllCategoryPage = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [allCategory, setAllCategory] = useState([]);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setIsLoadingCategory(true);
        const resp = await axios.get("/api/all-categories", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setAllCategory(resp.data.categories || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setIsLoadingCategory(false);
      }
    };

    if (localStorage.getItem("access_token")) fetchCats();
  }, []);

  const grouped = groupCategories(allCategory);
  const letters = Object.keys(grouped).sort();
  const availableLetters = new Set(letters);

  const getBtnClass = (char) => {
    let base = "alphabet-btn";
    if (!availableLetters.has(char)) return `${base} inactive`;
    if (selectedLetter === char) return `${base} active`;
    return base;
  };

  return (
    <div className="all-categories-page">
      <Card>
        <h2>All Categories</h2>

        <div className="main-content">
          <div className="alphabet-nav">
            {Array.from({ length: 26 }, (_, i) =>
              String.fromCharCode(65 + i)
            ).map((char) => (
              <div
                key={char}
                className={getBtnClass(char)}
                onClick={() =>
                  availableLetters.has(char) && setSelectedLetter(char)
                }
                style={{ letterSpacing: "10px", fontSize: "20px" }}
              >
                {char}
              </div>
            ))}
          </div>

          {letters.map((letter) => {
            if (selectedLetter && selectedLetter !== letter) return null;
            return (
              <section key={letter} className="category-section">
                <Title level={5} style={{ fontSize: "20px" }}>
                  {letter}
                </Title>
                {grouped[letter]
                  .sort((a, b) => a.localeCompare(b))
                  .map((name) => (
                    <p
                      key={name}
                      onClick={() =>
                        navigate(`/category/${name.toLowerCase()}`)
                      }
                      className="product-category-name"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      {name.toUpperCase()}
                    </p>
                  ))}
              </section>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AllCategoryPage;
