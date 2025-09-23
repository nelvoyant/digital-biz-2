// src/BusinessCard.jsx
import React, { useState, useEffect } from "react";
import "./BusinessCard.css";

function BusinessCard() {
  const [messages, setMessages] = useState([]);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // New state for logged-in user

  const API_ENDPOINT = "/api/messages"; // Our Cloudflare Function endpoint
  const GITHUB_CLIENT_ID = "Ov23liIeEEyRM8yBzqsY"; // <--- IMPORTANT: Replace with your actual GitHub Client ID

  // Function to fetch messages from the API (remains the same)
  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError("Failed to fetch messages: " + err.message);
      console.error("Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Later: Add a call here to check login status
  }, []);

  // Function to handle new message submission (remains the same for now)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!newName.trim() || !newMessage.trim()) {
      setError("Name and Message cannot be empty.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Later: Add authorization header if user is logged in
        },
        body: JSON.stringify({ name: newName, message: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setNewName("");
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      setError("Failed to post message: " + err.message);
      console.error("Error posting message:", err);
    }
  };

  // Function to redirect to GitHub for login
  const handleLoginWithGitHub = () => {
    // The redirect URL where GitHub sends the user back after authorization
    // This MUST match the "Authorization callback URL" you set in your GitHub OAuth App
    const redirectUri = encodeURIComponent(
      "https://digital-biz-2.pages.dev/api/auth/callback"
    );

    // GitHub's authorization endpoint
    window.location.href =
      `https://github.com/login/oauth/authorize?` +
      `client_id=${GITHUB_CLIENT_ID}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=user:email`; // Request user's email access
  };

  // Placeholder for future logout function
  const handleLogout = () => {
    console.log("Logout functionality not yet implemented.");
    setUser(null); // For now, just clear local user state
    // Later: Make an API call to invalidate session
  };

  return (
    <div className="business-card">
      <h1>Your Name</h1> {/* Update with your name */}
      <h2>Your Title / Profession</h2> {/* Update with your title */}
      <p>
        This is a simple digital business card. You can add more details here,
        like a short bio or a mission statement.
      </p>
      <div className="social-links">
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
      <hr style={{ margin: "40px 0", borderColor: "#eee" }} />
      {/* Authentication Section */}
      <div className="auth-section">
        {user ? (
          <div className="logged-in-status">
            <p>
              Logged in as: <strong>{user.name || user.login}</strong>
            </p>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={handleLoginWithGitHub}
            className="github-login-button"
          >
            Login with GitHub
          </button>
        )}
      </div>
      <hr style={{ margin: "40px 0", borderColor: "#eee" }} />
      {/* Guestbook Section */}
      <div className="guestbook-section">
        <h3>Guestbook</h3>

        {error && (
          <p className="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* Message Submission Form */}
        <form onSubmit={handleSubmit} className="message-form">
          <input
            type="text"
            placeholder="Your Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <textarea
            placeholder="Your Message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            rows="3"
            required
          ></textarea>
          <button type="submit">Send Message</button>
        </form>

        {/* Display Messages */}
        <div className="messages-list">
          {loading ? (
            <p>Loading messages...</p>
          ) : messages.length === 0 ? (
            <p>No messages yet. Be the first to leave one!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="message-item">
                <p>
                  <strong>{msg.name}</strong> says:
                </p>
                <p className="message-text">{msg.message}</p>
                <span className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default BusinessCard;
