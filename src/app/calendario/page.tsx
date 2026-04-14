import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import CalendarView from '@/components/calendar-view'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  title: 'Palpites de Futebol Hoje e Amanhã — Calendário de Partidas',
  description:
    'Veja os palpites e prognósticos para os jogos de futebol de hoje e dos próximos dias. Análises com modelo estatístico para Brasileirão, Premier League, Champions League e mais.',
  alternates: {
    canonical: `${SITE_URL}/calendario`,
  },
}

export default async function CalendarioPage() {
  const queryClient = getQueryClient()
  await queryClient.prefetchQuery(trpc.matchPicks.getAll.queryOptions())

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="relative mb-12 rounded-xl overflow-hidden bg-surface-container-low h-48 md:h-56 flex items-center px-8 border border-outline-variant/15">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="relative z-10">
            <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tighter mb-2">
              CALENDÁRIO DE <span className="text-primary">PARTIDAS</span>
            </h1>
            <p className="text-on-surface-variant max-w-md text-base md:text-lg">
              O oráculo das apostas futuras. Analise a confiança da IA para os próximos confrontos.
            </p>
          </div>
        </div>

        {/* Dashboard */}
        <CalendarView />
      </div>
    </HydrationBoundary>
  )
}
