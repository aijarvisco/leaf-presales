'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import Button from '@/components/ui/Button'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Scroll-driven values
  const gradientOpacity = useTransform(scrollYProgress, [0, 0.6], [0.7, 1])
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, -24])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.05])

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  // Animation prop factories — no-ops when reduced motion is preferred
  function entryFade(delay: number) {
    if (prefersReducedMotion) return {}
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.6, delay, ease: 'easeOut' as const },
    }
  }

  function fadeUp(delay: number) {
    if (prefersReducedMotion) return {}
    return {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay, ease: 'easeOut' as const },
    }
  }

  function clipReveal(delay: number) {
    if (prefersReducedMotion) return {}
    return {
      initial: { clipPath: 'inset(0 0 100% 0)', opacity: 0 },
      animate: { clipPath: 'inset(0 0 0% 0)', opacity: 1 },
      transition: { duration: 0.7, delay, ease: 'easeOut' as const },
    }
  }

  function scaleRule() {
    if (prefersReducedMotion) return {}
    return {
      initial: { scaleX: 0 },
      animate: { scaleX: 1 },
      transition: { duration: 0.5, delay: 0.15, ease: 'easeOut' as const },
      style: { transformOrigin: 'left center' },
    }
  }

  return (
    <section ref={heroRef} className="relative h-screen overflow-hidden">

      {/* Video background — wrapped for Ken Burns scroll scale */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ scale: videoScale }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/nissan-leaf-hero.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/videos/lhd_h.mp4" type="video/mp4" />
        </video>
      </motion.div>

      {/* Layer 1: top vignette — barely dims the sky */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%)',
        }}
      />

      {/* Layer 2: bottom-to-solid gradient — darkens on scroll */}
      <motion.div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 40%, #0A0A0A 100%)',
          opacity: gradientOpacity,
        }}
      />

      {/* Layer 3: left edge vignette — contrast for the text block */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)',
        }}
      />

      {/* Content block — fades and lifts on scroll */}
      <motion.div
        className="absolute bottom-16 md:bottom-20 left-0 pl-8 md:pl-16 lg:pl-24 z-20"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Label */}
        <motion.p
          className="text-xs md:text-sm text-white/50 tracking-[0.2em] font-sans font-light uppercase mb-4"
          {...entryFade(0)}
        >
          Nissan Leaf · 100% Elétrico · Reserva Antecipada
        </motion.p>

        {/* Thin rule */}
        <motion.div
          className="w-12 border-t border-white/30 mb-6"
          {...scaleRule()}
        />

        {/* Headline — two lines with italic/roman contrast */}
        <h1 className="font-cormorant font-light leading-none mb-4">
          <span className="block overflow-hidden">
            <motion.span
              className="block text-6xl md:text-7xl lg:text-[9rem] text-white italic"
              {...clipReveal(0.3)}
            >
              Além do
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span
              className="block text-6xl md:text-7xl lg:text-[9rem] text-white not-italic"
              {...clipReveal(0.45)}
            >
              Horizonte.
            </motion.span>
          </span>
        </h1>

        {/* Subline */}
        <motion.p
          className="text-base md:text-lg text-white/70 font-sans font-light max-w-md mb-8"
          {...fadeUp(0.7)}
        >
          O Nissan Leaf foi construído para quem nunca parou de imaginar.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-row gap-4"
          {...fadeUp(0.9)}
        >
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
          <Button variant="ghost" onClick={() => scrollTo('contacto')}>
            Saber mais
          </Button>
        </motion.div>
      </motion.div>

    </section>
  )
}
