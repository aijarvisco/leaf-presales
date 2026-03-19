'use client'
import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import type { ConfiguratorView } from '@/types'

interface ImageSequenceViewerProps {
  view: ConfiguratorView
  colorId: string
  // Image sets: images[view][colorId] = array of frame URLs
  images: Record<ConfiguratorView, Record<string, string[]>>
}

export default function ImageSequenceViewer({ view, colorId, images }: ImageSequenceViewerProps) {
  const frames = images[view][colorId] ?? []
  const frameCount = frames.length || 1

  const [frameIndex, setFrameIndex] = useState(0)
  const dragStart = useRef<number | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    dragStart.current = e.clientX
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStart.current === null) return
    const delta = e.clientX - dragStart.current
    if (Math.abs(delta) > 10) {
      const direction = delta > 0 ? -1 : 1
      setFrameIndex((i) => (i + direction + frameCount) % frameCount)
      dragStart.current = e.clientX
    }
  }, [frameCount])

  const handlePointerUp = useCallback(() => {
    dragStart.current = null
  }, [])

  const currentSrc = frames[frameIndex] ?? '/images/placeholder-hero.jpg'

  return (
    <div
      className="relative w-full aspect-video select-none cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <Image
        src={currentSrc}
        alt="Vista do veículo"
        fill
        className="object-contain"
        draggable={false}
        priority
      />
      <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white/30">
        Arrasta para rodar
      </p>
    </div>
  )
}
