'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion} from 'framer-motion'
import { getApiUrl} from '../../config/api'

interface User {
  _id: string
  name: string
  email: string
  phone: string
  studentId: string
  storageUsed: number
  role: string
  department: string
}

interface NewUserForm {
  name: string
  email: string
  phone: string
  studentId: string
  department: string
}

type MenuItem = 'status' | 'add-student' | 'add-single-user' | 'view-students' | 'settings'

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalStorageUsed, setTotalStorageUsed] = useState(0)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [activeMenu, setActiveMenu] = useState<MenuItem>('status')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [backupStatus, setBackupStatus] = useState<string | null>(null)
  const [backupFileUrl, setBackupFileUrl] = useState<string | null>(null)
  const [resetEmail, setResetEmail] = useState('')
  const [resettingPassword, setResettingPassword] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // New user form state
  const [newUserForm, setNewUserForm] = useState<NewUserForm>({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    department: ''
  })
  const [creatingUser, setCreatingUser] = useState(false)

  // Debug: Log API base URL
  console.log('API_BASE_URL:', process.env.NEXT_PUBLIC_API_BASE_URL)
  console.log('getApiUrl test:', getApiUrl('api/admin/test'))

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/admin')
        return
      }

      const usersResponse = await axios.get(getApiUrl('api/admin/users'), {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(usersResponse.data)
      setFilteredUsers(usersResponse.data)
      
      // Calculate total storage used
      const total = usersResponse.data.reduce((acc: number, user: User) => acc + (user.storageUsed || 0), 0)
      setTotalStorageUsed(total)
    } catch (error) {
      toast.error('Failed to fetch data')
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push('/admin')
      }
    } finally {
      setLoading(false)
    }
  }, [router])

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    setDeletingUserId(userId)
    try {
      const token = localStorage.getItem('token')
      await axios.delete(getApiUrl(`api/admin/users/${userId}`), {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success('User deleted successfully')
      fetchData()
    } catch {
      toast.error('Failed to delete user')
    } finally {
      setDeletingUserId(null)
    }
  }

  const handleCreateSingleUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newUserForm.name || !newUserForm.email || !newUserForm.phone || !newUserForm.studentId || !newUserForm.department) {
      toast.error('Please fill in all fields')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newUserForm.email)) {
      toast.error('Please enter a valid email address')
      return
    }

    if (newUserForm.phone.length < 10) {
      toast.error('Please enter a valid phone number')
      return
    }

    setCreatingUser(true)
    try {
      const token = localStorage.getItem('token')
      console.log('🔍 Creating user with data:', newUserForm)
      console.log('🔍 API URL:', getApiUrl('api/admin/users'))
      console.log('🔍 Token:', token ? 'Present' : 'Missing')
      
      const response = await axios.post(getApiUrl('api/admin/users'), newUserForm, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      console.log('✅ User created successfully:', response.data)
      toast.success('User created successfully')
      setNewUserForm({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        department: ''
      })
      fetchData()
    } catch (error) {
      console.error('❌ Error creating user:', error)
      if (axios.isAxiosError(error)) {
        console.error('❌ Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        toast.error(error.response?.data?.error || 'Failed to create user')
      } else {
        toast.error('Failed to create user')
      }
    } finally {
      setCreatingUser(false)
    }
  }

  const handleInputChange = (field: keyof NewUserForm, value: string) => {
    setNewUserForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first')
      return
    }

    setUploadingFile(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('file', selectedFile)

      await axios.post(getApiUrl('api/admin/upload-students'), formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Students uploaded successfully')
      setSelectedFile(null)
      fetchData()
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to upload students')
      } else {
        toast.error('Failed to upload students')
      }
    } finally {
      setUploadingFile(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/pdf', 'text/csv']
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file)
      } else {
        toast.error('Please select a valid Excel, PDF, or CSV file')
      }
    }
  }

  const handleBackup = async () => {
    setBackupStatus('Creating backup...')
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(getApiUrl('api/admin/backup-db'), {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      if (data.backupFileUrl) {
        setBackupFileUrl(data.backupFileUrl)
        setBackupStatus('Backup created successfully!')
        toast.success('Backup created successfully')
      } else {
        setBackupStatus('Backup created but download link not available')
        toast.error('Backup created but download link not available')
      }
    } catch {
      setBackupStatus('Failed to create backup')
      toast.error('Failed to create backup')
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) {
      toast.error('Please enter an email address')
      return
    }

    setResettingPassword(true)
    try {
      const token = localStorage.getItem('token')
      const { data } = await axios.post(getApiUrl('api/admin/reset-password'), { email: resetEmail }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      toast.success(data.message || 'Password reset successfully')
      setResetEmail('')
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to reset password')
      } else {
        toast.error('Failed to reset password')
      }
    } finally {
      setResettingPassword(false)
    }
  }

  useEffect(() => {
    fetchData()
    const intervalId = setInterval(fetchData, 30000)
    return () => clearInterval(intervalId)
  }, [fetchData])

  // Filter users based on search and department
  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery) ||
        user.studentId.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedDepartment) {
      filtered = filtered.filter(user => user.department === selectedDepartment)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, selectedDepartment])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin')
  }

  const totalStudents = users.length
  const storagePercentage = (totalStorageUsed / (500 * 1024 * 1024 * 1024)) * 100
  const departmentStats = users.reduce((acc, user) => {
    acc[user.department] = (acc[user.department] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:transition-none`}>
          <div className="p-6">
            <div className="lg:hidden flex items-center justify-between mb-6">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => {
                  setActiveMenu('status')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeMenu === 'status'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Status Overview
              </button>
              
              <button
                onClick={() => {
                  setActiveMenu('add-student')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeMenu === 'add-student'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Bulk Upload
              </button>

              <button
                onClick={() => {
                  setActiveMenu('add-single-user')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeMenu === 'add-single-user'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Add Single User
              </button>
               
              <button
                onClick={() => {
                  setActiveMenu('view-students')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeMenu === 'view-students'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                View Students
              </button>

              <button
                onClick={() => {
                  setActiveMenu('settings')
                  setIsSidebarOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activeMenu === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </button>
            </nav>
          </div>
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {activeMenu === 'status' && 'Status Overview'}
                  {activeMenu === 'add-student' && 'Bulk Upload Students'}
                  {activeMenu === 'add-single-user' && 'Add Single User'}
                  {activeMenu === 'view-students' && 'View Students'}
                  {activeMenu === 'settings' && 'Settings'}
                </h1>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </header>
          
          <main className="p-4 lg:p-8">
            {/* Mobile Page Title */}
            <div className="lg:hidden mb-6">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeMenu === 'status' && 'Status Overview'}
                {activeMenu === 'add-student' && 'Bulk Upload Students'}
                {activeMenu === 'add-single-user' && 'Add Single User'}
                {activeMenu === 'view-students' && 'View Students'}
                {activeMenu === 'settings' && 'Settings'}
              </h1>
            </div>

            {activeMenu === 'status' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Dashboard Statistics</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                      <div className="p-2 lg:p-3 bg-blue-100 rounded-lg">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-600">Total Students</p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">{totalStudents}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                      <div className="p-2 lg:p-3 bg-green-100 rounded-lg">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                        </svg>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-600">Storage Used</p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">
                          {Math.round(totalStorageUsed / (1024 * 1024 * 1024) * 100) / 100} GB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                      <div className="p-2 lg:p-3 bg-yellow-100 rounded-lg">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-600">Storage %</p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">{Math.round(storagePercentage)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                    <div className="flex items-center">
                      <div className="p-2 lg:p-3 bg-purple-100 rounded-lg">
                        <svg className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="ml-3 lg:ml-4">
                        <p className="text-xs lg:text-sm font-medium text-gray-600">Departments</p>
                        <p className="text-lg lg:text-2xl font-bold text-gray-900">{Object.keys(departmentStats).length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md mb-6 lg:mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Usage Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs lg:text-sm font-medium text-gray-700">Total Storage Used</span>
                      <span className="text-xs lg:text-sm text-gray-500">
                        {Math.round(totalStorageUsed / (1024 * 1024 * 1024) * 100) / 100} / 500 GB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <motion.div 
                        className={`h-4 rounded-full ${
                          storagePercentage > 90
                            ? 'bg-red-500'
                            : storagePercentage > 70
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(storagePercentage, 100)}%` }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0 GB</span>
                      <span>250 GB</span>
                      <span>500 GB</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md mb-6 lg:mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Distribution</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(departmentStats).map(([dept, count]) => (
                      <div key={dept} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-xs lg:text-sm font-medium text-gray-700">
                          {dept.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="text-xs lg:text-sm font-bold text-blue-600">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-4 lg:p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm text-gray-600">System is running normally</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm text-gray-600">{totalStudents} students currently registered</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span className="text-xs lg:text-sm text-gray-600">Storage usage at {Math.round(storagePercentage)}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeMenu === 'add-student' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Bulk Upload Student Data</h2>
                
                <div className="bg-white p-4 lg:p-8 rounded-lg shadow-md">
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Student Data</h3>
                    <p className="text-gray-600 mb-6">
                      Upload an Excel file (.xlsx), PDF file, or CSV file containing student information. 
                      The file should include columns for: Name, Email, Phone, Student ID, and Department.
                    </p>

                    <div className="space-y-6">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200">
                        <input
                          type="file"
                          accept=".xlsx,.pdf,.csv"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="mt-4">
                            <p className="text-lg font-medium text-gray-900">
                              {selectedFile ? selectedFile.name : 'Click to select a file'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {selectedFile ? 'File selected' : 'Excel, PDF, or CSV files accepted'}
                            </p>
                          </div>
                        </label>
                      </div>

                      {selectedFile && (
                        <div className="flex justify-center">
                          <button
                            onClick={handleFileUpload}
                            disabled={uploadingFile}
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            {uploadingFile ? (
                              <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Uploading...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload Students
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">File Format Instructions:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Excel files (.xlsx) should have headers in the first row</li>
                          <li>• CSV files should be comma-separated with headers</li>
                          <li>• PDF files should contain tabular data</li>
                          <li>• Required columns: Name, Email, Phone, Student ID, Department</li>
                          <li>• Maximum file size: 10MB</li>
                        </ul>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = getApiUrl('api/admin/download-template');
                              link.download = 'student_template.csv';
                              link.style.display = 'none';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Download CSV Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeMenu === 'add-single-user' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Add Single User</h2>
                
                <div className="bg-white p-4 lg:p-8 rounded-lg shadow-md max-w-2xl">
                  <form onSubmit={handleCreateSingleUser} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        value={newUserForm.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Enter student's full name"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={newUserForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        value={newUserForm.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-2">
                        Student ID *
                      </label>
                      <input
                        type="text"
                        id="studentId"
                        value={newUserForm.studentId}
                        onChange={(e) => handleInputChange('studentId', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                        placeholder="Enter student ID"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                        Department *
                      </label>
                      <select
                        id="department"
                        value={newUserForm.department}
                        onChange={(e) => handleInputChange('department', e.target.value)}
                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                        required
                      >
                        <option value="">Select Department</option>
                        <option value="botany">Botany</option>
                        <option value="chemistry">Chemistry</option>
                        <option value="electronics">Electronics</option>
                        <option value="english">English</option>
                        <option value="mathematics">Mathematics</option>
                        <option value="microbiology">Microbiology</option>
                        <option value="biotechnology">Biotechnology</option>
                        <option value="sports">Sports</option>
                        <option value="statistics">Statistics</option>
                        <option value="zoology">Zoology</option>
                        <option value="animation-science">Animation Science</option>
                        <option value="data-science">Data Science</option>
                        <option value="artificial-intelligence">Artificial Intelligence</option>
                        <option value="bvoc-software-development">B.Voc Software Development</option>
                        <option value="bioinformatics">Bioinformatics</option>
                        <option value="computer-application">Computer Application</option>
                        <option value="computer-science-entire">Computer Science (Entire)</option>
                        <option value="computer-science-optional">Computer Science (Optional)</option>
                        <option value="drug-chemistry">Drug Chemistry</option>
                        <option value="food-technology">Food Technology</option>
                        <option value="forensic-science">Forensic Science</option>
                         <option value="nanoscience-and-technology">Nanoscience and Technology</option>
                         <option value="fishery">Fishery</option>
                         <option value="military-science">Military Science</option>
                         <option value="physics">Physics</option>
                         <option value="music-science">Music Science</option>
                         <option value="plant-protection">Plant Protection</option>
                         <option value="seed-technology">Seed Technology</option>
                         <option value="instrumentation">Instrumentation</option>
                      </select>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex">
                        <svg className="w-5 h-5 text-blue-400 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-medium text-blue-900">Login Information</h4>
                          <p className="text-sm text-blue-800 mt-1">
                            The user will be able to log in using their <strong>email address</strong> as username and their <strong>contact number</strong> as password.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => {
                          setNewUserForm({
                            name: '',
                            email: '',
                            phone: '',
                            studentId: '',
                            department: ''
                          })
                        }}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                      >
                        Clear Form
                      </button>
                      
                      <button
                        type="submit"
                        disabled={creatingUser}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {creatingUser ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Creating User...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Create User
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {activeMenu === 'view-students' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Student Management</h2>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white shadow-lg rounded-lg overflow-hidden"
                >
                  <div className="px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                      <div>
                        <h3 className="text-lg lg:text-xl font-semibold text-gray-900">All Students</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Showing {filteredUsers.length} of {users.length} students
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <select
                          value={selectedDepartment}
                          onChange={(e) => setSelectedDepartment(e.target.value)}
                          className="block w-full sm:w-48 pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                        >
                          <option value="">All Departments</option>
                          <option value="botany">Botany</option>
                          <option value="chemistry">Chemistry</option>
                          <option value="electronics">Electronics</option>
                          <option value="english">English</option>
                          <option value="mathematics">Mathematics</option>
                          <option value="microbiology">Microbiology</option>
                          <option value="biotechnology">Biotechnology</option>
                          <option value="sports">Sports</option>
                          <option value="statistics">Statistics</option>
                          <option value="zoology">Zoology</option>
                          <option value="animation-science">Animation Science</option>
                          <option value="data-science">Data Science</option>
                          <option value="artificial-intelligence">Artificial Intelligence</option>
                          <option value="bvoc-software-development">B.Voc Software Development</option>
                          <option value="bioinformatics">Bioinformatics</option>
                          <option value="computer-application">Computer Application</option>
                          <option value="computer-science-entire">Computer Science (Entire)</option>
                          <option value="computer-science-optional">Computer Science (Optional)</option>
                          <option value="drug-chemistry">Drug Chemistry</option>
                          <option value="food-technology">Food Technology</option>
                          <option value="forensic-science">Forensic Science</option>
                           <option value="nanoscience-and-technology">Nanoscience and Technology</option>
                           <option value="fishery">Fishery</option>
                           <option value="military-science">Military Science</option>
                           <option value="physics">Physics</option>
                           <option value="music-science">Music Science</option>
                           <option value="plant-protection">Plant Protection</option>
                           <option value="seed-technology">Seed Technology</option>
                           <option value="instrumentation">Instrumentation</option>
                        </select>
                        <div className="relative rounded-lg shadow-sm w-full sm:w-72">
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, ID, email, or phone..."
                            className="block w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact Info</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Used</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage %</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => {
                          const storageUsedMB = Math.round(user.storageUsed / 1024 / 1024)
                          const storagePercentage = (user.storageUsed / (1024 * 1024 * 1024)) * 100
                          const storageColorClass = storagePercentage > 90 ? 'bg-red-500' : storagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          const formatDepartment = (dept: string) => {
                            if (!dept) return ''
                            return dept
                              .replace(/-/g, ' ')
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          }
                          return (
                            <motion.tr 
                              key={user._id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className="hover:bg-gray-50 transition-colors duration-150"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                                <div className="text-sm text-gray-500">{user.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {user.studentId}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {formatDepartment(user.department)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {storageUsedMB} MB
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <div className="flex-grow">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <motion.div 
                                        className={`h-2 rounded-full ${storageColorClass}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${storagePercentage}%` }}
                                        transition={{ duration: 0.5 }}
                                      />
                                    </div>
                                  </div>
                                  <span className="flex-shrink-0 text-sm text-gray-500 w-12">
                                    {Math.round(storagePercentage)}%
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  disabled={deletingUserId === user._id}
                                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                >
                                  {deletingUserId === user._id ? (
                                    <>
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                      </svg>
                                      Deleting...
                                    </>
                                  ) : (
                                    <>
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      Delete
                                    </>
                                  )}
                                </button>
                              </td>
                            </motion.tr>
                          )
                        })}
                        {filteredUsers.length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                <p className="text-lg font-medium">No students found</p>
                                <p className="text-sm text-gray-400 mt-1">Try adjusting the search criteria</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {activeMenu === 'settings' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 lg:mb-6">Settings</h2>
                
                <div className="space-y-8">
                  {/* Backup Data Section */}
                  <div className="bg-white p-4 lg:p-8 rounded-lg shadow-md max-w-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Backup Data</h3>
                    <p className="text-gray-600 mb-6">Create a local backup of all user and document data. The backup will be saved as a JSON file that you can download.</p>
                    <button
                      onClick={handleBackup}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      disabled={backupStatus === 'Creating backup...'}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      {backupStatus === 'Creating backup...' ? 'Backing up...' : 'Backup Now'}
                    </button>
                    {backupStatus && (
                      <div className="mt-4 text-sm text-gray-700">
                        {backupStatus}
                        {backupFileUrl && (
                          <a
                            href={backupFileUrl}
                            className="ml-4 text-blue-600 underline"
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download Backup
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Reset Password Section */}
                  <div className="bg-white p-4 lg:p-8 rounded-lg shadow-md max-w-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset User Password</h3>
                    <p className="text-gray-600 mb-6">Reset a user&apos;s password by entering their email address. A new temporary password will be generated.</p>
                    <form onSubmit={handleResetPassword} className="space-y-6">
                      <div>
                        <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-2">
                          User Email Address *
                        </label>
                        <input
                          type="email"
                          id="resetEmail"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
                          placeholder="Enter user's email address"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={resettingPassword}
                          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                        >
                          {resettingPassword ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              Resetting...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              Reset Password
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}