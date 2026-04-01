// src/server/api/routers/match-picks.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { fetchMatchPicks, fetchMatchPickBySlug } from '@/lib/strapi'

export const matchPicksRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return fetchMatchPicks()
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return fetchMatchPickBySlug(input.slug)
    }),
})
