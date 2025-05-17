import React, { useState } from "react";
import "./DecisionSection.css";

const DecisionSection = ({
  original,
  replacement,
  decision,
  lastComment,
  role,
  onDecision,
  onReview,
}) => {
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const canMakeDecisions = ["manager", "admin"].includes(role);
  const isUser = role === "user";

  const handleSubmit = async (accepted = false, rejected = false) => {
    setBusy(true);
    try {
      await onDecision(original, accepted, rejected, commentText, replacement);
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit.");
    } finally {
      setBusy(false);
    }
  };

  const handleReview = async () => {
    setBusy(true);
    try {
      await onReview(original, replacement);
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Error occurred during review.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="decision-section">
      {!isUser && (
        <>
          <h4 className="comment-heading">
            Please share your thoughts about the replacement
          </h4>

          <div className="comment-box-section">
            <textarea
              className="comment-box"
              placeholder="Add a comment to accept or reject the replacement"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              disabled={!!decision || busy}
            />
          </div>
        </>
      )}

      {/* Decision buttons (managers/admins only) */}
      {!isUser &&
        (decision === null ? (
          <div className="decision-buttons">
            {canMakeDecisions && (
              <>
                <button
                  className="accept-button"
                  onClick={() => handleSubmit(true, false)}
                  disabled={busy}
                >
                  Accept
                </button>
                <button
                  className="reject-button"
                  onClick={() => handleSubmit(false, true)}
                  disabled={busy}
                >
                  Reject
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="decision-status">
            <span className={`decision-badge ${decision}`}>
              {decision === "accepted" ? "✔ Accepted" : "✘ Rejected"}
            </span>
            {canMakeDecisions && (
              <button
                className="review-button"
                onClick={handleReview}
                disabled={busy}
              >
                Review
              </button>
            )}
          </div>
        ))}
    </div>
  );
};

export default DecisionSection;