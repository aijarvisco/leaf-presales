'use client'

interface InteriorViewerProps {
  images?: string[]
}

export default function InteriorViewer({ images: _ }: InteriorViewerProps) {
  return (
    <div className="absolute inset-0 w-full h-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/nissan-leaf-lights.webp"
        alt="Interior view"
        className="w-full h-full object-cover"
        draggable={false}
      />
    </div>
  )
}
