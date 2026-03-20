'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import Image from 'next/image'

const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',    descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '592', unit: 'km',      descriptor: 'Autonomia em ciclo WLTP' },
  { qualifier: '',    number: '30',  unit: 'min',     descriptor: 'De 20 a 80% em carga rápida' },
  { qualifier: '',    number: '7,2', unit: 'km/kWh',  descriptor: 'Eficiência energética' },
]

const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const statItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

export default function AutonomiaSectionV2() {
  const containerRef = useRef<HTMLElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const copyY = useTransform(scrollYProgress, [0, 0.5], ['40vh', '5vh'])
  const statsOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])

  useMotionValueEvent(statsOpacity, 'change', (v) => {
    if (v > 0.05) setStatsVisible(true)
  })

  return (
    <section id="autonomia" ref={containerRef} style={{ height: '300vh' }}>
      <div className="sticky top-0 h-screen overflow-hidden">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.jpg"
            alt="Nissan Leaf autonomia"
            fill
            className="object-cover"
            priority={false}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-amber-950/30 via-40% to-black/75" />
        </div>

        {/* Copy block */}
        <motion.div
          className="absolute inset-x-0 z-10 flex flex-col items-center text-center px-6"
          style={{ top: copyY }}
        >
          <p className="font-normal mb-3" style={{ fontSize: '24px', color: '#86868b' }}>
            Autonomia
          </p>
          <h2
            className="font-semibold text-white"
            style={{ fontSize: '80px', lineHeight: 1.07, letterSpacing: '-0.005em' }}
          >
            Uma bateria que vai onde tu vais.
          </h2>
        </motion.div>

        {/* Stats panel */}
        <motion.div
          className="absolute bottom-12 inset-x-0 z-10 px-16"
          style={{ opacity: statsOpacity }}
        >
          <motion.div
            className="grid grid-cols-4 gap-8"
            variants={statsContainerVariants}
            initial="hidden"
            animate={statsVisible ? 'visible' : 'hidden'}
          >
            {STATS.map((stat) => (
              <motion.div key={stat.descriptor} className="flex flex-col" variants={statItemVariants}>
                {stat.qualifier ? (
                  <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>{stat.qualifier}</p>
                ) : (
                  <p aria-hidden="true" style={{ fontSize: '21px', color: 'transparent', fontWeight: 400 }}>&nbsp;</p>
                )}
                <div className="flex items-baseline gap-2">
                  <span style={{ fontSize: '48px', fontWeight: 500, color: 'white', letterSpacing: '-0.003em' }}>
                    {stat.number}
                  </span>
                  <span style={{ fontSize: '48px', fontWeight: 500, color: 'white', letterSpacing: '-0.003em' }}>
                    {stat.unit}
                  </span>
                </div>
                <p style={{ fontSize: '21px', color: '#86868b', fontWeight: 400 }}>{stat.descriptor}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
