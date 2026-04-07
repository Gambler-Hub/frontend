// src/app/page.tsx
import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import Hero from '@/components/hero'
import MatchGrid from '@/components/match-grid'
import TrustSection from '@/components/trust-section'

export const metadata: Metadata = {
  title: 'Portal do Apostador — Palpites e Análises de Apostas Esportivas',
  description:
    'Palpites de apostas esportivas com análise quantitativa. Prognósticos para futebol baseados em modelo estatístico com probabilidades, edge e value betting para gols, escanteios, cartões e mais.',
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  },
}

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
