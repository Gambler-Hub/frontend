// src/app/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import Hero from '@/components/hero'
import MatchGrid from '@/components/match-grid'
import TrustSection from '@/components/trust-section'

export default async function HomePage() {
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(trpc.matchPicks.getAll.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Hero />
      <MatchGrid />
      <TrustSection />
    </HydrationBoundary>
  )
}
