import React, { useState } from "react";
import { Radio, Button, Typography, Card } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import "./AllCategoryPage.css";

const { Title } = Typography;

const CATEGORY_OPTIONS = [
  "Pneumatics",
  "AIR BOOSTER REGULATOR",
  "AIR CYLINDER",
  "AIR FILTER",
  "AIR LUBRICATOR",
  "AIR REGULATOR",
  "AIR CYLINDER  KF-531",
  "COMPACT CYLINDER",
  "COMPACT GUIDE CYLINDER",
  "COMPACT SLIDE TABLE CYLINDER",
  "COOLANT VALVE",
  "CYLINDER",
  "FILTER ELEMENT",
  "FITTING STRAIGHT CONNECTOR",
  "FLOATING JOINT",
  "FLOW SWITCH",
  "GRIPPER CYLINDER",
  "GUIDE CYLINDER",
  "HYDRAULIC CYLINDER",
  "ISO SOLENOID VALVE",
  "PNEUMATIC PIPE 04 MM",
  "PNEUMATIC PIPE 12 MM",
  "PNEUMATIC PIPE 16 MM",
  "POWER CYLINDER",
  "PRESSURE SWITCH CABLE",
  "PROCESS VALVE",
  "QUICK EXHAUST VALVE",
  "REED SWITCH",
  "ROTARY ACTUATOR",
  "SILENCER",
  "SOLENOID VALVE",
  "SPEED CONTROLLER",
  "VALVE",
];

const groupCategories = (categories) => {
  return categories.reduce((acc, category) => {
    const key = /^[0-9]/.test(category[0]) ? "0-9" : category[0].toUpperCase();
    if (!acc[key]) acc[key] = [];
    acc[key].push(category);
    return acc;
  }, {});
};

const AllCategoryPage = () => {
  const navigate = useNavigate();
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const grouped = groupCategories(CATEGORY_OPTIONS);
  const letters = Object.keys(grouped).sort();
  const availableLetters = new Set(Object.keys(grouped));

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
                disabled={!availableLetters.has(char)}
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
                {grouped[letter].sort().map((cat) => (
                  <p
                    onClick={() => navigate(`/category/${cat.toLowerCase()}`)}
                    className="product-category-name"
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: "18px",
                    }}
                  >
                    {cat.toUpperCase()}
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
