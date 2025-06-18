'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface CounterProps {
  endValue: number;
  suffix?: string;
  duration?: number;
}

function Counter({ endValue, suffix = '', duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0)
  const steps = 50
  const increment = endValue / steps

  useEffect(() => {
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      setCount(Math.min(currentStep * increment, endValue))

      if (currentStep >= steps) {
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [endValue, duration, increment, steps])

  return (
    <span>
      {Math.round(count)}
      {suffix}
    </span>
  )
}

const stats = [
  {
    label: 'Students Using Digital Locker',
    endValue: 2000,
    suffix: '+',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  },
  {
    label: 'Documents Stored Securely',
    endValue: 6000,
    suffix: '+',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
      </svg>
    )
  }
]

export default function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full text-white mb-6">
                {stat.icon}
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                <Counter endValue={stat.endValue} suffix={stat.suffix} />
              </div>
              <div className="text-lg text-blue-100">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 