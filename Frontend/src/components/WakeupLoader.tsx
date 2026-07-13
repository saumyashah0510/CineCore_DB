import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Determine API URL identically to api.ts configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const PING_URL = API_URL.replace('/api/v1', '') + '/health';

const CINEMA_TIPS = [
  "Threading the 35mm film reel into the gate...",
  "Warming up the high-intensity xenon projector lamp...",
  "Calibrating Dolby Atmos multi-channel surround sound matrices...",
  "Retrieving talent profiles and active casting registries...",
  "Spinning up FastAPI engine... Scene 1, Take 1!",
  "Connecting to CineCore DB database pitwall...",
  "Warming up Redis cache to pull analytics telemetry...",
  "Checking location scout permits and scheduled shoot sheets...",
  "Quiet on set... Sound rolling... Camera rolling... ACTION!"
];

interface WakeupLoaderProps {
  children: React.ReactNode;
}

export default function WakeupLoader({ children }: WakeupLoaderProps) {
  const [isAwake, setIsAwake] = useState(false);
  const [fadeAway, setFadeAway] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);

  // 1. Fake progressive loader bar
  useEffect(() => {
    if (isAwake) {
      setProgress(100);
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 96) return prev; // Hold at 96% until awake
        let diff = 1.6;
        if (prev > 30) diff = 0.9;
        if (prev > 60) diff = 0.4;
        if (prev > 85) diff = 0.05;
        return Math.min(prev + diff, 96);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isAwake]);

  // 2. Cycle through cinema tips
  useEffect(() => {
    if (isAwake) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % CINEMA_TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAwake]);

  // 3. Ping the backend health check
  useEffect(() => {
    let isActive = true;

    const ping = async () => {
      try {
        const response = await axios.get(PING_URL, { timeout: 3000 });
        if ((response.status === 200 || response.status === 201) && isActive) {
          setIsAwake(true);
          setTimeout(() => {
            if (isActive) setFadeAway(true);
          }, 600);
        }
      } catch (err) {
        if (isActive) {
          // Retry every 2.5 seconds
          setTimeout(ping, 2500);
        }
      }
    };

    ping();

    return () => {
      isActive = false;
    };
  }, []);

  if (fadeAway) {
    return <>{children}</>;
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#070709] text-white selection:bg-[#d4af37]/30 transition-opacity duration-700 ease-in-out ${
        isAwake ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Self-contained CSS Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cinema-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cinema-beam {
          0%, 100% { opacity: 0.4; transform: scaleY(0.96) rotate(-12deg); }
          50% { opacity: 0.75; transform: scaleY(1.04) rotate(-12deg); }
        }
        @keyframes cinema-flicker {
          0%, 100% { opacity: 0.95; }
          45% { opacity: 1; }
          50% { opacity: 0.85; }
          55% { opacity: 0.98; }
          60% { opacity: 0.88; }
        }
        @keyframes dust-float {
          0% { transform: translate(0, 0); opacity: 0; }
          50% { opacity: 0.6; }
          100% { transform: translate(-30px, -40px); opacity: 0; }
        }
        .cinema-animate-spin {
          animation: cinema-spin 4s linear infinite;
        }
        .cinema-animate-beam {
          animation: cinema-beam 0.15s ease-in-out infinite;
        }
        .cinema-animate-flicker {
          animation: cinema-flicker 0.12s linear infinite;
        }
        .dust-particle-1 {
          animation: dust-float 3s linear infinite;
        }
        .dust-particle-2 {
          animation: dust-float 4s linear infinite 1.5s;
        }
      `}} />

      {/* Ambient background glow */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#d4af37]/5 via-transparent to-transparent opacity-60" />

      {/* Main Content Card */}
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6 text-center gap-8">
        
        {/* Cinematic Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/30 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
              <line x1="7" y1="2" x2="7" y2="22" />
              <line x1="17" y1="2" x2="17" y2="22" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <line x1="2" y1="7" x2="7" y2="7" />
              <line x1="2" y1="17" x2="7" y2="17" />
              <line x1="17" y1="17" x2="22" y2="17" />
              <line x1="17" y1="7" x2="22" y2="7" />
            </svg>
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="font-extrabold text-xl tracking-wider text-white font-mono uppercase">CINE<span className="text-[#d4af37]">CORE</span></span>
            <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-0.5">Database Registry</span>
          </div>
        </div>

        {/* Vintage Projector & Film Reel Illustration */}
        <div className="relative w-72 h-32 flex items-center justify-center overflow-hidden bg-black/60 border border-white/5 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
          
          {/* Light Projection beam & particles */}
          <div 
            className="absolute left-[54%] top-[50%] -translate-y-[50%] w-48 h-28 bg-gradient-to-r from-[#d4af37]/15 to-transparent pointer-events-none origin-left cinema-animate-beam z-10" 
            style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0 60%)' }} 
          />
          <div className="absolute left-[70%] top-[40%] w-1.5 h-1.5 rounded-full bg-[#d4af37]/40 dust-particle-1 z-20 pointer-events-none" />
          <div className="absolute left-[80%] top-[60%] w-1 h-1 rounded-full bg-[#d4af37]/35 dust-particle-2 z-20 pointer-events-none" />

          {/* Projector Chassis & Wheels */}
          <div className="relative w-48 h-20 flex items-center gap-3">
            
            {/* Front Film Reel */}
            <div className="w-14 h-14 rounded-full border-[3px] border-[#d4af37] relative flex items-center justify-center cinema-animate-spin bg-neutral-900 shadow-md">
              <div className="w-4 h-4 rounded-full bg-black border border-[#d4af37]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute top-1.5 border border-[#d4af37]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute bottom-1.5 border border-[#d4af37]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute left-1.5 border border-[#d4af37]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute right-1.5 border border-[#d4af37]/20" />
            </div>

            {/* Projector Body */}
            <div className="w-20 h-10 bg-neutral-850 rounded-md border border-neutral-700 relative flex items-center justify-center shadow-inner">
              {/* Dial knobs */}
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-neutral-900 border border-neutral-600" />
              <div className="absolute top-5 left-2 w-2.5 h-2.5 rounded-full bg-neutral-950 border border-neutral-600" />
              {/* Lens housing */}
              <div className="absolute -right-3 w-5 h-6 bg-neutral-900 border border-neutral-700 rounded-r-md flex items-center justify-center">
                <div className="w-3.5 h-4 bg-gradient-to-r from-neutral-800 to-[#d4af37]/30 rounded-r-sm" />
              </div>
            </div>

            {/* Rear Film Reel */}
            <div className="w-14 h-14 rounded-full border-[3px] border-[#d4af37] relative flex items-center justify-center cinema-animate-spin bg-neutral-900 shadow-md">
              <div className="w-4 h-4 rounded-full bg-black border border-[#d4af37]/50" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute top-1.5 border border-[#d4af37]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute bottom-1.5 border border-[#d4af37]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute left-1.5 border border-[#d4af37]/20" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-950 absolute right-1.5 border border-[#d4af37]/20" />
            </div>

            {/* Looping Film Strip thread shadow */}
            <div className="absolute bottom-2 left-8 w-28 h-[2px] bg-neutral-800 border-b border-dashed border-[#d4af37]/30 pointer-events-none" />
          </div>
        </div>

        {/* Text status */}
        <div className="flex flex-col gap-2.5">
          <h2 className="text-white font-bold text-sm tracking-wider uppercase font-mono flex items-center justify-center gap-2">
            {!isAwake && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-ping" />
            )}
            {isAwake ? "Projection Active" : "Warming Projector Lamp..."}
          </h2>
          <p className="text-[#8e8d98] text-[11px] leading-relaxed min-h-[36px] flex items-center justify-center px-2 font-sans cinema-animate-flicker">
            {CINEMA_TIPS[tipIndex]}
          </p>
        </div>

        {/* Cinematic Gold Progress Bar */}
        <div className="w-full">
          <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden border border-white/5 relative">
            <div
              className="h-full rounded-full bg-[#d4af37] transition-all duration-300 relative shadow-[0_0_10px_rgba(212,175,55,0.4)]"
              style={{ width: `${progress}%` }}
            >
              {/* Shine highlight */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-white/10" />
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 text-[9px] font-mono text-neutral-600 font-bold uppercase tracking-widest">
            <span>{isAwake ? "ROLL CAMERA" : "SYSTEM READYING"}</span>
            <span className="text-[#d4af37]">{Math.round(progress)}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
