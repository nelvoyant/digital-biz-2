// functions/api/auth/status.js
import { validateSession } from "../../middleware/auth";

// This is the main handler that runs AFTER the middleware.
// It receives the user data that the middleware attached to context.
const handleStatusRequest = async ({ data }) => {
  // The `validateSession` middleware has already run.
  // If it failed, this function would never be reached.
  // If it succeeded, the user's data is in `context.data.user`.
  return new Response(JSON.stringify({ user: data.user }), {
    headers: { "Content-Type": "application/json" },
  });
};

// We export an array to create a middleware chain.
// `validateSession` runs first, then `handleStatusRequest`.
export const onRequestGet = [validateSession, handleStatusRequest];
