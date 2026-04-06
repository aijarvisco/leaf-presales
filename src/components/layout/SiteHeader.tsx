'use client'
import Image from 'next/image'

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

export default function SiteHeader() {
  return (
    <div className="absolute left-0 right-0 top-6 z-50 pointer-events-none">
      <header
        className="mx-auto flex items-center justify-between pointer-events-auto px-6 md:px-10 lg:px-16"
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
        <div className="flex items-center gap-4">
          <button
            className="text-white text-sm font-normal cursor-pointer"
            onClick={() => scrollTo('contacto')}
          >
            Ser Contactado
          </button>
          <button
            className="bg-[#E8372F] text-white hover:bg-[#D42F27] px-5 py-2 rounded-lg text-sm font-normal transition-colors duration-200 cursor-pointer"
            onClick={() => scrollTo('reservar')}
          >
            Reservar
          </button>
        </div>
      </header>
    </div>
  )
}
