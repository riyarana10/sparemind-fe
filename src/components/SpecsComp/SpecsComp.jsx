import React, { useState } from "react";
import { formatPrice } from "../../utils/utils";
import "./SpecComp.css";

const SpecsComparison = ({
  originalSpecs = [],
  replacementSpecs = [],
  originalPart = {},
  replacementPart = {},
}) => {
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);

  // Custom renderer for image cells
  const renderImageCell = (imageUrl) => {
    if (!imageUrl || imageUrl === "N/A") return "N/A";
    return <img src={imageUrl} alt="Part" className="part-image" />;
  };

  // General information fields
  const generalInfoFields = [
    {
      label: "Part Name",
      original: originalPart.original_part_name,
      replacement: replacementPart.replacement_part_name,
    },
    {
      label: "Image",
      original: originalPart.original_part_image,
      replacement: replacementPart.replacement_part_image,
      isImage: true,
    },
    {
      label: "Item Code",
      original: originalPart.original_part_item_code,
      replacement: replacementPart.replacement_part_item_code,
    },
    {
      label: "Location",
      original: originalPart.original_part_location,
      replacement: replacementPart.replacement_part_location,
    },
    {
      label: "Stock",
      original: originalPart.original_part_stock,
      replacement: replacementPart.replacement_part_stock,
    },
    {
      label: "Price",
      original: `$${formatPrice(originalPart.original_part_price)}`,
      replacement: `$${formatPrice(replacementPart.replacement_part_price)}`,
    },
    {
      label: "Description",
      original: originalPart.original_part_name_breakdown_definition,
      replacement: replacementPart.replacement_part_name_breakdown_definition,
    },
  ];

  // Process the new spec format into sections
  const processSpecs = (specs) => {
    const sections = {};
    specs.forEach((specItem) => {
      const [section, value] = Object.entries(specItem)[0];
      if (!sections[section]) {
        sections[section] = [];
      }
      sections[section].push(value);
    });
    return sections;
  };

  const originalSpecsBySection = processSpecs(originalSpecs);
  const replacementSpecsBySection = processSpecs(replacementSpecs);

  const allSections = Array.from(
    new Set([
      "General Information",
      ...Object.keys(originalSpecsBySection),
      ...Object.keys(replacementSpecsBySection),
    ])
  );

  const hasData = allSections.length > 0;

  if (!hasData) {
    return null;
  }

  const parseLine = (line = "") => {
    const txt = line.replace(/^[•\-\s]+/, "").trim();
    const idx = txt.indexOf(":");
    if (idx > 0) {
      return {
        attr: txt.slice(0, idx).trim(),
        val: txt.slice(idx + 1).trim(),
      };
    }
    return { attr: "", val: txt };
  };

  return (
    <div className="spec-comparison">
      <div className="spec-header">
        <h2>Specs Comparison</h2>
        <div className="diff-toggle">
          <span className="toggle-label">Show Only Differences</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={showOnlyDiff}
              onChange={() => setShowOnlyDiff((prev) => !prev)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
      <div className="table-scroll-wrapper">
        <table className="spec-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Attribute</th>
              <th>Original</th>
              <th className="replacement-header">
                <div className="replacement-line">
                  <span>Replacement </span>
                  {originalPart.original_part_price &&
                    replacementPart.replacement_part_price && (
                      <span
                        className={`savings-value ${
                          originalPart.original_part_price -
                            replacementPart.replacement_part_price >=
                          0
                            ? "positive"
                            : "negative"
                        }`}
                      >
                        {originalPart.original_part_price -
                          replacementPart.replacement_part_price >=
                        0
                          ? `Savings: $ ${formatPrice(
                              originalPart.original_part_price -
                                replacementPart.replacement_part_price
                            )}`
                          : `Extra Cost: $ ${formatPrice(
                              replacementPart.replacement_part_price -
                                originalPart.original_part_price
                            )}`}
                      </span>
                    )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* General Information Rows */}
            <tr className="general-info-header">
              <td
                rowSpan={generalInfoFields.length + 1}
                className="category-cell"
              >
                General Information
              </td>
            </tr>

            {generalInfoFields.map((field, index) => (
              <tr key={`general-${index}`}>
                <td>{field.label}</td>
                <td className={field.isImage ? "image-cell" : ""}>
                  {field.isImage
                    ? renderImageCell(field.original)
                    : field.original || "N/A"}
                </td>
                <td className={field.isImage ? "image-cell" : ""}>
                  {field.isImage
                    ? renderImageCell(field.replacement)
                    : field.replacement || "N/A"}
                </td>
              </tr>
            ))}

            {/* Technical Specifications */}
            {allSections
              .filter((section) => section !== "General Information")
              .map((section) => {
                const origLines = originalSpecsBySection[section] || [];
                const repLines = replacementSpecsBySection[section] || [];
                const rowCount = Math.max(origLines.length, repLines.length, 1);

                const rows = [];

                for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
                  const { attr: oAttr, val: oVal } = parseLine(
                    origLines[rowIdx]
                  );
                  const { attr: rAttr, val: rVal } = parseLine(
                    repLines[rowIdx]
                  );
                  const labelAttr = oAttr || rAttr || "—";
                  const isDiff = oVal !== rVal;

                  if (showOnlyDiff && !isDiff) continue;

                  rows.push(
                    <tr
                      key={`${section}-${rowIdx}`}
                      className={isDiff ? "highlight-row" : ""}
                    >
                      {rows.length === 0 && (
                        <td rowSpan="REPLACE_ME" className="category-cell">
                          {section}
                        </td>
                      )}
                      <td>{labelAttr}</td>
                      <td className={isDiff ? "highlight-diff" : ""}>
                        {oVal || "N/A"}
                      </td>
                      <td className={isDiff ? "highlight-diff" : ""}>
                        {rVal || "N/A"}
                      </td>
                    </tr>
                  );
                }

                // Inject the correct rowSpan for the first cell
                if (rows.length > 0) {
                  const firstRow = rows[0];
                  const withRowSpan = React.cloneElement(firstRow, {}, [
                    <td
                      rowSpan={rows.length}
                      className="category-cell"
                      key="cat-cell"
                    >
                      {section}
                    </td>,
                    ...firstRow.props.children.slice(1),
                  ]);
                  rows[0] = withRowSpan;
                }

                return rows;
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpecsComparison;
