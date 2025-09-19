"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone } from "lucide-react";

// Custom interface for the beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallationSection() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  const checkMobile = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;

    setIsMobile(mobile);
    setIsIOS(ios);
    setIsAndroid(android);
    setIsStandalone(standalone);
  }, []);

  useEffect(() => {
    checkMobile();

    const handleBeforeInstall = (e: Event) => {
      const event = e as BeforeInstallPromptEvent;
      event.preventDefault();
      setDeferredPrompt(event);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    // Show mobile prompt after delay if not installed
    const timer = setTimeout(() => {
      if (isMobile && !isStandalone) {
        setShowInstallPrompt(true);
      }
    }, 3000);

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("resize", checkMobile);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("resize", checkMobile);
    };
  }, [checkMobile, isMobile, isStandalone]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          setShowInstallPrompt(false);
          setDeferredPrompt(null);
        }
      } catch (err) {
        console.error("Installation failed:", err);
      }
    }
  };

  const handleClose = () => setShowInstallPrompt(false);

  // Don't render if already installed and no deferred prompt
  if (isStandalone || (!isMobile && !deferredPrompt)) return null;

  return (
    <>
      {/* Floating Install Button (Mobile) */}
      {isMobile && !isStandalone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 right-4 z-40 md:hidden"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowInstallPrompt(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            title="Install YCIS Locker"
            aria-label="Install YCIS Locker app"
          >
            <Download className="w-6 h-6" />
          </motion.button>
        </motion.div>
      )}

      {/* Floating Install Button (Desktop) */}
      {!isMobile && !isStandalone && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-20 right-4 z-40 hidden md:block"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowInstallPrompt(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            title="Install YCIS Locker"
            aria-label="Install YCIS Locker app"
          >
            <Download className="w-5 h-5" />
            <span>Install App</span>
          </motion.button>
        </motion.div>
      )}

      {/* Installation Popup */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-6 right-4 bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl rounded-2xl p-6 w-80 border border-blue-100 z-50 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                  {isMobile ? (
                    <Smartphone className="w-5 h-5 text-white" />
                  ) : (
                    <Download className="w-5 h-5 text-white" />
                  )}
                </div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Install App
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close installation prompt"
              >
                <X size={20} />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 mb-4 leading-relaxed">
              Install YCIS Locker on your device for faster access, offline
              capabilities, and a native app experience.
            </p>

            {/* Install Now Button or Manual Instructions */}
            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-3 font-semibold shadow-lg mb-4 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                <Download size={20} /> Install Now
              </button>
            ) : (
              <div className="space-y-3">
                {isIOS && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h3 className="font-semibold text-blue-900 text-sm mb-2">
                      📱 Install on iOS
                    </h3>
                    <ol className="text-xs text-blue-800 space-y-1">
                      <li>
                        1. Tap <strong>Share</strong> in Safari
                      </li>
                      <li>
                        2. Tap <strong>&quot;Add to Home Screen&quot;</strong>
                      </li>
                      <li>
                        3. Tap <strong>&quot;Add&quot;</strong>
                      </li>
                    </ol>
                  </div>
                )}
                {isAndroid && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h3 className="font-semibold text-green-900 text-sm mb-2">
                      🤖 Install on Android
                    </h3>
                    <ol className="text-xs text-green-800 space-y-1">
                      <li>
                        1. Tap <strong>Menu</strong> (⋮) in Chrome
                      </li>
                      <li>
                        2. Tap{" "}
                        <strong>&quot;Add to Home screen&quot;</strong>
                      </li>
                      <li>
                        3. Tap <strong>&quot;Add&quot;</strong>
                      </li>
                    </ol>
                  </div>
                )}
                {!isIOS && !isAndroid && isMobile && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <h3 className="font-semibold text-purple-900 text-sm mb-2">
                      📱 Install on Mobile
                    </h3>
                    <p className="text-xs text-purple-800">
                      Use your browser&apos;s menu to add this app to your home
                      screen.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Maybe Later */}
            <div className="text-center">
              <button
                onClick={handleClose}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
