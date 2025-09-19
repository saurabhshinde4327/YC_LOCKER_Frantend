'use client'

import React, { useEffect, useState } from 'react'

const LiveDate = () => {
  const [date, setDate] = useState<string>('')

  useEffect(() => {
    const updateDate = () => {
      const now = new Date()
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }
      setDate(now.toLocaleString('en-US', options))
    }

    // Update immediately
    updateDate()

    // Update every second
    const interval = setInterval(updateDate, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-2">
      <div className="container mx-auto px-4 flex justify-center items-center">
        <span className="text-sm font-medium">
          {date || 'Loading...'}
        </span>
      </div>
    </div>
  )
}

export default LiveDate 