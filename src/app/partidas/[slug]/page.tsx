import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import MatchDetail from '@/components/match-detail'
import { fetchMatchPickBySlug, fetchMatchPickSlugs } from '@/lib/strapi'
import { formatTournament } from '@/lib/format'
import { formatInTimeZone } from 'date-fns-tz'
import { ptBR } from 'date-fns/locale'
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

  if (!pick) return { title: 'Partida não encontrada' }

  const matchup = `${pick.home_team} x ${pick.away_team}`
  const tournament = formatTournament(pick.tournament)
  const date = formatInTimeZone(new Date(pick.match_date), TZ, 'dd/MM/yyyy')
  const dateExtended = formatInTimeZone(new Date(pick.match_date), TZ, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const title = `Palpite ${matchup} — Prognóstico ${tournament} ${date}`
  const description = `Palpite e prognóstico para ${matchup} em ${dateExtended} pelo ${tournament}. Análise com modelo estatístico: probabilidades, odds com valor, edge e dicas para apostas em gols, escanteios, cartões e mais mercados.`
  const url = `${SITE_URL}/partidas/${slug}`

  return {
    title,
    description,
    keywords: [
      `palpite ${pick.home_team} x ${pick.away_team}`,
      `prognóstico ${pick.home_team} ${pick.away_team}`,
      `dicas apostas ${matchup}`,
      `${pick.home_team} x ${pick.away_team} ${tournament}`,
      `palpite ${tournament}`,
      'apostas futebol',
      'apostas de valor',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: pick.match_date,
      url,
    },
    twitter: {
      card: 'summary_large_image',
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

  const matchup = `${pick.home_team} x ${pick.away_team}`
  const tournament = formatTournament(pick.tournament)
  const pageUrl = `${SITE_URL}/partidas/${slug}`

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'SportsEvent',
      name: matchup,
      startDate: pick.match_date,
      sport: 'Futebol',
      url: pageUrl,
      description: `Palpite e prognóstico para ${matchup} pelo ${tournament}. Análise quantitativa com probabilidades e mercados de valor.`,
      homeTeam: { '@type': 'SportsTeam', name: pick.home_team },
      awayTeam: { '@type': 'SportsTeam', name: pick.away_team },
      organizer: { '@type': 'SportsOrganization', name: tournament },
      location: { '@type': 'Place', name: tournament },
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Portal do Apostador', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Calendário', item: `${SITE_URL}/calendario` },
        { '@type': 'ListItem', position: 3, name: matchup, item: pageUrl },
      ],
    },
  ]

  const dateForH1 = formatInTimeZone(new Date(pick.match_date), TZ, "dd/MM/yyyy")

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">
        {`Palpite ${matchup} — Prognóstico e análise para ${tournament} ${dateForH1}`}
      </h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MatchDetail slug={slug} />
      </HydrationBoundary>
    </>
  )
}
