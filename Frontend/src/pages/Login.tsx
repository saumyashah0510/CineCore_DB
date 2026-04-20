import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Wallet, Clapperboard, ChevronLeft, Users, MonitorPlay, Lock, Unlock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const roles = [
  { id: 'ADMIN', label: 'Production Admin', desc: 'Greenlight projects & monitor studio health', icon: Shield },
  { id: 'TALENT_MANAGER', label: 'Talent Manager', desc: 'Manage casting, contracts & scripts', icon: Users },
  { id: 'FINANCE_MANAGER', label: 'Finance Manager', desc: 'Clear milestones & track budget overruns', icon: Wallet },
  { id: 'PRODUCTION_MANAGER', label: 'Production Manager', desc: 'Locations, permits & shoot schedules', icon: Clapperboard },
  { id: 'DISTRIBUTION_MANAGER', label: 'Distribution Manager', desc: 'OTT deals, box office & music rights', icon: MonitorPlay }
] as const;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showSuperadmin, setShowSuperadmin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuperadmin, setIsSuperadmin] = useState(() => !!localStorage.getItem('cinecore_superadmin'));

  useEffect(() => {
    const handleStorageChange = () => setIsSuperadmin(!!localStorage.getItem('cinecore_superadmin'));
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('superadmin_changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('superadmin_changed', handleStorageChange);
    };
  }, []);

  const handleLogin = (roleId: any) => {
    login(roleId);
    navigate('/dashboard');
  };

  const handleSuperadminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const adminEmail = import.meta.env.VITE_SUPERADMIN_EMAIL || 'admin@cinecore.com';
    const adminPass = import.meta.env.VITE_SUPERADMIN_PASSWORD || 'superadminkey123';
    
    if (email === adminEmail && password === adminPass) {
      localStorage.setItem('cinecore_superadmin', password);
      setIsSuperadmin(true);
      window.dispatchEvent(new Event('superadmin_changed'));
      setShowSuperadmin(false);
    } else {
      alert('Invalid superadmin credentials. Database locked.');
    }
  };

  return (
    <div className="min-h-screen bg-cine-void flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-cine-gold/30">
      
      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-cine-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-4xl"
      >
        <button onClick={() => navigate('/')} className="mb-12 flex items-center gap-2 text-cine-dust hover:text-cine-cream transition-colors font-caption tracking-widest text-xs uppercase">
          <ChevronLeft className="w-4 h-4" /> Return to Home
        </button>

        <div className="mb-8 border-l-2 border-cine-gold pl-6">
          <h1 className="font-display text-4xl text-gradient-gold mb-2">Identity Verification</h1>
          <p className="font-mono text-xs text-cine-dust tracking-widest uppercase">
            Select role to access CineCore
          </p>
        </div>

        {/* --- PROMINENT DEMO / SUPERADMIN BANNER --- */}
        {isSuperadmin ? (
          <div className="mb-10 p-4 border border-green-500 bg-green-500/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Unlock className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-sm text-green-400 uppercase tracking-widest font-bold">Database Unlocked</h3>
                <p className="font-body text-xs text-cine-dust mt-1">You are currently in Superadmin mode. All changes will be saved permanently. Select a role below to begin editing.</p>
              </div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('cinecore_superadmin');
                setIsSuperadmin(false);
                window.dispatchEvent(new Event('superadmin_changed'));
              }}
              className="px-6 py-2 bg-green-500 text-cine-void font-caption text-xs font-bold uppercase tracking-widest hover:bg-green-400 transition-colors shrink-0"
            >
              Lock DB
            </button>
          </div>
        ) : (
          <div className="mb-10 p-4 border border-cine-gold bg-cine-gold/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-cine-gold shrink-0 mt-0.5" />
              <div>
                <h3 className="font-heading text-sm text-cine-gold uppercase tracking-widest font-bold">Database is in Demo Mode</h3>
                <p className="font-body text-xs text-cine-dust mt-1">Changes are simulated. To persist data to PostgreSQL, unlock developer access.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowSuperadmin(!showSuperadmin)}
              className="px-6 py-2 bg-cine-gold text-cine-void font-caption text-xs font-bold uppercase tracking-widest hover:bg-cine-gold-light transition-colors shrink-0"
            >
              {showSuperadmin ? 'Cancel' : 'Unlock DB'}
            </button>
          </div>
        )}

        <AnimatePresence>
          {showSuperadmin && (
            <motion.form 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              onSubmit={handleSuperadminLogin}
              className="border border-cine-gold/30 bg-cine-onyx/50 p-6 overflow-hidden max-w-md mx-auto"
            >
              <div className="flex items-center gap-3 mb-4 text-cine-gold">
                <Lock className="w-5 h-5" />
                <h3 className="font-caption tracking-widest text-sm uppercase">Superadmin Override</h3>
              </div>
              <div className="space-y-4">
                <input 
                  type="email" placeholder="Master Email" required
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-cine-void border border-cine-border p-3 text-cine-ivory font-mono text-sm focus:outline-none focus:border-cine-gold"
                />
                <input 
                  type="password" placeholder="Master Password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-cine-void border border-cine-border p-3 text-cine-ivory font-mono text-sm focus:outline-none focus:border-cine-gold"
                />
                <button type="submit" className="w-full bg-cine-gold text-cine-void py-3 font-caption text-xs uppercase font-bold tracking-widest hover:bg-cine-gold-light transition-colors">
                  Submit Credentials
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {roles.map((role, idx) => {
            const Icon = role.icon;
            return (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => handleLogin(role.id)}
                className="group relative flex items-start gap-6 p-6 bg-cine-onyx border border-cine-border hover:border-cine-gold/40 transition-all duration-500 text-left overflow-hidden"
              >
                {/* Hover sweep */}
                <div className="absolute inset-0 bg-gradient-to-r from-cine-gold/0 via-cine-gold/5 to-cine-gold/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="p-4 border border-cine-border bg-cine-void group-hover:border-cine-gold/50 transition-colors duration-500 shrink-0">
                  <Icon className="w-6 h-6 text-cine-gold" strokeWidth={1.5} />
                </div>
                
                <div className="relative z-10">
                  <h3 className="font-heading text-xl text-cine-ivory mb-2 group-hover:text-cine-gold transition-colors duration-300">
                    {role.label}
                  </h3>
                  <p className="font-body text-sm text-cine-dust leading-relaxed">
                    {role.desc}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

      </motion.div>
    </div>
  );
}