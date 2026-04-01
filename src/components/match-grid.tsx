'use client'

import Link from 'next/link'
import { useTRPC } from '@/lib/trpc/client'
import { useSuspenseQuery } from '@tanstack/react-query'
import MatchCard from './match-card'

export default function MatchGrid() {
  const trpc = useTRPC()
  const { data: picks } = useSuspenseQuery(trpc.matchPicks.getAll.queryOptions())
  const visible = picks.slice(0, 3)

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
        <Link
          href="/calendario"
          className="text-primary text-sm font-bold flex items-center gap-1 hover:text-primary/80 transition-colors"
        >
          Ver Calendário Completo →
        </Link>
      </div>

      {visible.length === 0 ? (
        <p className="text-on-surface-variant text-center py-20">
          Nenhuma partida disponível hoje.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visible.map((pick) => (
            <MatchCard key={pick.id} pick={pick} />
          ))}
        </div>
      )}
    </section>
  )
}
