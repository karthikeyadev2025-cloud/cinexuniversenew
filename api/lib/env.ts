import "dotenv/config";

function getEnv(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  appId: getEnv("APP_ID"),
  appSecret: getEnv("APP_SECRET"),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: getEnv("DATABASE_URL"),
  // Public URL for the app — used for OAuth redirect URIs.
  // Set APP_URL in production (e.g. https://www.cinexuniverse.com).
  appUrl: getEnv("APP_URL") || (process.env.NODE_ENV === "production" ? "https://www.cinexuniverse.com" : "http://localhost:3000"),
  // Default values prevent runtime crashes when env vars are not set
  kimiAuthUrl: getEnv("KIMI_AUTH_URL") || "https://auth.kimi.com",
  kimiOpenUrl: getEnv("KIMI_OPEN_URL") || "https://open.kimi.com",
  ownerUnionId: getEnv("OWNER_UNION_ID") || "",
  replicateApiToken: getEnv("REPLICATE_API_TOKEN") || "",
  razorpayKeyId: getEnv("RAZORPAY_KEY_ID") || "",
  razorpayKeySecret: getEnv("RAZORPAY_KEY_SECRET") || "",
  googleClientId: getEnv("GOOGLE_CLIENT_ID") || "",
  googleClientSecret: getEnv("GOOGLE_CLIENT_SECRET") || "",
};
