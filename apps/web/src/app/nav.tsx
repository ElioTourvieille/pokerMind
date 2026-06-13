'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/hands', label: 'Mains' },
  { href: '/review', label: 'Review' },
  { href: '/concepts', label: 'Concepts' },
  { href: '/preflop', label: 'Préflop' },
  { href: '/progression', label: 'Progression' },
]

export default function Nav() {
  const path = usePathname()
  const isApp = LINKS.some((l) => path.startsWith(l.href))
  if (!isApp) return null

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-14">
        <Link href="/" className="font-bold text-lg">
          Poker<span className="text-primary">Mind</span>
        </Link>
        <nav className="flex items-center gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                path.startsWith(l.href)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
