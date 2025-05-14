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

  const [userComments, setUserComments] = useState([]); // Track user comments

  const canMakeDecisions = ["manager", "admin"].includes(role);
  const isUser = role === "user";

  const handleSubmit = async (accepted = false, rejected = false) => {
    setBusy(true);
    try {
      await onDecision(original, accepted, rejected, commentText, replacement);
      if (isUser) {
        setUserComments([...userComments, commentText]); // Save user comment
      }
      setCommentText("");
    } catch (err) {
      console.error(err);
      alert("Failed to submit.");
    } finally {
      setBusy(false);
    }
  };

  // Textarea behavior (always enabled for users)
  const textareaProps = {
    className: "comment-box",
    placeholder: isUser
      ? "Add a comment to accept or reject the replacement"
      : "Add a comment to accept or reject the replacement",
    value: commentText,
    onChange: (e) => setCommentText(e.target.value),
    disabled: !isUser && (!!decision || busy), // Only disable for managers/admins
  };

  if (isUser) {
    textareaProps.onKeyDown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (commentText.trim()) handleSubmit(false, false);
      }
    };
  }

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
      {/* <div className="role-display">Current Role: {role}</div> */}

      <h4 className="comment-heading">
        {isUser
          ? "Please share your thoughts about the replacement"
          : "Please share your thoughts about the replacement"}
      </h4>

      {/* {decision === null && lastComment && (
        <div className="saved-comment">
          <strong>Last comment:</strong> {lastComment}
        </div>
      )} */}

      {/* Show user's comment history */}
      {/* {isUser && userComments.length > 0 && (
        <div className="comment-history">
          <strong>Your comments:</strong>
          {userComments.map((comment, i) => (
            <div key={i} className="user-comment">
              ✔ {comment}
            </div>
          ))}
        </div>
      )} */}

      <div className="comment-box-section">
        <textarea {...textareaProps} />
      </div>

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
                onClick={() => {
                  onReview(original, replacement);
                  setCommentText("");
                }}
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
