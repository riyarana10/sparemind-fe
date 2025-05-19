export const formatPrice = (p) => {
  const n = parseFloat(p);
  return isNaN(n) ? "N/A" : Math.round(n).toLocaleString("en-IN");
};

export const parseSpecs = (raw) => {
  if (!raw) return null;
  const decoded = raw.replace(/&#10;/g, "\n");
  const lines = decoded
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  const blocks = [];
  let curr = null;

  lines.forEach((line) => {
    if (line.endsWith(":")) {
      if (curr) blocks.push(curr);
      curr = { heading: line.slice(0, -1).trim(), items: [] };
    } else if (curr) {
      const txt = line.replace(/^[•\-]\s*/, "").trim();
      if (txt) curr.items.push(txt);
    }
  });

  if (curr) blocks.push(curr);
  return blocks.length ? blocks : null;
};

export const buildSpecsObject = (raw) => {
  const blocks = parseSpecs(raw);
  if (!blocks) return {};

  return blocks.reduce((acc, { heading, items }) => {
    const section = {};
    items.forEach((line) => {
      const colonIndex = line.indexOf(":");
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const val = line.substring(colonIndex + 1).trim();
        if (key && val) section[key] = val;
      }
    });

    if (Object.keys(section).length > 0) {
      acc[heading] = section;
    }

    return acc;
  }, {});
};
