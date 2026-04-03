import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import MatchDetail from '@/components/match-detail'
import { fetchMatchPickBySlug, fetchMatchPickSlugs } from '@/lib/strapi'
import { formatTournament } from '@/lib/format'
import { formatInTimeZone } from 'date-fns-tz'
import type { MatchPick } from '@/lib/strapi'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const TZ = 'America/Sao_Paulo'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await fetchMatchPickSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const pick = await fetchMatchPickBySlug(slug)

  if (!pick) return { title: 'Partida não encontrada | Portal do Apostador' }

  const matchup = `${pick.home_team} x ${pick.away_team}`
  const tournament = formatTournament(pick.tournament)
  const date = formatInTimeZone(new Date(pick.match_date), TZ, 'dd/MM/yyyy')
  const title = `${matchup} | Palpite e Análise | Portal do Apostador`
  const description = `Palpite e análise quantitativa de ${matchup} pelo ${tournament} em ${date}. Probabilidades do modelo, edge e escolhas de valor para esta partida.`
  const url = `${SITE_URL}/partidas/${slug}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: pick.match_date,
      url,
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function PartidaPage({ params }: Props) {
  const { slug } = await params
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(trpc.matchPicks.getBySlug.queryOptions({ slug }))

  const pick = queryClient.getQueryData(
    trpc.matchPicks.getBySlug.queryOptions({ slug }).queryKey,
  ) as MatchPick | null

  if (!pick) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${pick.home_team} x ${pick.away_team}`,
    startDate: pick.match_date,
    sport: 'Futebol',
    url: `${SITE_URL}/partidas/${slug}`,
    description: `${pick.home_team} x ${pick.away_team} — ${formatTournament(pick.tournament)}`,
    homeTeam: { '@type': 'SportsTeam', name: pick.home_team },
    awayTeam: { '@type': 'SportsTeam', name: pick.away_team },
    organizer: { '@type': 'Organization', name: formatTournament(pick.tournament) },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MatchDetail slug={slug} />
      </HydrationBoundary>
    </>
  )
}
