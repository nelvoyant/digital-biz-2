// functions/middleware/auth.js

/**
 * Middleware to validate a session token from a cookie.
 * If valid, it attaches the user's data to context.data.
 * If invalid, it returns a 401 Unauthorized response.
 */
export async function validateSession(context) {
  const { request, env, next, data } = context;

  // 1. Get the session token from the cookie
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split(";").map((c) => c.trim().split("="))
  );
  const sessionToken = cookies.session_token;

  if (!sessionToken) {
    return new Response("Unauthorized: No session token provided", {
      status: 401,
    });
  }

  // 2. Look up the session in the D1 database
  const session = await env.DB.prepare(
    "SELECT * FROM sessions WHERE session_token = ?"
  )
    .bind(sessionToken)
    .first();

  if (!session) {
    return new Response("Unauthorized: Invalid session token", { status: 401 });
  }

  // 3. Check if the session has expired
  if (new Date(session.expires_at) < new Date()) {
    // Optional: Clean up expired session from the database
    await env.DB.prepare("DELETE FROM sessions WHERE id = ?")
      .bind(session.id)
      .run();
    return new Response("Unauthorized: Session has expired", { status: 401 });
  }

  // 4. Fetch the associated user
  const user = await env.DB.prepare(
    "SELECT id, github_id, login, name, avatar_url FROM users WHERE id = ?"
  )
    .bind(session.user_id)
    .first();

  if (!user) {
    return new Response("Unauthorized: User not found for this session", {
      status: 401,
    });
  }

  // 5. Attach the user object to the context for the next function to use
  data.user = user;

  // 6. Call the next function in the chain
  return await next();
}
