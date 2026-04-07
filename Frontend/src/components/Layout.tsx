import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, LogOut, Database } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { CustomCursor } from './CinematicEffects';

// STRICT MAPPING BASED ON SCENARIOS DOC
const NAV_LINKS = {
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'All Projects', path: '/all-projects' }
  ],
  TALENT_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Talent Registry', path: '/talent' },
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

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const isHiddenPage = location.pathname === '/' || location.pathname === '/login';
  const isAudience = role === 'AUDIENCE';

  const currentLinks = isAudience ? [] : NAV_LINKS[role as keyof typeof NAV_LINKS] || [];

  const handleSignOut = () => {
    logout();
    navigate('/');
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
                          className="relative px-4 py-2 group"
                        >
                          <span className={`font-body text-xs tracking-ultra uppercase transition-colors duration-300 ${isActive ? 'text-cine-gold' : 'text-cine-dust group-hover:text-cine-cream'
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
              <div className="flex items-center gap-4">
                {!isAudience && (
                  <div className="hidden lg:flex items-center gap-2 px-3 py-1 border border-cine-border">
                    <div className="w-1.5 h-1.5 rounded-full bg-cine-gold" />
                    <span className="font-mono text-[9px] tracking-widest text-cine-gold/80 uppercase">
                      {role.replace('_', ' ')}
                    </span>
                  </div>
                )}

                {isAudience ? (
                  <Link to="/login" className="flex items-center gap-2 font-caption text-xs tracking-ultra uppercase text-cine-gold border border-cine-gold/40 px-4 py-1.5 hover:bg-cine-gold/10 transition-colors">
                    <User className="w-3.5 h-3.5" />
                    <span>Staff Login</span>
                  </Link>
                ) : (
                  <button onClick={handleSignOut} className="flex items-center gap-2 font-caption text-xs tracking-ultra uppercase text-red-500 border border-red-900/40 px-4 py-1.5 hover:bg-red-900/20 transition-colors">
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
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
    </div>
  );
}