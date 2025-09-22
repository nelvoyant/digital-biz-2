// functions/api/messages.js

export async function onRequest(context) {
  const { request, env } = context;

  console.log(`[API] Received ${request.method} request for ${request.url}`);
  console.log(`[API] env.DB is defined: ${!!env.DB}`); // Check if DB binding exists

  // Handle GET requests to fetch messages
  if (request.method === "GET") {
    try {
      console.log("[API-GET] Attempting to prepare SELECT query...");
      // Check if env.DB is indeed an object with a 'prepare' method
      if (!env.DB || typeof env.DB.prepare !== "function") {
        console.error(
          "[API-GET] Error: env.DB is not a valid D1 database object."
        );
        throw new Error(
          "Database binding (env.DB) is not correctly configured."
        );
      }
      /*
      await env.DB.prepare(
        `
        DROP TABLE IF EXISTS messages;
        CREATE TABLE messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          message TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO messages (name, message) VALUES ('Alice', 'Hello, great business card!');
      `
      ).all();
``````*/
      const { results } = await env.DB.prepare(
        "SELECT * FROM messages ORDER BY timestamp DESC"
      ).all();

      /*const { results } = await env.DB.prepare(
        "SELECT name, type, sql FROM sqlite_master WHERE type IN ('table', 'view')"
      ).all();
      */
      console.log(`[API-GET] Successfully fetched ${results.length} messages.`);
      console.log(`[API-GET] ${JSON.stringify(results)}`);
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("[API-GET] Error fetching messages:", error); // Log the actual error
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle POST requests to add a new message
  if (request.method === "POST") {
    try {
      console.log("[API-POST] Attempting to parse request body...");
      const { name, message } = await request.json(); // Parse JSON from the request body
      console.log(
        `[API-POST] Received data - Name: "${name}", Message: "${message}"`
      );

      if (!name || !message) {
        console.error("[API-POST] Error: Name and message are required.");
        return new Response(
          JSON.stringify({ error: "Name and message are required" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      console.log("[API-POST] Attempting to prepare INSERT query...");
      if (!env.DB || typeof env.DB.prepare !== "function") {
        console.error(
          "[API-POST] Error: env.DB is not a valid D1 database object for POST."
        );
        throw new Error(
          "Database binding (env.DB) is not correctly configured for POST."
        );
      }

      const { success } = await env.DB.prepare(
        "INSERT INTO messages (name, message) VALUES (?, ?)"
      )
        .bind(name, message)
        .run();

      if (success) {
        console.log("[API-POST] Message added successfully.");
        return new Response(
          JSON.stringify({
            statusMessage: "Message added successfully",
            name,
            message,
          }),
          {
            status: 201, // 201 Created
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        console.error(
          "[API-POST] Error: Failed to insert message into database (success was false)."
        );
        throw new Error("Failed to insert message into database.");
      }
    } catch (error) {
      console.error("[API-POST] Error posting message:", error); // Log the actual error
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Handle other methods (e.g., PUT, DELETE) if they were to be implemented
  console.log(`[API] Method Not Allowed: ${request.method}`);
  return new Response("Method Not Allowed", { status: 405 });
}
