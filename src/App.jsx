// src/App.jsx
import React from "react";
import BusinessCard from "./BusinessCard"; // Import your new component
import "./App.css"; // Keep the App-specific CSS

function App() {
  return (
    <div className="App">
      <BusinessCard /> {/* Use your BusinessCard component here */}
    </div>
  );
}

export default App;
