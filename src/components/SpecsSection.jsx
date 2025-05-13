import React from "react";
import { parseSpecs } from "../productUtils";

const SpecsSection = ({ specsJson, rawSpecs, title }) => {
  const hasSpecs = (specsJson && Object.keys(specsJson).length > 0) || rawSpecs;

  if (!hasSpecs) return null;

  return (
    <div className="specs-section">
      <h3>{title}</h3>
      <div className="specs-grid">
        {specsJson && Object.keys(specsJson).length > 0
          ? Object.entries(specsJson).map(([heading, items], idx) => (
              <div key={idx} className="spec-block">
                <h4>{heading}</h4>
                <ul>
                  {items.map((item, j) => (
                    <li key={j}>{item.replace(/^[•\-]\s*/, "").trim()}</li>
                  ))}
                </ul>
              </div>
            ))
          : parseSpecs(rawSpecs)?.map((blk, idx) => (
              <div key={idx} className="spec-block">
                <h4>{blk.heading}</h4>
                <ul>
                  {blk.items.map((it, j) => (
                    <li key={j}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
      </div>
    </div>
  );
};

export default SpecsSection;
