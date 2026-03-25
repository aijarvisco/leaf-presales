import Image from 'next/image'

interface ValuesCardProps {
  imageSrc: string
  imageAlt: string
  boldText: string
  bodyText: string
  width: number   // applied to wrapper div — NOT to <Image>
  height: number  // applied to wrapper div — NOT to <Image>
}

export default function ValuesCard({
  imageSrc,
  imageAlt,
  boldText,
  bodyText,
  width,
  height,
}: ValuesCardProps) {
  return (
    <div className="flex flex-col select-none" style={{ width }}>
      {/* Image container — fill requires position:relative + explicit dimensions */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ width, height }}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes={`${width}px`}
          className="object-cover pointer-events-none"
          draggable={false}
        />
      </div>

      {/* Text below image */}
      <div className="mt-4">
        <p className="text-lg leading-snug text-[#0A0A0A] max-w-2xl">
          <strong className="font-semibold">{boldText}</strong>{' '}
          <span className="font-normal text-[#3a3a3a]">{bodyText}</span>
        </p>
      </div>
    </div>
  )
}
