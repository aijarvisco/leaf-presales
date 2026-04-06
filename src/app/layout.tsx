import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import CookieBanner from '@/components/CookieBanner'

const nissanBrand = localFont({
  src: [
    { path: '../../public/fonts/Nissan Brand Light.otf', weight: '300', style: 'normal' },
    { path: '../../public/fonts/Nissan Brand Regular.otf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/Nissan Brand Bold.otf', weight: '700', style: 'normal' },
  ],
  variable: '--font-nissan',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Nissan Leaf — Reserve o seu',
  description: 'Reserve o novo Nissan Leaf. 100% elétrico. Design que impressiona.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className={nissanBrand.variable}>
      <body className={nissanBrand.className}>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
