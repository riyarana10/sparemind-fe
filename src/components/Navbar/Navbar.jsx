import { useState } from "react";
import { MenuOutlined } from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button, Drawer, Dropdown, Menu } from "antd";
import partsGenieLogo from "../../assets/img/partsGenieLogo.svg";
import "./Navbar.css";
import dropdownIcon from "../../assets/img/dropdownIcon.svg";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("categoryId");
    navigate("/login");
    window.location.reload();
  };

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  const navItems = [
    { key: "home", label: "HOME" },
    { key: "all-categories", label: "ALL CATEGORIES" },
    { key: "dashboard", label: "DASHBOARD" },
    { key: "rca-bot", label: "RCA BOT" },
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (e.key === "rca-bot") {
      window.open("http://15.168.192.43:8001/", "_blank");
      return;
    }
    navigate(`/${e.key}`);
  };

  const getSelectedKey = () => {
    if (location.pathname === "/") return "home";
    if (location.pathname.includes("all-categories")) return "all-categories";
    if (location.pathname.includes("dashboard")) return "dashboard";
    return "";
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
          <div
            className="navbar-logo"
            onClick={() => {
              navigate("/");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <img src={partsGenieLogo} alt="partsGeneie-logo" />
          </div>

          {/* Desktop Menu */}
          <div className="navbar-menu desktop">
            <Menu
              mode="horizontal"
              items={navItems}
              className="nav-menu-items"
              onClick={handleNavClick}
              selectedKeys={[getSelectedKey()]}
            />
          </div>
        </div>

        {/* Desktop Account */}
        <div className="navbar-account desktop">
          <Dropdown
            menu={{
              items: accountMenuItems,
              onClick: handleAccountClick,
            }}
            placement="bottomRight"
          >
            <span className="account-dropdown">
              MY ACCOUNT{" "}
              <img
                style={{ marginLeft: "14px" }}
                src={dropdownIcon}
                alt="dropdown-icon"
              />
            </span>
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
              selectedKeys={[getSelectedKey()]}
            />
            <div className="drawer-account">
              <Dropdown
                menu={{
                  items: accountMenuItems,
                  onClick: handleAccountClick,
                }}
                placement="bottomLeft"
              >
                <span className="account-dropdown">
                  MY ACCOUNT <img src={dropdownIcon} alt="dropdown-icon" />
                </span>
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
