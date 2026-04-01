// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
      className={cn("dark", spaceGrotesk.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-background text-on-surface font-body antialiased">
        {children}
      </body>
    </html>
  )
}
