import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { tryInitDb } from "./queries/connection";

// Initialise DB connection eagerly so isDbAvailable() is correct
// from the very first incoming request (not just after the first DB call).
tryInitDb();

const app = new Hono();

// CORS
app.use("*", cors({
  origin: "*",
  allowMethods: ["GET", "POST", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Body limit
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Health check — API only
app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    ts: Date.now(),
    message: "Cinex Universe API is running",
    version: "1.0.0",
  });
});

// Database health check — tests the actual DB connection
app.get("/api/health/db", async (c) => {
  try {
    const { getDb, isDbAvailable } = await import("./queries/connection");

    if (!isDbAvailable()) {
      return c.json({ ok: false, db: "unavailable", message: "DATABASE_URL not configured or connection failed" }, 503);
    }

    // Run a lightweight ping query to confirm the DB is reachable
    const db = getDb();
    await db.execute("SELECT 1" as unknown as Parameters<typeof db.execute>[0]);

    return c.json({ ok: true, db: "connected", ts: Date.now() });
  } catch (err: any) {
    return c.json({ ok: false, db: "error", message: err.message }, 503);
  }
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// Google OAuth callback
app.get("/api/oauth/google/callback", async (c) => {
  const code = c.req.query("code");
  const state = c.req.query("state");
  const error = c.req.query("error");

  if (error) {
    return c.html(`
      <html><body style="background:#060606;color:#F0F0F0;font-family:sans-serif;text-align:center;padding:50px;">
        <h2>Google Sign-In Error</h2>
        <p>${error}</p>
        <a href="/#/login" style="color:#D4A853;">Back to Login</a>
      </body></html>
    `);
  }

  if (!code) {
    return c.html(`
      <html><body style="background:#060606;color:#F0F0F0;font-family:sans-serif;text-align:center;padding:50px;">
        <h2>Sign-In Failed</h2>
        <p>Authorization code not received from Google.</p>
        <a href="/#/login" style="color:#D4A853;">Back to Login</a>
      </body></html>
    `);
  }

  // Try to exchange the code via tRPC
  try {
    const caller = appRouter.createCaller({ req: c.req.raw, resHeaders: new Headers() });
    const result = await caller.googleAuth.exchangeCode({ code, state: state || "" });

    // Escape display name to prevent XSS
    const safeName = (result.user.name || "Filmmaker")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    // Safely encode token via JSON.stringify so any special chars are escaped
    const safeToken = JSON.stringify(result.token);

    // Store token and redirect
    return c.html(`
      <html>
        <body style="background:#060606;color:#F0F0F0;font-family:sans-serif;text-align:center;padding:50px;">
          <h2 style="color:#D4A853;">Welcome, ${safeName}!</h2>
          <p>Sign-in successful. Redirecting to dashboard...</p>
          <script>
            localStorage.setItem('cinex_token', ${safeToken});
            setTimeout(() => window.location.href = '/#/dashboard', 1000);
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    return c.html(`
      <html><body style="background:#060606;color:#F0F0F0;font-family:sans-serif;text-align:center;padding:50px;">
        <h2 style="color:#E74C3C;">Sign-In Error</h2>
        <p>${err.message || 'Something went wrong'}</p>
        <a href="/#/login" style="color:#D4A853;">Back to Login</a>
      </body></html>
    `);
  }
});

// Kimi OAuth callback (fallback)
app.get("/api/oauth/callback", async (c) => {
  return c.html(`
    <html><body style="background:#060606;color:#F0F0F0;font-family:sans-serif;text-align:center;padding:50px;">
      <h2 style="color:#D4A853;">OAuth Setup</h2>
      <p>Please use Google Sign-In or Email/Password to log in.</p>
      <a href="/#/login" style="color:#D4A853;">Back to Login</a>
    </body></html>
  `);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: "Not Found", path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error("Server error:", err);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

export default app;
