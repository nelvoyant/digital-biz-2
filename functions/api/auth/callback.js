// functions/auth/callback.js
import { v4 as uuidv4 } from "uuid"; // Import uuid for generating tokens

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // const state = url.searchParams.get('state'); // Not used in this basic example

  if (!code) {
    return redirectToError("Error: Missing authorization code", "/");
  }

  const GITHUB_CLIENT_ID = env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = env.GITHUB_CLIENT_SECRET;
  // Use the Pages.dev URL as the REDIRECT_URI for consistency
  const REDIRECT_URI = env.GITHUB_REDIRECT_URI; // Correct Line
  console.log(REDIRECT_URI);
  try {
    // 1. Exchange the code for an access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("GitHub token exchange error:", errorData);
      throw new Error(
        errorData.error_description || "Failed to exchange code for token"
      );
    }

    const tokenData = await tokenResponse.json();

    // LOG THE ENTIRE RESPONSE FROM GITHUB
    console.log(
      "GitHub Token Response Body:",
      JSON.stringify(tokenData, null, 2)
    );

    const { access_token } = tokenData;

    if (!access_token) {
      // We can even make our error more specific now
      const errorDescription =
        tokenData.error_description || "No access token in response";
      throw new Error(`Failed to get access token: ${errorDescription}`);
    }
    // 2. Use the access token to fetch user profile data
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${access_token}`,
        "User-Agent": "Cloudflare-Pages-App",
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error("GitHub user data fetch error:", errorData);
      throw new Error(errorData.message || "Failed to fetch user data");
    }

    const githubUser = await userResponse.json();

    // 3. Store or retrieve user in D1
    let userRecord;
    const existingUser = await env.DB.prepare(
      "SELECT * FROM users WHERE github_id = ?"
    )
      .bind(githubUser.id)
      .first();

    if (existingUser) {
      // Update existing user (e.g., if name/email changed)
      await env.DB.prepare(
        "UPDATE users SET login = ?, name = ?, email = ?, avatar_url = ? WHERE github_id = ?"
      )
        .bind(
          githubUser.login,
          githubUser.name,
          githubUser.email,
          githubUser.avatar_url,
          githubUser.id
        )
        .run();
      userRecord = {
        ...existingUser,
        login: githubUser.login,
        name: githubUser.name,
        email: githubUser.email,
        avatar_url: githubUser.avatar_url,
      }; // Update the record
    } else {
      // Create new user
      const { success, results } = await env.DB.prepare(
        "INSERT INTO users (github_id, login, name, email, avatar_url) VALUES (?, ?, ?, ?, ?)"
      )
        .bind(
          githubUser.id,
          githubUser.login,
          githubUser.name,
          githubUser.email,
          githubUser.avatar_url
        )
        .run();

      if (!success) {
        throw new Error("Failed to create new user in D1");
      }
      // Fetch the newly created user to get the auto-incremented ID
      userRecord = await env.DB.prepare(
        "SELECT * FROM users WHERE github_id = ?"
      )
        .bind(githubUser.id)
        .first();
    }

    if (!userRecord || !userRecord.id) {
      throw new Error("Could not retrieve or create user record.");
    }

    // 4. Generate and store a secure session token
    const sessionToken = uuidv4(); // Generate a UUID as a session token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await env.DB.prepare(
      "INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)"
    )
      .bind(userRecord.id, sessionToken, expiresAt.toISOString())
      .run();

    // 5. Set the session token as a secure, httpOnly cookie and redirect
    const cookie = `session_token=${sessionToken}; Path=/; HttpOnly; Secure; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;

    return new Response(null, {
      status: 302, // Redirect
      headers: {
        Location: "/", // Redirect to homepage
        "Set-Cookie": cookie,
      },
    });
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    // Redirect to an error page or show an error message
    return redirectToError(
      `An error occurred during GitHub login: ${error.message}`,
      "/"
    );
  }
}

// Helper function for redirection with an error message
function redirectToError(message, path = "/") {
  // You might want to encode the error message to pass it as a query param
  // For simplicity, we'll just redirect to the path for now
  return new Response(null, {
    status: 302,
    headers: {
      Location: path, // Or path + `?error=${encodeURIComponent(message)}`
    },
  });
}
