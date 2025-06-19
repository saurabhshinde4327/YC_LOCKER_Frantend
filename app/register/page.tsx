'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getApiUrl } from '../config/api'

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
      await new Promise(resolve => setTimeout(resolve, 1000))
      await this.process()
    }
  }
}

export default function Register() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [otp, setOtp] = useState('')
  const maxRetries = 3

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    password: '',
    department: ''
  })

  const initiateRegistration = async (): Promise<boolean> => {
    try {
      await axios.post(getApiUrl('api/auth/register/initiate'), formData)
      toast.success('OTP sent to your email!')
      setStep('otp')
      return true
    } catch (error) {
      toast.error('Failed to send OTP.')
      return false
    }
  }

  const verifyOtpAndRegister = async (): Promise<boolean> => {
    try {
      const response = await axios.post(getApiUrl('api/auth/register/verify'), {
        ...formData,
        otp
      })
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      toast.success('Registration successful!')
      router.push('/dashboard')
      return true
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'OTP verification failed')
      }
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setRetryCount(0)

    const task = async () => {
      let success = false
      while (!success && retryCount < maxRetries) {
        success = await initiateRegistration()
      }
      setIsLoading(false)
    }

    await registrationQueue.add(task)
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const success = await verifyOtpAndRegister()
    if (!success) setIsLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="absolute top-4 left-4">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </Link>
      </div>

      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
                {step === 'form' ? 'Create Account' : 'Verify OTP'}
              </h2>
              <p className="text-gray-600 mt-2">
                {step === 'form' ? 'Sign up to start storing your documents' : 'Enter the OTP sent to your email'}
              </p>
            </div>

            {step === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border" />
                <input type="tel" name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border" />
                <input type="text" name="studentId" placeholder="Student ID" value={formData.studentId} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border" />
                <input type="text" name="department" placeholder="Department" value={formData.department} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border" />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-3 rounded-xl border" />

                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  {isLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">OTP</label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the OTP"
                    required
                  />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
                  {isLoading ? 'Verifying...' : 'Verify & Register'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <p className="mt-4 text-center text-sm text-gray-500">
                Didn't get the code?{' '}
                <button
                  type="button"
                  className="text-blue-600 font-medium hover:text-blue-700"
                  onClick={() => {
                    setRetryCount(0)
                    setIsLoading(true)
                    registrationQueue.add(async () => {
                      await initiateRegistration()
                      setIsLoading(false)
                    })
                  }}
                >
                  Resend OTP
                </button>
              </p>
            )}

            {step === 'form' && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                    Sign in here
                  </Link>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
