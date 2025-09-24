// functions/api/auth/logout.js
import { validateSession } from "../../middleware/auth";

// This handler runs AFTER a session is validated.
const handleLogoutRequest = async ({ env, request }) => {
  // 1. Get the session token from the cookie to identify which session to delete.
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("="))
  );
  const sessionToken = cookies.session_token;

  // 2. Delete the session from the D1 database.
  if (sessionToken) {
    await env.DB.prepare("DELETE FROM sessions WHERE session_token = ?")
      .bind(sessionToken)
      .run();
  }

  // 3. Instruct the browser to clear the cookie by setting its expiration date to the past.
  const cookie =
    "session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT";

  return new Response(JSON.stringify({ message: "Logged out successfully" }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookie,
    },
  });
};

// We use the middleware to ensure only authenticated users can hit the logout endpoint.
export const onRequestPost = [validateSession, handleLogoutRequest];
