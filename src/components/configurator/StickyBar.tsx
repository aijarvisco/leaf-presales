'use client'

interface StickyBarProps {
  versionName: string
  price: number
  onReserve: () => void
}

export default function StickyBar({ versionName, price, onReserve }: StickyBarProps) {
  const formattedPrice = price.toLocaleString('pt-PT')

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-md border-t border-white/10">
      {/* Desktop: single row */}
      <div className="hidden md:flex items-center justify-between h-16 px-8 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">Nissan Leaf</span>
          <span className="text-white font-semibold">{versionName}</span>
        </div>
        <span className="text-white font-medium">€{formattedPrice}</span>
        <button
          onClick={onReserve}
          className="bg-white text-[#0A0A0A] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Reservar agora
        </button>
      </div>

      {/* Mobile: two rows */}
      <div className="flex md:hidden flex-col gap-2 px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-sm">{versionName}</span>
          <span className="text-white/80 text-sm">€{formattedPrice}</span>
        </div>
        <button
          onClick={onReserve}
          className="w-full bg-white text-[#0A0A0A] font-semibold text-sm py-2.5 rounded-full hover:bg-white/90 transition-colors"
        >
          Reservar agora
        </button>
      </div>
    </div>
  )
}
