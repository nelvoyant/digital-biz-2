// src/BusinessCard.jsx
import React, { useState, useEffect } from "react"; // Import useState and useEffect
import "./BusinessCard.css";

function BusinessCard() {
  const [messages, setMessages] = useState([]);
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_ENDPOINT = "/api/messages"; // Our Cloudflare Function endpoint

  // Function to fetch messages from the API
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

  // useEffect hook to fetch messages when the component mounts
  useEffect(() => {
    fetchMessages();
  }, []); // Empty dependency array means this runs once on mount

  // Function to handle new message submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(null); // Clear previous errors

    if (!newName.trim() || !newMessage.trim()) {
      setError("Name and Message cannot be empty.");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName, message: newMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // If successful, clear the form and re-fetch messages
      setNewName("");
      setNewMessage("");
      fetchMessages();
    } catch (err) {
      setError("Failed to post message: " + err.message);
      console.error("Error posting message:", err);
    }
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
