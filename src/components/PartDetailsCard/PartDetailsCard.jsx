import { useMemo, useState } from "react";
import ZoomImage from "../ZoomImage/ZoomImage";
import { parseSpecs, buildSpecsObject } from "../../utils/utils";
import "./PartDetailsCard.css";
import { Modal, Button, List } from "antd";
import location from "../../assets/img/location.svg";
import file from "../../assets/img/file.svg";

const PartDetailsCard = ({
  part,
  isOriginal = false,
  formatPrice,
  resourceLink,
  isSelectable = false,
  isSelected = false,
  showSpecs = true,
}) => {
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const partData = {
    item_code: isOriginal
      ? part?.original_part_item_code
      : part?.replacement_part_item_code,
    name: isOriginal ? part?.original_part_name : part?.replacement_part_name,
    description: isOriginal
      ? part?.original_part_name_breakdown_definition
      : part?.replacement_part_name_breakdown_definition,
    location: isOriginal
      ? part?.original_part_location
      : part?.replacement_part_location,
    stock: isOriginal
      ? part?.original_part_stock
      : part?.replacement_part_stock,
    price: isOriginal
      ? part?.original_part_price
      : part?.replacement_part_price,
    image: isOriginal
      ? part?.original_part_image
      : part?.replacement_part_image,
    brand: isOriginal ? 
           part?.brand
           : part?.replacement_part_brand,
    category: part?.category,
    msil_category: part?.msil_category,
    source: part?.replacement_source,
  };

  const specsJson = isOriginal ? part?.original_specs : part?.replacement_specs;
  const rawSpecs = isOriginal
    ? part?.top_specs_original_part
    : part?.top_specs_replacement_part;
  const specsObj = useMemo(() => buildSpecsObject(rawSpecs || ""), [rawSpecs]);

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
          <h1 className="part-name">
            {`${partData.name}, ${partData.category.replace(/\b\w/g, (char) =>
              char.toUpperCase()
            )}, ${partData.brand === null ? "" : partData.brand}` || "No name available"}
          </h1>
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
                {partData.brand === null ? "" : partData.brand}
              </span>
            </div>
          </div>
          <div
            className="detail-row double-column"
            style={{ display: "flex", flexDirection: "row", gap: "30px" }}
          >
            <div className="detail-group">
              <span className="detail-label">PartsGenie Category</span>
              <span className="detail-value">
                <div className="">
                  {(partData.category || "Uncategorized")
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")}
                </div>
              </span>
            </div>
            <div className="detail-group">
              <span className="detail-label">MSIL Category</span>
              <span className="detail-value">
                {partData.msil_category || "N/A"}
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
            ((specsJson && specsJson.length > 0) ||
              (specsObj && Object.keys(specsObj).length > 0)) && (
              <div className="detail-row">
                <div className="detail-group">
                  <span className="detail-label">More Details</span>
                  <div className="specs-grid">
                    {(specsJson && specsJson.length > 0
                      ? specsJson.reduce((acc, specItem) => {
                          const [heading, value] = Object.entries(specItem)[0];
                          const existingGroup = acc.find(
                            (group) => group.heading === heading
                          );
                          if (existingGroup) {
                            existingGroup.items.push(value);
                          } else {
                            acc.push({ heading, items: [value] });
                          }
                          return acc;
                        }, [])
                      : (parseSpecs(rawSpecs) || []).map((blk) => ({
                          ...blk,
                          items: Array.isArray(blk?.items)
                            ? blk.items
                            : [blk?.items || ""],
                        }))
                    )
                      .slice(0, showAllSpecs ? undefined : 1)
                      .map((blk, idx) => (
                        <div key={idx} className="spec-block">
                          <h4>{blk?.heading || "Specifications"}</h4>
                          <ul>
                            {blk.items.map((item, j) => (
                              <li key={j}>
                                {typeof item === "string"
                                  ? // eslint-disable-next-line
                                    item.replace(/^[•\-]\s*/, "")?.trim() ??
                                    item
                                  : JSON.stringify(item)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                  </div>

                  {((specsJson && specsJson.length > 1) ||
                    (specsObj && Object.keys(specsObj).length > 1) ||
                    (parseSpecs(rawSpecs) || []).length > 1) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllSpecs(!showAllSpecs);
                      }}
                      className="toggle-specs-btn"
                    >
                      {showAllSpecs ? "Show Less" : "Read More"}
                    </button>
                  )}
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
          <div className="action-item action-item-location">
            <div className="location-wrapper flex items-center space-x-4">
              <img
                src={location}
                alt="Location"
                className="location-icon w-10 h-10 text-gray-500"
              />
              <div style={{ fontFamily: "IBM Plex Sans Condensed" }}>
                <p
                  className="text-gray-500 text-sm font-sans"
                  style={{
                    fontSize: "16px",
                    fontWeight: "400",
                    color: "#000000",
                    opacity: "50%",
                  }}
                >
                  Location
                </p>
                <p
                  className="font-sans font-extrabold text-gray-900 text-base leading-tight"
                  style={{ fontSize: "18px", fontWeight: "700" }}
                >
                  {partData.location || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {resourceLink ? (
            <button
              onClick={() => {
                if (resourceLink.length > 1) {
                  setIsModalOpen(true);
                } else {
                  window.open(resourceLink[0], "_blank");
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="download-button"
            >
              <img src={file} alt="" />
              Download PDF Specs
            </button>
          ) : (
            <button className="download-button" disabled>
              <img src={file} alt="" />
              No PDF Docs
            </button>
          )}
        </div>
      </div>

      {/* modal for multiple pdf links  */}
      <Modal
        title={`Attachments`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
        ]}
      >
        <List
          dataSource={resourceLink}
          renderItem={(link, index) => (
            <List.Item key={index}>
              <div style={{ wordBreak: "break-all", maxWidth: "100%" }}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link}
                </a>
              </div>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default PartDetailsCard;
