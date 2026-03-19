'use client'
import { motion } from 'framer-motion'

interface StatCardProps {
  stat: string
  unit: string
  descriptor: string
  cta?: string
  onClick?: () => void
}

export default function StatCard({ stat, unit, descriptor, cta = 'Saber mais', onClick }: StatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex-1 min-w-0 bg-card rounded-xl p-6 text-left group cursor-pointer hover:bg-white/5 transition-colors"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-3">
        <span className="text-5xl font-bold text-white">{stat}</span>
        <span className="text-xl text-text-secondary ml-1">{unit}</span>
      </div>
      <p className="text-sm text-text-secondary mb-4">{descriptor}</p>
      <span className="text-xs text-accent group-hover:underline">{cta} →</span>
    </motion.button>
  )
}
