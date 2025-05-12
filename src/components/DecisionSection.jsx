import React, { useState } from "react";
import "./DecisionSection.css";

const DecisionSection = ({ 
  original, 
  replacement, 
  decision, 
  lastComment, 
  role, 
  onDecision,
  onReview // Add this new prop
}) => {
  const [commentText, setCommentText] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = (accepted, rejected) => {
    setBusy(true);
    onDecision(accepted, rejected, commentText)
      .finally(() => setBusy(false));
  };

  const handleReview = () => {
    setBusy(true);
    onReview() // Use the new prop
      .finally(() => {
        setCommentText("");
        setBusy(false);
      });
  };

  return (
    <div className="decision-section">
      {decision === null && lastComment && (
        <div className="saved-comment">
          <strong>Last comment:</strong> {lastComment}
        </div>
      )}
      
      <div className="comment-box-section">
        <textarea
          className="comment-box"
          placeholder="Add a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={!!decision || busy}
        />
      </div>

      {decision === null ? (
        <div className="decision-buttons">
          <button
            className="comment-button"
            onClick={() => handleSubmit(false, false)}
            disabled={busy || !commentText.trim()}
          >
            Comment
          </button>
          
          {(role === "manager" || role === "admin") && (
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
          <button
            className="review-button"
            onClick={handleReview}
            disabled={busy}
          >
            Review
          </button>
        </div>
      )}
    </div>
  );
};

export default DecisionSection;