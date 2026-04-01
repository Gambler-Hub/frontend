// src/server/api/root.ts
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({})

export type AppRouter = typeof appRouter
