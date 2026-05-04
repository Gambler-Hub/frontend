import type { MetadataRoute } from 'next'
import { parseISO } from 'date-fns'

export const revalidate = 86400 // 24 hours in seconds

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const STRAPI_URL = process.env.STRAPI_URL ?? 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN ?? ''

async function fetchAllMatchPickSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const PAGE_SIZE = 100
  const results: { slug: string; updatedAt: string }[] = []
  let page = 1
  let totalPages = 1

  do {
    const params = new URLSearchParams({
      'fields[0]': 'slug',
      'fields[1]': 'updatedAt',
      'filters[publishedAt][$notNull]': 'true',
      'pagination[pageSize]': String(PAGE_SIZE),
      'pagination[page]': String(page),
      'sort[0]': 'match_date:desc',
    })

    const res = await fetch(`${STRAPI_URL}/api/match-picks?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      }
    })

    if (!res.ok) break

    const json = await res.json()
    totalPages = json.meta?.pagination?.pageCount ?? 1

    for (const item of json.data ?? []) {
      results.push({ slug: item.slug, updatedAt: item.updatedAt })
    }

    page++
  } while (page <= totalPages)

  return results
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
