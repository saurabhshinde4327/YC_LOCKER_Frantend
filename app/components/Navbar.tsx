"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface User {
  name: string;
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [showScrollBar, setShowScrollBar] = useState(false);

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Handle PWA install prompt
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall as EventListener);
    };
  }, []);

  // Show quick bar on scroll
  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY || window.pageYOffset;
      setShowScrollBar(currentY > 120);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const handleInstall = async () => {
    if (deferredPrompt && "prompt" in deferredPrompt) {
      // @ts-expect-error: beforeinstallprompt event type is not in default lib
      deferredPrompt.prompt();
      // @ts-expect-error: userChoice is part of beforeinstallprompt
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    }
  };

  return (
    <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
      {/* Slide-down top bar on scroll */}
      <AnimatePresence>
        {showScrollBar && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 bg-white text-gray-900 shadow-md"
          >
            <div className="container mx-auto px-4 py-2 flex items-center justify-between">
              <div className="text-sm font-medium">Quick Access</div>
              <div className="flex items-center gap-3">
                <Link href="/" className="text-sm hover:text-blue-600 transition-colors">
                  Home
                </Link>
                <Link href="/about" className="text-sm hover:text-blue-600 transition-colors">
                  About
                </Link>
                {user ? (
                  <Link href="/dashboard" className="text-sm hover:text-blue-600 transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/login" className="text-sm hover:text-blue-600 transition-colors">
                    Login
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="relative container mx-auto px-6 py-6 flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-8"
        >
          <Link href="/" className="text-2xl font-bold tracking-tight">
            YCIS Digital Locker
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className={`text-white/80 hover:text-white transition-colors ${
                pathname === "/" ? "text-white font-medium" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/about"
              className={`text-white/80 hover:text-white transition-colors ${
                pathname === "/about" ? "text-white font-medium" : ""
              }`}
            >
              About
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className={`text-white/80 hover:text-white transition-colors ${
                  pathname === "/dashboard" ? "text-white font-medium" : ""
                }`}
              >
                Dashboard
              </Link>
            )}
          </div>
        </motion.div>

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
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="group px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 font-medium backdrop-blur-sm inline-flex items-center space-x-2"
            >
              <span>Student Login</span>
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

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden"
              >
                <div className="flex flex-col h-full">
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

                  <div className="flex-1 px-4 py-6 space-y-4">
                    <Link
                      href="/"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        pathname === "/" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Home
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg transition-colors ${
                        pathname === "/about" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      About
                    </Link>
                    {user && (
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-4 py-3 rounded-lg transition-colors ${
                          pathname === "/dashboard" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Dashboard
                      </Link>
                    )}
                    {isInstallable && (
                      <button
                        onClick={handleInstall}
                        className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                      >
                        📱 Install App
                      </button>
                    )}
                  </div>

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

      {/* Install Button (Mobile) */}
      {isInstallable && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-24 right-4 z-40 md:hidden"
        >
          <button
            onClick={handleInstall}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
            title="Install YCIS Locker"
          >
            <span className="text-sm font-semibold">Install</span>
          </button>
        </motion.div>
      )}
    </header>
  );
}
