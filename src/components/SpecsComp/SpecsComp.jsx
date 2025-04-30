import React, { useState } from "react";
import "./SpecComp.css";

const SpecsComparison = ({ originalSpecs = {}, replacementSpecs = {} }) => {
  const [isTableOpen, setIsTableOpen] = useState(true);

  const toggleTable = () => {
    setIsTableOpen((prev) => !prev);
  };

  const allSections = Array.from(
    new Set([
      ...Object.keys(originalSpecs || {}),
      ...Object.keys(replacementSpecs || {}),
    ])
  );

  const hasData = allSections.length > 0;
 
  if (!hasData) {
    return null; // Return nothing if no data
  }
  
 
  // 2) Helper to strip the bullet and split at first colon:
  const parseLine = (line = "") => {
    // remove leading bullet + whitespace (matches • or - or any spaces)
    const txt = line.replace(/^[•\-\s]+/, "").trim();
    const idx = txt.indexOf(":");
    if (idx > 0) {
      return {
        attr: txt.slice(0, idx).trim(),
        val: txt.slice(idx + 1).trim(),
      };
    }
    // no colon → empty attr, whole thing is the value
    return { attr: "", val: txt };
  };

  return (
    <div className="spec-comparison">
      <h2>Specs Comparison</h2>
      <div className="table-toggle" onClick={toggleTable}>
        <strong>{isTableOpen ? "Collapse Table" : "Expand Table"}</strong>
        <span>{isTableOpen ? "▲" : "▼"}</span>
      </div>

      {isTableOpen && (
        <div className="table-scroll-wrapper">
          <table className="spec-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Attribute</th>
                <th>Original</th>
                <th>Replacement</th>
              </tr>
            </thead>
            <tbody>
            {allSections.map((section) => {
              const origLines = originalSpecs[section] || [];
              const repLines  = replacementSpecs[section] || [];
              const rowCount  = Math.max(origLines.length, repLines.length, 1);
 
              return Array.from({ length: rowCount }).map((_, rowIdx) => {
                const { attr: oAttr, val: oVal } = parseLine(origLines[rowIdx]);
                const { attr: rAttr, val: rVal } = parseLine(repLines[rowIdx]);
                const labelAttr = oAttr || rAttr || "—";
                const isDiff    = oVal !== rVal;
 
                return (
                  <tr
                    key={`${section}-${rowIdx}`}
                    className={isDiff ? "highlight-row" : ""}
                  >
                    {rowIdx === 0 && (
                      <td rowSpan={rowCount} className="category-cell">
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
              });
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SpecsComparison;
