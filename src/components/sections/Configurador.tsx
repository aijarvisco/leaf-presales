'use client'
import { useState, useEffect, useRef } from 'react'
import ImagePanel from '@/components/configurator/ImagePanel'
import OptionsPanel from '@/components/configurator/OptionsPanel'
import ReservationDrawer from '@/components/ui/ReservationDrawer'
import { TRIM_LEVELS, COLOR_OPTIONS, getEffectivePrice } from '@/components/configurator/configuradorData'

export default function Configurador() {
  const [selectedTrimId, setSelectedTrimId] = useState<'engage' | 'advance' | 'evolve'>('engage')
  const [selectedBatteryKwh, setSelectedBatteryKwh] = useState<52 | 75>(52)
  const [selectedColorId, setSelectedColorId] = useState('PEARL_WHITE')
  const [imageView, setImageView] = useState<'exterior' | 'interior' | '360'>('exterior')
  const [slideIndex, setSlideIndex] = useState(0)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const sectionRef  = useRef<HTMLElement>(null)
  const clipRef     = useRef<HTMLDivElement>(null)
  const contentRef  = useRef<HTMLDivElement>(null)
  const overflowRef = useRef(0)

  function handleTrimSelect(id: string) {
    const newTrim = TRIM_LEVELS.find(t => t.id === id)
    if (!newTrim) return
    setSelectedTrimId(id as 'engage' | 'advance' | 'evolve')
    // 52 kWh is disabled for Advance and Evolve — auto-switch to 75
    const batteryAvailable = newTrim.batteryOptions.find(b => b.kWh === selectedBatteryKwh && !b.disabled)
    if (!batteryAvailable) setSelectedBatteryKwh(75)
    setSelectedColorId(newTrim.availableColorIds[0])
  }

  function handleColorSelect(id: string) {
    if (imageView === '360') setImageView('exterior')
    setSelectedColorId(id)
  }

  function handleBatterySelect(kWh: 52 | 75) {
    setSelectedBatteryKwh(kWh)
  }

  const activeTrim   = TRIM_LEVELS.find(t => t.id === selectedTrimId) ?? TRIM_LEVELS[0]
  const activeColor  = COLOR_OPTIONS.find(c => c.id === selectedColorId) ?? COLOR_OPTIONS[0]
  const effectivePrice = getEffectivePrice(activeTrim, selectedBatteryKwh) + 750

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
        section!.style.height = ''
        content!.style.transform = ''
        overflowRef.current = 0
        return
      }
      const overflow = Math.max(0, content!.scrollHeight - clip!.clientHeight)
      overflowRef.current = overflow
      section!.style.height = `calc(100vh + ${overflow}px)`
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
    window.dispatchEvent(new CustomEvent(
      isDrawerOpen ? 'reservationdrawer:open' : 'reservationdrawer:close'
    ))
  }, [isDrawerOpen])

  // Open drawer when BottomCTABar fires ctabar:reserve
  useEffect(() => {
    const onReserve = () => setIsDrawerOpen(true)
    window.addEventListener('ctabar:reserve', onReserve)
    return () => window.removeEventListener('ctabar:reserve', onReserve)
  }, [])

  return (
    <section ref={sectionRef} id="configurador" className="relative bg-white">

      <div className="overflow-hidden flex flex-col md:flex-row md:sticky md:top-0 md:h-screen">

        <div className="w-full md:w-[65%] h-[50vh] md:h-full">
          <ImagePanel
            exteriorImageSrc={activeColor.imageSrc}
            colorPath360={activeColor.path360}
            view={imageView}
            onViewChange={setImageView}
            slideIndex={slideIndex}
            onSlideChange={setSlideIndex}
          />
        </div>

        <div className="w-full md:w-[35%] md:h-full flex flex-col">

          <div ref={clipRef} className="flex-1 overflow-hidden relative">
            <div ref={contentRef} className="md:absolute md:top-0 md:left-0 md:right-0 md:will-change-transform">
              <OptionsPanel
                selectedTrimId={selectedTrimId}
                selectedColorId={selectedColorId}
                selectedBatteryKwh={selectedBatteryKwh}
                onSelectTrim={handleTrimSelect}
                onSelectColor={handleColorSelect}
                onSelectBattery={handleBatterySelect}
              />
            </div>
          </div>

          <div className="border-t border-gray-100 bg-white px-8 py-5">
            {/* Desktop */}
            <div className="hidden md:flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-[#86868b]">Nissan Leaf {activeTrim.name}</span>
                <span className="text-xl font-semibold text-[#0A0A0A]">
                  €{effectivePrice.toLocaleString('pt-PT')}
                </span>
              </div>
              <button
                onClick={handleReserve}
                className="bg-[#0A0A0A] text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Tenho Interesse
              </button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-[#0A0A0A]">{activeTrim.name}</span>
                <span className="text-base text-[#86868b]">€{effectivePrice.toLocaleString('pt-PT')}</span>
              </div>
              <button
                onClick={handleReserve}
                className="w-full bg-[#0A0A0A] text-white font-semibold text-sm py-3 rounded-full hover:bg-[#0A0A0A]/80 transition-colors cursor-pointer"
              >
                Tenho Interesse
              </button>
            </div>
          </div>

        </div>
      </div>

      <ReservationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        versionId={activeTrim.id}
        versionName={activeTrim.name}
        colorName={activeColor.name}
        colorHex={activeColor.hex}
        colorImageSrc={activeColor.imageSrc}
        price={effectivePrice}
      />
    </section>
  )
}
