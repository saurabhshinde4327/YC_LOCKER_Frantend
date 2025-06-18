'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function DirectorMessage() {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Director&apos;s Message
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:col-span-1 flex flex-col items-center"
            >
              <div className="relative w-64 h-80 mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl"></div>
                <div className="absolute inset-4 shadow-2xl rounded-lg overflow-hidden">
                  <Image
                    src="/director.jpg"
                    alt="Dr. B.T. Jadhav"
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, 256px"
                    priority
                  />
                </div>
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-xl font-semibold text-gray-900">Dr. B.T. Jadhav</h3>
                <p className="text-gray-600 font-medium">Principal / Director</p>
                <p className="text-gray-600 text-sm">Yashavantrao Chavan Institute of Science, Satara</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="md:col-span-2 space-y-6"
            >
              <p className="text-gray-600 leading-relaxed">
               I am pleased to announce the launch of our new Student Document Storage Web Application at Yashavantrao Chavan Institute of Science, Satara. This initiative aims to provide a secure and centralized platform for you to store and manage your academic documents, including mark sheets, certificates, and other essential records.
              </p>
              <p className="text-gray-600 leading-relaxed">
              This digital solution is part of our ongoing commitment to integrating technology into our educational framework, enhancing accessibility, and promoting sustainability by reducing paper usage. The application is designed to be user-friendly, ensuring that you can easily upload, access, and retrieve your documents whenever needed.
              </p>
              <p className="text-gray-600 leading-relaxed">
                I encourage all students to utilize this platform to safeguard your academic records and streamline your document management process. Should you require any assistance or have suggestions for improvement, please do not hesitate to reach out to our IT support team.
              </p>
               <p className="text-gray-600 leading-relaxed">
                Let us embrace this advancement as a step toward a more efficient and digitally empowered academic environment.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 