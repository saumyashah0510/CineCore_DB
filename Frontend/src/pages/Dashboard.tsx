import { motion } from 'framer-motion';
import {
  Film, Users, Wallet, MapPin, MonitorPlay,
  AlertCircle, FileText, Music, Calendar, Clapperboard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export default function Dashboard() {
  const { role } = useAuth();

  // 1. Dynamic Project Fetching for Admin & Finance views
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projectsAll'],
    queryFn: async () => {
      const { data } = await api.get('/projects/');
      return data;
    },
    enabled: role === 'ADMIN' || role === 'FINANCE_MANAGER'
  });

  // 2. Calculations for Admin Visuals
  const totalProjects = projects?.length || 0;
  const shootingProjects = projects?.filter((p: any) => p.status === 'SHOOTING').length || 0;
  const releasedProjects = projects?.filter((p: any) => p.status === 'RELEASED').length || 0;

  const displayRole = role.replace('_', ' ');

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">

      {/* ── HEADER ── */}
      <div className="mb-10 border-b border-cine-border pb-6 flex justify-between items-end">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Clearance Level: {displayRole}
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Command Center</h1>
        </div>
        <div className="text-right font-mono text-[10px] text-cine-dust uppercase tracking-widest">
          Fiscal Year 2025-26
        </div>
      </div>

      {/* ── 1. PRODUCTION ADMIN VIEW ── */}
      {role === 'ADMIN' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-cine-border bg-cine-onyx p-8 relative overflow-hidden">
              <Film className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5" />
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Total Studio Slate</h3>
              <p className="font-display text-5xl text-cine-ivory mb-2">
                {projectsLoading ? '...' : totalProjects}
              </p>
              <p className="font-mono text-xs text-cine-gold uppercase">Active Projects in Registry</p>
            </div>
            <div className="border border-cine-border bg-cine-onyx p-8 relative overflow-hidden">
              <MonitorPlay className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5" />
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Global Matrix Revenue</h3>
              <p className="font-display text-5xl text-cine-ivory mb-2">₹100+ Cr</p>
              <p className="font-mono text-xs text-cine-gold uppercase">Theatrical & OTT Combined</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-cine-onyx border border-cine-border p-4">
              <div className="font-mono text-[10px] text-cine-dust uppercase mb-1">Currently Shooting</div>
              <div className="font-display text-2xl text-cine-gold">{shootingProjects}</div>
            </div>
            <div className="bg-cine-onyx border border-cine-border p-4">
              <div className="font-mono text-[10px] text-cine-dust uppercase mb-1">Released Films</div>
              <div className="font-display text-2xl text-cine-ivory">{releasedProjects}</div>
            </div>
          </div>

          <div className="border border-red-900/30 bg-red-900/10 p-6">
            <h3 className="font-caption text-xs tracking-widest text-red-500 uppercase flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4" /> Studio Alerts
            </h3>
            <div className="space-y-2 font-mono text-sm text-cine-cream">
              <div className="flex justify-between border-b border-red-900/20 py-2">
                <span>Overspent Budget Heads</span> <span className="text-red-400">1 Warning</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Overdue Milestone Payments</span> <span className="text-red-400">21 Pending</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 2. TALENT MANAGER VIEW ── */}
      {role === 'TALENT_MANAGER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/talent" className="flex items-center gap-4 border border-cine-border bg-cine-onyx p-4 hover:border-cine-gold transition-colors">
              <div className="p-3 bg-cine-void border border-cine-border text-cine-gold"><Users className="w-5 h-5" /></div>
              <div><h3 className="font-display text-xl text-cine-ivory">Talent Registry</h3><p className="font-mono text-[10px] text-cine-dust uppercase">Manage Global Roster</p></div>
            </Link>
            <Link to="/contracts" className="flex items-center gap-4 border border-cine-border bg-cine-onyx p-4 hover:border-cine-gold transition-colors">
              <div className="p-3 bg-cine-void border border-cine-border text-cine-gold"><FileText className="w-5 h-5" /></div>
              <div><h3 className="font-display text-xl text-cine-ivory">Active Contracts</h3><p className="font-mono text-[10px] text-cine-dust uppercase">Draft & Sign Agreements</p></div>
            </Link>
            <Link to="/scripts" className="flex items-center gap-4 border border-cine-border bg-cine-onyx p-4 hover:border-cine-gold transition-colors">
              <div className="p-3 bg-cine-void border border-cine-border text-cine-gold"><Clapperboard className="w-5 h-5" /></div>
              <div><h3 className="font-display text-xl text-cine-ivory">Script Vault</h3><p className="font-mono text-[10px] text-cine-dust uppercase">Review Writer Drafts</p></div>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-cine-border bg-cine-onyx p-6">
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Contract Status Pipeline
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1"><span className="text-cine-cream">Completed</span><span className="text-cine-gold">73.33%</span></div>
                  <div className="w-full bg-cine-void h-2 rounded-full overflow-hidden"><div className="bg-cine-gold h-full" style={{ width: '73%' }} /></div>
                </div>
                <div>
                  <div className="flex justify-between font-mono text-xs mb-1"><span className="text-cine-cream">Active</span><span className="text-blue-400">26.67%</span></div>
                  <div className="w-full bg-cine-void h-2 rounded-full overflow-hidden"><div className="bg-blue-400 h-full" style={{ width: '26%' }} /></div>
                </div>
              </div>
            </div>

            <div className="border border-cine-border bg-cine-onyx p-6">
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                <Users className="w-4 h-4" /> Talent Composition
              </h3>
              <div className="w-full h-8 flex gap-1 mb-4">
                <div className="bg-cine-gold h-full flex-grow relative group" style={{ flexBasis: '50%' }}>
                  <span className="absolute -top-6 left-1 opacity-0 group-hover:opacity-100 font-mono text-[10px] text-cine-gold transition-opacity">Actors</span>
                </div>
                <div className="bg-purple-400 h-full flex-grow relative group" style={{ flexBasis: '25%' }}>
                  <span className="absolute -top-6 left-1 opacity-0 group-hover:opacity-100 font-mono text-[10px] text-purple-400 transition-opacity">Writers</span>
                </div>
                <div className="bg-blue-400 h-full flex-grow relative group" style={{ flexBasis: '15%' }}>
                  <span className="absolute -top-6 left-1 opacity-0 group-hover:opacity-100 font-mono text-[10px] text-blue-400 transition-opacity">Directors</span>
                </div>
                <div className="bg-cine-border h-full flex-grow relative group" style={{ flexBasis: '10%' }}>
                  <span className="absolute -top-6 right-0 opacity-0 group-hover:opacity-100 font-mono text-[10px] text-cine-dust transition-opacity">Other</span>
                </div>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-cine-dust uppercase tracking-wider">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-cine-gold" /> Actors</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-purple-400" /> Writers</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-400" /> Directors</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── 3. FINANCE MANAGER VIEW ── */}
      {role === 'FINANCE_MANAGER' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

          {/* ── TOP ACTION TILES ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/ledger" className="group bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold transition-all">
              <Wallet className="w-8 h-8 text-cine-gold mb-4" />
              <h3 className="font-display text-2xl text-cine-ivory">Expense Ledger</h3>
              <p className="font-body text-sm text-cine-dust mt-2">Log new vendor invoices and assign them to departments.</p>
              <div className="mt-4 font-mono text-[10px] text-cine-gold uppercase tracking-widest">Add New Expense →</div>
            </Link>

            <Link to="/payments" className="group bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold transition-all">
              <FileText className="w-8 h-8 text-cine-gold mb-4" />
              <h3 className="font-display text-2xl text-cine-ivory">Milestone Payments</h3>
              <p className="font-body text-sm text-cine-dust mt-2">View and clear the 30/40/30 payments for signed talent.</p>
              <div className="mt-4 font-mono text-[10px] text-cine-gold uppercase tracking-widest">Clear 21 Pending →</div>
            </Link>
          </div>

          {/* ── PROJECT BUDGET MONITOR ── */}
          <div className="bg-cine-onyx border border-cine-border overflow-hidden">
            <div className="p-4 border-b border-cine-border bg-cine-void/50">
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase">Studio Budget Overview</h3>
            </div>

            <div className="divide-y divide-cine-border/50">
              {projects?.map((p: any) => (
                <div key={p.project_id} className="p-6 hover:bg-cine-border/10 transition-colors">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div>
                      <h4 className="font-display text-xl text-cine-ivory">{p.title}</h4>
                      <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider">{p.production_house} • {p.status}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs text-cine-dust uppercase block mb-1">Sanctioned Budget</span>
                      <span className="font-display text-2xl text-cine-gold">₹{(p.total_budget / 10000000).toFixed(2)} Cr</span>
                    </div>
                  </div>

                  {/* Simple Visual: Expenses vs Budget */}
                  <div className="space-y-2">
                    <div className="flex justify-between font-mono text-[10px] text-cine-dust uppercase">
                      <span>Expenses Recorded</span>
                      <span>{p.expenses} Invoices Logged</span>
                    </div>
                    <div className="w-full bg-cine-void h-2 rounded-full overflow-hidden border border-cine-border">
                      {/* We use the expense count just for visual since we're fetching project summary */}
                      <div
                        className="bg-cine-gold h-full"
                        style={{ width: p.expenses > 0 ? '35%' : '0%' }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

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