import React, { useMemo, useState } from "react";
import ZoomImage from "./ZoomImage";
import { FaDownload, FaMapMarkerAlt, FaPaperclip } from "react-icons/fa";
import { parseSpecs, buildSpecsObject } from "../utils/specsParser";
import "./PartDetailsCard.css";

const PartDetailsCard = ({
  part,
  isOriginal = false,
  formatPrice = (p) => {
    const n = parseFloat(p);
    return isNaN(n) ? "N/A" : Math.round(n).toLocaleString("en-IN");
  },
  isSelectable = false,
  isSelected = false,
  resourceLink,
  showSpecs = true,
}) => {
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const toggleAllSpecs = () => {
    setShowAllSpecs(!showAllSpecs);
  };

  const partData = {
    item_code: isOriginal
      ? part.original_part_item_code
      : part.replacement_part_item_code,
    name: isOriginal ? part.original_part_name : part.replacement_part_name,
    description: isOriginal
      ? part.original_part_name_breakdown_definition
      : part.replacement_part_name_breakdown_definition,
    location: isOriginal
      ? part.original_part_location
      : part.replacement_part_location,
    stock: isOriginal ? part.original_part_stock : part.replacement_part_stock,
    price: isOriginal ? part.original_part_price : part.replacement_part_price,
    image: isOriginal ? part.original_part_image : part.replacement_part_image,
    brand: part.brand,
    category: part.category,
    category_msil_sheet: part.category_msil_sheet,
    source: part.replacement_source,
  };

  const specsJson = isOriginal ? part.original_specs : part.replacement_specs;
  const rawSpecs = isOriginal
    ? part.top_specs_original_part
    : part.top_specs_replacement_part;
  const specsObj = useMemo(() => buildSpecsObject(rawSpecs), [rawSpecs]);

  return (
    <div
      className={`part-details-card${isSelectable ? " selectable" : ""}${
        isSelected ? " selected" : ""
      }`}
    >
      {/* Left: Image */}
      <div className="part-image-container">
        <ZoomImage src={partData.image} alt={partData.name} />
      </div>

      {/* Center: Details */}
      <div className="part-details">
        <div className="part-header">
          <h1 className="part-name">{partData.name || "No name available"}</h1>
          <span className="part-source">{partData.source}</span>
        </div>

        <div className="details-grid">
          <div className="detail-row triple-column">
            <div className="detail-group">
              <span className="detail-label">Item Code</span>
              <span className="detail-value">
                {partData.item_code || "N/A"}
              </span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Location</span>
              <span className="detail-value">
                <FaMapMarkerAlt className="location-icon" />
                {partData.location || "N/A"}
              </span>
            </div>
            <div className="detail-group">
              <span className="detail-label">Brand</span>
              <span className="detail-value">
                {partData.brand || "Unknown"}
              </span>
            </div>
          </div>

          <div className="detail-row double-column">
            <div className="detail-group">
              <span className="detail-label">Category</span>
              <span className="detail-value">
                {partData.category || "Uncategorized"}
              </span>
            </div>
            <div className="detail-group">
              <span className="detail-label">MSIL Category</span>
              <span className="detail-value">
                {partData.category_msil_sheet || "N/A"}
              </span>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-group">
              <span className="detail-label">Description</span>
              <span className="detail-value">
                {partData.description || "No description available"}
              </span>
            </div>
          </div>

          {showSpecs &&
            (Object.keys(specsJson || {}).length > 0 ||
              (specsObj && Object.keys(specsObj).length > 0)) && (
              <div className="detail-row">
                <div className="detail-group">
                  <div className="specs-header">
                    <span className="detail-label">Specifications</span>
                    <button
                      className="toggle-all-specs"
                      onClick={toggleAllSpecs}
                    >
                      {showAllSpecs ? "Show Less" : "Read More"}
                    </button>
                  </div>
                  <div className="specs-list">
                    {specsJson && Object.keys(specsJson).length > 0
                      ? Object.entries(specsJson).map(
                          ([heading, items], idx) => (
                            <div
                              key={`${heading}-${idx}`}
                              className="spec-section"
                              style={{
                                display:
                                  showAllSpecs || idx === 0 ? "block" : "none",
                              }}
                            >
                              <h4 className="spec-heading">{heading}</h4>
                              <ul className="spec-items">
                                {items.map((item, j) => (
                                  <li key={j} className="spec-item">
                                    {item.replace(/^[•-]\s*/, "").trim()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )
                        )
                      : parseSpecs(rawSpecs)?.map((blk, idx) => (
                          <div
                            key={idx}
                            className="spec-section"
                            style={{
                              display:
                                showAllSpecs || idx === 0 ? "block" : "none",
                            }}
                          >
                            <h4 className="spec-heading">{blk.heading}</h4>
                            <ul className="spec-items">
                              {blk.items.map((it, j) => (
                                <li key={j} className="spec-item">
                                  {it}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="part-actions-container">
        <div className="vertical-divider"></div>
        <div className="part-actions">
          <div className="action-item">
            <div className="detail-label">Price</div>
            <div className="price-value">₹{formatPrice(partData.price)}</div>
          </div>

          <div className="action-item">
            <div className="detail-label">Stock</div>
            <div
              className={`stock-value ${
                partData.stock > 0 ? "in-stock" : "out-of-stock"
              }`}
            >
              {partData.stock > 0
                ? `${partData.stock} available`
                : "Out of stock"}
            </div>
          </div>

          {resourceLink ? (
            <a
              href={resourceLink}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
            >
              <FaPaperclip className="download-icon" />
              View Attachments
            </a>
          ) : (
            <button className="download-button" disabled>
              <FaDownload className="download-icon" />
              No Documents
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartDetailsCard;
