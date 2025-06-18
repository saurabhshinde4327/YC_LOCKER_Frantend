'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { getApiUrl } from '../../config/api'

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

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [loading, setLoading] = useState(true)
  const [totalStorageUsed, setTotalStorageUsed] = useState(0)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

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
      // Update the users list
      setUsers(users.filter(user => user._id !== userId))
      setFilteredUsers(filteredUsers.filter(user => user._id !== userId))
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || 'Failed to delete user')
      } else {
        toast.error('Failed to delete user')
      }
    } finally {
      setDeletingUserId(null)
    }
  }

  useEffect(() => {
    fetchData() // Initial fetch

    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(fetchData, 30000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [router, fetchData])

  useEffect(() => {
    const filtered = users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
      
      const matchesDepartment = selectedDepartment === '' || user.department === selectedDepartment
      
      return matchesSearch && matchesDepartment
    })
    setFilteredUsers(filtered)
  }, [searchQuery, users, selectedDepartment])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/admin')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>

          {/* Dashboard Header with Storage and Logout */}
          <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            {/* Total Storage Usage Indicator */}
            <div className="bg-white p-4 rounded-lg shadow-md w-full sm:w-auto">
              <div className="text-sm font-medium mb-1 text-gray-600">Total Storage Used</div>
              <div className="flex items-center space-x-3">
                <div className="w-48 bg-gray-200 rounded-full h-2">
                  <motion.div 
                    className={`h-2 rounded-full ${
                      (totalStorageUsed / (500 * 1024 * 1024 * 1024)) * 100 > 90
                        ? 'bg-red-500'
                        : (totalStorageUsed / (500 * 1024 * 1024 * 1024)) * 100 > 70
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalStorageUsed / (500 * 1024 * 1024 * 1024)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-sm whitespace-nowrap text-gray-700">
                  {Math.round(totalStorageUsed / (1024 * 1024 * 1024))} / 500 GB
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Showing {filteredUsers.length} of {users.length} users
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
                    // Helper to format department name
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
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <svg className="w-12 h-12 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <p className="text-lg font-medium">No users found</p>
                          <p className="text-sm text-gray-400 mt-1">Try adjusting your search criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </main>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        {/* Existing footer content */}
      </footer>
    </div>
  )
} 