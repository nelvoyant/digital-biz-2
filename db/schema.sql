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