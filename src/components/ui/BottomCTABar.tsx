'use client'
import { useState, useEffect, useRef } from 'react'

const HEADER_BOTTOM = 90

export default function BottomCTABar() {
  const [pastHeader, setPastHeader] = useState(false)
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const hidden = !pastHeader || configuradorVisible || closingVisible || drawerOpen

  // Collapse when bar is hidden
  useEffect(() => {
    if (hidden) setIsExpanded(false)
  }, [hidden])

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

  // Collapse on outside click
  useEffect(() => {
    if (!isExpanded) return
    const onMouseDown = (e: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [isExpanded])

  // Collapse on Escape
  useEffect(() => {
    if (!isExpanded) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsExpanded(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isExpanded])

  function openReservation() {
    window.dispatchEvent(new CustomEvent('ctabar:reserve'))
  }

  function scrollToConfigurador() {
    document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
  }

  function scrollToContacto() {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      ref={barRef}
      className={`fixed left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 md:max-w-[calc(100vw-2rem)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className={`bg-[#3A3A3C]/95 backdrop-blur-md shadow-2xl overflow-hidden transition-[border-radius] duration-300 ease-out ${isExpanded ? 'rounded-2xl' : 'rounded-full'}`}>

        {/* ── COLLAPSED ROW ─────────────────────────────────── */}
        <div
          data-testid="collapsed-row"
          style={{ display: 'grid', gridTemplateRows: isExpanded ? '0fr' : '1fr' }}
          className="transition-[grid-template-rows] duration-300 ease-out"
        >
          <div className="overflow-hidden">
            <div className={`flex items-center gap-4 md:gap-24 pl-7 pr-2.5 py-2.5 transition-opacity duration-200 ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
              <div className="hidden md:flex items-baseline gap-3">
                <span className="text-white font-semibold text-base whitespace-nowrap">Nissan Leaf</span>
                <span className="text-white/50 text-sm whitespace-nowrap">Desde 39.900€</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={openReservation}
                  tabIndex={hidden || isExpanded ? -1 : undefined}
                  aria-label="Reservar agora"
                  className="bg-[#E8372F] text-white font-semibold text-base px-6 py-2.5 rounded-full hover:bg-[#D42F27] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reservar agora
                </button>
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  tabIndex={hidden || isExpanded ? -1 : undefined}
                  aria-expanded={isExpanded}
                  aria-label="Ver mais opções"
                  className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white transition-colors cursor-pointer flex-shrink-0"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 10L8 5L13 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── EXPANDED PANEL ────────────────────────────────── */}
        <div
          data-testid="expanded-panel"
          aria-hidden={isExpanded ? undefined : 'true'}
          style={{ display: 'grid', gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
          className="transition-[grid-template-rows] duration-300 ease-out"
        >
          <div className="overflow-hidden">
            <div className={`px-2 pt-4 pb-2 flex flex-col min-w-[240px] transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <button
                type="button"
                onClick={() => { openReservation(); setIsExpanded(false) }}
                tabIndex={isExpanded ? undefined : -1}
                aria-label="Reservar agora"
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl text-left hover:bg-white/[0.08] transition-colors cursor-pointer whitespace-nowrap"
              >
                Reservar agora
              </button>
              <button
                type="button"
                onClick={() => { scrollToConfigurador(); setIsExpanded(false) }}
                tabIndex={isExpanded ? undefined : -1}
                aria-label="Configurar Leaf"
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl text-left hover:bg-white/[0.08] transition-colors cursor-pointer whitespace-nowrap"
              >
                Configurar Leaf
              </button>
              <button
                type="button"
                onClick={() => { scrollToContacto(); setIsExpanded(false) }}
                tabIndex={isExpanded ? undefined : -1}
                aria-label="Ser Contactado"
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl text-left hover:bg-white/[0.08] transition-colors cursor-pointer whitespace-nowrap"
              >
                Ser Contactado
              </button>
              <div className="flex justify-end pr-0.5 pb-0.5 mt-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  tabIndex={isExpanded ? undefined : -1}
                  aria-expanded={isExpanded}
                  aria-label="Fechar opções"
                  className="bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center text-white transition-colors cursor-pointer"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3 6L8 11L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
