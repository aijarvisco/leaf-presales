'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, type Transition } from 'framer-motion'
import { INTERIOR_IMAGES } from './configuradorData'
import Canvas360Viewer from '@/components/configurator/Canvas360Viewer'

type ImageView = 'exterior' | 'interior' | '360'

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
  const [glassVisible, setGlassVisible] = useState(false)
  const prevSrcRef = useRef(exteriorImageSrc)

  useEffect(() => {
    if (exteriorImageSrc !== prevSrcRef.current) {
      prevSrcRef.current = exteriorImageSrc
      setGlassVisible(true)
    }
  }, [exteriorImageSrc])

  useEffect(() => {
    if (view === 'interior') setDirection(0)
  }, [view])

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

      {/* Exterior image */}
      {view === 'exterior' && (
        <div className="absolute inset-0">
          <Image
            src={exteriorImageSrc}
            alt="Nissan Leaf — cor exterior"
            fill
            className="object-cover"
            priority
            onLoad={() => setGlassVisible(false)}
          />
        </div>
      )}

      {/* Glass overlay — appears on color change, fades out once image loads */}
      <AnimatePresence>
        {view === 'exterior' && glassVisible && (
          <motion.div
            className="absolute inset-0 z-10 backdrop-blur-md bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {/* Shimmer sweep */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
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
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-[6px] z-10">
            {INTERIOR_IMAGES.map((_, i) => (
              <button
                key={INTERIOR_IMAGES[i]}
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

      {/* Bottom controls — hidden in 360 view */}
      {view !== '360' && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={() => onViewChange('360')}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-black/40 backdrop-blur-sm text-white text-base font-medium hover:bg-black/60 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="6.5" stroke="white" strokeWidth="1.25"/>
              <ellipse cx="8" cy="8" rx="3" ry="6.5" stroke="white" strokeWidth="1.25"/>
              <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="white" strokeWidth="1.25"/>
            </svg>
            Vista 360
          </button>
        </div>
      )}

      {/* 360 view */}
      <AnimatePresence>
        {view === '360' && (
          <motion.div
            key="360-view"
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Canvas360Viewer />

            {/* Drag hint — auto-fades after 2s, pointer-events-none so it doesn't block dragging */}
            <motion.p
              className="pointer-events-none absolute bottom-20 left-1/2 -translate-x-1/2 text-sm font-medium text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] whitespace-nowrap z-20"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 2, duration: 0.6 }}
            >
              ← Drag to explore →
            </motion.p>

            {/* Close button */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
              <button
                onClick={() => onViewChange('exterior')}
                className="px-6 py-3 rounded-full bg-[#0A0A0A] text-white text-base font-semibold hover:bg-[#0A0A0A]/80 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
