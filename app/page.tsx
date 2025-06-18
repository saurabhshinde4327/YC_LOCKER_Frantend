'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import LiveDate from './components/LiveDate'
// import ImageSlider from './components/ImageSlider'
import DocumentTypesSlider from './components/DocumentTypesSlider'
import DataCenter from './components/DataCenter'
import UploadSteps from './components/UploadSteps'
import StatsCounter from './components/StatsCounter'
import DirectorMessage from './components/DirectorMessage'
import Navbar from './components/Navbar'
import CollegeInfo from './components/CollegeInfo'
import FeedbackForm from '@/app/components/FeedbackForm'
import VideoBackground from './components/VideoBackground'

export default function Home() {
  const [heroRef] = useInView({ triggerOnce: true })
  const [ctaRef, ctaInView] = useInView({ triggerOnce: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <LiveDate />
      <Navbar />

      <main className="flex flex-col">
        <section ref={heroRef}>
          <VideoBackground />
          {/* <ImageSlider /> */}
        </section>

        <DirectorMessage />
        
        <DocumentTypesSlider />
        
        <StatsCounter />
        
        <UploadSteps />
        
        <CollegeInfo />
        
        <DataCenter />

        <section ref={ctaRef} className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={ctaInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6"
          >
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 mix-blend-multiply" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              </div>
              <div className="relative text-center py-16 px-6">
                <h2 className="text-3xl font-bold text-white mb-8">
                  Ready to Get Started?
                </h2>
                <Link 
                  href="/register" 
                  className="inline-flex items-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-full hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 group"
                >
                  Create Your Account
                  <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <div className="mt-8">
        <FeedbackForm />
      </div>
      
      {/* AI Chatbot Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open AI Chatbot"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </motion.button>
      </div>

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-6 py-12">
        </div>
      </footer>
    </div>
  )
}