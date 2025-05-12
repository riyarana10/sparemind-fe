import React, { useMemo, useState } from "react";
import ZoomImage from "./ZoomImage";
import { FaDownload, FaMapMarkerAlt, FaPaperclip } from "react-icons/fa";
import { parseSpecs, buildSpecsObject } from "../utils/specsParser";
import "./PartDetailsCard.css";
import location from "../assets/img/location.svg";

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
              <span className="detail-value">{partData.location || "N/A"}</span>
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
        <span className="detail-label">More Details</span>
        <div className="specs-grid">
          {(specsJson && Object.keys(specsJson).length > 0
            ? Object.entries(specsJson).map(([heading, items]) => ({
                heading,
                items,
              }))
            : parseSpecs(rawSpecs)
          )
            ?.slice(0, showAllSpecs ? undefined : 1)
            .map((blk, idx) => (
              <div key={idx} className="spec-block">
                <h4>{blk.heading}</h4>
                <ul>
                  {blk.items.map((item, j) => (
                    <li key={j}>
                      {item.replace?.(/^[•\-]\s*/, "").trim() ?? item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>

        {/* Toggle Button */}
        {(specsJson && Object.keys(specsJson).length > 1) ||
        (specsObj && Object.keys(specsObj).length > 1) ? (
          <button
            onClick={() => setShowAllSpecs(!showAllSpecs)}
            className="toggle-specs-btn"
          >
            {showAllSpecs ? "Show Less" : "Read More"}
          </button>
        ) : null}
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
            <div className="detail-label">MRP</div>
            <div className="price-value">₹{formatPrice(partData.price)}</div>
          </div>

          <div className="action-item">
            <div
              className={`stock-value ${
                partData.stock > 0 ? "in-stock" : "out-of-stock"
              }`}
            >
              {partData.stock > 0
                ? `In stock: ${partData.stock}`
                : "Out of stock"}
            </div>
          </div>
          <div className="action-item">
            <div className="location-wrapper flex items-center space-x-4">
              <img
                src={location}
                alt="Location"
                className="location-icon w-10 h-10 text-gray-500"
              />
              <div>
                <p className="text-gray-500 text-sm font-sans">Location</p>
                <p className="font-sans font-extrabold text-gray-900 text-base leading-tight">
                  {partData.location}
                </p>
              </div>
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
              Download PDF Docs
            </a>
          ) : (
            <button className="download-button" disabled>
              <FaDownload className="download-icon" />
              No PDF Docs
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartDetailsCard;
