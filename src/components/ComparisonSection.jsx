import React, { useState } from "react";
import PartDetailsCard from "./PartDetailsCard";
import DecisionSection from "./DecisionSection";
import "./ComparisonSection.css";
import NoImage from ".././assets/img/no_image.jpg";

const ComparisonSection = ({
  original,
  replacements,
  formatPrice,
  SpecsComparison,
}) => {
  const [expandedCard, setExpandedCard] = useState(null);

  const toggleCard = (partCode) => {
    setExpandedCard(expandedCard === partCode ? null : partCode);
  };

  return (
    <div className="comparison-section">
      <h2 className="section-title">Alternative Parts</h2>

      <div className="cards-scroll-container">
        <div className="replacement-cards-row">
          {replacements.map((rep) => (
            <div
              key={rep.replacement_part_item_code}
              className={`replacement-card ${
                expandedCard === rep.replacement_part_item_code ? "active" : ""
              }`}
              onClick={() => toggleCard(rep.replacement_part_item_code)}
            >
              <div className="stock-badge">{rep.replacement_part_stock} {rep.replacement_part_stock > 1 ? "Units" : "Unit"}</div>

              {/* Simple image with fallback */}
              <img
                className="replacement-image"
                src={rep.replacement_part_image || NoImage}
                alt={rep.replacement_part_name}
                onError={(e) => {
                  e.target.src = NoImage;
                }}
              />

              <h3 className="rep-name">{rep.replacement_part_name}</h3>
              <p className="rep-code">
                Item Code
                <br />
                <strong>{rep.replacement_part_item_code}</strong>
              </p>

              <p className="rep-mrp-label">MRP</p>
              <p className="rep-price">
                ₹{formatPrice(rep.replacement_part_price)}
              </p>

              <p
                className={`rep-savings ${
                  original.original_part_price - rep.replacement_part_price < 0
                    ? "negative-savings"
                    : ""
                }`}
              >
                {original.original_part_price - rep.replacement_part_price < 0
                  ? `Don't Save: ₹${formatPrice(
                      Math.abs(
                        original.original_part_price -
                          rep.replacement_part_price
                      )
                    )}`
                  : `Save: ₹${formatPrice(
                      original.original_part_price - rep.replacement_part_price
                    )}`}
              </p>

              <button className="compare-button">📊 Compare</button>
            </div>
          ))}
        </div>
      </div>

      {expandedCard && (
        <div className="expanded-details">
          {(() => {
            const rep = replacements.find(
              (r) => r.replacement_part_item_code === expandedCard
            );
            return (
              <>
                <div className="comparison-grid">
                  <div className="replacement-part">
                    <h4>Replacement</h4>
                    <PartDetailsCard part={rep} formatPrice={formatPrice} />
                  </div>
                </div>

                <div className="differences-section">
                  <div className="difference-item">
                    <h4>Additions & Subtractions</h4>
                    <p>{rep.addition_subtraction || "No info available"}</p>
                  </div>
                  <div className="difference-item">
                    <h4>Reasons for Replacement</h4>
                    <p>{rep.reason_for_replacement || "None specified"}</p>
                  </div>
                  <div className="difference-item">
                    <h4>Key Notes</h4>
                    <p>
                      {rep.key_differences_notes || "No key notes provided"}
                    </p>
                  </div>
                </div>

                <SpecsComparison
                  originalSpecs={original.original_specs}
                  replacementSpecs={rep.replacement_specs}
                  originalPart={original}
                  replacementPart={rep}
                />

                <DecisionSection
                  original={original}
                  replacement={rep}
                  decision={
                    original.accepted
                      ? "accepted"
                      : original.rejected
                      ? "rejected"
                      : null
                  }
                  lastComment={original.comment || ""}
                  role={"admin"}
                  onDecision={() => {}}
                />
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ComparisonSection;
