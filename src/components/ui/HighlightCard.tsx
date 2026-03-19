import Image from 'next/image'

interface HighlightCardProps {
  imageSrc: string
  imageAlt: string
  category: string
  label: string
  description: string
  isActive: boolean
}

export default function HighlightCard({
  imageSrc,
  imageAlt,
  category,
  label,
  description,
  isActive,
}: HighlightCardProps) {
  return (
    <div className="w-[75vw] md:w-[60vw] aspect-[4/5] flex flex-col rounded-2xl overflow-hidden shadow-xl bg-white relative">
      {/* Image — 65% of card height */}
      <div className="relative shrink-0" style={{ flex: '0 0 65%' }}>
        <Image src={imageSrc} alt={imageAlt} fill className="object-cover" />
      </div>

      {/* Content — remaining 35% */}
      <div className="flex-1 p-8 flex flex-col justify-center">
        <p className="font-heading font-medium text-xs tracking-widest uppercase text-gray-400 mb-2">
          {category}
        </p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
          {label}
        </h3>
        <p className="text-base text-gray-500 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Inactive overlay */}
      {!isActive && (
        <div className="absolute inset-0 bg-white/20 transition-opacity duration-300" />
      )}
    </div>
  )
}
