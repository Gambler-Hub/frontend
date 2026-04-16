import type { MetadataRoute } from 'next'
import { parseISO } from 'date-fns'

export const revalidate = 3600

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

async function fetchAllMatchPickSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const params = new URLSearchParams({
    'fields[0]': 'slug',
    'fields[1]': 'updatedAt',
    'filters[publishedAt][$notNull]': 'true',
    'pagination[pageSize]': '1000',
    'sort[0]': 'match_date:desc',
  })

  const res = await fetch(`${STRAPI_URL}/api/match-picks?${params}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) return []

  const json = await res.json()
  return (json.data ?? []).map((item: { slug: string; updatedAt: string }) => ({
    slug: item.slug,
    updatedAt: item.updatedAt,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const picks = await fetchAllMatchPickSlugs()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/calendario`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const dynamicRoutes: MetadataRoute.Sitemap = picks.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/partidas/${slug}`,
    lastModified: parseISO(updatedAt),
    changeFrequency: 'daily',
    priority: 0.9,
  }))

  return [...staticRoutes, ...dynamicRoutes]
}
