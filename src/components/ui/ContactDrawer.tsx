'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import ContactForm from '@/components/forms/ContactForm'

interface ContactDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function ContactDrawer({ isOpen, onClose }: ContactDrawerProps) {
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
      {/* Glass overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full md:w-1/3 bg-surface flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-medium text-white">Pedir informações</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-white/60 hover:text-white text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 pb-[env(safe-area-inset-bottom)]">
          <ContactForm />
        </div>
      </div>
    </>,
    document.body
  )
}
