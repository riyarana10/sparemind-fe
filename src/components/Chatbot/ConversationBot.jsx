// import React, { useState, useRef, useEffect } from "react";
// import { useLocation } from "react-router-dom";
// import Markdown from "react-markdown";
// import "./ConversationBot.css";
// import botImage from "../../assets/img/bot_image.png";

// function ChatBot({ categoryId, isOpen, toggleChat, stage, setStage }) {
//   const location = useLocation();
//   const [userInput, setUserInput] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isExistingChatLoading, setisExistingChatLoading] = useState(false);
//   const [isNewChatLoading, setisNewChatLoading] = useState(false);
//   const messagesEndRef = useRef(null);
//   const inputRef = useRef(null);

//   const defaultMessages = [
//     {
//       sender: "bot",
//       text: location.pathname.startsWith("/dashboard")
//         ? `How can i help you ?`
//         : `Hi there! I'm your automobile parts assistant. Ask me anything about spare parts manuals ${categoryId}.`,
//     },
//   ];

//   const [messages, setMessages] = useState(() => {
//     const saved = sessionStorage.getItem("chatbot_messages");
//     return saved ? JSON.parse(saved) : defaultMessages;
//   });

//   useEffect(() => {
//     sessionStorage.setItem("chatbot_messages", JSON.stringify(messages));
//   }, [messages]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isLoading]);

//   useEffect(() => {
//     if (isOpen && stage === "chat") {
//       setTimeout(() => inputRef.current?.focus(), 100);
//     }
//   }, [isOpen, stage]);
//   if (
//     !location.pathname.startsWith("/category/") &&
//     !location.pathname.startsWith("/original/") &&
//     !location.pathname.startsWith("/replacement/") &&
//     !location.pathname.startsWith("/dashboard")
//   ) {
//     return null;
//   }

//   const clearFrontendChat = () => {
//     setMessages(defaultMessages);
//     sessionStorage.removeItem("chatbot_messages");
//   };

//   const handleContinue = async () => {
//     setisExistingChatLoading(true);
//     setIsLoading(true);
//     if (location.pathname.startsWith("/dashboard")) {
//       try {
//         const res = await fetch("http://localhost:8000/chat/history", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           },
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const { history } = await res.json();
//         setMessages([defaultMessages[0], ...history]);
//       } catch (err) {
//         console.error("Failed to load history:", err);
//         setMessages(defaultMessages);
//       } finally {
//         setStage("chat");
//         setIsLoading(false);
//         setisExistingChatLoading(false);
//       }
//     } else {
//       try {
//         const res = await fetch("http://localhost:8000/chat/history", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           },
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const { history } = await res.json();
//         setMessages([defaultMessages[0], ...history]);
//       } catch (err) {
//         console.error("Failed to load history:", err);
//         setMessages(defaultMessages);
//       } finally {
//         setStage("chat");
//         setIsLoading(false);
//         setisExistingChatLoading(false);
//       }
//     }
//   };

//   const handleNewChat = async () => {
//     setisNewChatLoading(true);
//     setStage("chat");
//     clearFrontendChat();
//     try {
//       const res = await fetch("http://localhost:8000/chat/reset", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//         },
//         body: JSON.stringify({}),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       setisNewChatLoading(false);
//     } catch (err) {
//       console.warn("Failed to reset backend chat:", err);
//     } finally {
//       setStage("chat");
//       setIsLoading(false);
//       setisNewChatLoading(false);
//     }
//   };

//   const handleSend = async () => {
//     if (!userInput.trim()) return;
//     const text = userInput;
//     setMessages((prev) => [...prev, { sender: "user", text }]);
//     setUserInput("");
//     setIsLoading(true);

