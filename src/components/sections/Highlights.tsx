'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import HighlightCard from '@/components/ui/HighlightCard'

const HIGHLIGHTS = [
  {
    imageSrc: '/images/889248-F308-25TDIEU_PZ1D_L5_PS_YBR_005_HERO.png',
    imageAlt: 'Design exterior do Nissan Leaf',
    category: 'DESIGN',
    label: 'Design que impressiona',
    description: 'Linhas curvas e uma silhueta moderna que redefinem o que um elétrico pode ser.',
  },
  {
    imageSrc: '/images/889249-F308-25TDIEU_PZ1D_L5_PS_YBR_006_HERO.png',
    imageAlt: 'Interior tecnológico do Nissan Leaf',
    category: 'TECNOLOGIA',
    label: 'Tecnologia no centro',
    description: 'Cockpit digital, conectividade total e sistemas de assistência à condução.',
  },
  {
    imageSrc: '/images/889857a-F275-25TDIEULHD_PZ1D_01_LO.jpg',
    imageAlt: 'Autonomia do Nissan Leaf',
    category: 'AUTONOMIA',
    label: 'Vai mais longe',
    description: 'Autonomia real para o teu dia a dia, com carregamento rápido onde precisas.',
  },
  {
    imageSrc: '/images/889861-F275-25TDIEU_PZ1D_03_LO.jpg',
    imageAlt: 'Nissan Leaf 100% elétrico',
    category: 'ELÉTRICO',
    label: 'Zero emissões',
    description: '100% elétrico. Contribui para um futuro mais limpo a cada quilómetro.',
  },
]

const GAP = 24 // px — matches gap-6

const trackSpring = { type: 'spring' as const, stiffness: 300, damping: 30, mass: 0.5 }
const cardTransition = { type: 'tween' as const, duration: 0.3, ease: 'easeInOut' as const }

function getScale(distance: number) {
  if (distance === 0) return 1
  if (distance === 1) return 0.92
  return 0.88
}

function getOpacity(distance: number) {
  if (distance === 0) return 1
  if (distance === 1) return 0.6
  return 0.4
}

export default function Highlights() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [cardWidth, setCardWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setViewportWidth(window.innerWidth)

    const handleResize = () => setViewportWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)

    if (!cardRef.current) return () => window.removeEventListener('resize', handleResize)

    const ro = new ResizeObserver(() => {
      if (cardRef.current) {
        setCardWidth(cardRef.current.getBoundingClientRect().width)
      }
    })
    ro.observe(cardRef.current)

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const getOffset = (index: number) =>
    viewportWidth / 2 - cardWidth / 2 - index * (cardWidth + GAP)

  const targetOffset = getOffset(activeIndex)
  const maxRight = getOffset(0)
  const maxLeft = getOffset(HIGHLIGHTS.length - 1)

  const handleDragEnd = (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } },
  ) => {
    const { offset, velocity } = info
    if (Math.abs(velocity.x) > 500) {
      if (velocity.x < 0) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    } else if (Math.abs(offset.x) > cardWidth / 2) {
      if (offset.x < 0) setActiveIndex(i => Math.min(i + 1, HIGHLIGHTS.length - 1))
      else setActiveIndex(i => Math.max(i - 1, 0))
    }
  }

  return (
    <section id="highlights" className="pt-32 pb-32 bg-white overflow-hidden">
      {/* Title */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-24">
        <motion.h2
          className="text-6xl md:text-8xl text-[#0A0A0A]"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Feito para te surpreender.
        </motion.h2>
      </div>

      {/* Carousel track */}
      <div className="w-full overflow-hidden">
        <motion.div
          className="flex flex-row"
          style={{ gap: GAP }}
          drag="x"
          dragConstraints={{ left: maxLeft, right: maxRight }}
          dragElastic={0.1}
          animate={{ x: targetOffset }}
          transition={trackSpring}
          onDragEnd={handleDragEnd}
        >
          {HIGHLIGHTS.map((h, i) => {
            const distance = Math.abs(i - activeIndex)
            return (
              <div
                key={h.label}
                ref={i === 0 ? cardRef : undefined}
                className="shrink-0"
              >
                <motion.div
                  animate={{
                    scale: getScale(distance),
                    opacity: getOpacity(distance),
                  }}
                  transition={cardTransition}
                >
                  <HighlightCard {...h} isActive={i === activeIndex} />
                </motion.div>
              </div>
            )
          })}
        </motion.div>
      </div>

      {/* Pagination dots */}
      <div className="flex justify-center items-center gap-2 mt-10">
        {HIGHLIGHTS.map((_, i) => (
          <motion.button
            key={i}
            layout
            onClick={() => setActiveIndex(i)}
            className={`h-2 rounded-full cursor-pointer ${
              i === activeIndex ? 'bg-gray-800 w-6' : 'bg-gray-300 w-2'
            }`}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            aria-label={`Ir para destaque ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
