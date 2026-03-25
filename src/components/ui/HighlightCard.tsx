import Image from 'next/image'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  description: string
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
    <div className="w-full aspect-[8/5] rounded-2xl overflow-hidden relative select-none">
      {/* Full-bleed image */}
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        className="object-cover pointer-events-none"
        draggable={false}
      />

      {/* Gradient overlay based on text position */}
      <div className={`absolute inset-0 pointer-events-none ${overlayClasses[textPosition]}`} />

      {/* Text overlay */}
      <div className={`${positionClasses[textPosition]} max-w-[60%] lg:max-w-[50%] pointer-events-none`}>
        <p className="text-base md:text-xl lg:text-2xl font-medium text-white leading-snug tracking-[-0.02em]">
          {description}
        </p>
      </div>

    </div>
  )
}