//     if (location.pathname.startsWith("/dashboard")) {
//       try {
//         const res = await fetch("http://localhost:8000/vanna-chat", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           },
//           body: JSON.stringify({
//             question: text,
//           }),
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const { answer } = await res.json();
//         setMessages((prev) => [
//           ...prev,
//           {
//             sender: "bot",
//             text: answer || "Sorry, I didn't understand that.",
//           },
//         ]);
//       } catch (err) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             sender: "bot",
//             text: err.message.includes("Network")
//               ? "Network error. Check your connection."
//               : "Sorry, I'm having trouble responding. Please try again later.",
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     } else {
//       try {
//         const res = await fetch("http://localhost:8000/chat", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//           },
//           body: JSON.stringify({
//             page_context: categoryId.toLowerCase(),
//             query: text,
//           }),
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const { query_answer } = await res.json();
//         setMessages((prev) => [
//           ...prev,
//           {
//             sender: "bot",
//             text: query_answer || "Sorry, I didn't understand that.",
//           },
//         ]);
//       } catch (err) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             sender: "bot",
//             text: err.message.includes("Network")
//               ? "Network error. Check your connection."
//               : "Sorry, I'm having trouble responding. Please try again later.",
//           },
//         ]);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") handleSend();
//   };

//   return (
//     <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
//     {isOpen && (
//       <div className="chat-popup">
//         <div className="chat-header">
//           <button className="close-btn" onClick={toggleChat}>
//             ×
//           </button>
//         </div>

//         {stage === "choose" ? (
//           // Keep your existing stage="choose" JSX here
//           <div className="chat-body">
//             <img src={botImage} alt="Chatbot" style={{ width: "100px", marginBottom: "10px" }} />
//             <button onClick={handleContinue} disabled={isNewChatLoading}>Continue</button>
//             <button onClick={handleNewChat} disabled={isExistingChatLoading}>New</button>
//           </div>
//         ) : (
//           <>
//             <div className="chat-body">
//               <div className="chat-messages">
//                 {messages.map((msg, i) => (
//                   <div key={i} className={`chat-message ${msg.sender}`}>
//                     {msg.sender === "bot" ? (
//                       <Markdown>{msg.text}</Markdown>
//                     ) : (
//                       msg.text
//                     )}
//                   </div>
//                 ))}
//                 {isLoading && (
//                   <div className="chat-message bot typing-indicator">
//                     <span />
//                     <span />
//                     <span />
//                   </div>
//                 )}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             <div className="chat-input-container">
//               <input
//                 ref={inputRef}
//                 type="text"
//                 className="chat-input"
//                 placeholder="Type something…"
//                 value={userInput}
//                 onChange={(e) => setUserInput(e.target.value)}
//                 onKeyDown={handleKeyDown}
//               />
//               <button className="send-btn" onClick={handleSend}>
//                 ➤
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     )}
//   </div>
//   );
// }

// export default ChatBot;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from "react-router-dom";
import Markdown from "react-markdown";
import partsgenieLogo from "../../assets/img/partsGenieLogo.svg"
import bgImage from "../../assets/img/homePageBG.svg"
import './bot.css';

