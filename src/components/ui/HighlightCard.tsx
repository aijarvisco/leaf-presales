'use client'
import { motion } from 'framer-motion'
import Image from 'next/image'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  label: string
  description: string
  videoSrc?: string
}

export default function HighlightCard({
  imageSrc, imageAlt, label, description, videoSrc,
}: HighlightCardProps) {
  return (
    <div className="flex flex-col bg-card rounded-xl overflow-hidden flex-1 min-w-0">
      <div className="relative aspect-[4/3] w-full">
        {videoSrc ? (
          <video autoPlay muted loop playsInline className="w-full h-full object-cover">
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : (
          <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
        )}
      </div>
      <div className="p-5">
        <p className="text-sm font-semibold text-white mb-1">{label}</p>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  )
}
