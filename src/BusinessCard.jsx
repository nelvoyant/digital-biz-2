// src/BusinessCard.jsx
import React from "react";
import "./BusinessCard.css"; // Import your new CSS file

function BusinessCard() {
  return (
    <div className="business-card">
      <h1>Your Name</h1>
      <h2>Your Title / Profession</h2>
      <p>
        This is a simple digital business card. You can add more details here,
        like a short bio or a mission statement.
      </p>
      <div className="social-links">
        {/* We'll add social links here later */}
        <a href="#" target="_blank" rel="noopener noreferrer">
          LinkedIn
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          GitHub
        </a>
        <a href="#" target="_blank" rel="noopener noreferrer">
          Twitter
        </a>
      </div>
    </div>
  );
}

export default BusinessCard;
