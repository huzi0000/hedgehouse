'use client';

import React, { useEffect, useRef, useState } from 'react';

export function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Ensure audio is muted for autoplay compliance
    video.defaultMuted = true;
    video.muted = true;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      video.pause();
    } else {
      video.play().catch(() => {
        // Autoplay may be deferred until user interaction by strict browser policies
      });
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (!video) return;
      if (e.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="relative w-full max-w-[580px] lg:max-w-[620px] mx-auto lg:mx-0 flex items-center justify-center">
      {/* Ambient background glow for organic depth */}
      <div
        className="absolute -inset-4 sm:-inset-6 bg-gradient-to-tr from-[#10B981]/15 via-[#10B981]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Video Presentation Container with seamless #0B0D0C edge dissolving */}
      <div className="relative w-full overflow-hidden rounded-2xl bg-[#0B0D0C]">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-auto max-h-[340px] sm:max-h-[380px] lg:max-h-[420px] object-cover scale-[1.01]"
          style={{
            maskImage:
              'radial-gradient(ellipse 94% 90% at 50% 50%, black 55%, rgba(0,0,0,0.85) 75%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 94% 90% at 50% 50%, black 55%, rgba(0,0,0,0.85) 75%, transparent 100%)',
          }}
          aria-label="Ambient HedgeHouse protocol visualization"
        >
          <source src="/videos/hedgehouse-hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Directional Soft Edge Dissolves: ensures no bounding box or harsh border */}
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#0B0D0C] via-transparent to-[#0B0D0C]/40 opacity-70"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0B0D0C] via-transparent to-[#0B0D0C]/20 opacity-70"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0B0D0C]/30 via-transparent to-transparent opacity-60"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
