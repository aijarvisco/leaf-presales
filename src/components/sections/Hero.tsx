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

  // onClick-only — safe after hydration ('use client' is set)
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

  return (
    <section ref={heroRef} className="relative flex-1 overflow-hidden">

      {/* Video background — wrapped for Ken Burns scroll scale */}
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden"
        style={{ scale: videoScale }}
      >
        <video
          aria-hidden="true"
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
        className="absolute bottom-16 md:bottom-20 left-8 md:left-16 lg:left-24 right-8 md:right-16 lg:right-24 z-20 flex flex-col md:flex-row items-start md:items-end md:justify-between gap-6"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Left — copy block */}
        <div>
          {/* Label */}
          <motion.p
            className="text-lg md:text-lg text-white font-sans font-medium uppercase mb-2"
            {...entryFade(0)}
          >
            Nissan Leaf
          </motion.p>

          {/* Headline */}
          <div className="block overflow-hidden mb-6">
            <motion.h1
              className="font-sans font-semibold text-5xl md:text-6xl lg:text-7xl text-white leading-none"
              {...clipReveal(0.2)}
            >
              Listening. Remastered.
            </motion.h1>
          </div>

          {/* Sub-label + reassurance */}
          <motion.p
            className="text-lg font-sans font-medium text-white"
            {...fadeUp(0.5)}
          >
            Reserva já.
          </motion.p>
          <motion.p
            className="text-lg font-sans font-light text-white"
            {...fadeUp(0.6)}
          >
            Disponível para entrega em Outubro.
          </motion.p>
        </div>

        {/* Right — CTA */}
        <motion.div {...fadeUp(0.8)}>
          <Button variant="primary" onClick={() => scrollTo('reservar')}>
            Reservar agora
          </Button>
        </motion.div>
      </motion.div>

    </section>
  )
}