const ChatBot = ({isOpen, setIsOpen, stage, setStage,toggleChat}) => {
  let categoryId = localStorage.getItem("categoryId")
  let categoryName = localStorage.getItem("categoryId")
  if (categoryId) {
    categoryId = categoryId.replace(/\s+/g, "-");
  }
  // const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExistingChatLoading, setisExistingChatLoading] = useState(false);
  const [isNewChatLoading, setisNewChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

    const defaultMessages = [
    {
      sender: "bot",
      text: location.pathname.startsWith("/dashboard")
        ? `How can i help you ?`
        : `Hi there! I'm your automobile parts assistant. Ask me anything about spare parts manuals ${categoryName.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}.`,
    },
  ];

    const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem("chatbot_messages");
    return saved ? JSON.parse(saved) : defaultMessages;
  });

  // const [messages, setMessages] = useState([
  //   { from: 'bot', text: 'Hi! How can I help you today?' }
  // ]);
  const [input, setInput] = useState('');

  // const handleSend = () => {
  //   if (!input.trim()) return;

  //   setMessages(prev => [...prev, { from: 'user', text: input }]);
  //   setInput('');

  //   // Simulate bot response
  //   setTimeout(() => {
  //     setMessages(prev => [...prev, { from: 'bot', text: 'Thanks for your message!' }]);
  //   }, 500);
  // };

    useEffect(() => {
    sessionStorage.setItem("chatbot_messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // useEffect(() => {
  //   if (isOpen && stage === "chat") {
  //     setTimeout(() => inputRef.current?.focus(), 100);
  //   }
  // }, [isOpen, stage]);

  useEffect(() => {
    const handleContinue = async () => {
      setisExistingChatLoading(true);
      setIsLoading(true);
      if (location.pathname.startsWith("/dashboard")) {
        setIsLoading(false)
        try {
          const res = await fetch("http://localhost:8000/chat/history", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const { history } = await res.json();
          setMessages([defaultMessages[0], ...history]);
        } catch (err) {
          console.error("Failed to load history:", err);
          setMessages(defaultMessages);
        } finally {
          setStage("chat");
          setIsLoading(false);
          setisExistingChatLoading(false);
        }
      } else {
        try {
          const res = await fetch("http://localhost:8000/chat/history", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const { history } = await res.json();
          setMessages([defaultMessages[0], ...history]);
        } catch (err) {
          console.error("Failed to load history:", err);
          setMessages(defaultMessages);
        } finally {
          setStage("chat");
          setIsLoading(false);
          setisExistingChatLoading(false);
        }
      }
    };
    handleContinue();
  },[])
  if (
    !location.pathname.startsWith("/category/") &&
    !location.pathname.startsWith("/original/") &&
    !location.pathname.startsWith("/replacement/") &&
    !location.pathname.startsWith("/dashboard")
  ) {
    return null;
  }

  const clearFrontendChat = () => {
    setMessages(defaultMessages);
    sessionStorage.removeItem("chatbot_messages");
  };

  const handleNewChat = async () => {
    setisNewChatLoading(true);
    setStage("chat");
    clearFrontendChat();
    try {
      const res = await fetch("http://localhost:8000/chat/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setisNewChatLoading(false);
    } catch (err) {
      console.warn("Failed to reset backend chat:", err);
    } finally {
      setStage("chat");
      setIsLoading(false);
      setisNewChatLoading(false);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const text = userInput;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setUserInput("");
    setIsLoading(true);

    if (location.pathname.startsWith("/dashboard")) {
      try {
        const res = await fetch("http://localhost:8000/vanna-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            question: text,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { answer } = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: answer || "Sorry, I didn't understand that.",
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: err.message.includes("Network")
              ? "Network error. Check your connection."
              : "Sorry, I'm having trouble responding. Please try again later.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await fetch("http://localhost:8000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            page_context: categoryName.toLowerCase(),
            query: text,
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { query_answer } = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: query_answer || "Sorry, I didn't understand that.",
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "bot",
            text: err.message.includes("Network")
              ? "Network error. Check your connection."
              : "Sorry, I'm having trouble responding. Please try again later.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {/* Floating Button */}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-container" >
          {/* Header */}
          <div className="chatbot-header">
            <span>
            <span style={{color: "#2A2F92", fontWeight:"700"}}>Parts</span><span style={{color: "#C1282E", fontWeight:"700"}}>GENIE</span> Chat
            </span>
            <div className='chatbot-header-buttons'>
            {/* <button className='new-chat-button' onClick={handleNewChat} disabled={isExistingChatLoading}>New Chat</button> */}
            <button className="chatbot-close" onClick={() => toggleChat()}>&times;</button>
            </div>
          </div>

          {/* Chat Messages */}
          {/* {
            stage === "choose" ? (
              <div className="chat-stage-body">
           <img src={botImage} alt="Chatbot" style={{ width: "100px", marginBottom: "10px" }} />
           <div>
            <img src={bgImage}/>
           </div>
           <div className='stage-buttons'>
           <button onClick={handleContinue} disabled={isNewChatLoading}>Continue</button>
           <button onClick={handleNewChat} disabled={isExistingChatLoading}>New</button>
           </div>
         </div>
            ) : (
              <> */}
              <div className="chatbot-body">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chatbot-message ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                                 {msg.sender === "bot" ? (
                                    <Markdown>{msg.text}</Markdown>
                                  ) : (
                                    msg.text
                                  )}
                                </div>
            ))}
            {isLoading && (
                  <div className="chatbot-message bot typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                )}
                <div ref={messagesEndRef} />
          </div>

          
          {/* </>
            )
          } */}

          {/* Input Area */}
          <div className="chatbot-footer">
            {/* {
              stage !== "choose" && (
                <> */}
                <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
              />
              <button onClick={handleSend}>Send</button>
              {/* </>
              )
            } */}
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
