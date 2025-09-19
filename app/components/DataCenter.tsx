'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const features = [
  {
    title: 'State-of-the-Art Infrastructure',
    description: 'Our data centers utilize cutting-edge technology and infrastructure to ensure maximum reliability and performance.'
  },
  {
    title: '24/7 Security Monitoring',
    description: 'Round-the-clock security personnel and advanced surveillance systems protect your data.'
  },
  {
    title: 'Redundant Power Systems',
    description: 'Multiple power sources and backup generators ensure uninterrupted operation.'
  },
  {
    title: 'Environmental Controls',
    description: 'Advanced cooling systems and climate control maintain optimal conditions for data storage.'
  },
  {
    title: 'Disaster Recovery',
    description: 'Regular backups and disaster recovery protocols protect against data loss.'
  },
  {
    title: 'Compliance Standards',
    description: 'We adhere to international security standards and compliance requirements.'
  }
]

export default function DataCenter() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold text-gray-900 mb-4"
          >
            Our World-Class Data Center
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Secure, reliable, and scalable infrastructure to protect your valuable documents
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <Image
              src="/server.webp"
              alt="Data Center"
              fill
              className="object-cover"
              priority
            />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-gray-50 p-6 rounded-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="md:col-span-2 text-center mt-4"
            >
              <Link
                href="https://ycis.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
} 