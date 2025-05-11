import React, { useState } from 'react';
import { MenuOutlined } from '@ant-design/icons';
import { Outlet } from "react-router-dom";
import { Button, Drawer, Dropdown, Menu } from 'antd';
import './Navbar.css';

const Navbar = () => {
  const [visible, setVisible] = useState(false);

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  const navItems = [
    { key: 'dashboard', label: 'DASHBOARD' },
    { key: 'spare-parts', label: 'SPARE PARTS' },
    { key: 'reports', label: 'REPORTS' },
    { key: 'manage', label: 'MANAGE' },
  ];

  const accountMenuItems = [
    { key: 'profile', label: 'Profile' },
    { key: 'logout', label: 'Logout' },
  ];

  return (
    <>
    <nav className="navbar">
      <div className='nav-logo-menu-section'>
        <div className="navbar-logo">
          <div className="navbar-icon">🛠️</div>
          <span className="navbar-title">
            <span className="title-blue">Parts</span>
            <span className="title-red">GENIE</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu desktop">
          <Menu mode="horizontal" items={navItems} className="nav-menu-items" />
        </div>
      </div>

      {/* Desktop Account */}
      <div className="navbar-account desktop">
        <Dropdown menu={{ items: accountMenuItems }} placement="bottomRight">
          <span className="account-dropdown">MY ACCOUNT ▾</span>
        </Dropdown>
      </div>

      {/* Mobile Hamburger */}
      <div className="mobile-toggle mobile">
        <Button type="text" icon={<MenuOutlined />} onClick={showDrawer} />
        <Drawer title="Menu" placement="right" onClose={closeDrawer} open={visible}>
          <Menu mode="vertical" items={navItems} className="nav-menu-items" />
          <div className="drawer-account">
            <Dropdown menu={{ items: accountMenuItems }} placement="bottomLeft">
              <span className="account-dropdown">MY ACCOUNT ▾</span>
            </Dropdown>
          </div>
        </Drawer>
      </div>
    </nav>
    <div>
      <Outlet/>
    </div>
    </>
  );
};

export default Navbar;
