import React from "react";

/**
 * Compares original and replacement specs line-by-line.
 * Returns an array of JSX elements, where lines that differ are highlighted.
 *
 * @param {string} originalSpecs - The original part specs as a single string.
 * @param {string} replacementSpecs - The replacement part specs as a single string.
 */
function SpecsComparison({ originalSpecs, replacementSpecs }) {
  // Split the strings by newline; you might want to use a more robust splitting method if needed.
  const originalLines = originalSpecs.split("\n").map((line) => line.trim());
  const replacementLines = replacementSpecs
    .split("\n")
    .map((line) => line.trim());

  // Compare and return JSX for each line in replacementSpecs.
  const renderedLines = replacementLines.map((repLine, idx) => {
    // We compare only if original line exists, otherwise treat extra lines as different.
    if (originalLines[idx] !== undefined && originalLines[idx] === repLine) {
      // Same content – render without highlighting.
      return <div key={idx}>{repLine}</div>;
    } else {
      // Different content (or no matching original) – render highlighted.
      return (
        <div key={idx}>
          <mark>{repLine}</mark>
        </div>
      );
    }
  });

  return <div className="specs-comparison">{renderedLines}</div>;
}

export default SpecsComparison;
