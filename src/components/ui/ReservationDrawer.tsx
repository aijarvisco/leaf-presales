'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import StripePaymentForm from '@/components/forms/StripePaymentForm'

interface ReservationDrawerProps {
  isOpen: boolean
  onClose: () => void
  versionId: string
  versionName: string
  colorName: string
  colorHex: string
  colorImageSrc: string
  price: number
}

export default function ReservationDrawer({
  isOpen,
  onClose,
  versionId,
  versionName,
  colorName,
  colorHex,
  colorImageSrc,
  price,
}: ReservationDrawerProps) {
  const [mounted, setMounted] = useState(false)

  // SSR guard — only render portal on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Escape key — only active when drawer is open
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [isOpen])

  if (!mounted) return null

  return createPortal(
    <>
      {/* Glass overlay — decorative only. Intentionally no onClick: payment flow
          should only dismiss via ESC or the × button, not accidental backdrop tap. */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Drawer panel — slides from the RIGHT, matching ContactDrawer direction.
          bg-white is intentional: matches the light Stripe form styling. */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full md:w-[35%] bg-white flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-3xl font-medium tracking-[-0.07em] leading-none text-[#0A0A0A]">Reserva</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-[#0A0A0A]/40 hover:text-[#0A0A0A] text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">

          {/* Config card */}
          <div className="flex items-start gap-4 border border-gray-100 rounded-xl p-4">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={colorImageSrc}
                alt={colorName}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-[#0A0A0A]">Nissan Leaf</span>
              <span className="text-sm text-[#86868b]">{versionName}</span>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                    style={{ backgroundColor: colorHex }}
                  />
                  <span className="text-sm text-[#86868b]">{colorName}</span>
                </div>
                <span className="text-sm font-semibold text-[#0A0A0A]">€{price.toLocaleString('pt-PT')}</span>
              </div>
            </div>
          </div>

          {/* Intro + form */}
          <p className="text-base font-medium text-[#0A0A0A]">Complete a sua reserva</p>

          {/* StripePaymentForm mounts only when open so it re-fetches a fresh
              payment intent on each open with the current versionId */}
          {isOpen && (
            <StripePaymentForm
              versionId={versionId}
              versionName={versionName}
              colorName={colorName}
              colorHex={colorHex}
              price={price}
            />
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
