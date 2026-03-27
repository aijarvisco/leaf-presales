'use client'
import { useScroll, useTransform, useReducedMotion, motion, easeOut } from 'framer-motion'
import Image from 'next/image'

const staticStyle = {
  width:          '100%',
  height:         '64px',
  borderRadius:   0,
  background:     'rgba(0,0,0,0.85)',
  backdropFilter: 'none',
  paddingLeft:    '64px',
  paddingRight:   '64px',
}

export default function SiteHeader() {
  const prefersReducedMotion = useReducedMotion()
  const { scrollY } = useScroll()

  // Always call hooks unconditionally — use results only when reduced motion is not preferred
  const animatedStyle = {
    width:          useTransform(scrollY, [0, 300], ['100%', '76%'],       { ease: easeOut }),
    height:         useTransform(scrollY, [0, 300], [64, 48],              { ease: easeOut }),
    borderRadius:   useTransform(scrollY, [0, 300], [0, 14],               { ease: easeOut }),
    background:     useTransform(scrollY, [0, 300], ['transparent', 'rgba(0,0,0,0.55)'], { ease: easeOut }),
    backdropFilter: useTransform(scrollY, [0, 300], ['blur(0px)', 'blur(16px)'],         { ease: easeOut }),
    paddingLeft:    useTransform(scrollY, [0, 300], [64, 32],              { ease: easeOut }),
    paddingRight:   useTransform(scrollY, [0, 300], [64, 32],              { ease: easeOut }),
  }

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="fixed left-0 right-0 top-6 z-50 pointer-events-none">
      <motion.header
        className="mx-auto flex items-center justify-between pointer-events-auto"
        style={{
          willChange: 'backdrop-filter',
          ...(prefersReducedMotion ? staticStyle : animatedStyle),
        }}
      >
        <Image
          src="/nissan-lettering.svg"
          alt="Nissan"
          width={180}
          height={26}
          style={{ height: 'auto', filter: 'brightness(0) invert(1)' }}
          priority
        />
        <div className="flex items-center gap-4">
          <button
            className="text-white text-sm font-normal cursor-pointer"
            onClick={() => scrollTo('contacto')}
          >
            Ser Contactado
          </button>
          <button
            className="bg-[#E8372F] text-white hover:bg-[#D42F27] px-5 py-2 rounded-lg text-sm font-normal transition-colors duration-200 cursor-pointer"
            onClick={() => scrollTo('reservar')}
          >
            Reservar
          </button>
        </div>
      </motion.header>
    </div>
  )
}
