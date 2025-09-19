'use client'

import { useInView } from 'react-intersection-observer'
import LiveDate from './components/LiveDate'
import DocumentTypesSlider from './components/DocumentTypesSlider'
import DataCenter from './components/DataCenter'
import UploadSteps from './components/UploadSteps'
import StatsCounter from './components/StatsCounter'
import DirectorMessage from './components/DirectorMessage'
import Navbar from './components/Navbar'
import CollegeInfo from './components/CollegeInfo'
import FeedbackForm from '@/app/components/FeedbackForm'
import VideoBackground from './components/VideoBackground'
import StudentReview from './components/StudentReview'
import InstallationSection from './components/InstallationSection'

export default function Home() {
  const [heroRef] = useInView({ triggerOnce: true })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <LiveDate />
      <Navbar />

      <main className="flex flex-col">
        <section ref={heroRef}>
          <VideoBackground />
        </section>
        
        <DirectorMessage />
        <DocumentTypesSlider />
        <StatsCounter />
        <UploadSteps />
        <CollegeInfo />
        <DataCenter />
        <StudentReview />
        <InstallationSection />
      </main>

      <div className="mt-8">
        <FeedbackForm />
      </div>

      <footer className="bg-gray-900 text-white mt-auto">
        <div className="container mx-auto px-6 py-12" />
      </footer>
    </div>
  )
}
