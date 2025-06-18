'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { getApiUrl } from '../config/api'
import Navbar from '../components/Navbar'
import LiveDate from '../components/LiveDate'

interface Document {
  _id: string
  fileName: string
  fileSize: number
  fileType: string
  uploadDate: string
  isFavorite: boolean
}

interface User {
  _id: string;
  name: string;
  storageUsed: number;
  role?: string;
  email?: string;
  phone?: string;
}

export default function Dashboard() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [user, setUser] = useState<User | null>(null)
  const [initialized, setInitialized] = useState(false)

  const fetchDocuments = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      setLoading(true)
      const response = await axios.get(getApiUrl('api/documents'), {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      setDocuments(response.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
        toast.error('Failed to fetch documents')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      
      // First try to get user data from documents endpoint
      const docsResponse = await axios.get(getApiUrl('api/documents'), {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Documents response:', docsResponse.data)
      
      // Calculate total storage from documents if user data isn't provided
      if (!docsResponse.data.user && Array.isArray(docsResponse.data)) {
        const totalStorage = docsResponse.data.reduce((acc: number, doc: Document) => acc + (doc.fileSize || 0), 0)
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        setUser({
          ...currentUser,
          storageUsed: totalStorage
        })
      } else if (docsResponse.data.user) {
        console.log('Setting user data from response:', docsResponse.data.user)
        setUser(docsResponse.data.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Failed to fetch user data')
        }
      }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return

    const file = e.target.files[0]
    console.log('Uploading file:', file.name, 'Size:', file.size, 'bytes')
    
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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      console.log('Upload response:', response.data)
      
      // Update user data if it's included in the response
      if (response.data.user) {
        console.log('Setting user data from upload response:', response.data.user)
        setUser(response.data.user)
      } else {
        // If no user data in response, fetch latest data
        await fetchUserData()
      }
      
      toast.success('File uploaded successfully')
      await fetchDocuments()
    } catch (error) {
      console.error('Upload error:', error)
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Upload failed: ' + (error.response?.data?.message || 'Unknown error'))
        }
      }
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.get(getApiUrl(`api/documents/search?query=${searchQuery}`), {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      setDocuments(response.data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error('Search failed')
      }
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
      const response = await axios.delete(getApiUrl(`api/documents/${id}`), {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      
      // Update user data if it's included in the response
      if (response.data?.user) {
        console.log('Setting user data from delete response:', response.data.user)
        setUser(response.data.user)
      } else {
        // If no user data in response, fetch latest data
        await fetchUserData()
      }

      toast.success('Document deleted')
      await fetchDocuments()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          router.push('/login')
        } else {
          toast.error('Failed to delete document: ' + (error.response?.data?.message || 'Unknown error'))
        }
      }
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      await axios.patch(getApiUrl(`api/documents/${id}/favorite`), {}, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      })
      fetchDocuments()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error('Failed to update favorite status')
      }
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
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error('Failed to view document')
      }
    }
  }

  const handleDownload = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }
      const response = await axios.get(getApiUrl(`api/documents/download/${id}`), {
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      })
      
      const blob = new Blob([response.data], { 
        type: response.headers['content-type'] 
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      const contentDisposition = response.headers['content-disposition']
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : 'document'
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error('Failed to download document')
      }
    }
  }

  // Calculate storage values
  const calculateStorageValues = useCallback(() => {
    const storageUsed = user?.storageUsed || 0
    const storageUsedMB = storageUsed / (1024 * 1024)
    const storagePercentage = (storageUsed / (1024 * 1024 * 1024)) * 100
    
    console.log('Storage calculation:', {
      rawStorage: storageUsed,
      inMB: storageUsedMB,
      percentage: storagePercentage
    })
    
    return {
      usedMB: storageUsedMB.toFixed(2),
      percentage: storagePercentage
    }
  }, [user?.storageUsed])

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LiveDate />
        <Navbar />
      </div>
    )
  }

  const { usedMB, percentage } = calculateStorageValues()
  const storageColor = percentage > 90 ? 'red' : percentage > 70 ? 'yellow' : 'green'

  return (
    <div className="min-h-screen bg-gray-50">
      <LiveDate />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
        </div>
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex-1 w-full sm:w-auto sm:max-w-xs">
              <div className="relative rounded-lg shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search documents..."
                  className="block w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                >
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
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Upload Document
                    </>
                  )}
                </button>

                <div className="bg-white rounded-lg shadow p-4 min-w-[200px]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Storage Used</span>
                    <span className="text-sm font-medium text-gray-900">
                      {usedMB} MB / 1 GB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div 
                      className={`h-2 rounded-full bg-${storageColor}-500`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-12"
            >
              <div className="flex items-center space-x-3 text-blue-600">
                <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="text-lg font-medium">Loading documents...</span>
              </div>
            </motion.div>
          ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow rounded-lg overflow-hidden"
          >
            {/* Desktop View - Table */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {documents.map((doc) => (
                    <motion.tr 
                      key={doc._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {doc.fileType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.round(doc.fileSize / 1024)} KB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                        <button
                          onClick={() => handleView(doc._id)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-150"
                          title="View"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownload(doc._id)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-150"
                          title="Download"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(doc._id)}
                          className={`${doc.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600 transition-colors duration-150`}
                          title={doc.isFavorite ? "Remove from favorites" : "Add to favorites"}
                        >
                          <svg className="w-5 h-5" fill={doc.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-150"
                          title="Delete"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile View - Cards */}
            <div className="block md:hidden">
              <div className="divide-y divide-gray-200">
                {documents.map((doc) => (
                  <motion.div
                    key={doc._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="flex flex-col space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium text-gray-900 break-all pr-4">
                          {doc.fileName}
                        </div>
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                          {doc.fileType}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{Math.round(doc.fileSize / 1024)} KB</span>
                        <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <button
                          onClick={() => handleView(doc._id)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-900 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => handleDownload(doc._id)}
                          className="flex items-center px-3 py-1 text-sm text-green-600 hover:text-green-900 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                        <button
                          onClick={() => handleToggleFavorite(doc._id)}
                          className={`flex items-center px-3 py-1 text-sm ${doc.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600 transition-colors duration-150`}
                        >
                          <svg className="w-4 h-4 mr-1" fill={doc.isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          {doc.isFavorite ? "Starred" : "Star"}
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-900 transition-colors duration-150"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {documents.length === 0 && (
              <div className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center">
                  <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No documents found</p>
                  <p className="text-sm text-gray-400 mt-1">Upload your first document to get started</p>
                </div>
              </div>
            )}
          </motion.div>
          )}
        </AnimatePresence>
        </div>
    </div>
  )
} 