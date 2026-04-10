'use client'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ArrowRight } from 'lucide-react'

const HEADER_BOTTOM = 90

export default function BottomCTABar() {
  const [pastHeader, setPastHeader] = useState(false)
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const barRef = useRef<HTMLDivElement>(null)

  const hidden = !pastHeader || configuradorVisible || closingVisible || drawerOpen

  useEffect(() => {
    if (hidden) setIsExpanded(false)
  }, [hidden])

  useEffect(() => {
    const onScroll = () => setPastHeader(window.scrollY > HEADER_BOTTOM)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
    setIsExpanded(false)
  }

  function scrollToContacto() {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
    setIsExpanded(false)
  }

  return (
    <div
      ref={barRef}
      className={`fixed left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-30 md:max-w-[calc(100vw-2rem)] transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${hidden ? 'translate-y-[calc(100%+2rem)] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}
      style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className={`bg-[#3A3A3C]/95 backdrop-blur-md shadow-2xl overflow-hidden transition-[border-radius] duration-300 ease-out ${isExpanded ? 'rounded-2xl' : 'rounded-full'}`}>

        {/* ── MENU PANEL (renders above main row) ───────────────────── */}
        <div
          id="tenho-interesse-menu"
          data-testid="menu-panel"
          aria-hidden={isExpanded ? undefined : 'true'}
          style={{ display: 'grid', gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
          className="transition-[grid-template-rows] duration-300 ease-out"
        >
          <div className="overflow-hidden">
            <div className={`px-2 pt-3 pb-3 flex flex-col min-w-[240px] transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>
              <button
                type="button"
                onClick={scrollToContacto}
                tabIndex={isExpanded ? undefined : -1}
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl flex items-center justify-between hover:bg-white/[0.08] transition-colors cursor-pointer group"
              >
                <span>Quero ser contactado</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
              <button
                type="button"
                onClick={openReservation}
                tabIndex={isExpanded ? undefined : -1}
                className="w-full text-white font-semibold text-base px-5 py-3 rounded-xl flex items-center justify-between hover:bg-white/[0.08] transition-colors cursor-pointer group"
              >
                <span>Quero reservar</span>
                <ArrowRight
                  size={16}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN ROW (always visible) ──────────────────────────────── */}
        <div
          data-testid="main-row"
          className="flex items-center justify-between pl-7 pr-2.5 py-2.5"
        >
          <div className="hidden md:flex items-baseline gap-3">
            <span className="text-white font-semibold text-base whitespace-nowrap">Nissan Leaf</span>
            <span className="text-white/50 text-sm whitespace-nowrap">Desde 39.900€</span>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            tabIndex={hidden ? -1 : undefined}
            aria-expanded={isExpanded}
            aria-controls="tenho-interesse-menu"
            className="bg-white text-[#0A0A0A] font-semibold text-base px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ml-auto"
          >
            Tenho Interesse
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
              aria-hidden="true"
            />
          </button>
        </div>

      </div>
    </div>
  )
}
