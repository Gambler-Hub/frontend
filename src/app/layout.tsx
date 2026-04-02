// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
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

export const metadata: Metadata = {
  title: 'Portal do Apostador',
  description: 'Análise preditiva de apostas esportivas baseada em dados',
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
      </body>
    </html>
  )
}
