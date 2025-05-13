import React, { useState, useRef, useEffect } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Button, Drawer, Dropdown, Menu } from "antd";
import partsGenieLogo from "../../assets/img/partsGenieLogo.svg";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";
  const [visible, setVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const token = localStorage.getItem("access_token");
  const wrapperRef = useRef(null);

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
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
    setShowSuggestions(false);
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
    window.location.reload();
  };

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  const navItems = [
    { key: "home", label: "HOME" },
    { key: "all-categories", label: "ALL CATEGORIES" },
    { key: "dashboard", label: "DASHBOARD" },
  ];

  const accountMenuItems = [
    { key: "profile", label: "Profile" },
    { key: "logout", label: "Logout" },
  ];

  const handleNavClick = (e) => {
    // Perform navigation based on key
    setVisible(false);
    if (e.key === "home") {
      navigate("/");
      return;
    }
    navigate(`/${e.key}`);
  };

  const handleAccountClick = (e) => {
    setVisible(false);
    if (e.key === "logout") {
      handleLogout();
    } else {
      navigate(`/${e.key}`);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="nav-logo-menu-section">
          <div className="navbar-logo" onClick={() => navigate("/")}>
            <img src={partsGenieLogo} alt="partsGeneie-logo" />
          </div>

          {/* Desktop Menu */}
          <div className="navbar-menu desktop">
            <Menu
              mode="horizontal"
              items={navItems}
              className="nav-menu-items"
              onClick={handleNavClick}
            />
          </div>
        </div>

        {/* Desktop Account */}
        <div className="navbar-account desktop">
          <Dropdown
            overlay={
              <Menu items={accountMenuItems} onClick={handleAccountClick} />
            }
            placement="bottomRight"
          >
            <span className="account-dropdown">MY ACCOUNT ▾</span>
          </Dropdown>
        </div>

        {/* Mobile Hamburger */}
        <div className="mobile-toggle mobile">
          <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} />
          <Drawer
            title="Menu"
            placement="right"
            onClose={closeDrawer}
            open={visible}
          >
            <Menu
              mode="vertical"
              items={navItems}
              className="nav-menu-items"
              onClick={handleNavClick}
            />
            <div className="drawer-account">
              <Dropdown
                overlay={
                  <Menu items={accountMenuItems} onClick={handleAccountClick} />
                }
                placement="bottomLeft"
              >
                <span className="account-dropdown">MY ACCOUNT ▾</span>
              </Dropdown>
            </div>
          </Drawer>
        </div>
      </nav>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Navbar;
