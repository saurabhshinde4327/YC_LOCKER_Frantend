'use client';

import React from 'react';

const VideoBackground = () => {
  return (
    <div className="relative w-full h-[40vh] sm:h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden shadow-2xl transition-all duration-500">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-contain md:object-cover object-center"
      >
        <source src="/starter.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay for better readability and modern look */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent rounded-none" />
      {/* Optional: Add a title or tagline here if desired */}
    </div>
  );
};

export default VideoBackground;