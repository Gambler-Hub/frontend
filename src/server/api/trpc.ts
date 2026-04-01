// src/server/api/trpc.ts
import { initTRPC } from '@trpc/server'

const t = initTRPC.create()

export const createTRPCContext = () => ({})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
