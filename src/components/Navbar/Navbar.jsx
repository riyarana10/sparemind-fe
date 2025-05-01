import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  Select,
  Button,
  Avatar,
  Menu,
  Dropdown,
  Drawer,
  AutoComplete,
} from "antd";
import { UserOutlined, MenuOutlined } from "@ant-design/icons";
import ChatBot from "../Chatbot/ConversationBot";
import "./Navbar.css";

const { Option } = Select;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const ENABLE_CATEGORY_DROPDOWN = true;
  const CATEGORY_OPTIONS = [
    "All Categories",
    "Pneumatics",
    "Hydraulics",
    "Filters",
    "Valves",
    "AIR BOOSTER REGULATOR",
    "AIR CYLINDER",
    "AIR FILTER",
    "AIR LUBRICATOR",
    "AIR REGULATOR",
    "AIR CYLINDER",
    "AIR CYLINDER  KF-531",
    "COMPACT CYLINDER",
    "COMPACT GUIDE CYLINDER",
    "COMPACT SLIDE TABLE CYLINDER",
    "COOLANT VALVE",
    "CYLINDER",
    "FILTER ELEMENT",
    "FITTING STRAIGHT CONNECTOR",
    "FLOATING JOINT",
    "FLOW SWITCH",
    "GLASS COVER FOR PRESSURE GAUGES",
    "GRIPPER CYLINDER",
    "GUIDE CYLINDER",
    "HYDRAULIC CYLINDER",
    "ISO SOLENOID VALVE",
    "PNEUMATIC PIPE 04 MM",
    "PNEUMATIC PIPE 12 MM",
    "PNEUMATIC PIPE 16 MM",
    "POWER CYLINDER",
    "PRESSURE SWITCH CABLE",
    "PROCESS VALVE",
    "QUICK EXHAUST VALVE",
    "REED SWITCH",
    "ROTARY ACTUATOR",
    "SILENCER",
    "SOLENOID VALVE",
    "SOLENOID VALVE",
    "SPEED CONTROLLER",
    "SPEED CONTROLLER, SM",
    "VALVE",
  ];
  const [selectedCategory, setSelectedCategory] = useState(CATEGORY_OPTIONS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const token = localStorage.getItem("access_token");
  const wrapperRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setSuggestions([]);
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const url = `http://localhost:8000/autocomplete?query=${encodeURIComponent(
          searchTerm
        )}`;
        const config = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};
        const { data } = await axios.get(url, config);
        setSuggestions(data.suggestions || []);
        setShowSuggestions(true);
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchTerm, token]);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    navigate(
      `/search?query=${encodeURIComponent(searchTerm.trim())}` +
        (ENABLE_CATEGORY_DROPDOWN
          ? `&category=${encodeURIComponent(selectedCategory)}`
          : "")
    );
    setShowSuggestions(false);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/");
    window.location.reload();
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" onClick={() => navigate("/")}>
        Home
      </Menu.Item>
      <Menu.Item key="2" onClick={() => window.open("/dashboard", "_blank")}>
        Dashboard
      </Menu.Item>
      <Menu.Item key="3" onClick={() => navigate("/profile")}>
        Profile
      </Menu.Item>
      <Menu.Item key="4" onClick={handleLogout} style={{ color: "#ff4d4f" }}>
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <>
      {token && !isDashboard && <ChatBot />}
      <header className="top-header">
        <div className="header-left">
          <div className="hamburger-container">
            <MenuOutlined
              style={{ fontSize: "24px", cursor: "pointer" }}
              onClick={() => setVisible(true)}
            />
          </div>
          <h1
            className="app-title"
            onClick={async () => {
              setSearchTerm("");
              try {
                const resp = await axios.get(
                  `http://localhost:8000/search?original_part_item_code=`
                );
                const hits = resp.data.results || [];
                const sorted = [...hits].sort(
                  (a, b) =>
                    (b.price_difference || 0) - (a.price_difference || 0)
                );
                navigate("/", { state: { query: "", results: sorted } });
              } catch (err) {
                console.error("Search failed:", err);
              }
            }}
          >
            <span className="app-title-heading">PartsGenie</span>
            <p className="app-title-text">Intelligent Spare Parts Management</p>
          </h1>
        </div>

        <Drawer
          title="Menu"
          placement="left"
          onClose={() => setVisible(false)}
          visible={visible}
          width={250}
        >
          <Menu>
            <Menu.Item
              key="1"
              onClick={() => {
                navigate("/");
                setVisible(false);
              }}
            >
              Home
            </Menu.Item>
            <Menu.Item
              key="2"
              onClick={() => {
                navigate("/dashboard");
                setVisible(false);
              }}
            >
              Dashboard
            </Menu.Item>
            <Menu.Item
              key="3"
              onClick={() => {
                navigate("/profile");
                setVisible(false);
              }}
            >
              Profile
            </Menu.Item>
            <Menu.Item
              key="4"
              onClick={handleLogout}
              style={{ color: "#ff4d4f" }}
            >
              Logout
            </Menu.Item>
          </Menu>
        </Drawer>

        <form
          onSubmit={handleSearch}
          className={`search-form ${isDashboard ? "hide-on-dashboard" : ""}`}
          style={{ width: "100%", display: "flex", justifyContent: "center" }}
          ref={wrapperRef}
        >
          <div
            className={`search-form ${isDashboard ? "hide-on-dashboard" : ""}`}
            style={{ width: "80%", display: "flex", gap: "10px" }}
          >
            {ENABLE_CATEGORY_DROPDOWN && (
              <Select
                className="category-dropdown"
                value={selectedCategory}
                onChange={(value) => {
                  console.log("value on change : ", value);
                  setSelectedCategory(value);
                }}
              >
                {CATEGORY_OPTIONS.map((cat, i) => (
                  <Option key={i} value={cat}>
                    {cat}
                  </Option>
                ))}
              </Select>
            )}

            <AutoComplete
              className="search-input"
              style={{ flex: 1 }}
              options={suggestions.map((s) => ({
                value: s.original_part_item_code,
                label: (
                  <div>
                    <strong>{s.original_part_item_code}</strong> —{" "}
                    <small>{s.original_part_name}</small>
                  </div>
                ),
              }))}
              value={searchTerm}
              onChange={(value) => setSearchTerm(value)}
              onSelect={(value) => {
                setSearchTerm(value);
                setShowSuggestions(false);
                navigate(`/search?query=${encodeURIComponent(value)}`);
              }}
              onSearch={(value) => {
                setSearchTerm(value);
                if (value.length >= 2) {
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }}
              placeholder="Enter part code or exact name…"
            />

            <Button
              type="primary"
              htmlType="submit"
              className="search-button"
              disabled={isLoading}
              loading={isLoading}
              onClick={handleSearch}
            >
              {isLoading ? "…" : "Search"}
            </Button>
          </div>
        </form>

        <div className="header-right">
          <img
            src="https://static.wixstatic.com/media/0b32fd_b9ee0246c836473ea1342c30fce5021d~mv2.png"
            alt="Logo"
            className="company-logo"
          />
          <Dropdown overlay={menu} trigger={["click"]}>
            <Button type="link" style={{ padding: 0 }}>
              <Avatar icon={<UserOutlined />} style={{ marginRight: "2px" }} />
              Account
            </Button>
          </Dropdown>
        </div>
      </header>
      <main style={{ maxWidth: 1700, margin: "0 auto", padding: "1rem" }}>
        <Outlet />
      </main>
    </>
  );
};

export default Navbar;
