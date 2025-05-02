import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Modal, Button, List } from "antd";
import "./App.css";
import SpecsComparison from "./components/SpecsComp/SpecsComp";
import ChatBot from "./components/Chatbot/ConversationBot";
import NoImage from "./assets/img/no_image.jpg";
import ZoomImage from "./components/ZoomImage";

export default function ReplacementDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const categoryId = localStorage.getItem("categoryId");

  const [original, setOriginal] = useState(null);
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [commentText, setCommentText] = useState("");
  const [lastComment, setLastComment] = useState("");
  const [decision, setDecision] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showCompareOriginal, setShowCompareOriginal] = useState(false);
  const [compareOther, setCompareOther] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stage, setStage] = useState("choose");

  // ── new JSON specs state ────────────────────────────────────────────────────
  const [origSpecsJson, setOrigSpecsJson] = useState({});
  const [replSpecsJson, setReplSpecsJson] = useState({});

  const parseSpecs = (raw) => {
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

  const buildSpecsObject = (raw) => {
    const blocks = parseSpecs(raw);
    if (!blocks) return {};

    return blocks.reduce((acc, { heading, items }) => {
      const section = {};

      items.forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const val = line.substring(colonIndex + 1).trim();
          if (key && val) {
            section[key] = val;
          }
        }
      });

      if (Object.keys(section).length > 0) {
        acc[heading] = section;
      }

      return acc;
    }, {});
  };

  const [parsedOriginalSpecs, setParsedOriginalSpecs] = useState({});
  const [parsedReplacementSpecs, setParsedReplacementSpecs] = useState({});

  useEffect(() => {
    if (!code) return;
    setLoading(true);
    setError("");
    const token = localStorage.getItem("access_token");

    axios
      .get(`/api/search_exact?q=${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const { original: orig, replacements: repls } = res.data;
        setOrigSpecsJson(orig.original_specs || {});
        setReplSpecsJson(orig.replacement_specs || {});
        console.log("Full API Response:", res.data);
        console.log("Original Part:", orig.top_specs_original_part);
        console.log("Replacement Part:", orig.top_specs_replacement_part);
        console.log("Replacements:", repls);
        console.log("replacements[0] specs:", repls[0]);

        // Parse the specs immediately after receiving data
        const originalSpecs = buildSpecsObject(orig?.top_specs_original_part);
        const replacementSpecs = buildSpecsObject(
          orig?.top_specs_replacement_part
        );

        setOriginal(orig);
        setReplacements(repls || []);
        setParsedOriginalSpecs(originalSpecs);
        setParsedReplacementSpecs(replacementSpecs);
        setLastComment(orig?.comment || "");
        setDecision(
          orig?.accepted ? "accepted" : orig?.rejected ? "rejected" : null
        );
      })
      .catch((err) => {
        console.error("Load failed:", err);
        setError("Could not load replacement details.");
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <p>Loading part…</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!original)
    return (
      <div className="app-container">
        <h1>Replacement Part Details</h1>
        <p>No such part found.</p>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    );

  const formatPrice = (p) =>
    isNaN(parseFloat(p))
      ? "N/A"
      : Math.round(parseFloat(p)).toLocaleString("en-IN");
  const diffColor = (d) =>
    d > 0 ? "price-positive" : d < 0 ? "price-negative" : "";

  const sendDecision = async (accepted, rejected, comment) => {
    setBusy(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "/api/decision",
        {
          original_part_item_code: original.original_part_item_code,
          replacement_part_item_code: code,
          accepted,
          rejected,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDecision(accepted ? "accepted" : rejected ? "rejected" : decision);
      if (!accepted && !rejected) setLastComment(comment);
      setCommentText("");
    } catch {
      alert("Failed to save your decision.");
    } finally {
      setBusy(false);
    }
  };

  const PartDetailsCard = ({ title, part, isOriginal = false }) => (
    <div
      className="part-details-card"
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRadius: "8px",
      }}
    >
      <div className="compare-col">
        <h3>{title}</h3>
        <p>
          <strong>Code:</strong>{" "}
          {isOriginal
            ? part.original_part_item_code
            : part.replacement_part_item_code}
        </p>
        <p>
          <strong>Name:</strong>{" "}
          {isOriginal ? part.original_part_name : part.replacement_part_name}
        </p>
        <p>
          <strong>Description:</strong>{" "}
          {isOriginal
            ? part.original_part_name_breakdown_definition
            : part.replacement_part_name_breakdown_definition}
        </p>
        <p>
          <strong>Location:</strong>{" "}
          {isOriginal
            ? part.original_part_location
            : part.replacement_part_location}
        </p>
        <p>
          <strong>In Stock:</strong>{" "}
          {isOriginal ? part.original_part_stock : part.replacement_part_stock}
        </p>
        <p>
          <strong>Price:</strong> ₹
          {formatPrice(
            isOriginal ? part.original_part_price : part.replacement_part_price
          )}
        </p>
      </div>
      <div className="compare-col-img">
        <p>
          <strong>
            {isOriginal ? "Original Part" : "Replacement Part"} Image:
          </strong>
        </p>
        <img
          src={
            isOriginal
              ? part.original_part_image === null
                ? NoImage
                : part.original_part_image
              : part.replacement_part_image === null
              ? NoImage
              : part.replacement_part_image
          }
          style={{ height: "200px" }}
        />
      </div>
    </div>
  );

  // const pdfLinks = {
  //   "AIR LUBRICATOR":
  //     "https://www.smcworld.com/assets/manual/en-jp/files/AL-OMX0056.pdf",
  //   "PRESSURE SWITCH":
  //     "https://www.smcworld.com/assets/manual/en-jp/files/ZISE30A.eng.pdf",
  //   "AIR FILTER":
  //     "https://ca01.smcworld.com/catalog/New-products-en/mpv/es30-22-AFF-D/data/es30-22-AFF-D.pdf",
  //   "SPEED CONTROLLER":
  //     "https://ca01.smcworld.com/catalog/New-products-en/mpv/es30-22-AFF-D/data/es30-22-AFF-D.pdf",
  //   "RODLESS CYLINDER":
  //     "https://ca01.smcworld.com/catalog/New-products-en/mpv/es20-261-MY1/data/es20-261-MY1.pdf",
  //   "PNEUMATIC SEAL KIT":
  //     "https://ca01.smcworld.com/catalog/en/actuator/MGP-Z-E/6-2-2-p0423-0494-mgp_en/data/6-2-2-p0423-0494-mgp_en.pdf",
  //   "REED SWITCH":
  //     "https://ca01.smcworld.com/catalog/BEST-5-2-en/pdf/2-p1574-1651-sw2mu.pdf",
  //   "PNEUMATIC FITTING":
  //     "https://ca01.smcworld.com/catalog/BEST-5-6-en/pdf/es50-37-kq2.pdf",
  //   "AIR CYLINDER":
  //     "https://ca01.smcworld.com/catalog/BEST-Guide-en/pdf/2-m27-49_en.pdf",
  //   "SOLENOID VALVE":
  //     "https://content2.smcetech.com/pdf/VP300-500-700-A_EU.pdf",
  // };

  const pdfLinks = {
    "AIR LUBRICATOR": [
      "https://www.smcworld.com/assets/manual/en-jp/files/AL-OMX0056.pdf",
      "https://example.com/air-lubricator-extra.pdf",
    ],
    "PRESSURE SWITCH": [
      "https://www.smcworld.com/assets/manual/en-jp/files/ZISE30A.eng.pdf",
    ],
    "AIR FILTER": [
      "https://ca01.smcworld.com/catalog/New-products-en/mpv/es30-22-AFF-D/data/es30-22-AFF-D.pdf",
    ],
    "SPEED CONTROLLER": [
      "https://ca01.smcworld.com/catalog/New-products-en/mpv/es30-22-AFF-D/data/es30-22-AFF-D.pdf",
    ],
    "RODLESS CYLINDER": [
      "https://ca01.smcworld.com/catalog/New-products-en/mpv/es20-261-MY1/data/es20-261-MY1.pdf",
    ],
    "PNEUMATIC SEAL KIT": [
      "https://ca01.smcworld.com/catalog/en/actuator/MGP-Z-E/6-2-2-p0423-0494-mgp_en/data/6-2-2-p0423-0494-mgp_en.pdf",
    ],
    "REED SWITCH": [
      "https://ca01.smcworld.com/catalog/BEST-5-2-en/pdf/2-p1574-1651-sw2mu.pdf",
    ],
    "PNEUMATIC FITTING": [
      "https://ca01.smcworld.com/catalog/BEST-5-6-en/pdf/es50-37-kq2.pdf",
    ],
    "AIR CYLINDER": [
      "https://ca01.smcworld.com/catalog/BEST-Guide-en/pdf/2-m27-49_en.pdf",
    ],
    "SOLENOID VALVE": [
      "https://content2.smcetech.com/pdf/VP300-500-700-A_EU.pdf",
    ],
  };

  const category = original.category?.toUpperCase().trim();
  localStorage.setItem("categoryId", category)
  localStorage.getItem("categoryId")
  const resourceLink = pdfLinks[category];

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setStage("choose");
  };

  return (
    <div className={`all-page-style`} style={{ position: "relative" }}>
      {isChatOpen && window.innerWidth <= 1400 && (
        <div className="chat-overlay-active"></div>
      )}
      <div
        className={`app-container ${
          isChatOpen ? "chat-split-screen-transition" : "screen-transition"
        }`}
      >
        <h1>Replacement Part Details</h1>

        {/* ── Main Replacement Card ── */}
        <div className="replacement-card">
          <div className="card-header">
            <h2>{original.replacement_part_name}</h2>
            <div className="card-meta">
            <ZoomImage src={original.original_part_image} />
            </div>
            <div className="card-meta card-meta-main">
              <p>
                <strong>Code:</strong> {code}
              </p>
              <p>
                <strong>Price:</strong> ₹
                {formatPrice(original.replacement_part_price)}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {original.replacement_part_name_breakdown_definition}
              </p>
              <p className={diffColor(original.price_difference)}>
                <strong>Savings:</strong> ₹
                {formatPrice(original.price_difference)}
              </p>
              <p>
                <strong>Location:</strong> {original.replacement_part_location}
              </p>
              <p>
                <strong>Category:</strong> {original.category}
              </p>
            </div>

            {resourceLink && resourceLink.length === 1 && (
              <div className="resource-link">
                <a
                  href={resourceLink[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button style={{ padding: "12px" }}>Attachments</button>
                </a>
              </div>
            )}

            {resourceLink && resourceLink.length > 1 && (
              <div className="resource-link">
                <Button type="primary" onClick={() => setIsModalOpen(true)}>
                  Attachments
                </Button>
              </div>
            )}
            <div
              className={`stocks ${
                original.replacement_part_stock === 0
                  ? "stock-zero"
                  : "stock-available"
              }`}
            >
              <p>
                <strong>Stock:</strong> {original.replacement_part_stock}
              </p>
            </div>
          </div>
          {/* ── Replacement Specs ── */}
          {(replSpecsJson && Object.keys(replSpecsJson).length > 0) ||
          (parsedReplacementSpecs &&
            Object.keys(parsedReplacementSpecs).length > 0) ? (
            <div className="specs-section">
              <h3>Replacement Specs</h3>
              <div className="specs-grid">
                {replSpecsJson && Object.keys(replSpecsJson).length > 0
                  ? /* JSON version */
                    Object.entries(replSpecsJson).map(
                      ([heading, items], idx) => (
                        <div key={idx} className="spec-block">
                          <h4>{heading}</h4>
                          <ul>
                            {items.map((item, j) => (
                              <li key={j}>
                                {item.replace(/^[•\-]\s*/, "").trim()}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    )
                  : /* Parsed text version */
                    parseSpecs(original.top_specs_replacement_part)?.map(
                      (blk, idx) => (
                        <div key={idx} className="spec-block">
                          <h4>{blk.heading}</h4>
                          <ul>
                            {blk.items.map((it, j) => (
                              <li key={j}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    )}
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Compare with Original ── */}
        <div className="compare-toggle">
          <button
            className="compare-button"
            onClick={() => setShowCompareOriginal(!showCompareOriginal)}
          >
            {showCompareOriginal
              ? "Collapse Original Comparison"
              : "Compare with Original"}
          </button>
        </div>
        {showCompareOriginal && (
          <>
            <div
              className="compare-savings"
              style={{
                margin: "8px 0",
                padding: "8px",
                background: "#eef",
                borderRadius: 4,
              }}
            >
              <strong>Savings:</strong> ₹
              {formatPrice(original.price_difference)}
            </div>
            <div className={isChatOpen ? "compare-grid-chat-open" : "compare-grid"}>
              <PartDetailsCard
                title="Original Part"
                part={original}
                isOriginal={true}
              />
              <PartDetailsCard title="Replacement Part" part={original} />
            </div>

            {/* ── Differences / Notes ── */}
            <div className="differences-card">
              <h2>Differences / Additional Info</h2>
              <div className="difference-item">
                <h3>Additions &amp; Subtractions</h3>
                <p>{original.addition_subtraction || "No info available"}</p>
              </div>
              <div className="difference-item">
                <h3>Reasons for Replacement</h3>
                <p>{original.reason_for_replacement || "None specified"}</p>
              </div>
              <div className="difference-item highlighted">
                <h3>Key Notes</h3>
                <p>{original.key_differences_notes || "No special notes"}</p>
              </div>
            </div>

            <SpecsComparison
              originalSpecs={origSpecsJson}
              replacementSpecs={replSpecsJson}
            />

            {/* ── Comment / Accept / Reject ── */}
            <div className="card" style={{ margin: "20px 0px" }}>
              {decision === null && lastComment && (
                <div className="saved-comment">
                  <strong>Last comment:</strong> {lastComment}
                </div>
              )}
              <div className="comment-box-section">
                <textarea
                  className="comment-box"
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!!decision || busy}
                />
              </div>
              {decision === null ? (
                <div className="comment-button-section">
                  <button
                    className="comment-button"
                    onClick={() => sendDecision(false, false, commentText)}
                    disabled={busy || !commentText.trim()}
                  >
                    Comment
                  </button>
                  <button
                    className="accept-button"
                    onClick={() => sendDecision(true, false, commentText)}
                    disabled={busy}
                  >
                    Accept
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => sendDecision(false, true, commentText)}
                    disabled={busy}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 8,
                  }}
                >
                  <span
                    className={
                      decision === "accepted"
                        ? "accepted-badge"
                        : "rejected-badge"
                    }
                  >
                    {decision === "accepted" ? "✔ Accepted" : "✘ Rejected"}
                  </span>
                  <button
                    className="review-button"
                    onClick={() => {
                      setDecision(null);
                      setLastComment("");
                      setCommentText("");
                    }}
                    disabled={busy}
                  >
                    Review
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Compare with Other Replacements ── */}
        {replacements.filter((r) => r.replacement_part_item_code !== code)
          .length > 0 && (
          <>
            <h2>Compare with Other Replacements</h2>
            {replacements
              .filter((r) => r.replacement_part_item_code !== code)
              .map((other) => (
                <div
                  key={other.replacement_part_item_code}
                  className="other-compare"
                >
                  <button
                    className="other-compare-button"
                    onClick={() =>
                      setCompareOther((prev) => ({
                        ...prev,
                        [other.replacement_part_item_code]:
                          !prev[other.replacement_part_item_code],
                      }))
                    }
                  >
                    {compareOther[other.replacement_part_item_code]
                      ? `Collapse ${other.replacement_part_name}`
                      : `Compare with ${other.replacement_part_name}`}
                  </button>

                  {compareOther[other.replacement_part_item_code] && (
                    <>
                      <div
                        className="compare-savings"
                        style={{
                          margin: "8px 0",
                          padding: "8px",
                          background: "#eef",
                          borderRadius: 4,
                        }}
                      >
                        <strong>Savings:</strong> ₹
                        {formatPrice(other.price_difference)}
                      </div>
                      <div className={isChatOpen ? "compare-grid-chat-open" : "compare-grid"}>
                        <PartDetailsCard
                          title="Original Part"
                          part={original}
                          isOriginal={true}
                        />
                        <PartDetailsCard
                          title="Other Replacement"
                          part={other}
                        />
                      </div>

                      {/* ── Differences / Notes ── */}
                      <div className="differences-card">
                        <h2>Differences / Additional Info</h2>
                        <div className="difference-item">
                          <h3>Additions &amp; Subtractions</h3>
                          <p>
                            {other.addition_subtraction || "No info available"}
                          </p>
                        </div>
                        <div className="difference-item">
                          <h3>Reasons for Replacement</h3>
                          <p>
                            {other.reason_for_replacement || "None specified"}
                          </p>
                        </div>
                        <div className="difference-item highlighted">
                          <h3>Key Notes</h3>
                          <p>
                            {other.key_differences_notes || "No special notes"}
                          </p>
                        </div>
                      </div>

                      <SpecsComparison
                        originalSpecs={origSpecsJson}
                        replacementSpecs={replSpecsJson}
                      />

                      {/* ── Comment / Accept / Reject ── */}
                      <div className="card" style={{ margin: "20px 0px" }}>
                        {decision === null && lastComment && (
                          <div className="saved-comment">
                            <strong>Last comment:</strong> {lastComment}
                          </div>
                        )}
                        <div className="comment-box-section">
                          <textarea
                            className="comment-box"
                            placeholder="Add a comment…"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            disabled={!!decision || busy}
                          />
                        </div>
                        {decision === null ? (
                          <div className="comment-button-section">
                            <button
                              className="comment-button"
                              onClick={() =>
                                sendDecision(false, false, commentText)
                              }
                              disabled={busy || !commentText.trim()}
                            >
                              Comment
                            </button>
                            <button
                              className="accept-button"
                              onClick={() =>
                                sendDecision(true, false, commentText)
                              }
                              disabled={busy}
                            >
                              Accept
                            </button>
                            <button
                              className="reject-button"
                              onClick={() =>
                                sendDecision(false, true, commentText)
                              }
                              disabled={busy}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              marginTop: 8,
                            }}
                          >
                            <span
                              className={
                                decision === "accepted"
                                  ? "accepted-badge"
                                  : "rejected-badge"
                              }
                            >
                              {decision === "accepted"
                                ? "✔ Accepted"
                                : "✘ Rejected"}
                            </span>
                            <button
                              className="review-button"
                              onClick={() => {
                                setDecision(null);
                                setLastComment("");
                                setCommentText("");
                              }}
                              disabled={busy}
                            >
                              Review
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
          </>
        )}
        <button onClick={() => navigate(-1)}>← Back</button>

          <button
          style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            padding: "12px 16px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            zIndex: 1000,
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            display: isChatOpen ? "none" : "block",
          }}
          onClick={() => setIsChatOpen(true)}
        >
          Interact with Category PDF
        </button>
      </div>
      <div className={isChatOpen ? "chatbot-split-view" : "chat-view"}>
        <ChatBot
          categoryId={categoryId}
          isOpen={isChatOpen}
          toggleChat={handleChatToggle}
          stage={stage}
          setStage={setStage}
        />
      </div>

      <Modal
        title={`${category} - Attachments`}
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
            <List.Item>
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}
