'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import HighlightCard from '@/components/ui/HighlightCard'

const HIGHLIGHTS = [
  {
    imageSrc: '/images/nissan-leaf-lights.jpg',
    imageAlt: 'Nissan Leaf glass display',
    description: "A glass display that's 2x more scratch resistant than Series 10.",
    textPosition: 'bottom' as const,
  },
  {
    imageSrc: '/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png',
    imageAlt: 'Interior tecnológico do Nissan Leaf',
    description: 'Cockpit digital, conectividade total e sistemas de assistência à condução.',
    textPosition: 'bottom' as const,
  },
  {
    imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
    imageAlt: 'Autonomia do Nissan Leaf',
    description: 'Autonomia real para o teu dia a dia, com carregamento rápido onde precisas.',
    textPosition: 'bottom' as const,
  },
  {
    imageSrc: '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
    imageAlt: 'Nissan Leaf 100% elétrico',
    description: '100% elétrico. Contribui para um futuro mais limpo a cada quilómetro.',
    textPosition: 'bottom' as const,
  },
]

const GAP = 20
const CONTAINER_MAX = 1024 // max-w-5xl
const CONTAINER_PAD = 24  // px-6

const springConfig = { type: 'spring' as const, stiffness: 320, damping: 32, mass: 0.45 }

export default function Highlights() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isWheeling = useRef(false)
  const isDragging = useRef(false)
  const pointerStartX = useRef(0)
  const xAtDragStart = useRef(0)

  const x = useMotionValue(0)

  // containerLeft matches the title's max-w-5xl px-6 alignment
  const containerLeft = viewportWidth > 0 ? Math.max((viewportWidth - CONTAINER_MAX) / 2, 0) + CONTAINER_PAD : 0

  // Card width: at index 0, first card starts at containerLeft and fills the rest with 50% of next card peeking
  // containerLeft + cardWidth + GAP + 0.5 * cardWidth = viewportWidth  →  cardWidth = (viewportWidth - containerLeft - GAP) / 1.5
  const cardWidth = viewportWidth > 0 ? Math.round((viewportWidth - containerLeft - GAP) / 1.5) : 0

  // Index 0: aligned with container. Index > 0: 25% of prev card peeks from viewport left edge.
  const getOffset = (index: number) => {
    if (index === 0) return containerLeft
    return 0.25 * cardWidth + GAP - index * (cardWidth + GAP)
  }
  const targetOffset = getOffset(activeIndex)

  // Animate to target whenever activeIndex or layout changes
  useEffect(() => {
    if (!cardWidth) return
    animate(x, targetOffset, springConfig)
  }, [targetOffset]) // eslint-disable-line react-hooks/exhaustive-deps

  useLayoutEffect(() => {
    const vw = window.innerWidth
    setViewportWidth(vw)
    const cl = Math.max((vw - CONTAINER_MAX) / 2, 0) + CONTAINER_PAD
    x.set(cl)
    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWheel = useCallback((e: WheelEvent) => {
    if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 0.5 && Math.abs(e.deltaX) < 15) return
    e.preventDefault()
    if (isWheeling.current) return
    isWheeling.current = true

    const delta = Math.abs(e.deltaX) >= Math.abs(e.deltaY) ? e.deltaX : e.deltaY
    if (delta > 20) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
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
    const delta = e.clientX - pointerStartX.current
    x.set(xAtDragStart.current + delta)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    isDragging.current = false
    const delta = e.clientX - pointerStartX.current
    const vel = x.getVelocity()

    if (Math.abs(vel) > 300) {
      if (vel < 0) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else if (Math.abs(delta) > cardWidth / 4) {
      if (delta < 0) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else {
      animate(x, targetOffset, springConfig)
    }
  }

  return (
    <section id="highlights" className="pt-48 pb-48 bg-white overflow-hidden">
      {/* Title */}
      <div className="max-w-5xl mx-auto px-6 mb-20">
        <motion.h2
          className="leading-none font-medium text-[#0A0A0A] tracking-[-0.07em]"
          style={{ fontSize: 'var(--text-h2)' }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          Desenhado para surpreender.
        </motion.h2>
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
        <motion.div
          className="flex flex-row"
          style={{ gap: GAP, x }}
        >
          {HIGHLIGHTS.map((h, i) => (
            <div
              key={h.imageSrc}
              className="shrink-0"
              style={{ width: cardWidth || undefined }}
            >
              <HighlightCard {...h} />
            </div>
          ))}
        </motion.div>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setActiveIndex(i => Math.max(i - 1, 0))}
          disabled={activeIndex === 0}
          suppressHydrationWarning
          aria-label="Anterior"
          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="flex items-center gap-[6px]">
          {HIGHLIGHTS.map((_, i) => (
            <motion.button
              key={i}
              layout
              onClick={() => setActiveIndex(i)}
              className={`h-[6px] rounded-full cursor-pointer transition-colors duration-300 ${
                i === activeIndex ? 'bg-[#0A0A0A] w-5' : 'bg-gray-300 w-[6px]'
              }`}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              aria-label={`Ir para destaque ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))}
          disabled={activeIndex === HIGHLIGHTS.length - 1}
          suppressHydrationWarning
          aria-label="Próximo"
          className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-30 flex items-center justify-center transition-colors duration-200 cursor-pointer disabled:cursor-default"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2L10 7L5 12" stroke="#0A0A0A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </section>
  )
}
