// src/components/sections/RoofAnimationSection.tsx
'use client'
import { useRef, useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import Image from 'next/image'

// ─── Constants ────────────────────────────────────────────────────────────────

const FRAME_COUNT = 250
const BATCH_SIZE = 50
const pad = (n: number) => String(n).padStart(5, '0')
const FRAMES = Array.from({ length: FRAME_COUNT }, (_, i) =>
  `/images/roof/25tdieulhd_pz1d_u_roof_h_${pad(i)}.webp`
)

// ─── Pure utilities ───────────────────────────────────────────────────────────

function calcCoverDraw(cw: number, ch: number, iw: number, ih: number) {
  const scale = Math.max(cw / iw, ch / ih)
  const sw = iw * scale
  const sh = ih * scale
  const sx = (cw - sw) / 2
  const sy = (ch - sh) / 2
  return { sx, sy, sw, sh }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RoofAnimationSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<(HTMLImageElement | null)[]>(
    Array(FRAME_COUNT).fill(null)
  )
  const lastDrawnRef = useRef(0)
  const [batchOneReady, setBatchOneReady] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const overlayOpacity = useTransform(scrollYProgress, [0.72, 0.87], [0, 1])

  // ── Draw a frame to canvas ──────────────────────────────────────────────────
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = imagesRef.current[index]
    if (!canvas || !img || !img.complete || !img.naturalWidth) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const { sx, sy, sw, sh } = calcCoverDraw(
      canvas.width,
      canvas.height,
      img.naturalWidth,
      img.naturalHeight
    )
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, sx, sy, sw, sh)
    lastDrawnRef.current = index
  }

  // ── Chunked preloading ──────────────────────────────────────────────────────
  useEffect(() => {
    let active = true

    const loadBatch = (start: number, onDone: () => void) => {
      let loaded = 0
      const end = Math.min(start + BATCH_SIZE, FRAME_COUNT)
      for (let i = start; i < end; i++) {
        const img = new window.Image()
        img.src = FRAMES[i]
        const idx = i
        img.onload = () => {
          imagesRef.current[idx] = img
          loaded++
          if (loaded === end - start && active) onDone()
        }
        img.onerror = () => {
          loaded++
          if (loaded === end - start && active) onDone()
        }
      }
    }

    loadBatch(0, () => {
      if (active) setBatchOneReady(true)
      loadBatch(50, () =>
        loadBatch(100, () =>
          loadBatch(150, () =>
            loadBatch(200, () => {})
          )
        )
      )
    })

    return () => { active = false }
  }, [])

  // ── Keep canvas pixel size in sync with CSS size ────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      canvas.width = width
      canvas.height = height
      drawFrame(lastDrawnRef.current)
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // ── Drive frame from scroll progress ───────────────────────────────────────
  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (progress: number) => {
      const index = Math.round(progress * (FRAME_COUNT - 1))
      drawFrame(index)
    })
    return unsubscribe
  }, [scrollYProgress])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <section
      ref={sectionRef}
      id="roof-animation"
      style={{ height: '400vh' }}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-black">

        {/* Frame 0 static fallback — always mounted, hidden by canvas once ready */}
        <div className="absolute inset-0">
          <Image
            src={FRAMES[0]}
            alt="Nissan LEAF — teto panorâmico"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        {/* Canvas — always in DOM so ResizeObserver attaches immediately */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Spinner — shown until batch 1 is ready */}
        {!batchOneReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}

        {/* Overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: overlayOpacity,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 65%)',
          }}
        >
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-5xl mx-auto px-6 pb-8 sm:pb-12">
              <h2
                className="text-white font-medium tracking-[-0.07em] leading-none mb-3"
                style={{ fontSize: 'var(--text-h2)' }}
              >
                Interior de uma nova era
              </h2>
              <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-sm">
                O Teto panorâmico escurecido oferece uma experiência de habitáculo
                premium com maior altura livre e um isolamento térmico eficiente.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
