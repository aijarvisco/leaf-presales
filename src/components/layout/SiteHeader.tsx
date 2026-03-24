'use client'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function SiteHeader() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header className="flex items-center justify-between px-8 md:px-16 h-14 bg-[#0A0A0A]/80 backdrop-blur-md border-b border-white/10">
      <Image
        src="/nissan-lettering.svg"
        alt="Nissan"
        width={120}
        height={17}
        style={{ filter: 'brightness(0) invert(1)' }}
        priority
      />
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          className="text-xs px-5 py-2"
          onClick={() => scrollTo('contacto')}
        >
          Ser Contactado
        </Button>
        <Button
          variant="primary"
          className="text-xs px-5 py-2"
          onClick={() => scrollTo('reservar')}
        >
          Reservar
        </Button>
      </div>
    </header>
  )
}
