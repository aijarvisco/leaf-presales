'use client'
import { VERSIONS, EXTERIOR_COLORS, getVersionInclusions } from './configuradorData'

interface OptionsPanelProps {
  selectedVersionId: string
  selectedColorId: string
  onSelectVersion: (id: string) => void
  onSelectColor: (id: string) => void
}

export default function OptionsPanel({
  selectedVersionId,
  selectedColorId,
  onSelectVersion,
  onSelectColor,
}: OptionsPanelProps) {
  const activeVersion = VERSIONS.find(v => v.id === selectedVersionId) ?? VERSIONS[1]
  const inclusions = getVersionInclusions(selectedVersionId)
  const prevVersionName = VERSIONS[VERSIONS.findIndex(v => v.id === selectedVersionId) - 1]?.name

  return (
    <div className="px-8 py-12 space-y-10">

      {/* Heading */}
      <div>
        <p className="text-sm font-semibold text-[#86868b] uppercase tracking-wider mb-2">
          Configurador
        </p>
        <h2 className="text-3xl md:text-4xl font-semibold text-[#0A0A0A] leading-tight">
          Escolhe a tua versão.
        </h2>
      </div>

      {/* 1. Version selector */}
      <div>
        <div
          role="tablist"
          className="grid grid-cols-3 gap-2"
        >
          {VERSIONS.map((v) => (
            <button
              key={v.id}
              role="tab"
              aria-selected={v.id === selectedVersionId}
              onClick={() => onSelectVersion(v.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center transition-colors ${
                v.id === selectedVersionId
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-gray-100 text-[#0A0A0A] hover:bg-gray-200'
              }`}
            >
              <span className="font-semibold text-sm">{v.name}</span>
              <span className={`text-xs ${v.id === selectedVersionId ? 'text-white/60' : 'text-[#86868b]'}`}>
                €{v.price.toLocaleString('pt-PT')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Exterior colour */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Cor exterior
        </p>
        <div
          role="radiogroup"
          aria-label="Cor exterior"
          className="space-y-1"
        >
          {EXTERIOR_COLORS.map((color) => (
            <button
              key={color.id}
              role="radio"
              aria-checked={color.id === selectedColorId}
              onClick={() => onSelectColor(color.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                color.id === selectedColorId
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-gray-50 text-[#0A0A0A] hover:bg-gray-100'
              }`}
            >
              {/* Swatch */}
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm font-medium">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Interior colour */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Cor interior
        </p>
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0A] text-white cursor-default">
          <span className="w-4 h-4 rounded-full flex-shrink-0 bg-[#1a1a1a] border border-white/20" />
          <span className="text-sm font-medium">Black</span>
        </div>
      </div>

      {/* 4. Inclusions */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          O que inclui
        </p>
        {prevVersionName && (
          <p className="text-sm text-[#86868b] mb-3">
            Tudo da versão {prevVersionName} +
          </p>
        )}
        <ul className="space-y-2">
          {inclusions.map((item) => (
            <li key={item.label} className="flex items-center gap-2 text-sm text-[#0A0A0A]">
              <span className="text-green-600 font-semibold">✓</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Features — TODO: v2 */}

    </div>
  )
}
