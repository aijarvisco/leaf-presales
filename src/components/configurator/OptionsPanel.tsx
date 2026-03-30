'use client'
import { TRIM_LEVELS, COLOR_OPTIONS, getEffectivePrice } from './configuradorData'

interface OptionsPanelProps {
  selectedTrimId: string
  selectedColorId: string
  selectedBatteryKwh: 52 | 75
  onSelectTrim: (id: string) => void
  onSelectColor: (id: string) => void
  onSelectBattery: (kWh: 52 | 75) => void
}

export default function OptionsPanel({
  selectedTrimId,
  selectedColorId,
  selectedBatteryKwh,
  onSelectTrim,
  onSelectColor,
  onSelectBattery,
}: OptionsPanelProps) {
  const activeTrim    = TRIM_LEVELS.find(t => t.id === selectedTrimId) ?? TRIM_LEVELS[0]
  const availableColors = COLOR_OPTIONS.filter(c => activeTrim.availableColorIds.includes(c.id))
  const trimIndex     = TRIM_LEVELS.findIndex(t => t.id === selectedTrimId)
  const prevTrimName  = trimIndex > 0 ? TRIM_LEVELS[trimIndex - 1].name : null

  return (
    <div className="px-8 py-12 space-y-10">

      {/* Heading */}
      <div className="flex flex-col items-center text-center">
        <p className="leading-none text-3xl font-medium tracking-[-0.07em] text-[#0A0A0A]/60">
          Configurador
        </p>
        <h2 className="text-3xl md:text-4xl font-medium tracking-[-0.07em] leading-none text-[#0A0A0A]">
          Escolhe a tua versão.
        </h2>
      </div>

      {/* 1. Trim selector */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Versões
        </p>
        <div role="tablist" className="grid grid-cols-3 gap-2">
          {TRIM_LEVELS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={t.id === selectedTrimId}
              onClick={() => onSelectTrim(t.id)}
              className={`flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-center transition-colors ${
                t.id === selectedTrimId
                  ? 'bg-[#0A0A0A] text-white'
                  : 'bg-gray-100 text-[#0A0A0A] hover:bg-gray-200'
              }`}
            >
              <span className="font-semibold text-sm">{t.name}</span>
              {t.isPopular && (
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  t.id === selectedTrimId ? 'bg-white/20 text-white' : 'bg-[#0A0A0A] text-white'
                }`}>
                  Popular
                </span>
              )}
              <span className={`text-xs ${t.id === selectedTrimId ? 'text-white/60' : 'text-[#86868b]'}`}>
                €{getEffectivePrice(t, t.id === 'engage' ? selectedBatteryKwh : undefined).toLocaleString('pt-PT')}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Battery selector — Engage only */}
      {activeTrim.id === 'engage' && activeTrim.batteryOptions && (
        <div>
          <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
            Bateria
          </p>
          <div className="flex gap-2">
            {activeTrim.batteryOptions.map((opt) => (
              <button
                key={opt.kWh}
                aria-pressed={opt.kWh === selectedBatteryKwh}
                onClick={() => onSelectBattery(opt.kWh)}
                className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-colors ${
                  opt.kWh === selectedBatteryKwh
                    ? 'bg-[#0A0A0A] text-white'
                    : 'bg-gray-100 text-[#0A0A0A] hover:bg-gray-200'
                }`}
              >
                {opt.kWh} kWh
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Exterior colour */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Exterior
        </p>
        <div
          role="radiogroup"
          aria-label="Cor exterior"
          className="space-y-1"
        >
          {availableColors.map((color) => (
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
              <span
                className="w-4 h-4 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-sm font-medium">{color.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Interior colour — hardcoded, single option */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Interior
        </p>
        <div className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0A0A0A] text-white cursor-default">
          <span className="w-4 h-4 rounded-full flex-shrink-0 bg-[#1a1a1a] border border-white/20" />
          <span className="text-sm font-medium">Black</span>
        </div>
      </div>

      {/* 5. Highlights */}
      <div>
        <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider mb-3">
          Incluído
        </p>
        {prevTrimName && (
          <p className="text-sm text-[#86868b] mb-3">
            Tudo da versão {prevTrimName} +
          </p>
        )}
        <ul className="space-y-2">
          {activeTrim.highlights.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-[#0A0A0A]">
              <span className="text-green-600 font-semibold">✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

    </div>
  )
}
