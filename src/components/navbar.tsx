'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Calendário', href: '/calendario' },
  { label: 'AI Insights', href: '#', disabled: true },
  { label: 'Odds', href: '#', disabled: true },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant/10">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-headline font-bold text-xl text-primary uppercase tracking-tighter">
          Portal do Apostador
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, href, disabled }) => {
            const isActive = href !== '#' && (href === '/' ? pathname === '/' : pathname.startsWith(href))
            return (
              <li key={href + label}>
                {disabled ? (
                  <span className="text-on-surface-variant/40 text-sm font-headline uppercase tracking-tight cursor-not-allowed">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className={`text-sm font-headline uppercase tracking-tight transition-colors duration-200 ${
                      isActive
                        ? 'text-primary border-b-2 border-primary pb-0.5'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {label}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
