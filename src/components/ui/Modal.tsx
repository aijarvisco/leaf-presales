'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ open, onClose, children }: ModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = original }
  }, [open])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            data-testid="modal-backdrop"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Bottom-sheet panel */}
          <motion.div
            data-testid="modal-panel"
            className="fixed bottom-0 inset-x-0 z-50 bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto pt-6"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Fechar"
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f0f0f0] hover:bg-[#e0e0e0] flex items-center justify-center text-[#0A0A0A]/60 hover:text-[#0A0A0A] text-xl leading-none cursor-pointer transition-colors"
            >
              ×
            </button>

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
