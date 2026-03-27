'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

export default function ClosingSection() {
  const containerRef = useRef<HTMLElement>(null)
  const [ctasVisible, setCtasVisible] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const copyY = useTransform(scrollYProgress, [0, 0.5], ['40vh', '5vh'])
  const ctasOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])

  useMotionValueEvent(ctasOpacity, 'change', (v) => {
    if (v > 0.05) setCtasVisible(true)
  })

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      {/* Full-screen closing section */}
      <section id="closing" ref={containerRef} style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/889888a-F275-25TDIEULHD_PZ1D_20_LO.jpg"
            alt="Nissan Leaf em paisagem natural"
            fill
            className="object-cover object-center"
            priority={false}
          />
          {/* Gradient: dark top for headline, transparent middle, dark bottom for CTAs */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
        </div>

        {/* Headline — scrolls from center to top */}
        <motion.div
          className="absolute inset-x-0 z-10 text-center px-6"
          style={{ top: copyY }}
        >
          <h2 className="text-[56px] leading-none font-medium text-white tracking-[-0.07em]">
            Não imagine mais.
            <br />
            Conduza-o.
          </h2>
        </motion.div>

        {/* Bottom CTAs — fade in as headline reaches top */}
        <motion.div
          className="absolute z-10 bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 pb-12"
          style={{ opacity: ctasOpacity }}
        >
          <div className="flex flex-col sm:flex-row items-stretch gap-0 overflow-hidden rounded-xl">
            {/* Small CTA — submit lead */}
            <button
              onClick={() => scrollTo('contacto')}
              className="group flex flex-col justify-between gap-8 w-full sm:w-[36%] px-6 py-5 bg-neutral-900/80 backdrop-blur-sm text-left cursor-pointer transition-colors duration-200 hover:bg-neutral-900/90"
            >
              <p className="text-[10px] font-medium uppercase tracking-widest text-white">
                Ser Contactado
              </p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-xl font-medium text-white/80 leading-snug tracking-[-0.02em] max-w-[70%]">
                  Tem dúvidas? Nós respondemos.
                </p>
                <div className="shrink-0 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center group-hover:bg-white/25 transition-colors duration-200">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </button>

            {/* Large CTA — reserve */}
            <button
              onClick={() => scrollTo('configurador')}
              className="group flex flex-col justify-between gap-8 flex-1 px-6 py-5 bg-[#E8372F] text-left cursor-pointer transition-colors duration-200 hover:bg-[#D42F27]"
            >
              <p className="text-[10px] font-medium uppercase tracking-widest text-white">
                Reservar Agora
              </p>
              <div className="flex items-end justify-between gap-4">
                <p className="text-xl font-medium text-white leading-snug tracking-[-0.02em] max-w-[70%]">
                  Garanta o seu lugar com 300€ totalmente reembolsáveis.
                </p>
                <div className="shrink-0 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:bg-black/35 transition-colors duration-200">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </motion.div>
        </div>
      </section>

      {/* Minimal footer */}
      <footer className="bg-black py-5 px-8 flex flex-wrap items-center justify-between gap-4">
        <Image
          src="/nissan-lettering.svg"
          alt="Nissan"
          width={80}
          height={20}
          className="opacity-50 hover:opacity-80 transition-opacity duration-200 brightness-0 invert"
        />
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/35">
          <Link href="/politica-de-privacidade" className="hover:text-white/70 transition-colors duration-150">
            Política de Privacidade
          </Link>
          <Link href="/termos" className="hover:text-white/70 transition-colors duration-150">
            Termos e Condições
          </Link>
          <Link href="/cookies" className="hover:text-white/70 transition-colors duration-150">
            Cookies
          </Link>
          <button
            onClick={() => scrollTo('contacto')}
            className="hover:text-white/70 transition-colors duration-150 cursor-pointer"
          >
            Contacto
          </button>
          <span className="text-white/20">© 2026 Nissan Portugal</span>
        </nav>
      </footer>
    </>
  )
}
