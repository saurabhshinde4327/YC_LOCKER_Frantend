'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CollegeInfo() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              About Our Institution
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl"
            >
              <Image
                src="/clgbuilding.jpg"
                alt="YCIS College Building"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-900">
                Yashavantrao Chavan Institute of Science (YCIS), Satara
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Yashavantrao Chavan Institute of Science (YCIS), Satara, established in year 1958, is a government-aided science college affiliated with Karmaveer Bhaurao Patil University,Satara. The institute offers undergraduate and postgraduate programs in various science disciplines, including B.Sc. and M.Sc. degrees in fields like Physics, Chemistry, Botany, Zoology, Microbiology, and Computer Science. Professional courses such as BCS (Bachelor of Computer Science), B.Voc in Software Development, and B.Lib & I.Sc. are also available. YCIS has been accredited with an &apos;A&apos; grade by the National Assessment and Accreditation Council (NAAC) and recognized as a &apos;College with Potential for Excellence&apos; by the University Grants Commission (UGC). The campus is equipped with facilities like a library, laboratories, hostel accommodations, canteen, and ICT-enabled classrooms.
              </p>
              <div className="pt-4">
                <Link 
                  href="https://ycis.ac.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                >
                  Visit College Website
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 