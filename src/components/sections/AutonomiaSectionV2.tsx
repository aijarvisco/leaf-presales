'use client'
import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion'
import Image from 'next/image'
import Modal from '@/components/ui/Modal'
import SavingsCalculator from '@/components/forms/SavingsCalculator'

const STATS = [
  { qualifier: 'Até', number: '75',  unit: 'kWh',   descriptor: 'Capacidade da bateria' },
  { qualifier: 'Até', number: '622', unit: 'km',     descriptor: 'Autonomia.' },
  { qualifier: '',    number: '8',   unit: 'anos',   descriptor: 'de garantia na bateria' },
]

const statsContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
}

const statItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
}

function CalcButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex items-center gap-3 rounded-full pl-5 pr-1.5 py-1.5 cursor-pointer select-none"
      style={{ backgroundColor: '#1c1c1e' }}
      onClick={onClick}
    >
      <span className="text-white font-medium" style={{ fontSize: '17px', letterSpacing: '-0.01em' }}>
        Calcule o que vai poupar
      </span>
      <span
        className="flex items-center justify-center rounded-full shrink-0"
        style={{ width: 32, height: 32, backgroundColor: '#E8453C' }}
        aria-hidden="true"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2v10M2 7h10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </span>
    </button>
  )
}

export default function AutonomiaSectionV2() {
  const containerRef = useRef<HTMLElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const copyY = useTransform(scrollYProgress, [0, 0.5], ['40vh', '5vh'])
  const statsOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1])

  useMotionValueEvent(statsOpacity, 'change', (v) => {
    setStatsVisible(v > 0.05)
  })

  return (
    <>
      {/* ── Mobile layout (static, no scroll animation) ── */}
      <section id="autonomia" className="md:hidden bg-white">
        {/* Image */}
        <div className="relative w-full aspect-[4/3]">
          <Image
            src="/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.webp"
            alt="Nissan Leaf autonomia"
            fill
            className="object-cover"
            priority={false}
          />
        </div>

        {/* Title + button */}
        <div className="bg-white px-6 pt-12 pb-6 flex flex-col items-center text-center gap-6">
          <div>
            <p className="font-medium text-base tracking-[-0.07em] leading-none text-[#86868b]">
              Autonomia
            </p>
            <h2
              className="leading-none text-black font-medium tracking-[-0.07em] mt-2"
              style={{ fontSize: 'var(--text-display)' }}
            >
              Excelência elétrica para chegar mais longe
            </h2>
          </div>
          <CalcButton onClick={() => setModalOpen(true)} />
        </div>

        {/* Stats — one per row */}
        <div className="bg-white divide-y divide-black/10 border-t border-black/10 pb-4">
          {STATS.map((stat) => (
            <div key={stat.descriptor} className="px-6 py-5 flex flex-col items-center text-center">
              {stat.qualifier && (
                <p className="text-sm text-[#86868b] font-normal">{stat.qualifier}</p>
              )}
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-medium text-black tracking-[-0.02em]">
                  {stat.number}
                </span>
                <span className="text-5xl font-medium text-black tracking-[-0.02em]">
                  {stat.unit}
                </span>
              </div>
              <p className="text-sm text-[#86868b] font-normal">{stat.descriptor}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Desktop layout (sticky scroll animation) ── */}
      <section ref={containerRef} className="hidden md:block" style={{ height: '300vh' }}>
        <div className="sticky top-0 h-screen overflow-hidden">

          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/889867a-F275-25TDIEULHD_PZ1D_09_LO.webp"
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
            <p className="font-medium text-xl mx-auto max-w-2xl 2xl:max-w-5xl tracking-[-0.07em] leading-none">
              Autonomia
            </p>
            <h2
              className="leading-none text-white font-medium tracking-[-0.07em] max-w-2xl 2xl:max-w-5xl"
              style={{ fontSize: 'var(--text-display)' }}
            >
              Excelência elétrica para chegar mais longe
            </h2>

            {/* EV Savings Calculator button — appears with stats */}
            <motion.div
              variants={statItemVariants}
              initial="hidden"
              animate={statsVisible ? 'visible' : 'hidden'}
              className="mt-8"
            >
              <CalcButton onClick={() => setModalOpen(true)} />
            </motion.div>
          </motion.div>

          {/* Stats panel */}
          <motion.div
            className="absolute bottom-24 inset-x-0 z-10 px-16"
            style={{ opacity: statsOpacity }}
          >
            <motion.div
              className="grid grid-cols-3 gap-8 mx-auto max-w-5xl"
              variants={statsContainerVariants}
              initial="hidden"
              animate={statsVisible ? 'visible' : 'hidden'}
            >
              {STATS.map((stat) => (
                <motion.div key={stat.descriptor} className="flex flex-col" variants={statItemVariants}>
                  {stat.qualifier ? (
                    <p className="text-xl text-[#86868b] font-normal">{stat.qualifier}</p>
                  ) : (
                    <p aria-hidden="true" className="text-xl text-transparent font-normal">&nbsp;</p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-medium text-white tracking-[-0.02em]">
                      {stat.number}
                    </span>
                    <span className="text-5xl font-medium text-white tracking-[-0.02em]">
                      {stat.unit}
                    </span>
                  </div>
                  <p className="text-xl text-[#86868b] font-normal">{stat.descriptor}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

        </div>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <SavingsCalculator
          onInterested={() => {
            setModalOpen(false)
            document.getElementById('configurador')?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      </Modal>
    </>
  )
}
