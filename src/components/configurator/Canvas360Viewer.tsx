'use client'
import { useEffect, useRef, useState } from 'react'

// --- Constants ---
const SENSITIVITY = 0.45         // frames per pixel dragged
const DAMPING = 0.92             // velocity decay per rAF frame
const VELOCITY_THRESHOLD = 0.005 // px/ms — inertia stops below this
// --- Frame URL array ---
const encode = (n: number) => `/images/360/filters-quality-60-${n}.png`
const FRAME_NUMBERS = [
  0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 36, 37, 38, 39,
  40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 72,
]
const FRAME_COUNT = FRAME_NUMBERS.length
const FRAMES: string[] = FRAME_NUMBERS.map(encode)

function wrapFrame(raw: number): number {
  return ((Math.floor(raw) % FRAME_COUNT) + FRAME_COUNT) % FRAME_COUNT
}

interface Canvas360ViewerProps {
  onFirstInteraction?: () => void
}

export default function Canvas360Viewer({ onFirstInteraction }: Canvas360ViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const frameAccRef = useRef(0)       // floating-point frame accumulator
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const lastTime = useRef(0)
  const velocity = useRef(0)          // px/ms
  const rafId = useRef<number | null>(null)
  const hasInteracted = useRef(false)

  const [loading, setLoading] = useState(true)

  // Draw the current frame to canvas
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    const img = imagesRef.current[index]
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  }

  // Preload all frames
  useEffect(() => {
    let loaded = 0
    const imgs: HTMLImageElement[] = FRAMES.map((src, i) => {
      const img = new Image()
      img.src = src
      img.onload = () => {
        // Draw frame 0 immediately when it loads
        if (i === 0) drawFrame(0)
        loaded++
        if (loaded === FRAME_COUNT) setLoading(false)
      }
      return img
    })
    imagesRef.current = imgs
  }, [])

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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (rafId.current !== null) cancelAnimationFrame(rafId.current)
    isDragging.current = true
    lastX.current = e.clientX
    lastTime.current = e.timeStamp
    velocity.current = 0
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return

    // Fire onFirstInteraction once on first actual move
    if (!hasInteracted.current && onFirstInteraction) {
      hasInteracted.current = true
      onFirstInteraction()
    }

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
    <div className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      )}
    </div>
  )
}
