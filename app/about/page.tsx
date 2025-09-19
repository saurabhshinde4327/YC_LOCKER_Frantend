'use client'

import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import Link from 'next/link'
import Navbar from '../components/Navbar'
import LiveDate from '../components/LiveDate'
import { FaShieldAlt, FaCloudUploadAlt, FaMobileAlt, FaUsers, FaLock, FaDatabase, FaChartLine, FaGlobe, FaGraduationCap, FaUniversity, FaBook, FaCertificate } from 'react-icons/fa'

export default function About() {
  const [heroRef, heroInView] = useInView({ triggerOnce: true })
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true })
  const [importanceRef, importanceInView] = useInView({ triggerOnce: true })
  const [statsRef, statsInView] = useInView({ triggerOnce: true })

  const features = [
    {
      icon: <FaShieldAlt className="text-blue-500" size={32} />,
      title: "Secure Document Storage",
      description: "Military-grade encryption ensures your documents are protected with the highest security standards."
    },
    {
      icon: <FaCloudUploadAlt className="text-green-500" size={32} />,
      title: "Easy File Upload",
      description: "Drag and drop or click to upload documents in multiple formats including PDF, Excel, Word, and images."
    },
    {
      icon: <FaMobileAlt className="text-purple-500" size={32} />,
      title: "Mobile Responsive",
      description: "Access your documents from any device - desktop, tablet, or smartphone with our responsive design."
    },
    {
      icon: <FaUsers className="text-orange-500" size={32} />,
      title: "Multi-User Support",
      description: "Support for all departments and students with individual accounts and storage management."
    },
    {
      icon: <FaLock className="text-red-500" size={32} />,
      title: "Access Control",
      description: "Role-based access control ensures only authorized users can access specific documents and features."
    },
    {
      icon: <FaDatabase className="text-indigo-500" size={32} />,
      title: "Data Backup",
      description: "Automatic backup systems ensure your documents are never lost with redundant storage solutions."
    }
  ]

  const importancePoints = [
    {
      icon: <FaGraduationCap className="text-blue-600" size={24} />,
      title: "Academic Excellence",
      description: "Streamlines document management for students and faculty, enabling better focus on academic pursuits."
    },
    {
      icon: <FaUniversity className="text-green-600" size={24} />,
      title: "Institutional Efficiency",
      description: "Reduces administrative overhead and improves institutional workflow management."
    },
    {
      icon: <FaBook className="text-purple-600" size={24} />,
      title: "Digital Transformation",
      description: "Modernizes traditional paper-based processes with cutting-edge digital solutions."
    },
    {
      icon: <FaCertificate className="text-orange-600" size={24} />,
      title: "Compliance & Security",
      description: "Ensures compliance with data protection regulations while maintaining document integrity."
    }
  ]

  const stats = [
    { number: "1000+", label: "Students Supported", icon: <FaUsers className="text-blue-500" size={24} /> },
    { number: "28", label: "Departments", icon: <FaUniversity className="text-green-500" size={24} /> },
    { number: "99.9%", label: "Uptime", icon: <FaChartLine className="text-purple-500" size={24} /> },
    { number: "24/7", label: "Access", icon: <FaGlobe className="text-orange-500" size={24} /> }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <LiveDate />
      <Navbar />

      <main className="flex flex-col">
        {/* Hero Section */}
        <section ref={heroRef} className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              About YCIS Locker
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-8">
              A comprehensive digital document management system designed specifically for Yashavantrao Chavan Institute of Science, 
              providing secure, efficient, and modern document storage solutions for students and faculty.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Access Dashboard
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section ref={featuresRef} className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose YCIS Locker?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our platform offers cutting-edge features designed to meet the unique needs of educational institutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-blue-500"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Importance Section */}
        <section ref={importanceRef} className="py-20 bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={importanceInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Importance of YCIS Locker
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Understanding why digital document management is crucial for modern educational institutions
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {importancePoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={importanceInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">{point.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{point.title}</h3>
                      <p className="text-gray-600">{point.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Platform Statistics
              </h2>
              <p className="text-xl text-gray-600">
                Trusted by the YCIS community for secure document management
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={statsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-4">{stat.icon}</div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="container mx-auto px-6 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Experience the Future of Document Management?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and faculty who trust YCIS Locker for their document storage needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  )
}
