import React, { useState, useEffect, useMemo } from "react";
import ChatBot from "../../components/Chatbot/ConversationBot";
import "./Dashboard.css";

const Dashboard = () => {
  const categoryId = localStorage.getItem("categoryId");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [stage, setStage] = useState("choose");
  const [isOpen, setIsOpen] = useState(false);

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
    setIsOpen(!isOpen);
    setStage("choose");
  };
  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: isOpen ? "74%" : "100%", transition: "width 0.3s" }}>
        <div className="dashboard-content">
          <div className="dashboard-widgets">
            <iframe
              title="Maruti Dashboard"
              width="100%"
              height="750"
              src="https://app.powerbi.com/reportEmbed?reportId=0e762fc3-6c90-48a8-9801-be2b507eb729&autoAuth=true&ctid=85a77b6c-a790-4bcf-8fd6-c1f891dd360b"
              frameborder="0"
              allowFullScreen="true"
            ></iframe>
          </div>
        </div>
      </div>

      {!isOpen && (
        <button className="chatbot-toggle" onClick={() => setIsOpen(!isOpen)}>
          Know more about part replacements 
        </button>
      )}
      <div
        style={{
          width: isOpen ? "25%" : "0",
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ChatBot
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          stage={stage}
          setStage={setStage}
          toggleChat={handleChatToggle}
        />
      </div>
    </div>
  );
};

export default Dashboard;
