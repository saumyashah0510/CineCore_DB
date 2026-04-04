import { motion } from 'framer-motion';
import { 
  Film, Users, Wallet, MapPin, MonitorPlay, 
  AlertCircle, FileText, Music, Calendar, Clapperboard 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { role } = useAuth();

  // Helper to format the role name nicely
  const displayRole = role.replace('_', ' ');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-cine-border pb-6">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Clearance Level: {displayRole}
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Command Center</h1>
        </div>
        <div className="text-right">
          <span className="font-mono text-[10px] text-cine-dust uppercase tracking-widest">System Status</span>
          <div className="flex items-center justify-end gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono text-xs text-cine-cream">API Online</span>
          </div>
        </div>
      </div>

      {/* ── 1. PRODUCTION ADMIN VIEW ── */}
      {role === 'ADMIN' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-cine-border bg-cine-onyx p-8 relative overflow-hidden">
              <Film className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5" />
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Total Studio Slate</h3>
              <p className="font-display text-5xl text-cine-ivory mb-2">12</p>
              <p className="font-mono text-xs text-cine-gold uppercase">Active Projects in Pipeline</p>
            </div>
            <div className="border border-cine-border bg-cine-onyx p-8 relative overflow-hidden">
              <MonitorPlay className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5" />
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Global Matrix Revenue</h3>
              <p className="font-display text-5xl text-cine-ivory mb-2">₹100+ Cr</p>
              <p className="font-mono text-xs text-cine-gold uppercase">Theatrical & OTT Combined</p>
            </div>
          </div>
          
          <div className="border border-red-900/30 bg-red-900/10 p-6">
            <h3 className="font-caption text-xs tracking-widest text-red-500 uppercase flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" /> Studio Alerts
            </h3>
            <div className="space-y-2 font-mono text-sm text-cine-cream">
              <div className="flex justify-between border-b border-red-900/20 py-2">
                <span>Overspent Budget Heads</span> <span className="text-red-400">2 Warnings</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Overdue Milestone Payments</span> <span className="text-red-400">5 Pending</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 2. TALENT MANAGER VIEW ── */}
      {role === 'TALENT_MANAGER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/talent" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <Users className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Talent Registry</h3>
            <p className="font-body text-sm text-cine-dust">Manage global cast and crew profiles, contact info, and tax IDs.</p>
          </Link>
          <Link to="/contracts" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <FileText className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Contracts</h3>
            <p className="font-body text-sm text-cine-dust">Sign talent to projects and automatically generate payment milestones.</p>
          </Link>
          <Link to="/scripts" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <Clapperboard className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Script Vault</h3>
            <p className="font-body text-sm text-cine-dust">Track draft submissions, word counts, and writer approvals.</p>
          </Link>
        </motion.div>
      )}

      {/* ── 3. FINANCE MANAGER VIEW ── */}
      {role === 'FINANCE_MANAGER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/ledger" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <Wallet className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Expense Ledger</h3>
            <p className="font-body text-sm text-cine-dust mb-4">Record vendor invoices against specific budget heads. The system will automatically warn you of overspending.</p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cine-gold">Open Ledger →</span>
          </Link>
          <Link to="/payments" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block relative overflow-hidden">
            <div className="absolute top-6 right-6 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <FileText className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Milestone Payments</h3>
            <p className="font-body text-sm text-cine-dust mb-4">Clear scheduled payments for contracted talent. Filter by overdue status to prevent legal disputes.</p>
            <span className="font-mono text-[10px] uppercase tracking-widest text-cine-gold">Clear Payments →</span>
          </Link>
        </motion.div>
      )}

      {/* ── 4. PRODUCTION MANAGER VIEW ── */}
      {role === 'PRODUCTION_MANAGER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/locations" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <MapPin className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Locations</h3>
            <p className="font-body text-sm text-cine-dust">Manage physical shoot sites, daily rental costs, and facilities.</p>
          </Link>
          <Link to="/permits" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <FileText className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Permit Authority</h3>
            <p className="font-body text-sm text-cine-dust">Track applications and valid dates for drone flights and night shoots.</p>
          </Link>
          <Link to="/schedules" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block">
            <Calendar className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="font-display text-2xl text-cine-ivory mb-2">Shoot Schedules</h3>
            <p className="font-body text-sm text-cine-dust">Log daily call times, planned scenes, and track weather delays.</p>
          </Link>
        </motion.div>
      )}

      {/* ── 5. DISTRIBUTION MANAGER VIEW ── */}
      {role === 'DISTRIBUTION_MANAGER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/distribution" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block relative overflow-hidden">
            <MonitorPlay className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5 group-hover:text-cine-gold/10 transition-colors" />
            <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Global Matrix</h3>
            <p className="font-display text-3xl text-cine-ivory mb-2">OTT & Theatrical</p>
            <p className="font-body text-sm text-cine-dust max-w-sm">Log streaming licenses, track platform expirations, and record weekly box office grosses city by city.</p>
          </Link>
          <Link to="/music" className="group border border-cine-border bg-cine-onyx p-8 hover:border-cine-gold transition-colors block relative overflow-hidden">
            <Music className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5 group-hover:text-cine-gold/10 transition-colors" />
            <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Audio Rights</h3>
            <p className="font-display text-3xl text-cine-ivory mb-2">Music Catalog</p>
            <p className="font-body text-sm text-cine-dust max-w-sm">Register individual songs, link singers by voice type, and manage ISRC codes for digital distribution.</p>
          </Link>
        </motion.div>
      )}

    </div>
  );
}