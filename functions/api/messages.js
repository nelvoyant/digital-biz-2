// functions/api/messages.js
import { validateSession } from "../middleware/auth"; // Import our new middleware

// Handler for GET requests (publicly accessible)
export async function onRequestGet({ env }) {
  try {
    const { results } = await env.DB.prepare(
      "SELECT * FROM messages ORDER BY timestamp DESC"
    ).all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET /api/messages Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Handler for the main POST logic, runs AFTER the middleware
const handlePostMessage = async ({ request, env, data }) => {
  try {
    // We no longer get the name from the body, we get it from the validated session!
    const { user } = data;
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { success } = await env.DB.prepare(
      "INSERT INTO messages (name, message) VALUES (?, ?)"
    )
      .bind(user.name || user.login, message) // Use the authenticated user's name
      .run();

    if (success) {
      return new Response(
        JSON.stringify({ statusMessage: "Message added successfully" }),
        {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      throw new Error("Failed to insert message into database.");
    }
  } catch (error) {
    console.error("POST /api/messages Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// For POST requests, we export an array.
// Cloudflare will run `validateSession` first. If it succeeds, it will run `handlePostMessage`.
export const onRequestPost = [validateSession, handlePostMessage];
