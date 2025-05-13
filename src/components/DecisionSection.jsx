import React, { useState } from "react";
import "./DecisionSection.css";

const DecisionSection = ({
  original,
  replacement,
  decision,
  lastComment,
  role,  // This should be passed from parent component
  onDecision,
  onReview,
}) => {
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (accepted, rejected) => {
    setBusy(true);
    try {
      const result = await onDecision(
        original,
        accepted,
        rejected,
        commentText,
        replacement
      );
      if (result?.success !== false) {
        setCommentText(""); // Clear only on successful save
      } else {
        alert("Failed to save decision.");
      }
    } catch (err) {
      console.error(err);
      alert("Error occurred while saving.");
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

  // Determine if buttons should be disabled
  const isUser = role === "user";
  const showDecisionButtons = !isUser && (role == "manager" || role == "admin");

  return (
    <div className="decision-section">
      <h4 className="comment-heading">
        Please share your thoughts about the replacement
      </h4>
      {/* {decision === null && lastComment && (
        <div className="saved-comment">
          <strong>Last comment:</strong> {lastComment}
        </div>
      )} */}

      <div className="comment-box-section">
        <textarea
          className="comment-box"
          placeholder={
            isUser 
              ? "Add your comments about the replacement"
              : "Add a comment to accept or reject the replacement"
          }
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!!decision || busy}
        />
      </div>

      {decision === null ? (
        <div className="decision-buttons">
          {showDecisionButtons ? (
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
          ) : (
            <div className="user-message">
              {/* {isUser && "Only managers/admins can make decisions"} */}
            </div>
          )}
        </div>
      ) : (
        <div className="decision-status">
          <span className={`decision-badge ${decision}`}>
            {decision === "accepted" ? "✔ Accepted" : "✘ Rejected"}
          </span>
          {showDecisionButtons && (
            <button
              className="review-button"
              onClick={handleReview}
              disabled={busy}
            >
              Review
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DecisionSection;