import { createRouter, publicQuery } from "./middleware";
import { contactRouter } from "./routers/contact";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  contact: contactRouter,
});

export type AppRouter = typeof appRouter;
