import { Clapperboard } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * --- MANUAL CONFIGURATION ---
 * Update the links below with your personal URLs.
 */
const YOUR_NAME = "Saumya Shah";
const SOCIAL_LINKS = {
  INSTAGRAM: "https://www.instagram.com/saumyashah05/", // Add your handle
  LINKEDIN: "https://www.linkedin.com/in/saumya-shah-5bb8602b4/", // Add your profile
  GITHUB: "https://github.com/saumyashah0510/CineCore_DB",        // Add your repo link
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-cine-void border-t border-cine-border/30 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto">
        
        {/* Horizontal 3-Column Layout */}
        <div className="flex flex-row items-center justify-between gap-8 mb-16 w-full">

          {/* 1. Brand & Attribution (Left Aligned, takes 1/3 space) */}
          <div className="flex flex-col items-start flex-1">
            <div className="flex items-center gap-3 mb-4 group cursor-default">
              <div className="w-8 h-8 border border-cine-gold rotate-45 flex items-center justify-center group-hover:bg-cine-gold transition-all duration-500">
                <Clapperboard className="w-4 h-4 text-cine-gold group-hover:text-cine-void -rotate-45 transition-colors" />
              </div>
              <span className="font-caption text-xl tracking-[0.2em] uppercase text-cine-ivory">
                CineCore
              </span>
            </div>
            <p className="font-body text-xs text-cine-dust leading-relaxed text-left max-w-[280px]">
              A premium management system for modern cinematic production houses, handling everything from talent to distribution.
            </p>
          </div>

          {/* 2. Cinematic Quote / Signature (Center Aligned, takes 1/3 space) */}
          <div className="flex flex-col items-center flex-1">
            <span className="font-caption text-[10px] tracking-ultra text-cine-gold uppercase mb-2">Developed with Passion</span>
            <span className="font-display text-2xl font-bold text-cine-ivory whitespace-nowrap">{YOUR_NAME}</span>
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-cine-gold to-transparent mt-4" />
          </div>

          {/* 3. Social Links (Right Aligned, takes 1/3 space) */}
          <div className="flex flex-col items-end flex-1">
            <span className="font-caption text-[10px] tracking-ultra text-cine-dust uppercase mb-6">Connect & Collaborate</span>
            <div className="flex items-center gap-6">
              <SocialIcon
                label="Instagram"
                href={SOCIAL_LINKS.INSTAGRAM}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>}
              />
              <SocialIcon
                label="LinkedIn"
                href={SOCIAL_LINKS.LINKEDIN}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>}
              />
              <SocialIcon
                label="GitHub"
                href={SOCIAL_LINKS.GITHUB}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar (Strictly Horizontal) */}
        <div className="pt-8 border-t border-cine-border/10 flex flex-row justify-between items-center w-full">
          <p className="font-mono text-[9px] uppercase tracking-widest text-cine-dust">
            © {currentYear} CineCore Systems. All masterrights reserved.
          </p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-cine-dust">
            Licensed as Open Source Portfolio Project
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href, label }: { icon: React.ReactNode, href: string, label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-3 bg-cine-onyx border border-cine-border text-cine-dust hover:text-cine-gold hover:border-cine-gold transition-all rounded-sm"
      whileHover={{ y: -4, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.a>
  );
}