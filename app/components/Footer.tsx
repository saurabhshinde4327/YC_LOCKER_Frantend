'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Footer() {
  const [year, setYear] = useState(2024)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* About Section */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">About YCIS Digital Locker</h3>
              <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A secure digital platform for YCIS College students to store and manage their academic documents efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Quick Links</h3>
              <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <svg className="w-4 h-4 mr-2 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  href="/dashboard" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <svg className="w-4 h-4 mr-2 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="https://ycis.ac.in" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <svg className="w-4 h-4 mr-2 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  College Website
                </Link>
              </li>
            <li>
             <Link 
        href="/admin"
          className="text-sm text-gray-400 hover:text-white transition-colors duration-300 flex items-center group"
          >
         <svg className="w-4 h-4 mr-2 text-blue-500 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          Admin Login
        </Link>
          </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Contact Us</h3>
              <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Powai Naka, Satara,<br />Maharashtra, India - 415001
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">support@ycislocker.space</p>
              </div>
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <p className="text-sm text-gray-400">8668428513</p>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-6">
            <div>
              <h3 className="text-white text-xl font-semibold mb-2">Location</h3>
              <div className="w-16 h-1 bg-blue-600 rounded-full"></div>
            </div>
            <div className="rounded-lg overflow-hidden h-[220px] shadow-lg shadow-black/30">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.7244853900514!2d74.00019937499171!3d17.67963998435931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc23993a1ee1c1b%3A0xf9bf0a391940e67!2sYashavantrao%20Chavan%20Institute%20of%20Science%2C%20Satara!5e0!3m2!1sen!2sin!4v1709799171135!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="YCIS Location"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800/50 text-center">
          <p className="text-sm text-gray-400">
            &copy; {year} Data Center. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 