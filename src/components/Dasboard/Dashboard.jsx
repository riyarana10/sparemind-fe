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
  );
};

export default Dashboard;
