import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Wallet, Clapperboard, ChevronLeft, Users, MonitorPlay } from 'lucide-react';
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

  const handleLogin = (roleId: any) => {
    login(roleId);
    navigate('/dashboard');
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

        <div className="mb-12 border-l-2 border-cine-gold pl-6">
          <h1 className="font-display text-4xl text-gradient-gold mb-2">Identity Verification</h1>
          <p className="font-mono text-xs text-cine-dust tracking-widest uppercase">
            Select role to access CineCore
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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