'use client'
import { useState, useEffect, useRef } from 'react'
import ImagePanel from '@/components/configurator/ImagePanel'
import OptionsPanel from '@/components/configurator/OptionsPanel'
import ReservationDrawer from '@/components/ui/ReservationDrawer'
import { VERSIONS, EXTERIOR_COLORS } from '@/components/configurator/configuradorData'

export default function Configurador() {
  const [selectedVersionId, setSelectedVersionId] = useState('visia')
  const [selectedColorId, setSelectedColorId] = useState('TURQUOISE')
  const [imageView, setImageView] = useState<'exterior' | 'interior' | '360'>('exterior')
  const [slideIndex, setSlideIndex] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Scroll-pin refs — all mutations go straight to the DOM, no re-renders needed
  const sectionRef  = useRef<HTMLElement>(null)
  const clipRef     = useRef<HTMLDivElement>(null)  // flex-1 clip area
  const contentRef  = useRef<HTMLDivElement>(null)  // absolute inner content
  const overflowRef = useRef(0)                     // cached overflow height
  const drawerEventMounted = useRef(false)

  function handleVersionSelect(id: string) {
    setSelectedVersionId(id)
  }

  function handleColorSelect(id: string) {
    if (imageView === '360') setImageView('exterior')
    setSelectedColorId(id)
  }

  const activeVersion = VERSIONS.find(v => v.id === selectedVersionId) ?? VERSIONS[0]
  const activeColor   = EXTERIOR_COLORS.find(c => c.id === selectedColorId) ?? EXTERIOR_COLORS[0]

  function handleReserve() {
    setIsDrawerOpen(true)
  }

  useEffect(() => {
    const section = sectionRef.current
    const clip    = clipRef.current
    const content = contentRef.current
    if (!section || !clip || !content) return

    function measure() {
      if (window.innerWidth < 768) {
        // Mobile: reset to natural layout
        section!.style.height = ''
        content!.style.transform = ''
        overflowRef.current = 0
        return
      }
      const overflow = Math.max(0, content!.scrollHeight - clip!.clientHeight)
      overflowRef.current = overflow
      section!.style.height = `calc(100vh + ${overflow}px)`
      // Re-sync scroll position after resize
      onScroll()
    }

    function onScroll() {
      if (window.innerWidth < 768) return
      const scrolledIn = Math.max(0, -section!.getBoundingClientRect().top)
      const clamped    = Math.min(scrolledIn, overflowRef.current)
      content!.style.transform = `translateY(-${clamped}px)`
    }

    const ro = new ResizeObserver(measure)
    ro.observe(content)
    measure()

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    if (!drawerEventMounted.current) {
      drawerEventMounted.current = true
      return
    }
    window.dispatchEvent(new CustomEvent(
      isDrawerOpen ? 'reservationdrawer:open' : 'reservationdrawer:close'
    ))
  }, [isDrawerOpen])

  return (
    <section ref={sectionRef} id="configurador" className="relative bg-white">

      {/* Viewport frame: sticky on desktop, natural flow on mobile */}
      <div className="overflow-hidden flex flex-col md:flex-row md:sticky md:top-0 md:h-screen">

        {/* Left — image panel */}
        <div className="w-full md:w-[65%] h-[50vh] md:h-full">
          <ImagePanel
            exteriorImageSrc={activeColor.imageSrc}
            view={imageView}
            onViewChange={setImageView}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        </div>

        {/* Right — clip area + CTA */}
        <div className="w-full md:w-[35%] md:h-full flex flex-col">

          {/* Clip window: on desktop, content scrolls here via JS translateY */}
          <div ref={clipRef} className="flex-1 overflow-hidden relative">
            <div ref={contentRef} className="md:absolute md:top-0 md:left-0 md:right-0 md:will-change-transform">
              <OptionsPanel
                selectedVersionId={selectedVersionId}
                selectedColorId={selectedColorId}
                onSelectVersion={handleVersionSelect}
                onSelectColor={handleColorSelect}
              />
            </div>
          </div>

          {/* CTA bar — always pinned at the bottom of the right column */}
          <div className="border-t border-gray-100 bg-white px-8 py-5">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-[#86868b]">Nissan Leaf {activeVersion.name}</span>
                <span className="text-lg font-semibold text-[#0A0A0A]">
                  €{activeVersion.price.toLocaleString('pt-PT')}
                </span>
              </div>
              <button
                onClick={handleReserve}
                className="bg-[#0A0A0A] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#0A0A0A]">{activeVersion.name}</span>
                <span className="text-sm text-[#86868b]">€{activeVersion.price.toLocaleString('pt-PT')}</span>
              </div>
              <button
                onClick={handleReserve}
                className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Reservar agora
              </button>
            </div>
          </div>

        </div>
      </div>

      <ReservationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        versionId={activeVersion.id}
        versionName={activeVersion.name}
        colorName={activeColor.name}
        colorHex={activeColor.hex}
        colorImageSrc={activeColor.imageSrc}
        price={activeVersion.price}
      />
    </section>
  )
}
