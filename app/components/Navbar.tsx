'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  name: string;
  role: string;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    // Check if the app can be installed
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    })

    // Reset installable state when installed
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
    })

    // Check auth status on mount and on route change
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (storedUser && token) {
        setUser(JSON.parse(storedUser))
      } else {
        setUser(null)
        if (pathname === '/dashboard') {
          router.push('/login')
        }
      }
    }

    checkAuth()
    
    // Listen for storage events (logout from other tabs)
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [router, pathname])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsMobileMenuOpen(false)
    router.push('/')
  }

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setIsInstallable(false)
      }
    } catch (err) {
      console.error('Error installing app:', err)
    }
  }

  return (
    <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 mix-blend-multiply" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      </div>
      <nav className="relative container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-8"
        >
          <Link href="/" prefetch className="text-2xl font-bold tracking-tight">
          YCIS Digital Locker
          </Link>
          {/* Desktop Navigation */}
          {user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/"
                prefetch
                className={`text-white/80 hover:text-white transition-colors ${pathname === '/' ? 'text-white font-medium' : ''}`}
              >
                Home
              </Link>
              <Link 
                href="/dashboard"
                prefetch
                className={`text-white/80 hover:text-white transition-colors ${pathname === '/dashboard' ? 'text-white font-medium' : ''}`}
              >
                Dashboard
              </Link>
            </div>
          )}
        </motion.div>
        
        {/* Desktop Auth Buttons */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center space-x-6"
        >
          {user ? (
            <>
              <span className="text-white/80">Welcome, {user.name}</span>
              <button
                onClick={handleLogout}
                className="group px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 font-medium backdrop-blur-sm inline-flex items-center space-x-2"
              >
                <span>Logout</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          ) : (
            <Link 
              href="/login" 
              prefetch
              className="group px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 font-medium backdrop-blur-sm inline-flex items-center space-x-2"
            >
              <span>Student Login</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </motion.div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Open mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Mobile Side Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              />
              
              {/* Side Menu */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden"
              >
                <div className="flex flex-col h-full">
                  {/* Close Button */}
                  <div className="flex justify-end p-4">
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      aria-label="Close mobile menu"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Mobile Menu Content */}
                  <div className="flex-1 px-4 py-6">
                    {user ? (
                      <>
                        <div className="mb-8 text-center">
                          <p className="text-gray-600">Welcome,</p>
                          <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                        </div>
                        <div className="space-y-4">
                          <Link
                            href="/"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg transition-colors ${
                              pathname === '/' 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Home
                          </Link>
                          <Link
                            href="/dashboard"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-4 py-3 rounded-lg transition-colors ${
                              pathname === '/dashboard' 
                                ? 'bg-blue-50 text-blue-600' 
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            Dashboard
                          </Link>
                          {isInstallable && (
                            <button
                              onClick={handleInstall}
                              className="w-full px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                              </svg>
                              <span>Add to Home Screen</span>
                            </button>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Link
                          href="/"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-3 rounded-lg transition-colors ${
                            pathname === '/' 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          Home
                        </Link>
                        {isInstallable && (
                          <button
                            onClick={handleInstall}
                            className="w-full px-4 py-3 rounded-lg text-left text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                            </svg>
                            <span>Add to Home Screen</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="p-4 border-t border-gray-200">
                    {user ? (
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Logout
                      </button>
                    ) : (
                      <Link
                        href="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Student Login
                      </Link>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
} 