import React, { useState, useEffect } from "react";
import PartDetailsCard from "../PartDetailsCard/PartDetailsCard";
import DecisionSection from "../DecisionSection/DecisionSection";
import "./ComparisonSection.css";
import NoImage from "../../assets/img/no_image.jpg";
import Icon from "../../assets/img/Icon.svg";
import axios from "axios";
import baseUrl from "../../services/base-url";
import cmpr from "../../assets/img/cmprr.svg";

const ComparisonSection = ({
  original,
  replacements,
  formatPrice,
  SpecsComparison,
}) => {
  const expandedRef = React.useRef(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [role, setRole] = useState("user");

  useEffect(() => {
    const updateRole = () => {
      const token = localStorage.getItem("access_token");
      const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
      setRole(payload.role || "user");
    };

    updateRole();

    const handleStorageChange = (e) => {
      if (e.key === "access_token") {
        updateRole();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    if (expandedCard && expandedRef.current) {
      // Scroll slightly above the element for better UX
      const yOffset = -100; // adjust this to match your header/nav height if any
      const y =
        expandedRef.current.getBoundingClientRect().top +
        window.pageYOffset +
        yOffset;

      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [expandedCard]);

  const [decisions, setDecisions] = useState(() => {
    const initialDecisions = {};
    replacements.forEach((rep) => {
      initialDecisions[rep.replacement_part_item_code] = {
        decision: rep.accepted ? "accepted" : rep.rejected ? "rejected" : null,
        lastComment: rep.comment || "",
      };
    });
    return initialDecisions;
  });

  const toggleCard = (partCode) => {
    setExpandedCard(expandedCard === partCode ? null : partCode);
  };

  const sendDecision = async (
    original,
    accepted,
    rejected,
    comment,
    replacement
  ) => {
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `${baseUrl}/decision`,
        {
          original_part_item_code: original.original_part_item_code,
          replacement_part_item_code: replacement.replacement_part_item_code,
          accepted,
          rejected,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update the decision state for this specific replacement
      setDecisions((prev) => ({
        ...prev,
        [replacement.replacement_part_item_code]: {
          decision: accepted ? "accepted" : "rejected",
          lastComment: comment,
        },
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to save your decision.");
    } finally {
    }
  };

  const onReview = async (original, replacement) => {
    setDecisions((prev) => ({
      ...prev,
      [replacement.replacement_part_item_code]: {
        decision: null,
        lastComment: prev[replacement.replacement_part_item_code].lastComment,
      },
    }));
  };

  return (
    <div className="comparison-section">
      <h2 className="section1-title">Alternative Parts</h2>

      <div className="cards-scroll-container">
        <div className="replacement-cards-row">
          {replacements
            // Sort by savings (highest first)
            .sort((a, b) => {
              const savingsA =
                original.original_part_price - a.replacement_part_price;
              const savingsB =
                original.original_part_price - b.replacement_part_price;
              return savingsB - savingsA; // Descending order
            })

            .map((rep, i) => (
              <div
                key={i}
                className={`replacement-card ${
                  expandedCard === rep.replacement_part_item_code
                    ? "active"
                    : ""
                }`}
              >
                <div className="stock-badge">
                  {rep.replacement_part_stock}{" "}
                  {rep.replacement_part_stock > 1 ? "Units" : "Unit"}
                </div>

                <img
                  className="replacement-image"
                  src={rep.replacement_part_image || NoImage}
                  alt={rep.replacement_part_name}
                  onError={(e) => {
                    e.target.src = NoImage;
                  }}
                />

                <div className="card-content">
                  <h3 className="rep-name">{rep.replacement_part_name}</h3>
                  <p style={{ marginBottom: "21px" }}>
                    <span style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                      Item Code:
                    </span>
                    <br />
                    <strong style={{ fontSize: "1rem", color: "#111827" }}>
                      {rep.replacement_part_item_code}
                    </strong>
                  </p>

                  <div className="price-row">
                    <div className="price-column">
                      <p className="rep-mrp-label">MRP</p>
                      <p className="rep-price">
                        ₹{formatPrice(rep.replacement_part_price)}
                      </p>
                    </div>
                    <div className="savings-column">
                      <p
                        className={`rep-savings ${
                          original.original_part_price -
                            rep.replacement_part_price <
                          0
                            ? "negative-savings"
                            : ""
                        }`}
                      >
                        {original.original_part_price -
                          rep.replacement_part_price <
                        0
                          ? `Extra Cost: ₹${formatPrice(
                              rep.replacement_part_price -
                                original.original_part_price
                            )}`
                          : `Save: ₹${formatPrice(
                              original.original_part_price -
                                rep.replacement_part_price
                            )}`}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  className="compare-button"
                  onClick={() => toggleCard(rep.replacement_part_item_code)}
                >
                  <img src={cmpr} alt="compare icon" />
                  Compare
                </button>
              </div>
            ))}
        </div>
      </div>

      {expandedCard && (
        <div className="expanded-details" ref={expandedRef}>
          {(() => {
            const rep = replacements.find(
              (r) => r.replacement_part_item_code === expandedCard
            );
            return (
              <>
                <div className="comparison-grid">
                  <div className="replacement-part">
                    <PartDetailsCard part={rep} formatPrice={formatPrice} />
                  </div>
                </div>
                <div className="lower-comparison-grid">
                  <h4
                    style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "24px",
                      fontWeight: 600,
                      color: "#000000",
                      gap: "0.75rem",
                      // padding: "2.5rem",
                      marginTop: "2rem",
                      marginBottom: "2.5rem",
                      fontFamily: "DM Sans",
                    }}
                  >
                    <img
                      src={Icon}
                      alt="Replacement Icon"
                      style={{ width: "2rem", height: "1rem" }}
                    />
                    <span>Replacement Insights</span>
                  </h4>
                  <div className="differences-section">
                    <div className="difference-item">
                      <h4>{"Additions & Subtractions".toUpperCase()}</h4>

                      <p>{rep.addition_subtraction || "No info available"}</p>
                    </div>
                    <div className="difference-item">
                      <h4>{"Reasons for Replacement".toUpperCase()}</h4>

                      <p>{rep.reason_for_replacement || "None specified"}</p>
                    </div>
                    <div className="difference-item">
                      <h4>{"Key Notes".toUpperCase()}</h4>

                      <p>
                        {rep.key_differences_notes || "No key notes provided"}
                      </p>
                    </div>
                  </div>

                  <SpecsComparison
                    originalSpecs={rep.original_specs}
                    replacementSpecs={rep.replacement_specs}
                    originalPart={original}
                    replacementPart={rep}
                  />

                  {role !== "user" && (
                    <DecisionSection
                      original={original}
                      replacement={rep}
                      decision={
                        decisions[rep.replacement_part_item_code]?.decision ||
                        null
                      }
                      lastComment={
                        decisions[rep.replacement_part_item_code]
                          ?.lastComment || ""
                      }
                      role={role}
                      onDecision={sendDecision}
                      onReview={onReview}
                    />
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ComparisonSection;
