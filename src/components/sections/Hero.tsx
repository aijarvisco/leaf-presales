'use client'
import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Scroll-driven values
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
    <section ref={heroRef} className="relative h-screen overflow-hidden">

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

      {/* Layer 3: left edge vignette — contrast for the text block */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, transparent 60%)',
        }}
      />

      {/* Content block — fades and lifts on scroll */}
      <motion.div
        className="absolute bottom-16 md:bottom-32 left-6 right-0 pr-4 md:pr-0 md:left-16 md:right-auto lg:left-24 z-20"
        style={{ opacity: textOpacity, y: textY }}
      >
        {/* Left — copy block */}
        <div className="max-w-4xl pr-4">
          {/* Label */}
          <motion.p
            className="text-xl sm:text-2xl 2xl:text-2xl text-white font-medium uppercase mb-3 leading-none"
            {...entryFade(0)}
          >
            Nissan Leaf · Nova Geração
          </motion.p>

          {/* Headline */}
          <div className="block overflow-hidden mb-6">
            <motion.h1
              className="font-medium text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl 2xl:text-7xl text-white leading-none tracking-[-0.05em] max-w-xl"
              {...clipReveal(0.2)}
            >
              A energia que vai mover a sua vida
            </motion.h1>
          </div>

          {/* Reassurance */}
          <motion.p
            className="text-lg xl:text-xl font-light text-white"
            {...fadeUp(0.6)}
          >
            Primeiras entregas - limitadas - a partir de Outubro
          </motion.p>
        </div>
      </motion.div>

    </section>
  )
}
