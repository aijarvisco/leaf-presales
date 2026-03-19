import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt">
      <body className={GeistSans.className}>
        <Navbar />
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
