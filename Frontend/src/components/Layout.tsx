import type { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Define the exact navigation links for each specific role
const NAV_LINKS = {
  ADMIN: ['Dashboard', 'All Projects', 'Distribution', 'Audit Logs'],
  FINANCE_MANAGER: ['Dashboard', 'Ledger', 'Contracts', 'Vendors'],
  PRODUCTION_MANAGER: ['Dashboard', 'Schedules', 'Locations', 'Permits'],
  DIRECTOR: ['Dashboard', 'Scripts', 'Talent', 'Music'],
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();
  
  const isHiddenPage = location.pathname === '/' || location.pathname === '/login';
  const isAudience = role === 'AUDIENCE';

  // Get the specific links for the logged-in role
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

            {/* Dynamic Role-Based Links */}
            <div className="hidden md:flex items-center gap-8">
              {isAudience ? (
                <Link to="/portfolio" className="font-body text-xs tracking-ultra text-cine-dust uppercase hover:text-cine-cream transition-colors">Released Films</Link>
              ) : (
                currentLinks.map((item) => (
                  <Link 
                    key={item} 
                    to={`/${item.toLowerCase().replace(' ', '-')}`} 
                    className="font-body text-xs tracking-ultra text-cine-dust uppercase hover:text-cine-cream transition-colors"
                  >
                    {item}
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
                <button onClick={handleSignOut} className="flex items-center gap-2 font-caption text-xs tracking-ultra uppercase text-cine-scarlet border border-cine-scarlet/40 px-4 py-1.5 hover:bg-cine-scarlet/10 transition-colors">
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