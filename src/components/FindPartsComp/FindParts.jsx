import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import lightImg from "../../assets/img/lightImg.svg"
import './FindParts.css';

const FindParts = () => {
  return (
    <div className="find-parts-section">
      <div className="search-box">
        <h1>FIND SPARE PARTS</h1>
        <div className="search-input-wrapper">
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Search by part name, code, machine type, issue etc.."
            className="search-input"
          />
        </div>
        <button className="search-button">FIND</button>
        <p className="powered-by">
          <img src={lightImg} alt="lightning" className="lightning-icon" />
          Powered by SHORTHILLS AI STUDIO
        </p>
      </div>
    </div>
  );
};

export default FindParts;
