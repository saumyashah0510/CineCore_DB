import { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

/* ═══════════════════════════════════════════════════════════════
   1. CUSTOM CURSOR — Golden ring + dot that follows mouse
   ═══════════════════════════════════════════════════════════════ */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const animate = () => {
      cursorX += (mouseX - cursorX) * 0.12;
      cursorY += (mouseY - cursorY) * 0.12;
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      requestAnimationFrame(animate);
    };

    // Hover detection for interactive elements
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, select, input, textarea, [role="button"]')) {
        cursor.classList.add('cursor-hover');
      }
    };
    const onMouseOut = () => {
      cursor.classList.remove('cursor-hover');
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);
    requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={cursorRef} className="custom-cursor hidden md:block" />
      <div ref={dotRef} className="custom-cursor-dot hidden md:block" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. AURORA BACKGROUND — Organic floating blobs
   ═══════════════════════════════════════════════════════════════ */
export function AuroraBackground() {
  return (
    <div className="aurora-bg">
      <div className="aurora-blob" />
      <div className="aurora-blob" />
      <div className="aurora-blob" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. PARTICLE FIELD — Floating golden dust
   ═══════════════════════════════════════════════════════════════ */
export function ParticleField({ count = 20 }: { count?: number }) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 12}s`,
    duration: `${8 + Math.random() * 8}s`,
    size: `${1 + Math.random() * 2}px`,
    opacity: 0.2 + Math.random() * 0.4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. PAGE TRANSITION WRAPPER
   ═══════════════════════════════════════════════════════════════ */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════════
   5. ANIMATED COUNTER — Numbers that count up
   ═══════════════════════════════════════════════════════════════ */
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.5,
  className = '',
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = value;
    const step = target / (duration * 60);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [value, duration]);

  return (
    <span ref={ref} className={`counter-value ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   6. SPOTLIGHT CARD — Card that tracks mouse
   ═══════════════════════════════════════════════════════════════ */
export function SpotlightCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', `${x}%`);
    card.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={`spotlight glass-card ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   7. CINEMA TICKER TAPE — Scrolling text bar
   ═══════════════════════════════════════════════════════════════ */
export function TickerTape({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div className="w-full overflow-hidden border-y border-cine-border/30 py-2.5 bg-cine-void/80 backdrop-blur-sm">
      <div className="ticker-tape whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 mx-8">
            <span className="w-1.5 h-1.5 bg-cine-gold/60 rounded-full" />
            <span className="font-mono text-[10px] text-cine-dust/70 uppercase tracking-[0.3em]">{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. CINEMATIC DIVIDER
   ═══════════════════════════════════════════════════════════════ */
export function CineDivider({ className = '' }: { className?: string }) {
  return <div className={`cine-divider my-8 ${className}`} />;
}

/* ═══════════════════════════════════════════════════════════════
   9. SCROLL REVEAL — Fades in as you scroll
   ═══════════════════════════════════════════════════════════════ */
export function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   10. FILM FRAME COUNTER — Retro frame counter
   ═══════════════════════════════════════════════════════════════ */
export function FrameCounter() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setFrame((f) => (f + 1) % 10000), 42);
    return () => clearInterval(timer);
  }, []);
  return (
    <span className="font-mono text-[9px] text-cine-gold/30 tabular-nums tracking-widest">
      {String(frame).padStart(4, '0')}:{String(Math.floor(Math.random() * 24)).padStart(2, '0')}
    </span>
  );
}
