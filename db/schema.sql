-- db/schema.sql
DROP TABLE IF EXISTS messages;
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
-- Optional: Insert some initial data
INSERT INTO messages (name, message) VALUES ('Alice', 'Hello, great business card!');
INSERT INTO messages (name, message) VALUES ('Bob', 'Nice work, excited to see more!');

-- Table for users
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    github_id TEXT UNIQUE NOT NULL, -- GitHub's unique ID for the user
    login TEXT NOT NULL,            -- GitHub username
    name TEXT,                      -- User's display name
    email TEXT,                     -- User's primary email
    avatar_url TEXT,                -- URL to their GitHub avatar
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table for user sessions
DROP TABLE IF EXISTS sessions;
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);