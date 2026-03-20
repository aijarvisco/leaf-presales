// src/components/sections/ValuesSection.tsx
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import ValuesCard from '@/components/ui/ValuesCard'

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_HEIGHT  = 480
const WIDE_WIDTH   = Math.round(CARD_HEIGHT * 16 / 9)  // 853
const NARROW_WIDTH = Math.round(CARD_HEIGHT * 9 / 16)   // 270
const GAP          = 20
const CONTAINER_MAX = 1024  // max-w-5xl
const CONTAINER_PAD = 24    // px-6

const VALUES = [
  {
    imageSrc: '/images/nissan-leaf-hero.jpg',
    imageAlt: 'Nissan Leaf — garantia de bateria',
    boldText: '8 anos de garantia na bateria.',
    bodyText: 'A tua tranquilidade começa aqui — cobertura total para que te focuses no essencial: conduzir.',
    width: WIDE_WIDTH,
  },
  {
    imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
    imageAlt: 'Nissan Leaf — do quotidiano à escapadela',
    boldText: 'Do quotidiano à escapadela.',
    bodyText: 'Confortável na cidade e capaz na estrada — o Leaf adapta-se à tua vida.',
    width: NARROW_WIDTH,
  },
  {
    imageSrc: '/images/889866a-F275-25TDIEULHD_PZ1D_08_LO.jpg',
    imageAlt: 'Nissan Leaf — carregamento fácil',
    boldText: 'Carrega sem complicações.',
    bodyText: 'Em casa, no trabalho ou na rede pública — a carga encaixa no teu ritmo.',
    width: NARROW_WIDTH,
  },
  {
    imageSrc: '/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png',
    imageAlt: 'Nissan Leaf — sempre ligado via app',
    boldText: 'Sempre ligado, onde estiveres.',
    bodyText: 'Com a app Nissan Connect tens o teu Leaf na palma da mão a qualquer momento.',
    width: NARROW_WIDTH,
  },
]

const springConfig = { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.45 }

// ─── Component ────────────────────────────────────────────────────────────────

export default function ValuesSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isWheeling = useRef(false)
  const isDragging = useRef(false)
  const pointerStartX = useRef(0)
  const xAtDragStart = useRef(0)

  const x = useMotionValue(0)

  // containerLeft: only viewport-dependent value — guarded against SSR
  const containerLeft = viewportWidth > 0
    ? Math.max((viewportWidth - CONTAINER_MAX) / 2, 0) + CONTAINER_PAD
    : 0

  function getOffset(index: number): number {
    if (index === 0) return containerLeft
    if (index === 1) return WIDE_WIDTH * 0.10 - WIDE_WIDTH
    return NARROW_WIDTH * 0.25 - (WIDE_WIDTH + (index - 1) * (NARROW_WIDTH + GAP))
  }

  const targetOffset = getOffset(activeIndex)

  useEffect(() => {
    animate(x, targetOffset, springConfig)
  }, [targetOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setViewportWidth(window.innerWidth)
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleWheel = useCallback((e: WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5 && Math.abs(e.deltaX) < 15) return
    e.preventDefault()
    if (isWheeling.current) return
    isWheeling.current = true

    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta > 20) setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))
    else if (delta < -20) setActiveIndex(i => Math.max(i - 1, 0))

    setTimeout(() => { isWheeling.current = false }, 550)
  }, [])

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    pointerStartX.current = e.clientX
    xAtDragStart.current = x.get()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    x.set(xAtDragStart.current + (e.clientX - pointerStartX.current))
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const delta = e.clientX - pointerStartX.current
    const vel = x.getVelocity()

    if (Math.abs(vel) > 300) {
      if (vel < 0) setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else if (Math.abs(delta) > NARROW_WIDTH / 4) {
      if (delta < 0) setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else {
      animate(x, targetOffset, springConfig)
    }
  }

  return (
    <section id="values" className="pt-48 pb-48 bg-white overflow-hidden">

      {/* Title block */}
      <div className="max-w-5xl mx-auto px-6 mb-20 text-center">
        <p className="font-normal text-[17px] text-[#86868b] mb-2">Values</p>
        <h2
          className="font-medium tracking-[-0.07em] text-[#0A0A0A] leading-tight"
          style={{ fontSize: '56px' }}
        >
          Designed to make a difference.
        </h2>
        <p className="mt-6 text-[17px] text-[#0A0A0A] max-w-2xl mx-auto leading-relaxed">
          <strong className="font-semibold">Our values lead the way.</strong>{' '}
          Apple Vision Pro was designed to help protect your privacy and keep you in control of your data. Its built‑in accessibility features are designed to work the way you do.
        </p>
      </div>

      {/* Carousel track */}
      <div
        ref={carouselRef}
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <motion.div className="flex flex-row items-start" style={{ gap: GAP, x }}>
          {VALUES.map((v) => (
            <div key={v.imageSrc} className="shrink-0">
              <ValuesCard
                imageSrc={v.imageSrc}
                imageAlt={v.imageAlt}
                boldText={v.boldText}
                bodyText={v.bodyText}
                width={v.width}
                height={CARD_HEIGHT}
              />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setActiveIndex(i => Math.max(i - 1, 0))}
          disabled={activeIndex === 0}
          aria-label="Anterior"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-[6px]">
          {VALUES.map((_, i) => (
            <motion.button
              key={i}
              layout
              onClick={() => setActiveIndex(i)}
              className={`h-[6px] rounded-full cursor-pointer transition-colors duration-300 ${
                i === activeIndex ? 'bg-[#0A0A0A] w-5' : 'bg-gray-300 w-[6px]'
              }`}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              aria-label={`Ir para valor ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIndex(i => Math.min(i + 1, VALUES.length - 1))}
          disabled={activeIndex === VALUES.length - 1}
          aria-label="Próximo"
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

    </section>
  )
}
