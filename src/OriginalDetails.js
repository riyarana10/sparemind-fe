import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";
import SpecsComparison from "./components/SpecsComp/SpecsComp";
import ChatBot from "./components/Chatbot/ConversationBot";
import NoImage from "./assets/img/no_image.jpg";
import { Modal, Button, List } from "antd";
import ZoomImage from "./components/ZoomImage";

export default function OriginalDetails() {
  const { code } = useParams();
  const navigate = useNavigate();
  const categoryId = localStorage.getItem("categoryId");

  const token = localStorage.getItem("access_token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : {};
  const role = payload.role || "user";

  const [original, setOriginal] = useState(null);
  const [replacements, setReplacements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stage, setStage] = useState("choose");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resourceLink, setResourceLink] = useState([]);

  const [commentText, setCommentText] = useState("");
  const [lastComment, setLastComment] = useState("");
  const [decision, setDecision] = useState(null);
  const [busy, setBusy] = useState(false);
  const [compareOther, setCompareOther] = useState({});
  const originalSpecsJson = original?.original_specs || {};
  const replacementSpecsJson = original?.replacement_specs || {};

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

  const originalSpecsObj = useMemo(() => {
    if (!original?.top_specs_original_part) return {};
    const parsed = buildSpecsObject(original.top_specs_original_part);
    return parsed;
  }, [original]);

  const fetchPdfLink = async (category) => {
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get("/api/pdf_link", {
        params: { category_id: category.replace(/\s+/g, "-") },
        headers: { Authorization: `Bearer ${token}` },
      });
      setResourceLink(res.data.pdf_links);
    } catch (e) {
      console.error(e);
    }
  };

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
        const { original, replacements } = res.data;

        setOriginal(original);
        setReplacements(replacements || []);
        setLastComment(original?.comment || "");
        setDecision(
          original.accepted ? "accepted" : original.rejected ? "rejected" : null
        );

        if (original.category) {
          fetchPdfLink(original.category);
        }
      })
      .catch((err) => {
        console.error("Load failed:", err);
        setError("Could not load part details.");
      })
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) return <p>Loading part…</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!original) {
    return (
      <div className="app-container">
        <h1>Original Part Details</h1>
        <p>No such part found.</p>
        <button onClick={() => navigate(-1)}>← Back</button>
      </div>
    );
  }

  const formatPrice = (p) => {
    const n = parseFloat(p);
    return isNaN(n) ? "N/A" : Math.round(n).toLocaleString("en-IN");
  };
  const sendDecision = async (accepted, rejected, comment) => {
    setBusy(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        "/api/decision",
        {
          original_part_item_code: original.original_part_item_code,
          replacement_part_item_code: "",
          accepted,
          rejected,
          comment,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (accepted || rejected) setDecision(accepted ? "accepted" : "rejected");
      else setLastComment(comment);
      setCommentText("");
    } catch (err) {
      console.error(err);
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
          <strong>Item Code:</strong>{" "}
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
        <p>
          <strong>Source:</strong> ₹
          {isOriginal ? part.replacement_source : part.replacement_source}
        </p>
      </div>
      <div className="compare-col-img">
        <p>
          <strong>
            {isOriginal ? "Original Part" : "Replacement Part"} Image:
          </strong>
        </p>
        <ZoomImage
          src={
            isOriginal ? part.original_part_image : part.replacement_part_image
          }
        />
      </div>
    </div>
  );

  const category = original.category?.toUpperCase().trim();
  localStorage.setItem("categoryId", category);
  localStorage.getItem("categoryId");

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
        <h1>Original Part Details</h1>

        {/* ── Main Original Card ── */}
        <div className="replacement-card">
          <div className="card-header">
            <h2>{original.original_part_name}</h2>
            <div className="card-meta">
              <ZoomImage src={original.original_part_image} />
            </div>
            <div className="card-meta card-meta-main">
              <p>
                <strong>Item Code:</strong> {original.original_part_item_code}
              </p>
              <p>
                <strong>Price:</strong> ₹
                {formatPrice(original.original_part_price)}
              </p>
              <p>
                <strong>Description:</strong>{" "}
                {original.original_part_name_breakdown_definition}
              </p>
              <p>
                <strong>Brand:</strong> {original.brand}
              </p>
              <p>
                <strong>Location:</strong> {original.original_part_location}
              </p>
              <p>
                <strong>Category:</strong> {original.category}
              </p>
              <p>
                <strong>MSIL Category:</strong> {original.category_msil}
              </p>
              <p>
                <strong>Source:</strong> {original.replacement_source}
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
                original.original_part_stock === 0
                  ? "stock-zero"
                  : "stock-available"
              }`}
            >
              <p>
                <strong>Stock:</strong> {original.original_part_stock}
              </p>
            </div>
          </div>

          {/* ── Show "Original Specs" table ── */}
          {(originalSpecsJson && Object.keys(originalSpecsJson).length > 0) ||
          (originalSpecsObj && Object.keys(originalSpecsObj).length > 0) ? (
            <div className="specs-section">
              <h3>Original Specs</h3>
              <div className="specs-grid">
                {originalSpecsJson && Object.keys(originalSpecsJson).length > 0
                  ? /* JSON version */
                    Object.entries(originalSpecsJson).map(
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
                  : parseSpecs(original.top_specs_original_part)?.map(
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

        {/* ── Compare with Its Replacements ── */}
        {replacements.length > 0 && (
          <div className="other-comparisons">
            <h2>Compare with Its Replacements</h2>
            {loading && <p>Loading…</p>}
            {!loading &&
              replacements.map((other) => {
                const savings = other.price_difference ?? 0;
                const replacementSpecsObj = other.replacement_specs || {};

                return (
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
                        ? `Collapse Comparison with ${other.replacement_part_name}`
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
                          <strong>Savings:</strong> ₹{formatPrice(savings)}
                        </div>
                        <div
                          className={
                            isChatOpen
                              ? "compare-grid-chat-open"
                              : "compare-grid"
                          }
                        >
                          <PartDetailsCard
                            title="Original Part"
                            part={original}
                            isOriginal={true}
                          />
                          <PartDetailsCard
                            title="Replacement Part"
                            part={other}
                            isOriginal={false}
                          />
                        </div>

                        {/* ── Differences & Notes ── */}
                        <div className="differences-card">
                          <h2>Differences / Additional Info</h2>
                          <div className="difference-item">
                            <h3>Additions &amp; Subtractions</h3>
                            <p>
                              {other.addition_subtraction ||
                                "No info available"}
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
                              {other.key_differences_notes ||
                                "No special notes"}
                            </p>
                          </div>
                        </div>

                        <SpecsComparison
                          originalSpecs={originalSpecsJson}
                          replacementSpecs={replacementSpecsJson}
                        />

                        {/* ── Comment / Accept / Reject UI ── */}
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
                              {/* Only show Accept/Reject buttons for manager and admin */}
                              {(role === "manager" || role === "admin") && (
                                <>
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
                                </>
                              )}
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
                );
              })}
          </div>
        )}

        <button onClick={() => navigate(-1)}>← Back</button>

        {!!resourceLink.length && (
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
            Know more about{" "}
            {category
              .toLowerCase()
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </button>
        )}
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
            <List.Item key={index}>
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
