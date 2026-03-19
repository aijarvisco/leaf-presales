'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '@/components/ui/Button'

const SECTIONS = [
  { label: 'Destaques', href: '#highlights' },
  { label: 'Configurador', href: '#configurador' },
  { label: 'Autonomia', href: '#autonomia' },
  { label: 'Versões', href: '#versoes' },
]

export default function Navbar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          initial={{ y: -64, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -64, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-background/80 backdrop-blur-md border-b border-white/5"
        >
          <span className="text-sm font-semibold tracking-widest uppercase text-text-primary">
            Nissan Leaf
          </span>
          <ul className="hidden md:flex gap-8">
            {SECTIONS.map(({ label, href }) => (
              <li key={href}>
                <a
                  href={href}
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <Button
            variant="primary"
            onClick={() => document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs px-5 py-2"
          >
            Reservar
          </Button>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}
