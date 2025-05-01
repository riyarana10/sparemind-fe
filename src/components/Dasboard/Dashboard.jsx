import React, { useState, useEffect, useMemo } from "react";
import ChatBot from "../../components/Chatbot/ConversationBot";
import "../../App.css";

const Dashboard = () => {
  const categoryId = localStorage.getItem("categoryId");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stage, setStage] = useState("choose");

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setStage("choose");
  };
  return (
    <div className={`all-page-style`} style={{ position: "relative" }}>
    <div className={`app-container ${
      isChatOpen ? "chat-split-screen-transition" : "screen-transition"
    }`}>
      <div className="dashboard-content">
        <div className="dashboard-widgets">
          <iframe
            title="Power BI Report"
            width="100%"
            height="700"
            src="https://app.powerbi.com/reportEmbed?reportId=cdceaa1b-26c0-4689-833e-c6b16635a59c&autoAuth=true&ctid=85a77b6c-a790-4bcf-8fd6-c1f891dd360b"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        </div>
      </div>

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
    </div>
  );
};

export default Dashboard;
