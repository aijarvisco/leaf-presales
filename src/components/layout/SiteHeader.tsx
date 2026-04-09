'use client'
import Image from 'next/image'

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function SiteHeader() {
  return (
    <div className="absolute left-0 right-0 top-6 z-50 pointer-events-none">
      <header
        className="mx-auto flex items-center justify-between pointer-events-auto px-6"
        style={{
          width: '100%',
          height: '64px',
          background: 'transparent',
        }}
      >
        <Image
          src="/nissan-lettering.svg"
          alt="Nissan"
          width={180}
          height={26}
          style={{ height: 'auto', filter: 'brightness(0) invert(1)' }}
          priority
        />
      </header>
    </div>
  )
}
