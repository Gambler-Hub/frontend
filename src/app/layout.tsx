// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { TRPCReactProvider } from '@/lib/trpc/client'
import { ClarityScript } from '@/components/clarity'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Portal do Apostador — Palpites e Análises de Apostas Esportivas',
    template: '%s | Portal do Apostador',
  },
  description:
    'Palpites, prognósticos e análises quantitativas para apostas em futebol. Modelo estatístico com probabilidades, edge e valor em mercados de gols, escanteios, cartões e mais.',
  keywords: [
    'palpites de apostas',
    'prognósticos futebol',
    'dicas de apostas',
    'apostas esportivas',
    'value betting',
    'análise quantitativa futebol',
    'palpites futebol hoje',
    'tips apostas',
  ],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Portal do Apostador',
    url: SITE_URL,
  },
  twitter: {
    card: 'summary_large_image',
  },
  alternates: {
    canonical: SITE_URL,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${spaceGrotesk.variable} ${inter.variable}`}
    >
      <body className="min-h-screen bg-background text-on-surface font-body antialiased">
        <ClarityScript />
        <TRPCReactProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </TRPCReactProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
