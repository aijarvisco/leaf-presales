'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-16 px-8 md:px-16 flex items-center justify-between transition-colors duration-300 motion-reduce:transition-none ${
        scrolled ? 'bg-black' : 'bg-transparent'
      }`}
    >
      <Image
        src="/nissan-lettering.svg"
        alt="Nissan"
        width={100}
        height={14}
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
  )
}
