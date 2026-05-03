import { authRouter } from "./auth-router";
import { localAuthRouter } from "./local-auth-router";
import { googleAuthRouter } from "./google-auth-router";
import { castingRouter } from "./casting-router";
import { projectRouter } from "./project-router";
import { adminRouter } from "./admin-router";
import { aiProxyRouter } from "./ai-proxy-router";
import { paymentRouter } from "./payment-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  health: publicQuery.query(async () => {
    return {
      ok: true,
      ts: Date.now(),
      message: "Cinex Universe API is running",
    };
  }),
  auth: authRouter,
  localAuth: localAuthRouter,
  googleAuth: googleAuthRouter,
  casting: castingRouter,
  project: projectRouter,
  admin: adminRouter,
  ai: aiProxyRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
