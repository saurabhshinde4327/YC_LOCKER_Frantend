'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { getApiUrl } from '../config/api'
import Navbar from '../components/Navbar'
import LiveDate from '../components/LiveDate'
import { FaTachometerAlt, FaUpload, FaFolderOpen, FaIdCard, FaTrash, FaEye, FaStar, FaRegStar, FaCloudUploadAlt, FaDatabase, FaChartPie, FaFilePdf, FaFileImage, FaFileAlt, FaAddressCard, FaCar, FaCertificate, FaCog, FaDownload, FaFileExcel } from 'react-icons/fa'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface Document {
  _id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: string
  isFavorite: boolean
  category?: string
}

interface User {
  _id: string
  name: string
  storageUsed: number
  role?: string
  email?: string
  phone?: string
  studentId?: string
  department?: string
}

type MenuItem = 'status' | 'upload' | 'view' | 'categories' | 'settings'

export default function Dashboard() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [activeMenu, setActiveMenu] = useState<MenuItem>('status')
  const [categoryUploading, setCategoryUploading] = useState<{ [key: string]: boolean }>({})
  const [viewCategory, setViewCategory] = useState<string | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const categories = [
    { key: 'Aadhar Card', label: 'Aadhar Card', icon: <FaIdCard className="text-blue-500" size={32} /> },
    { key: 'PAN Card', label: 'PAN Card', icon: <FaAddressCard className="text-green-500" size={32} /> },
    { key: 'Driving License', label: 'Driving License', icon: <FaCar className="text-yellow-500" size={32} /> },
    { key: 'Leaving Certificate', label: 'Leaving Certificate', icon: <FaFileAlt className="text-indigo-500" size={32} /> },
    { key: '10th Marksheet', label: '10th Marksheet', icon: <FaFilePdf className="text-red-500" size={32} /> },
    { key: '12th Marksheet', label: '12th Marksheet', icon: <FaFilePdf className="text-pink-500" size={32} /> },
    { key: 'Degree Certificate', label: 'Degree Certificate', icon: <FaCertificate className="text-purple-500" size={32} /> },
  ]

  const calculateStorageValues = useCallback(() => {
    const storageUsed = user?.storageUsed || 0
    const storageUsedMB = storageUsed / (1024 * 1024) // Convert bytes to MB
    const storagePercentage = (storageUsed / (1024 * 1024 * 1024)) * 100 // Percentage of 1 GB

    // Ensure percentage doesn't exceed 100
    const clampedPercentage = Math.min(storagePercentage, 100)

    console.log('Storage calculation:', {
      storageUsed,
      storageUsedMB: storageUsedMB.toFixed(2),
      percentage: clampedPercentage,
      user: user?.studentId
    })

    return {
      usedMB: storageUsedMB.toFixed(2),
      percentage: clampedPercentage
    }
  }, [user?.storageUsed, user?.studentId])

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.get(getApiUrl('api/documents'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Handle new response format: { documents, user }
      if (response.data.documents && response.data.user) {
        setDocuments(response.data.documents)
        setUser(response.data.user)
      } else if (Array.isArray(response.data)) {
        // Fallback for old format
        setDocuments(response.data)
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Failed to fetch documents')
        }
      }
    }
  }, [router])

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      // Get user data from documents endpoint which now includes user info
      const response = await axios.get(getApiUrl('api/documents'), {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.data.user) {
        setUser(response.data.user)
        // Update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        // Fallback: get user data from stored localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        if (currentUser._id) {
          setUser(currentUser)
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Failed to fetch user data')
        }
      }
    }
  }, [router])

  // Utility function to refresh user data and storage values
  const refreshUserData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await fetchUserData()
      toast.success('Storage data refreshed successfully')
    } catch  {
      toast.error('Failed to refresh storage data')
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchUserData])

  // Function to completely refresh all data
  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchDocuments(), fetchUserData()])
      toast.success('All data refreshed successfully')
    } catch {
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }, [fetchDocuments, fetchUserData])

  // Function to recalculate storage on backend
  const recalculateStorage = useCallback(async () => {
    setIsRefreshing(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      const response = await axios.post(getApiUrl('api/documents/recalculate-storage'), {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.data.user) {
        setUser(response.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        toast.success('Storage recalculated successfully')
      }
    } catch (error) {
      console.error('Storage recalculation error:', error)
      toast.error('Failed to recalculate storage')
    } finally {
      setIsRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser) {
      router.push('/login')
      return
    }

    try {
      setUser(JSON.parse(storedUser))
      Promise.all([fetchDocuments(), fetchUserData()])
        .finally(() => setInitialized(true))
    } catch {
      router.push('/login')
    }
  }, [router, fetchDocuments, fetchUserData])

  // Debug effect to log storage changes
  useEffect(() => {
    if (user?.storageUsed !== undefined) {
      console.log('User storage updated:', {
        studentId: user.studentId,
        storageUsed: user.storageUsed,
        storageUsedMB: (user.storageUsed / (1024 * 1024)).toFixed(2),
        percentage: ((user.storageUsed / (1024 * 1024 * 1024)) * 100).toFixed(2)
      })
    }
  }, [user?.storageUsed, user?.studentId])



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files[0]
    const formData = new FormData()
    formData.append('file', file)
    setUploading(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.post(getApiUrl('api/documents/upload'), formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Update user data first if returned in response
      if (response.data.user) {
        setUser(response.data.user)
        // Update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else if (response.data.document) {
        // If only document is returned, fetch updated user data
        await refreshUserData()
      } else {
        // Fallback: fetch user data
        await refreshUserData()
      }

      toast.success('File uploaded successfully')
      
      // Fetch documents after user data is updated
      await fetchDocuments()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Upload failed: ' + (error.response?.data?.message || 'Unknown error'))
        }
      } else {
        console.error('Upload error:', error)
        toast.error('Upload failed: Unknown error')
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleCategoryUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    if (!e.target.files?.[0]) return
    const file = e.target.files[0]
    setCategoryUploading((prev) => ({ ...prev, [category]: true }))
    const formData = new FormData()
    formData.append('file', file)
    formData.append('category', category)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.post(getApiUrl('api/documents/upload'), formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      // Update user data if returned in response
      if (response.data.user) {
        setUser(response.data.user)
        // Update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else if (response.data.document) {
        // If only document is returned, fetch updated user data
        await refreshUserData()
      } else {
        // Fallback: fetch user data
        await refreshUserData()
      }

      toast.success(`${category} uploaded successfully`)
      await fetchDocuments()
    } catch (error) {
      console.error(`Failed to upload ${category}:`, error)
      toast.error(`Failed to upload ${category}`)
    } finally {
      setCategoryUploading((prev) => ({ ...prev, [category]: false }))
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      await axios.delete(getApiUrl(`api/documents/${id}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Document deleted')
      await fetchDocuments()
      await refreshUserData()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const handleView = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.get(getApiUrl(`api/documents/view/${id}`), {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error) {
      console.error('View error:', error)
      toast.error('Failed to view document')
    }
  }

  const handleDownload = async (id: string, fileName: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.get(getApiUrl(`api/documents/download/${id}`), {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      })
      const blob = new Blob([response.data], { type: response.headers['content-type'] })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Document downloaded successfully')
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download document')
    }
  }

  const handleToggleImportant = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      await axios.patch(getApiUrl(`api/documents/${id}/favorite`), {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      await fetchDocuments()
    } catch {
      toast.error('Failed to update important status')
    }
  }

  const handleResetPassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both current and new password fields')
      return
    }

    setIsResettingPassword(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      await axios.post(getApiUrl('api/users/reset-password'), {
        currentPassword,
        newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Password reset successfully')
      setCurrentPassword('')
      setNewPassword('')
    } catch (error) {
      console.error('Password reset error:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Password reset failed: ' + (error.response?.data?.error || error.response?.data?.message || 'Unknown error'))
        }
      } else {
        toast.error('Password reset failed: Unknown error')
      }
    } finally {
      setIsResettingPassword(false)
    }
  }

  const handleMenuChange = (menu: MenuItem) => {
    setActiveMenu(menu)
    if (menu !== 'view') {
      setSearchQuery('')
    }
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LiveDate />
        <Navbar />
      </div>
    )
  }

  const { usedMB, percentage } = calculateStorageValues()

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveDate />
      <Navbar />
      
      {/* Mobile Top Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex justify-around py-2 shadow-lg">
        <button onClick={() => handleMenuChange('status')} className={`flex flex-col items-center text-xs ${activeMenu === 'status' ? 'text-blue-600' : 'text-gray-500'}`}><FaTachometerAlt size={22} /><span>Status</span></button>
        <button onClick={() => handleMenuChange('upload')} className={`flex flex-col items-center text-xs ${activeMenu === 'upload' ? 'text-blue-600' : 'text-gray-500'}`}><FaUpload size={22} /><span>Upload</span></button>
        <button onClick={() => handleMenuChange('view')} className={`flex flex-col items-center text-xs ${activeMenu === 'view' ? 'text-blue-600' : 'text-gray-500'}`}><FaFolderOpen size={22} /><span>View</span></button>
        <button onClick={() => handleMenuChange('categories')} className={`flex flex-col items-center text-xs ${activeMenu === 'categories' ? 'text-blue-600' : 'text-gray-500'}`}><FaIdCard size={22} /><span>Categories</span></button>
        <button onClick={() => handleMenuChange('settings')} className={`flex flex-col items-center text-xs ${activeMenu === 'settings' ? 'text-blue-600' : 'text-gray-500'}`}><FaCog size={22} /><span>Settings</span></button>
      </div>
      <div className="flex pt-0 md:pt-0">
        {/* Sidebar for desktop */}
        <div className="hidden md:flex w-64 bg-white shadow-lg flex-col h-screen">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Panel</h1>
            {user && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600 mb-1">Welcome back,</p>
                <p className="text-lg font-semibold text-blue-700">{user.name}</p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
            )}
            <nav className="space-y-2">
              <button onClick={() => handleMenuChange('status')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${activeMenu === 'status' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><FaTachometerAlt className="w-5 h-5 mr-3" /> Status Overview</button>
              <button onClick={() => handleMenuChange('upload')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${activeMenu === 'upload' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><FaUpload className="w-5 h-5 mr-3" /> Upload Documents</button>
              <button onClick={() => handleMenuChange('view')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${activeMenu === 'view' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><FaFolderOpen className="w-5 h-5 mr-3" /> View Documents</button>
              <button onClick={() => handleMenuChange('categories')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${activeMenu === 'categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><FaIdCard className="w-5 h-5 mr-3" /> Categories</button>
              <button onClick={() => handleMenuChange('settings')} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${activeMenu === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}><FaCog className="w-5 h-5 mr-3" /> Settings</button>
            </nav>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto pb-16 md:pb-0">
          {/* Welcome Banner */}
          {user && (
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white py-6 px-4 sm:px-6 lg:px-8">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row items-center justify-between">
                  <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                      Welcome back, {user.name}! 👋
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base">
                      Manage your documents and track your storage usage
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{documents.length}</div>
                      <div className="text-xs text-blue-200">Documents</div>
                    </div>
                    <div className="text-center" key={`storage-${user?.storageUsed}`}>
                      <div className="text-2xl font-bold">{usedMB} MB</div>
                      <div className="text-xs text-blue-200">Used</div>
                    </div>
                    <div className="text-center" key={`percentage-${user?.storageUsed}`}>
                      <div className="text-2xl font-bold">{Math.round(percentage)}%</div>
                      <div className="text-xs text-blue-200">Full</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-w-5xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
            {activeMenu === 'status' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center"><FaTachometerAlt className="mr-2 text-blue-600" /> Status Overview</h2>
                  <div className="flex gap-2">
                    <button 
                      onClick={recalculateStorage}
                      disabled={isRefreshing}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRefreshing ? (
                        <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      )}
                      {isRefreshing ? 'Recalculating...' : 'Recalculate'}
                    </button>
                    <button 
                      onClick={refreshAllData}
                      disabled={isRefreshing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRefreshing ? (
                        <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      )}
                      {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center border-t-4 border-blue-500">
                    <FaFolderOpen className="text-blue-500 mb-2" size={32} />
                    <span className="text-sm text-gray-600 mb-1">Total Documents</span>
                    <span className="text-3xl font-bold text-blue-700">{documents.length}</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center border-t-4 border-green-500" key={`storage-card-${user?.storageUsed}`}>
                    <FaDatabase className="text-green-500 mb-2" size={32} />
                    <span className="text-sm text-gray-600 mb-1">Storage Used</span>
                    <span className="text-3xl font-bold text-green-700">{usedMB} MB</span>
                    <span className="text-xs text-gray-400 mt-1">of 1024 MB (1 GB)</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center border-t-4 border-yellow-500" key={`usage-card-${user?.storageUsed}`}>
                    <FaChartPie className="text-yellow-500 mb-2" size={32} />
                    <span className="text-sm text-gray-600 mb-1">Storage Usage</span>
                    <div className="w-20 h-20 my-2">
                      <CircularProgressbar
                        value={percentage}
                        maxValue={100}
                        text={`${Math.round(percentage)}%`}
                        styles={buildStyles({
                          pathColor: percentage > 90 ? '#ef4444' : percentage > 70 ? '#facc15' : '#22c55e',
                          textColor: '#334155',
                          trailColor: '#e5e7eb',
                          backgroundColor: '#fff',
                        })}
                      />
                    </div>
                    <span className="text-xs text-gray-400">1 GB Limit</span>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center border-t-4 border-indigo-500" key={`free-space-card-${user?.storageUsed}`}>
                    <FaDatabase className="text-indigo-500 mb-2" size={32} />
                    <span className="text-sm text-gray-600 mb-1">Free Space</span>
                    <span className="text-3xl font-bold text-indigo-700">{(1024 - parseFloat(usedMB)).toFixed(2)} MB</span>
                    <span className="text-xs text-gray-400 mt-1">remaining</span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 mt-8">
                  <div className="w-40 h-40" key={`large-progress-${user?.storageUsed}`}>
                    <CircularProgressbar
                      value={percentage}
                      maxValue={100}
                      text={`${usedMB} MB`}
                      styles={buildStyles({
                        pathColor: percentage > 90 ? '#ef4444' : percentage > 70 ? '#facc15' : '#22c55e',
                        textColor: '#334155',
                        trailColor: '#e5e7eb',
                        backgroundColor: '#fff',
                      })}
                    />
                  </div>
                  <div className="text-center md:text-left" key={`storage-text-${user?.storageUsed}`}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Storage Usage</h3>
                    <p className="text-gray-600 mb-1">You have used <span className="font-bold text-blue-700">{usedMB} MB</span> out of <span className="font-bold text-green-700">1024 MB (1 GB)</span>.</p>
                    <p className="text-gray-500">{(1024 - parseFloat(usedMB)).toFixed(2)} MB free space remaining.</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 mt-4">
                      <div
                        className={`h-3 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{Math.round(percentage)}% of your storage is used</span>
                  </div>
                </div>
              </div>
            )}
            {activeMenu === 'upload' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Documents</h2>
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center w-full max-w-md border border-blue-100">
                    <FaCloudUploadAlt className="text-blue-500 mb-4" size={48} />
                    <p className="text-gray-700 mb-2 font-medium">Drag & drop your file here, or</p>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx" id="file-upload-input" />
                    <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 mb-2">
                      {uploading ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload className="w-5 h-5 mr-2" />
                          Upload Document
                        </>
                      )}
                    </button>
                    <span className="text-xs text-gray-400 mb-2">Accepted: PDF, PNG, JPG, JPEG, Excel (.xls, .xlsx), Word (.doc, .docx) (max 10MB)</span>
                    <div className="w-full mt-4">
                      <div className="bg-gray-100 rounded-lg h-2 overflow-hidden">
                        {uploading && <div className="bg-blue-400 h-2 animate-pulse w-full" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeMenu === 'view' && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center mb-4 sm:mb-0">
                    <FaFolderOpen className="mr-2 text-blue-600" /> View Documents
                  </h2>
                  <div className="relative w-full sm:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search documents..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
                {documents.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg font-medium">No documents found</p>
                      <p className="text-sm text-gray-400 mt-1">Upload your first document to get started</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const filteredDocuments = documents.filter(doc => {
                        const cleanFileName = doc.fileName.replace(/^\d+_/, '')
                        return cleanFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               doc.fileType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               doc.category?.toLowerCase().includes(searchQuery.toLowerCase())
                      })

                      if (filteredDocuments.length === 0 && searchQuery) {
                        return (
                          <div className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              <p className="text-lg font-medium">No documents found</p>
                              <p className="text-sm text-gray-400 mt-1">Try adjusting your search terms</p>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div>
                          {searchQuery && (
                            <div className="mb-4 text-sm text-gray-600">
                              Found {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} 
                              {searchQuery && ` for "${searchQuery}"`}
                            </div>
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredDocuments.map((doc) => {
                              let fileIcon = <FaFileAlt className="text-gray-400" size={36} />
                              if (doc.fileType?.toLowerCase().includes('pdf')) fileIcon = <FaFilePdf className="text-red-500" size={36} />
                              else if (doc.fileType?.toLowerCase().includes('image') || doc.fileType?.toLowerCase().includes('jpg') || doc.fileType?.toLowerCase().includes('jpeg') || doc.fileType?.toLowerCase().includes('png')) fileIcon = <FaFileImage className="text-yellow-500" size={36} />
                              else if (doc.fileType?.toLowerCase().includes('xls') || doc.fileType?.toLowerCase().includes('xlsx')) fileIcon = <FaFileExcel className="text-green-500" size={36} />
                              const cleanFileName = doc.fileName.replace(/^\d+_/, '')

                              return (
                                <div key={doc._id} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center transition-transform transform hover:-translate-y-1 hover:shadow-2xl border-t-4 border-blue-100 relative group">
                                  <div className="absolute top-4 right-4 flex space-x-2">
                                    <button onClick={() => handleView(doc._id)} className="text-blue-600 hover:text-blue-900 transition-colors duration-150" title="View"><FaEye size={18} /></button>
                                    <button onClick={() => handleToggleImportant(doc._id)} className={doc.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-600'} title={doc.isFavorite ? 'Unmark Important' : 'Mark Important'}>{doc.isFavorite ? <FaStar size={18} /> : <FaRegStar size={18} />}</button>
                                    <button onClick={() => handleDownload(doc._id, cleanFileName)} className="text-green-600 hover:text-green-900 transition-colors duration-150" title="Download"><FaDownload size={18} /></button>
                                    <button onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete"><FaTrash size={18} /></button>
                                  </div>
                                  <div className="mb-4 mt-2">{fileIcon}</div>
                                  <div className="flex items-center mb-2">
                                    <span className="font-semibold text-gray-900 text-lg text-center break-all max-w-[160px]">{cleanFileName}</span>
                                    {doc.isFavorite && <span className="ml-2 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">Important</span>}
                                  </div>
                                  <div className="flex flex-col items-center text-xs text-gray-500 mb-2">
                                    <span className="mb-1"><span className="font-medium text-blue-700">{doc.fileType}</span></span>
                                    <span>{Math.round(doc.fileSize / 1024)} KB</span>
                                    <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            )}
            {activeMenu === 'categories' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><FaIdCard className="mr-2 text-blue-600" /> Upload & View by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {categories.map(cat => (
                    <div key={cat.key} className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center border-t-4 border-blue-100 relative group transition-transform hover:-translate-y-1 hover:shadow-2xl">
                      <div className="mb-3">{cat.icon}</div>
                      <div className="font-semibold text-gray-900 text-lg mb-2 text-center">{cat.label}</div>
                      <input type="file" id={`upload-${cat.key}`} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.xls,.xlsx,.doc,.docx" onChange={e => handleCategoryUpload(e, cat.key)} />
                      <button onClick={() => document.getElementById(`upload-${cat.key}`)?.click()} disabled={categoryUploading[cat.key]} className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 mb-2">
                        {categoryUploading[cat.key] ? 'Uploading...' : (
                          <>
                            <FaUpload className="w-4 h-4 mr-2" />
                            Upload
                          </>
                        )}
                      </button>
                      <button onClick={() => setViewCategory(cat.key)} className="inline-flex items-center px-4 py-2 border border-blue-200 rounded-lg shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-200 transition-colors duration-200">
                        <FaEye className="w-4 h-4 mr-2" />
                        View
                      </button>
                    </div>
                  ))}
                </div>
                {viewCategory && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative">
                      <button onClick={() => setViewCategory(null)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold">&times;</button>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{viewCategory} Documents</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {documents.filter(doc => doc.category === viewCategory).length === 0 ? (
                          <div className="col-span-2 text-center text-gray-400">No documents uploaded for this category.</div>
                        ) : (
                          documents.filter(doc => doc.category === viewCategory).map(doc => {
                            let fileIcon = <FaFileAlt className="text-gray-400" size={28} />
                            if (doc.fileType?.toLowerCase().includes('pdf')) fileIcon = <FaFilePdf className="text-red-500" size={28} />
                            else if (doc.fileType?.toLowerCase().includes('image') || doc.fileType?.toLowerCase().includes('jpg') || doc.fileType?.toLowerCase().includes('jpeg') || doc.fileType?.toLowerCase().includes('png')) fileIcon = <FaFileImage className="text-yellow-500" size={28} />
                            else if (doc.fileType?.toLowerCase().includes('xls') || doc.fileType?.toLowerCase().includes('xlsx')) fileIcon = <FaFileExcel className="text-green-500" size={28} />
                            const cleanFileName = doc.fileName.replace(/^\d+_/, '')

                            return (
                              <div key={doc._id} className="bg-blue-50 rounded-xl p-4 flex flex-col items-center shadow group">
                                <div className="mb-2">{fileIcon}</div>
                                <div className="font-medium text-gray-900 text-center break-all max-w-[120px]">{cleanFileName}</div>
                                <div className="text-xs text-gray-500 mb-1">{doc.fileType}</div>
                                <div className="text-xs text-gray-500 mb-1">{Math.round(doc.fileSize / 1024)} KB</div>
                                <div className="text-xs text-gray-400 mb-2">{new Date(doc.uploadDate).toLocaleDateString()}</div>
                                <div className="flex space-x-2">
                                  <button onClick={() => handleView(doc._id)} className="text-blue-600 hover:text-blue-900 transition-colors duration-150" title="View"><FaEye size={16} /></button>
                                  <button onClick={() => handleToggleImportant(doc._id)} className={doc.isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-400 hover:text-yellow-600'} title={doc.isFavorite ? 'Unmark Important' : 'Mark Important'}>{doc.isFavorite ? <FaStar size={16} /> : <FaRegStar size={16} />}</button>
                                  <button onClick={() => handleDownload(doc._id, cleanFileName)} className="text-green-600 hover:text-green-900 transition-colors duration-150" title="Download"><FaDownload size={16} /></button>
                                  <button onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-900 transition-colors duration-150" title="Delete"><FaTrash size={16} /></button>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeMenu === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center"><FaCog className="mr-2 text-blue-600" /> Settings</h2>
                
                {/* User Profile Section */}
                {user && (
                  <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                    <div className="flex items-center mb-6">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 mr-4">
                        <FaIdCard className="text-white text-2xl" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600">Student ID: {user.studentId}</p>
                        {user.department && (
                          <p className="text-gray-600">Department: {user.department.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Contact Information</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600"><span className="font-medium">Email:</span> {user.email || 'N/A'}</p>
                          <p className="text-sm text-gray-600"><span className="font-medium">Phone:</span> {user.phone || 'N/A'}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-3">Account Status</h4>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600"><span className="font-medium">Role:</span> <span className="capitalize">{user.role || 'student'}</span></p>
                          <p className="text-sm text-gray-600"><span className="font-medium">Storage Used:</span> {usedMB} MB / 1024 MB</p>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${percentage > 90 ? 'bg-red-500' : percentage > 70 ? 'bg-yellow-400' : 'bg-green-500'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400">{Math.round(percentage)}% of storage used</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Reset Password</h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">Current Password</label>
                      <input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">New Password</label>
                      <input
                        id="new-password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Enter new password"
                      />
                    </div>
                    <button
                      onClick={handleResetPassword}
                      disabled={isResettingPassword}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isResettingPassword ? (
                        <>
                          <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
