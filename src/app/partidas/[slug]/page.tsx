import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { trpc, getQueryClient } from '@/lib/trpc/server'
import MatchDetail from '@/components/match-detail'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Análise da Partida | Portal do Apostador`,
    description: `Análise quantitativa e mercados recomendados para ${slug.replace(/-/g, ' ')}.`,
  }
}

export default async function PartidaPage({ params }: Props) {
  const { slug } = await params
  const queryClient = getQueryClient()

  await queryClient.prefetchQuery(trpc.matchPicks.getBySlug.queryOptions({ slug }))

  // If not found, 404
  const pick = queryClient.getQueryData(
    trpc.matchPicks.getBySlug.queryOptions({ slug }).queryKey,
  )
  if (!pick) notFound()

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MatchDetail slug={slug} />
    </HydrationBoundary>
  )
}
