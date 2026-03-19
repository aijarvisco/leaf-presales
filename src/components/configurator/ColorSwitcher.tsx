'use client'

interface Color {
  id: string
  label: string
  hex: string
}

interface ColorSwitcherProps {
  colors: Color[]
  activeColor: string
  onSelect: (id: string) => void
}

export default function ColorSwitcher({ colors, activeColor, onSelect }: ColorSwitcherProps) {
  return (
    <div className="flex gap-3 justify-center mt-6">
      {colors.map((color) => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          title={color.label}
          className={`
            w-8 h-8 rounded-full transition-all duration-200 border-2
            ${activeColor === color.id ? 'border-white scale-110' : 'border-transparent hover:border-white/50'}
          `}
          style={{ backgroundColor: color.hex }}
          aria-label={color.label}
          aria-pressed={activeColor === color.id}
        />
      ))}
    </div>
  )
}
