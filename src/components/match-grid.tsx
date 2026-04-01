'use client'

import { useTRPC } from '@/lib/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import MatchCard from './match-card'

export default function MatchGrid() {
  const trpc = useTRPC()
  const { data: picks } = useSuspenseQuery(trpc.matchPicks.getAll.queryOptions())

  return (
    <section className="max-w-screen-2xl mx-auto px-6 py-20">
      {/* Section header */}
      <div className="flex items-end justify-between mb-12">
        <div>
          <h2 className="font-headline text-4xl font-bold tracking-tighter mb-2">
            Partidas do Dia
          </h2>
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-medium">
            Predições de alta precisão baseadas em Big Data
          </p>
        </div>
        <button
          disabled
          className="text-primary/40 text-sm font-bold flex items-center gap-1 cursor-not-allowed"
        >
          Ver Calendário Completo →
        </button>
      </div>

      {picks.length === 0 ? (
        <p className="text-on-surface-variant text-center py-20">
          Nenhuma partida disponível hoje.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {picks.map((pick) => (
            <MatchCard key={pick.id} pick={pick} />
          ))}
        </div>
      )}
    </section>
  )
}
