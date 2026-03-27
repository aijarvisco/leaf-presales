'use client'
import { useState, useEffect } from 'react'

export default function BottomCTABar() {
  const [configuradorVisible, setConfiguradorVisible] = useState(false)
  const [closingVisible, setClosingVisible] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const hidden = configuradorVisible || closingVisible || drawerOpen

  // IntersectionObserver for #configurador and #closing
  useEffect(() => {
    const configurador = document.getElementById('configurador')
    const closing = document.getElementById('closing')

    const observers: IntersectionObserver[] = []

    if (configurador) {
      const obs = new IntersectionObserver(([entry]) => {
        setConfiguradorVisible(entry.isIntersecting)
      })
      obs.observe(configurador)
      observers.push(obs)
    }

    if (closing) {
      const obs = new IntersectionObserver(([entry]) => {
        setClosingVisible(entry.isIntersecting)
      })
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
      className={`fixed bottom-0 left-0 right-0 z-30 bg-[#1C1C1E] border-t border-white/10 pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300 ease-in-out motion-reduce:transition-none ${hidden ? 'translate-y-full' : ''}`}
      aria-hidden={hidden ? 'true' : undefined}
    >
      <div className="h-14 flex items-center justify-between px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-white font-semibold text-sm">Nissan Leaf</span>
          <span className="text-white/50 text-sm">/ Entregas previstas em Maio</span>
        </div>
        <button
          onClick={scrollToConfigurador}
          tabIndex={hidden ? -1 : undefined}
          aria-label="Ir para o configurador"
          className="bg-[#E8372F] text-white font-semibold text-sm px-5 py-2 rounded-full hover:bg-[#D42F27] transition-colors cursor-pointer"
        >
          Configurar
        </button>
      </div>
    </div>
  )
}
