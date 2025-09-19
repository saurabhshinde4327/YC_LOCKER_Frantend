'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function Installation() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showInstallBanner, setShowInstallBanner] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
    setIsAndroid(/android/.test(userAgent))

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallBanner(true)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      setShowInstallBanner(false)
      console.log('✅ App successfully installed')
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User chose to ${outcome} installation`)
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
        setShowInstallBanner(false)
      }
    } catch (error) {
      console.error('Installation failed:', error)
    }
  }

  const handleCloseBanner = () => {
    setShowInstallBanner(false)
  }

  const showIOSInstructions = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-blue-900 mb-2">📱 Install on iOS</h3>
      <ol className="text-sm text-blue-800 space-y-1">
        <li>1. Tap the <strong>Share</strong> button in Safari</li>
        <li>2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
        <li>3. Tap <strong>&quot;Add&quot;</strong> to confirm</li>
      </ol>
    </div>
  )

  const showAndroidInstructions = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-green-900 mb-2">🤖 Install on Android</h3>
      <ol className="text-sm text-green-800 space-y-1">
        <li>1. Tap the <strong>Menu</strong> button (⋮) in Chrome</li>
        <li>2. Tap <strong>&quot;Add to Home screen&quot;</strong></li>
        <li>3. Tap <strong>&quot;Add&quot;</strong> to confirm</li>
      </ol>
    </div>
  )

  const showDesktopInstructions = () => (
    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-purple-900 mb-2">💻 Install on Desktop</h3>
      <ol className="text-sm text-purple-800 space-y-1">
        <li>1. Click the <strong>Install</strong> button below</li>
        <li>2. Or use <strong>Ctrl+Shift+I</strong> in Chrome</li>
        <li>3. Click the <strong>Install</strong> icon in the address bar</li>
      </ol>
    </div>
  )

  return (
    <AnimatePresence>
      {!isInstalled && showInstallBanner && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white shadow-lg"
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 rounded-full p-2">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-lg">YCIS Digital Locker</h3>
                  <p className="text-sm opacity-90">Install our app for the best experience!</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {deferredPrompt ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleInstallClick}
                    className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                    </svg>
                    <span>Install Now</span>
                  </motion.button>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium mb-2">Available on:</p>
                    <div className="flex items-center space-x-3 text-xs">
                      {isIOS && <span className="bg-white/20 px-2 py-1 rounded">📱 iOS</span>}
                      {isAndroid && <span className="bg-white/20 px-2 py-1 rounded">🤖 Android</span>}
                      {!isIOS && !isAndroid && <span className="bg-white/20 px-2 py-1 rounded">💻 Desktop</span>}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleCloseBanner}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Close installation banner"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!isInstalled && !showInstallBanner && !deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 right-4 z-40 md:hidden"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInstallBanner(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            title="Install YCIS Locker"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
            </svg>
          </motion.button>
        </motion.div>
      )}

      <AnimatePresence>
        {showInstallBanner && !deferredPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleCloseBanner}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0 0l-4-4m4 4l4-4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Install YCIS Locker</h2>
                <p className="text-gray-600">Get the best experience with our app</p>
              </div>

              <div className="space-y-4">
                {isIOS && showIOSInstructions()}
                {isAndroid && showAndroidInstructions()}
                {!isIOS && !isAndroid && showDesktopInstructions()}
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleCloseBanner}
                  className="flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => setShowInstallBanner(false)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  )
}
