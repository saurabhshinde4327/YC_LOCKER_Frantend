'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getApiUrl } from '../config/api'

// Queue system for registration requests
const registrationQueue = {
  queue: [] as (() => Promise<void>)[],
  processing: false,
  async add(task: () => Promise<void>) {
    this.queue.push(task)
    if (!this.processing) {
      await this.process()
    }
  },
  async process() {
    if (this.queue.length === 0) {
      this.processing = false
      return
    }
    this.processing = true
    const task = this.queue.shift()
    if (task) {
      try {
        await task()
      } catch (error) {
        console.error('Queue processing error:', error)
      }
      // Wait for 1 second before processing next request
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.process()
    }
  }
}

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    department: ''
  })

  const attemptRegistration = async () => {
    try {
      const response = await axios.post(getApiUrl('api/auth/register'), formData)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success('Registration successful!')
      router.push('/dashboard')
      return true
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          if (retryCount < maxRetries) {
            setRetryCount(prev => prev + 1)
            // Exponential backoff: 2^retryCount seconds
            const delay = Math.pow(2, retryCount) * 1000
            toast.loading(`Server busy. Retrying in ${delay/1000} seconds...`, { id: 'retry' })
            await new Promise(resolve => setTimeout(resolve, delay))
            return false
          } else {
            toast.error('Server is currently busy. Please try again in a few minutes.')
          }
        } else {
          toast.error(error.response?.data?.error || 'Registration failed')
        }
      } else {
        toast.error('Registration failed')
      }
      return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRetryCount(0)

    const registrationTask = async () => {
      let success = false
      while (!success && retryCount < maxRetries) {
        success = await attemptRegistration()
      }
      setIsLoading(false)
    }

    await registrationQueue.add(registrationTask)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute top-4 left-4">
        <Link 
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 inline-block text-transparent bg-clip-text">
                Create Account
              </h2>
              <p className="text-gray-600 mt-2">Sign up to start storing your documents</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  id="studentId"
                  name="studentId"
                  required
                  value={formData.studentId}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Enter your student ID"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                >
                  <option className='text-gray-500' value="">Select your department</option>
                  <option className='text-gray-500' value="botany">Botany</option>
                  <option className='text-gray-500' value="chemistry">Chemistry</option>
                  <option className='text-gray-500' value="electronics">Electronics</option>
                  <option className='text-gray-500' value="english">English</option>
                  <option className='text-gray-500' value="mathematics">Mathematics</option>
                  <option className='text-gray-500' value="microbiology">Microbiology</option>
                  <option className='text-gray-500' value="sports">Sports</option>
                  <option className='text-gray-500' value="statistics">Statistics</option>
                  <option className='text-gray-500' value="zoology">Zoology</option>
                  <option className='text-gray-500' value="animation-science">Animation Science</option>
                  <option className='text-gray-500' value="data-science">Data Science</option>
                  <option className='text-gray-500' value="artificial-intelligence">Artificial Intelligence</option>
                  <option className='text-gray-500' value="bvoc-software-development">B.Voc Software Development</option>
                  <option className='text-gray-500' value="bioinformatics">Bioinformatics</option>
                  <option className='text-gray-500' value="computer-application">Computer Application</option>
                  <option className='text-gray-500' value="computer-science-entire">Computer Science (Entire)</option>
                  <option className='text-gray-500' value="computer-science-optional">Computer Science (Optional)</option>
                  <option className='text-gray-500' value="drug-chemistry">Drug Chemistry</option>
                  <option className='text-gray-500' value="food-technology">Food Technology</option>
                  <option className='text-gray-500' value="forensic-science">Forensic Science</option>
                  <option className='text-gray-500' value="nanoscience-and-technology">Nanoscience and Technology</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="Create a password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Account...
                  </div>
                ) : 'Create Account'}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 