import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// STRICT MAPPING BASED ON SCENARIOS DOC
const NAV_LINKS = {
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'All Projects', path: '/all-projects' }
  ],
  TALENT_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' }, // <-- Added!
    { label: 'Talent Registry', path: '/talent' },
    { label: 'Contracts', path: '/contracts' },
    { label: 'Scripts', path: '/scripts' }
  ],
  FINANCE_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' }, // <-- Added!
    { label: 'Expense Ledger', path: '/ledger' },
    { label: 'Milestone Payments', path: '/payments' }
  ],
  PRODUCTION_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' }, // <-- Added!
    { label: 'Locations', path: '/locations' },
    { label: 'Schedules', path: '/schedules' },
    { label: 'Permits', path: '/permits' }
  ],
  DISTRIBUTION_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' }, // <-- Added!
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
    <div className="min-h-screen bg-cine-void text-cine-ivory flex flex-col">
      {!isHiddenPage && (
        <nav className="sticky top-0 w-full z-50 bg-cine-void/90 backdrop-blur-md border-b border-cine-border">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-5 h-5 border border-cine-gold/60 rotate-45 flex items-center justify-center group-hover:border-cine-gold transition-colors duration-500">
                <div className="w-1.5 h-1.5 bg-cine-gold/80 group-hover:bg-cine-gold transition-colors duration-500" />
              </div>
              <span className="font-caption text-sm tracking-cinema uppercase text-cine-ivory">
                CineCore
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {isAudience ? (
                <Link to="/portfolio" className="font-body text-xs tracking-ultra text-cine-dust uppercase hover:text-cine-cream transition-colors">Released Films</Link>
              ) : (
                currentLinks.map((item) => (
                  <Link 
                    key={item.label} 
                    to={item.path} 
                    className={`font-body text-xs tracking-ultra uppercase transition-colors ${location.pathname === item.path ? 'text-cine-gold font-bold' : 'text-cine-dust hover:text-cine-cream'}`}
                  >
                    {item.label}
                  </Link>
                ))
              )}
            </div>

            <div className="flex items-center gap-4">
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
              <button className="md:hidden text-cine-dust hover:text-cine-ivory">
                <Menu className="w-5 h-5" />
              </button>
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