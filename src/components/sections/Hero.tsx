'use client'
import { motion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function Hero() {
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background video / image */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/placeholder-hero.jpg"
        >
          <source src="/videos/placeholder-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight mb-4"
        >
          O futuro chegou.
          <br />
          Reserve o seu.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-lg text-text-secondary mb-10"
        >
          O novo Nissan Leaf. 100% elétrico. Design que redefine o futuro.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contacto')}>
            Ser contactado
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <div className="w-px h-10 bg-white/30 mx-auto" />
      </motion.div>
    </section>
  )
}
