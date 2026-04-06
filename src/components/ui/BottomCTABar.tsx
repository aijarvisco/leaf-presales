'use client'
import { useState, useEffect } from 'react'

const HEADER_BOTTOM = 90 // top-6 (24px) + header height (64px) + small buffer

export default function BottomCTABar() {
  const [pastHeader, setPastHeader] = useState(false)
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const hidden = !pastHeader || configuradorVisible || closingVisible || drawerOpen

  // Show after scrolling past the header
  useEffect(() => {
    const onScroll = () => setPastHeader(window.scrollY > HEADER_BOTTOM)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for #configurador and #closing
  useEffect(() => {
    const configurador = document.getElementById('configurador')
    const closing = document.getElementById('closing')

    const observers: IntersectionObserver[] = []

    if (configurador) {
      const obs = new IntersectionObserver(([entry]) => {
        setConfiguradorVisible(entry.isIntersecting)
      }, { threshold: 0 })
      obs.observe(configurador)
      observers.push(obs)
    }

    if (closing) {
      const obs = new IntersectionObserver(([entry]) => {
        setClosingVisible(entry.isIntersecting)
      }, { threshold: 0 })
      obs.observe(closing)
      observers.push(obs)
    }

    return () => observers.forEach(o => o.disconnect())
  }, [])

  // ReservationDrawer custom events
  useEffect(() => {
    const onOpen = () => setDrawerOpen(true)
    const onClose = () => setDrawerOpen(false)
    window.addEventListener('reservationdrawer:open', onOpen)
    window.addEventListener('reservationdrawer:close', onClose)
    return () => {
      window.removeEventListener('reservationdrawer:open', onOpen)
      window.removeEventListener('reservationdrawer:close', onClose)
    }
  }, [])

  function scrollToConfigurador() {
    document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className="flex items-center gap-4 md:gap-24 bg-[#3A3A3C]/95 backdrop-blur-md rounded-full pl-7 pr-2.5 py-2.5 shadow-2xl">
        <div className="flex items-baseline gap-3">
          <span className="text-white font-semibold text-base whitespace-nowrap">Nissan Leaf</span>
          <span className="text-white/50 text-sm whitespace-nowrap">Desde 29.900€</span>
        </div>
        <button
          onClick={scrollToConfigurador}
          tabIndex={hidden ? -1 : undefined}
          aria-label="Ir para o configurador"
          className="bg-[#E8372F] text-white font-semibold text-base px-6 py-2.5 rounded-full hover:bg-[#D42F27] transition-colors cursor-pointer whitespace-nowrap"
        >
          Configurar
        </button>
      </div>
    </div>
  )
}
