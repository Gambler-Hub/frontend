// src/server/api/root.ts
import { createTRPCRouter } from './trpc'
import { matchPicksRouter } from './routers/match-picks'

export const appRouter = createTRPCRouter({
  matchPicks: matchPicksRouter,
})

export type AppRouter = typeof appRouter
