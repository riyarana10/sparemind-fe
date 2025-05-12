import React from 'react';
import './SearchBar.css';
import { FaSearch } from 'react-icons/fa';

const SearchBar = () => {
  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search by part name, code, machine type, issue etc.."
          className="search-input"
        />
      </div>
      <button className="search-button">FIND</button>
    </div>
  );
};

export default SearchBar;
