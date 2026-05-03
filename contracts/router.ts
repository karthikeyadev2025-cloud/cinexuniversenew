/**
 * AppRouter type placeholder for frontend tRPC client.
 *
 * The actual router with full procedure types lives in api/router.ts (server-side).
 * At runtime, tRPC communicates via HTTP JSON — types are not needed.
 * For local development with full type safety, run: npx tsc -p tsconfig.server.json
 */
export type AppRouter = Record<string, unknown>;
