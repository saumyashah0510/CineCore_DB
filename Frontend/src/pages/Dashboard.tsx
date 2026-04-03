import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, Clapperboard, DollarSign, Film, Play, AlertCircle, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ── API Fetcher ─────────────────────────────────────────────────────────────
const fetchDashboardStats = async () => {
  const { data } = await api.get('/analytics/dashboard');
  return data;
};

// Formatter for Indian Rupees (Crores/Lakhs)
const formatINR = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
};

// Quick inline icons
function AwardIcon(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>; }
function FileTextIcon(props: any) { return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>; }

// ── Main Dashboard Component ────────────────────────────────────────────────
export default function Dashboard() {
  const { role } = useAuth();

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-cine-gold">
        <div className="w-12 h-12 border-2 border-cine-gold border-t-transparent rounded-full animate-spin mb-4" />
        <p className="font-mono text-xs tracking-widest uppercase">Syncing with CineCore API...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-cine-scarlet">
        <AlertTriangle className="w-16 h-16 mb-4" />
        <h2 className="font-display text-3xl mb-2">Connection Severed</h2>
        <p className="font-mono text-xs tracking-widest text-cine-dust">Ensure FastAPI is running on port 8000.</p>
      </div>
    );
  }

  // Determine what role we are dealing with to conditionally render sections
  const isFinanceOrAdmin = role === 'ADMIN' || role === 'FINANCE_MANAGER';
  const isProductionOrDirector = role === 'PRODUCTION_MANAGER' || role === 'DIRECTOR' || role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      
      {/* Header Segment */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-cine-border pb-6"
      >
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Clearance Level: {role.replace('_', ' ')}
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Command Center</h1>
        </div>
        <div className="font-mono text-xs text-cine-dust text-right">
          Database Synced: <span className="text-cine-cream">{new Date().toLocaleTimeString()}</span>
        </div>
      </motion.div>

      {/* ── ZONE 1: FINANCIALS (Admin & Finance Only) ── */}
      {isFinanceOrAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-cine-onyx border border-cine-border p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="w-32 h-32 text-cine-gold" />
            </div>
            <span className="font-caption text-sm tracking-widest text-cine-dust uppercase mb-2 block">Global Box Office</span>
            <div className="font-display text-5xl text-cine-gold mb-2">{formatINR(stats.total_box_office)}</div>
            <span className="font-body text-sm text-cine-cream flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" /> Revenue from Theatre Releases
            </span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-cine-onyx border border-cine-border p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Film className="w-32 h-32 text-cine-gold" />
            </div>
            <span className="font-caption text-sm tracking-widest text-cine-dust uppercase mb-2 block">OTT Licensing Revenue</span>
            <div className="font-display text-5xl text-cine-ivory mb-2">{formatINR(stats.total_ott_revenue)}</div>
            <span className="font-body text-sm text-cine-cream">Cumulative Streaming Deals</span>
          </motion.div>
        </div>
      )}

      {/* ── ZONE 2: OPERATIONS (Production, Director, Admin) ── */}
      {isProductionOrDirector && (
        <>
          <div className="mb-4 font-caption text-sm tracking-widest text-cine-gold uppercase block border-b border-cine-border/50 pb-2">
            Active Slate & Logistics
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: 'Total Projects', value: stats.total_projects, icon: Clapperboard },
              { label: 'Currently Shooting', value: stats.projects_shooting, icon: Play },
              { label: 'Released Films', value: stats.projects_released, icon: AwardIcon },
              { label: 'Active Contracts', value: stats.active_contracts, icon: FileTextIcon },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                // Using idx here to stagger the animation of each card perfectly!
                transition={{ delay: 0.3 + (idx * 0.1) }}
                className="bg-cine-onyx/50 border border-cine-border p-6 hover:border-cine-gold/30 transition-colors"
              >
                <stat.icon className="w-6 h-6 text-cine-gold/50 mb-4" />
                <div className="font-display text-3xl text-cine-ivory mb-1">{stat.value}</div>
                <div className="font-caption text-xs tracking-widest text-cine-dust uppercase">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ── ZONE 3: SYSTEM ALERTS (Triggers from Database - Finance/Admin Only) ── */}
      {isFinanceOrAdmin && (stats.overdue_payments > 0 || stats.overspent_heads > 0) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="border border-red-900/50 bg-red-950/10 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="font-caption text-sm tracking-widest text-red-500 uppercase font-bold">Alerts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.overdue_payments > 0 && (
              <div className="flex justify-between items-center bg-cine-void p-4 border border-red-900/30">
                <span className="font-body text-sm text-cine-cream">Overdue Contract Milestones</span>
                <span className="font-mono text-lg text-red-400 font-bold">{stats.overdue_payments}</span>
              </div>
            )}
            {stats.overspent_heads > 0 && (
              <div className="flex justify-between items-center bg-cine-void p-4 border border-red-900/30">
                <span className="font-body text-sm text-cine-cream">Overspent Budget Heads</span>
                <span className="font-mono text-lg text-red-400 font-bold">{stats.overspent_heads}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── ZONE 4: LOGISTICS ALERT (Production Only) ── */}
      {role === 'PRODUCTION_MANAGER' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="border border-cine-gold/30 bg-cine-gold/5 p-6 mt-8 flex items-center justify-between"
        >
          <div>
            <h3 className="font-caption text-sm tracking-widest text-cine-gold uppercase font-bold mb-1">Shoot Calendar Ready</h3>
            <p className="font-body text-sm text-cine-cream">View upcoming schedules and expiring location permits.</p>
          </div>
          <button className="bg-cine-gold text-cine-void px-6 py-2 font-caption text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Open Grid
          </button>
        </motion.div>
      )}

    </div>
  );
}