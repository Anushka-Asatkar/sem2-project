// src/components/SearchFilter.jsx
import React, { useState } from "react";
import "./SearchFilter.css";

const SearchFilter = ({ onSearch }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search, category });
  };

  return (
    <form className="search-filter" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search notes..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        <option value="Math">Math</option>
        <option value="Science">Science</option>
        <option value="Commerce">Commerce</option>
        <option value="Coding">Coding</option>
        {/* Add more categories as needed */}
      </select>
      <button type="submit">Filter</button>
    </form>
  );
};

export default SearchFilter;
