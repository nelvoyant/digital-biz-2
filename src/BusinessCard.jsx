// src/BusinessCard.jsx
import React, { useState, useEffect } from "react";
import "./BusinessCard.css";

function BusinessCard() {
  // ... (state variables: messages, newName, newMessage, error, loading, user)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null); // This is key!

  const GITHUB_CLIENT_ID = "Ov23liIeEEyRM8yBzqsY"; // Your actual Client ID

  // NEW: Function to check login status when the app loads
  const checkLoginStatus = async () => {
    try {
      const response = await fetch("/api/auth/status", {
        credentials: "include", // IMPORTANT: Must include credentials to send the cookie
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user); // Set the user state if logged in
      } else {
        setUser(null); // Ensure user is null if not logged in
      }
    } catch (err) {
      console.error("Error checking login status:", err);
      setUser(null);
    }
  };

  const fetchMessages = async () => {
    // ... (fetchMessages function remains the same)
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/messages");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError("Failed to fetch messages: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: useEffect now calls both functions on initial load
  useEffect(() => {
    // We want to check login status first, then fetch messages
    const initialize = async () => {
      await checkLoginStatus();
      await fetchMessages();
    };
    initialize();
  }, []); // Empty array means this runs only once when the component mounts

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... (handleSubmit function updated to use credentials: 'include')
    setError(null);
    if (!newMessage.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // This allows the session cookie to be sent
        body: JSON.stringify({ message: newMessage }), // Name is no longer needed
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      setNewMessage("");
      fetchMessages(); // Re-fetch messages to show the new one
    } catch (err) {
      setError("Failed to post message: " + err.message);
    }
  };

  const handleLoginWithGitHub = () => {
    // ... (handleLoginWithGitHub function remains the same)
    const currentOrigin = window.location.origin;
    const redirectUri = encodeURIComponent(
      `${currentOrigin}/api/auth/callback`
    );
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  // NEW: Fully implemented Logout function
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Must include credentials to send the cookie
      });
      setUser(null); // Clear the user from state
    } catch (err) {
      console.error("Error logging out:", err);
    }
  };

  return (
    <div className="business-card">
      {/* ... (Your Name, Title, Social Links) ... */}
      <h1>Your Name</h1>
      <h2>Your Title / Profession</h2>
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

      {/* Authentication Section - This will now be dynamic! */}
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
            Login with GitHub to Post
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

        {/* Message Submission Form - Now it only shows if you're logged in */}
        {user ? (
          <form onSubmit={handleSubmit} className="message-form">
            <textarea
              placeholder="Your Message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows="3"
              required
            ></textarea>
            <button type="submit">Send Message</button>
          </form>
        ) : (
          <p>Please log in to leave a message.</p>
        )}

        {/* Display Messages */}
        {/* ... (messages-list JSX remains the same) ... */}
        <div className="messages-list">
          {loading ? (
            <p>Loading messages...</p>
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
