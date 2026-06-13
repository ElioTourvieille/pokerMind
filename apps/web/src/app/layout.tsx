import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from './nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PokerMind',
  description: 'Your intelligent poker coach',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
