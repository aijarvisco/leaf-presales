import Image from 'next/image'
import { ReactNode } from 'react'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  description: ReactNode
  textPosition: 'top' | 'middle' | 'bottom'
}

const overlayClasses = {
  top: 'bg-gradient-to-b from-black/65 via-black/20 to-transparent',
  middle: 'bg-[radial-gradient(ellipse_60%_50%_at_20%_50%,rgba(0,0,0,0.6)_0%,transparent_100%)]',
  bottom: 'bg-gradient-to-t from-black/70 via-black/25 to-transparent',
}

const positionClasses = {
  top: 'absolute top-7 left-7 md:top-10 md:left-10',
  middle: 'absolute top-1/2 -translate-y-1/2 left-7 md:left-10',
  bottom: 'absolute bottom-7 left-7 md:bottom-10 md:left-10',
}

export default function HighlightCard({
  imageSrc,
  imageAlt,
  description,
  textPosition,
}: HighlightCardProps) {
  return (
    <div className="w-full flex flex-col select-none">
      {/* Image container */}
      <div className="w-full aspect-[8/5] rounded-2xl overflow-hidden relative">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover pointer-events-none"
          draggable={false}
        />

        {/* Gradient overlay */}
        <div className={`absolute inset-0 pointer-events-none hidden md:block ${overlayClasses[textPosition]}`} />

        {/* Text overlay — desktop only */}
        <div className={`hidden md:block ${positionClasses[textPosition]} max-w-full md:max-w-[70%] lg:max-w-[55%] pointer-events-none`}>
          <p className="text-base md:text-xl lg:text-2xl font-medium text-white leading-snug tracking-[-0.02em]">
            {description}
          </p>
        </div>
      </div>

      {/* Text below image — mobile only */}
      <div className="block md:hidden mt-3 px-1">
        <p className="text-base font-medium text-[#0A0A0A] leading-snug tracking-[-0.02em]">
          {description}
        </p>
      </div>
    </div>
  )
}
