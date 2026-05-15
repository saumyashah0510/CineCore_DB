import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Database, Lock, Unlock, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CustomCursor } from './CinematicEffects';
import Footer from './Footer';
import GlobalSearch from './GlobalSearch';
import AIChatWidget from './AIChatWidget';

// STRICT MAPPING BASED ON SCENARIOS DOC
const NAV_LINKS = {
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'All Projects', path: '/all-projects' }
  ],
  TALENT_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Registry', path: '/talent' },
    { label: 'Contracts', path: '/contracts' },
    { label: 'Scripts', path: '/scripts' }
  ],
  FINANCE_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Expense Ledger', path: '/ledger' },
    { label: 'Milestone Payments', path: '/payments' }
  ],
  PRODUCTION_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Locations', path: '/locations' },
    { label: 'Schedules', path: '/schedules' },
    { label: 'Permits', path: '/permits' }
  ],
  DISTRIBUTION_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'OTT & Theatrical', path: '/distribution' },
    { label: 'Music & Audio', path: '/music' }
  ],
};

// Abbreviated role labels to keep navbar compact
const ROLE_SHORT: Record<string, string> = {
  ADMIN: 'ADMIN',
  TALENT_MANAGER: 'TALENT',
  FINANCE_MANAGER: 'FINANCE',
  PRODUCTION_MANAGER: 'PROD',
  DISTRIBUTION_MANAGER: 'DISTRIB',
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);

  const isHiddenPage = location.pathname === '/' || location.pathname === '/login';
  const isAudience = role === 'AUDIENCE';

  const currentLinks = isAudience ? [] : NAV_LINKS[role as keyof typeof NAV_LINKS] || [];

  const [isSuperadmin, setIsSuperadmin] = useState(() => {
    return !!localStorage.getItem('cinecore_superadmin');
  });

  useEffect(() => {
    const handleStorageChange = () => setIsSuperadmin(!!localStorage.getItem('cinecore_superadmin'));
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('superadmin_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('superadmin_changed', handleStorageChange);
    };
  }, []);

  // Global Cmd+K / Ctrl+K shortcut to open search
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const handleSuperadminLogout = () => {
    localStorage.removeItem('cinecore_superadmin');
    setIsSuperadmin(false);
    window.dispatchEvent(new Event('superadmin_changed'));
    alert('Database Locked.');
  };

  return (
    <div className="min-h-screen bg-cine-void text-cine-ivory flex flex-col relative">
      <CustomCursor />

      {!isHiddenPage && (
        <nav className="sticky top-0 w-full z-50">
          <div className="bg-cine-void border-b border-cine-border/40">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

              {/* Logo */}
              <Link to="/" className="flex items-center gap-3 group">
                <motion.div
                  className="w-5 h-5 border border-cine-gold/60 rotate-45 flex items-center justify-center group-hover:border-cine-gold transition-colors duration-500"
                  whileHover={{ rotate: 225, scale: 1.1 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="w-1.5 h-1.5 bg-cine-gold/80 group-hover:bg-cine-gold transition-colors duration-500" />
                </motion.div>
                <span className="font-caption text-sm tracking-cinema uppercase text-cine-ivory">
                  CineCore
                </span>
              </Link>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-1">
                {isAudience ? (
                  <>
                    <Link to="/portfolio" className="font-body text-xs tracking-ultra text-cine-dust uppercase hover:text-cine-cream transition-colors px-4 py-2 reveal-line">Released Films</Link>
                    <Link to="/dbms" className="font-body text-xs tracking-ultra text-cine-dust uppercase hover:text-cine-cream transition-colors px-4 py-2 reveal-line flex items-center gap-1.5">
                      <Database className="w-3 h-3" /> DBMS
                    </Link>
                  </>
                ) : (
                  <>
                    {currentLinks.map((item) => {
                      const isActive = location.pathname === item.path;
                      return (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="relative px-2 py-2 group"
                        >
                          <span className={`font-body text-xs tracking-ultra uppercase whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-cine-gold' : 'text-cine-dust group-hover:text-cine-cream'
                            }`}>
                            {item.label}
                          </span>

                          {isActive && (
                            <motion.div
                              layoutId="nav-indicator"
                              className="absolute bottom-0 left-2 right-2 h-[2px]"
                              style={{
                                background: 'linear-gradient(90deg, transparent, #B8962E, transparent)',
                              }}
                              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                            />
                          )}

                          {!isActive && (
                            <div className="absolute bottom-0 left-4 right-4 h-px bg-cine-gold/0 group-hover:bg-cine-gold/30 transition-all duration-500" />
                          )}
                        </Link>
                      );
                    })}
                    {/* DBMS link for logged-in users too */}
                    <Link to="/dbms" className="relative px-4 py-2 group">
                      <span className={`font-body text-xs tracking-ultra uppercase transition-colors duration-300 flex items-center gap-1.5 ${location.pathname === '/dbms' ? 'text-cine-gold' : 'text-cine-dust group-hover:text-cine-cream'
                        }`}>
                        <Database className="w-3 h-3" /> DBMS
                      </span>
                      {location.pathname === '/dbms' && (
                        <motion.div
                          layoutId="nav-indicator"
                          className="absolute bottom-0 left-2 right-2 h-[2px]"
                          style={{ background: 'linear-gradient(90deg, transparent, #B8962E, transparent)' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                        />
                      )}
                    </Link>
                  </>
                )}
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">

                {/* Search Button — icon only to save navbar space */}
                <button
                  onClick={() => setSearchOpen(true)}
                  className="flex items-center justify-center w-8 h-8 border border-cine-border text-cine-dust hover:border-cine-gold/40 hover:text-cine-ivory transition-colors"
                  title="Search (Ctrl+K)"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>

                {isSuperadmin ? (
                  <button onClick={handleSuperadminLogout}
                    className="hidden lg:flex items-center justify-center w-7 h-7 border border-green-500/50 bg-green-500/10 hover:bg-green-500/20 transition-colors text-green-400"
                    title="DB Unlocked — Click to lock"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div
                    className="hidden lg:flex items-center justify-center w-7 h-7 border border-cine-border bg-cine-void text-cine-dust"
                    title="Database is read-only (Demo Mode)"
                  >
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                )}

                {!isAudience && (
                  <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 border border-cine-border">
                    <div className="w-1.5 h-1.5 rounded-full bg-cine-gold" />
                    <span className="font-mono text-[9px] tracking-widest text-cine-gold/80 uppercase">
                      {ROLE_SHORT[role] || role}
                    </span>
                  </div>
                )}

                {isAudience ? (
                  <Link to="/login" className="flex items-center gap-2 font-caption text-xs tracking-ultra uppercase text-cine-gold border border-cine-gold/40 px-3 py-1.5 hover:bg-cine-gold/10 transition-colors">
                    <User className="w-3.5 h-3.5" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <button onClick={handleSignOut} className="flex items-center gap-1.5 font-caption text-xs tracking-ultra uppercase text-red-500 border border-red-900/40 px-3 py-1.5 hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}

      <main className="flex-1 flex flex-col relative z-10">
        {children}
      </main>

      <Footer />

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* AI Chat Widget */}
      {(!isHiddenPage && !isAudience) && <AIChatWidget />}
    </div>
  );
}