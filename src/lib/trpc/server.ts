// src/lib/trpc/server.ts
import 'server-only'
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query'
import { cache } from 'react'
import { makeQueryClient } from './query-client'
import { appRouter } from '@/server/api/root'
import { createTRPCContext } from '@/server/api/trpc'

export const getQueryClient = cache(makeQueryClient)

export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
})
