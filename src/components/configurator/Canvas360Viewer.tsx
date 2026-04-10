'use client'
import { useEffect, useRef, useState } from 'react'

interface CursorPos { x: number; y: number }

// --- Constants ---
const SENSITIVITY = 0.2          // frames per pixel dragged
const DAMPING = 0.92             // velocity decay per rAF frame
const VELOCITY_THRESHOLD = 0.005 // px/ms — inertia stops below this
const FRAME_COUNT = 120

const DEFAULT_PATH = '/images/360-exterior/pearl-white/25tdieulhd_pz1d_xkj_h_'

// On mobile or slow connections, load every Nth frame to reduce bandwidth ~50-75%
function getFrameStep(): number {
  if (typeof window === 'undefined') return 1
  if (window.matchMedia('(max-width: 767px)').matches) return 2
  const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection
  const type = conn?.effectiveType
  if (type === 'slow-2g' || type === '2g') return 4
  if (type === '3g') return 2
  return 1
}

// Returns {src, frameIndex} pairs — frameIndex is the actual 0-119 position
function buildFrameSources(pathPrefix: string, step: number) {
  const sources: Array<{ src: string; frameIndex: number }> = []
  for (let i = 0; i < FRAME_COUNT; i += step) {
    sources.push({ src: `${pathPrefix}${String(i).padStart(3, '0')}.webp`, frameIndex: i })
  }
  return sources
}

function wrapFrame(raw: number): number {
  return ((Math.floor(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

interface Canvas360ViewerProps {
  colorPath360?: string
}

export default function Canvas360Viewer({ colorPath360 }: Canvas360ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Sparse array sized FRAME_COUNT; only indices 0, step, 2*step… are filled
  const imagesRef = useRef<Array<HTMLImageElement | null>>([])
  const frameStepRef = useRef(1)
  const frameAccRef = useRef(0)       // floating-point frame accumulator
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)          // px/ms
  const rafId = useRef<number | null>(null)

  const [loading, setLoading] = useState(true)
  const [cursorPos, setCursorPos] = useState<CursorPos>({ x: 0, y: 0 })
  const [cursorVisible, setCursorVisible] = useState(false)

  // Draw the current frame to canvas using object-cover behaviour (no distortion).
  // Snaps to the nearest loaded frame when not all frames are available.
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const step = frameStepRef.current
    const wrapped = wrapFrame(index)
    // Round to nearest multiple of step, wrap back into [0, FRAME_COUNT)
    const snapped = (Math.round(wrapped / step) * step) % FRAME_COUNT
    const img = imagesRef.current[snapped]
    if (!img?.naturalWidth) return  // frame not yet loaded — keep previous canvas content

    const cw = canvas.width
    const ch = canvas.height
    const iw = img.naturalWidth
    const ih = img.naturalHeight
    if (!iw || !ih) return

    const scale = Math.max(cw / iw, ch / ih)
    const sw = iw * scale
    const sh = ih * scale
    const sx = (cw - sw) / 2
    const sy = (ch - sh) / 2

    ctx.clearRect(0, 0, cw, ch)
    ctx.drawImage(img, sx, sy, sw, sh)
  }

  // Preload frames — re-runs when color changes.
  // On mobile/slow connections loads every Nth frame; removes spinner as soon as frame 0 is ready.
  useEffect(() => {
    setLoading(true)
    frameAccRef.current = 0

    const step = getFrameStep()
    frameStepRef.current = step
    imagesRef.current = new Array(FRAME_COUNT).fill(null)

    const sources = buildFrameSources(colorPath360 ?? DEFAULT_PATH, step)

    sources.forEach(({ src, frameIndex }, idx) => {
      const img = new Image()
      if (idx === 0) img.fetchPriority = 'high'  // browser prioritises the first frame
      img.src = src
      img.onload = () => {
        imagesRef.current[frameIndex] = img
        // Allow interaction as soon as frame 0 is ready — don't wait for all frames
        if (frameIndex === 0) {
          drawFrame(0)
          setLoading(false)
        }
      }
    })
  }, [colorPath360])

  // ResizeObserver: keep canvas pixel dims in sync with CSS size
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      canvas.width = width
      canvas.height = height
      drawFrame(wrapFrame(frameAccRef.current))
    })
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Cancel inertia loop on unmount
  useEffect(() => {
    return () => {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const startInertia = (initialVelocity: number) => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    let vel = initialVelocity
    let last = performance.now()

    const step = (now: number) => {
      const elapsed = now - last
      last = now
      vel *= DAMPING
      if (Math.abs(vel) < VELOCITY_THRESHOLD) return
      frameAccRef.current += vel * elapsed
      drawFrame(wrapFrame(frameAccRef.current))
      rafId.current = requestAnimationFrame(step)
    }
    rafId.current = requestAnimationFrame(step)
  }

  const updateCursorPos = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    isDragging.current = true
    lastX.current = e.clientX
    lastTime.current = e.timeStamp
    velocity.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    updateCursorPos(e)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    updateCursorPos(e)
    if (!isDragging.current) return

    const dx = e.clientX - lastX.current
    const dt = e.timeStamp - lastTime.current
    if (dt > 0) velocity.current = dx / dt

    frameAccRef.current += dx * SENSITIVITY
    drawFrame(wrapFrame(frameAccRef.current))

    lastX.current = e.clientX
    lastTime.current = e.timeStamp
  }



  const handlePointerUp = () => {
    if (!isDragging.current) return
    isDragging.current = false
    startInertia(velocity.current)
  }

  return (
    <div
      className="absolute inset-0 w-full h-full select-none"
      style={{ cursor: 'none' }}
    >
      {/* Custom cursor */}
      {cursorVisible && (
        <div
          className="pointer-events-none absolute z-20 flex items-center gap-2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-150"
          style={{ left: cursorPos.x, top: cursorPos.y }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 shadow-md">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 10H17M3 10L7 6M3 10L7 14M17 10L13 6M17 10L13 14" stroke="#111827" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">360°</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={(e) => { handlePointerUp(); setCursorVisible(false) }}
        onPointerEnter={() => setCursorVisible(true)}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}
    </div>
  )
}
