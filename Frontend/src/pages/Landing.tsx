import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ChevronRight, FileSignature, CalendarDays, Wallet, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Grain overlay ─────────────────────────────────────────────────────────────
const GrainOverlay = () => (
  <div
    aria-hidden
    className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundSize: '256px 256px',
    }}
  />
);

// ── Ornamental rule ───────────────────────────────────────────────────────────
const OrnamentRule = ({ className = '' }: { className?: string }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cine-gold/40 to-transparent" />
    <div className="flex items-center gap-1.5">
      <div className="w-1 h-1 rounded-full bg-cine-gold/80" />
      <div className="w-1.5 h-1.5 rotate-45 border border-cine-gold/80" />
      <div className="w-1 h-1 rounded-full bg-cine-gold/80" />
    </div>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cine-gold/40 to-transparent" />
  </div>
);

// ── Film strip side decoration ────────────────────────────────────────────────
const FilmStrip = ({ side = 'left' }: { side?: 'left' | 'right' }) => (
  <div className={`hidden xl:flex fixed top-0 bottom-0 ${side === 'left' ? 'left-0' : 'right-0'} w-10 z-40 flex-col opacity-30`}>
    {Array.from({ length: 40 }).map((_, i) => (
      <div key={i} className="flex-1 border-b border-cine-border flex items-center justify-center">
        <div className="w-4 h-2.5 rounded-[1px] bg-cine-border" />
      </div>
    ))}
  </div>
);



// ── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const archY = useSpring(useTransform(scrollY, [0, 600], [0, -80]), { stiffness: 60, damping: 20 });

  const { role } = useAuth();
  const isLoggedIn = role !== 'AUDIENCE';

  const features = [
    { icon: Wallet, title: 'Budget & Ledger Engine', desc: 'Real-time expense tracking with automated Overrun Triggers and Vendor invoice management.' },
    { icon: CalendarDays, title: 'Logistics & Schedules', desc: 'Shoot calendar management with database-level protection against location double-booking.' },
    { icon: FileSignature, title: 'Contracts & Milestones', desc: 'Automated 30/40/30 payment splits with cron-triggered overdue alerts for the Finance team.' },
    { icon: Network, title: 'Distribution Matrix', desc: 'Box office aggregations and OTT deal tracking backed by immutable Change Data Capture audits.' },
  ];

  return (
    <div ref={containerRef} className="relative bg-cine-void min-h-screen overflow-x-hidden selection:bg-cine-gold/30 selection:text-cine-ivory">
      <GrainOverlay />
      <FilmStrip side="left" />
      <FilmStrip side="right" />

      {/* Ambient gold background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] opacity-[0.08]"
        style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 0%, #B8962E, transparent)' }}
      />

      {/* Decorative arch */}
      <motion.div style={{ y: archY }} aria-hidden className="pointer-events-none absolute top-[-1px] left-1/2 -translate-x-1/2 w-[700px]">
        <svg viewBox="0 0 700 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 0 Q350 220 700 0" stroke="url(#archGrad)" strokeWidth="1" fill="none" />
          <defs>
            <linearGradient id="archGrad" x1="0" y1="0" x2="700" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#B8962E" stopOpacity="0" />
              <stop offset="50%" stopColor="#B8962E" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#B8962E" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Unauthenticated Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative z-30 flex items-center justify-between px-8 md:px-20 py-6 border-b border-cine-border/50"
      >
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 border-2 border-cine-gold rotate-45 flex items-center justify-center">
            <div className="w-2 h-2 bg-cine-gold" />
          </div>
          <span className="font-caption text-sm tracking-cinema text-cine-ivory uppercase font-bold">CineCore</span>
        </div>



        <div className="flex items-center gap-8">
          
          <Link to="/login" className="font-caption text-xs font-bold tracking-ultra uppercase text-cine-void bg-cine-gold border border-cine-gold px-6 py-2 hover:bg-cine-gold-light transition-colors duration-300">
            Staff Login
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative z-20 max-w-7xl mx-auto px-8 xl:px-20 pt-28 pb-20">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-4 mb-12"
        >
          <div className="w-8 h-px bg-cine-gold" />
          <span className="font-caption text-sm tracking-cinema text-cine-gold font-semibold uppercase">
            Internal Studio Management
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-16 items-end mb-16">
          <div>
            {/* Focus Pull Effect applied to the title */}
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(4rem,9vw,8rem)] font-bold leading-[1] tracking-tight text-cine-ivory"
            >
              Every
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(4rem,9vw,8rem)] font-bold leading-[1] tracking-tight italic text-transparent"
              style={{ WebkitTextStroke: '1.5px #B8962E' }}
            >
              Frame.
            </motion.h1>

            <motion.h1
              initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(4rem,9vw,8rem)] font-bold leading-[1] tracking-tight text-cine-ivory"
            >
              Every Deal.
            </motion.h1>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col items-start lg:items-end gap-8 pb-4"
          >
            <p className="font-body text-base text-cine-cream font-medium leading-relaxed max-w-sm lg:text-right">
              The central nervous system for modern film studios. Role-based access ensures data integrity from the writer's room to worldwide release.
            </p>

            <Link
              to="/portfolio"
              className="group relative flex items-center gap-3 px-8 py-4 border border-cine-gold bg-cine-gold/5 text-cine-gold font-caption text-sm font-bold tracking-ultra uppercase hover:bg-cine-gold hover:text-cine-void transition-colors duration-500"
            >
              <span>View Cinematic Portfolio</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        <OrnamentRule className="mb-12" />

      </section>

      {/* Features strip mapping to our exact backend */}
      <section className="relative z-20 max-w-7xl mx-auto px-8 xl:px-20 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <span className="font-caption text-sm font-bold tracking-ultra text-cine-gold uppercase mb-4 block">System Architecture</span>
          <h2 className="font-display text-4xl md:text-5xl text-cine-ivory font-bold leading-tight mb-6">
            Built for the <em>reality</em> of production.
          </h2>


          <div className="flex items-center gap-3">
            <div className="font-mono text-xs text-cine-gold/40 tracking-wider">
              {['◼', '◼', '◼', '◼', '◻', '◻', '◻', '◻'].map((s, i) => (
                <span key={i} className="mr-0.5">{s}</span>
              ))}
            </div>
            <span className="font-caption text-xs text-cine-dust tracking-ultra uppercase">Sequence 01 of 04</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col items-start gap-4"
              >
                <div className="p-3 border border-cine-border bg-cine-onyx group-hover:border-cine-gold transition-colors duration-500">
                  <Icon className="w-5 h-5 text-cine-gold" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="font-heading text-lg font-bold text-cine-ivory mb-2">{f.title}</div>
                  <div className="font-body text-sm text-cine-cream leading-relaxed">{f.desc}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Cinematic Manifesto / Quote */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="relative z-20 border-t border-b border-cine-border bg-[#0d0d0d] py-24 overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ background: 'radial-gradient(ellipse 70% 100% at 50% 50%, #B8962E, transparent)' }}
        />
        <div className="max-w-4xl mx-auto px-8 text-center relative z-10">
          <OrnamentRule className="mb-12 opacity-50" />
          <blockquote className="font-display text-3xl md:text-5xl text-cine-ivory italic leading-tight mb-8">
            "Cinema is a mirror by which we often see ourselves."
          </blockquote>
          <cite className="font-caption text-sm tracking-cinema text-cine-gold uppercase not-italic font-bold">
            — Martin Scorsese
          </cite>
          <OrnamentRule className="mt-12 opacity-50" />
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-20 px-8 md:px-20 py-8 flex flex-col md:flex-row items-center justify-between bg-cine-void">
        <span className="font-caption text-xs font-bold tracking-ultra text-cine-dust uppercase mb-4 md:mb-0">
          © {new Date().getFullYear()} CineCore Systems
        </span>
        <span className="font-mono text-[10px] text-cine-dust uppercase tracking-wider flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cine-gold/50" />
          Authorized Studio Personnel Only
        </span>
      </footer>
    </div>
  );
}