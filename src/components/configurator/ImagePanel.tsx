'use client'
import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { INTERIOR_IMAGES } from './configuradorData'

type ImageView = 'exterior' | 'interior'

interface ImagePanelProps {
  exteriorImageSrc: string
  view: ImageView
  onViewChange: (view: ImageView) => void
  slideIndex: number
  onSlideChange: (index: number) => void
}

const SLIDE_ANIM: Transition = { type: 'tween', duration: 0.55, ease: 'easeInOut' }

export default function ImagePanel({
  exteriorImageSrc,
  view,
  onViewChange,
  slideIndex,
  onSlideChange,
}: ImagePanelProps) {
  const [direction, setDirection] = useState(0)

  function goTo(index: number) {
    setDirection(index > slideIndex ? 1 : -1)
    onSlideChange(index)
  }

  function prev() {
    if (slideIndex > 0) goTo(slideIndex - 1)
  }

  function next() {
    if (slideIndex < INTERIOR_IMAGES.length - 1) goTo(slideIndex + 1)
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#0A0A0A]">

      {/* Exterior: crossfade on color change */}
      <AnimatePresence mode="wait">
        {view === 'exterior' && (
          <motion.div
            key={exteriorImageSrc}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={exteriorImageSrc}
              alt="Nissan Leaf — cor exterior"
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interior: horizontal slide */}
      {view === 'interior' && (
        <div className="absolute inset-0 overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={slideIndex}
              custom={direction}
              className="absolute inset-0"
              variants={{
                enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
                center: { x: 0, opacity: 1 },
                exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SLIDE_ANIM}
            >
              <Image
                src={INTERIOR_IMAGES[slideIndex]}
                alt={`Interior — imagem ${slideIndex + 1}`}
                fill
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Prev / Next arrows */}
          <button
            onClick={prev}
            disabled={slideIndex === 0}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={next}
            disabled={slideIndex === INTERIOR_IMAGES.length - 1}
            aria-label="Próximo"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2L10 7L5 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-[6px] z-10">
            {INTERIOR_IMAGES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir para imagem ${i + 1}`}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === slideIndex ? 'bg-white w-5' : 'bg-white/40 w-[6px]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Exterior / Interior toggle pill */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1 bg-black/40 backdrop-blur-sm rounded-full p-1 z-10">
        {(['exterior', 'interior'] as ImageView[]).map((v) => (
          <button
            key={v}
            onClick={() => onViewChange(v)}
            aria-pressed={view === v}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 capitalize ${
              view === v ? 'bg-white text-black' : 'text-white/70 hover:text-white'
            }`}
          >
            {v === 'exterior' ? 'Exterior' : 'Interior'}
          </button>
        ))}
      </div>
    </div>
  )
}
