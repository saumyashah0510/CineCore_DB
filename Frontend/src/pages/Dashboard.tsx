import { motion } from 'framer-motion';
import {
  Film, Users, Wallet, MapPin, MonitorPlay, FileText, Music, Calendar, Clapperboard, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AnimatedCounter, CineDivider, ScrollReveal } from '../components/CinematicEffects';

const cardVariants = {
  hidden: { opacity: 0, y: 25, filter: 'blur(6px)' },
  visible: (i: number) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  }),
};

export default function Dashboard() {
  const { role } = useAuth();

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projectsAll'],
    queryFn: async () => (await api.get('/projects/')).data,
    refetchOnWindowFocus: true,
  });

  const { data: prodStats, isLoading: prodLoading } = useQuery({
    queryKey: ['productionStats'],
    queryFn: async () => (await api.get('/production/dashboard-stats')).data,
    enabled: role === 'PRODUCTION_MANAGER',
    refetchInterval: 60000,
  });

  const totalProjects = projects?.length || 0;
  const shootingProjects = projects?.filter((p: any) => p.status === 'SHOOTING').length || 0;
  const releasedProjects = projects?.filter((p: any) => p.status === 'RELEASED').length || 0;
  const displayRole = role.replace('_', ' ');

  function OverrunWarning({ projectId }: { projectId: number }) {
    const { data: overruns } = useQuery({
      queryKey: ['overruns', projectId],
      queryFn: async () => (await api.get(`/projects/${projectId}/overruns`)).data,
    });
    if (!overruns || overruns.length === 0) return null;
    return (
      <div className="mt-2 flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-2">
        <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
        <p className="font-mono text-[9px] text-red-400 leading-tight">
          {overruns.join(', ')} — budget limit exceeded
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full relative">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 border-b border-cine-border/40 pb-6"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-cine-gold" />
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase">
            {displayRole}
          </span>
        </div>
        <h1 className="font-display text-5xl text-gradient-gold">Dashboard</h1>
      </motion.div>

      {/* ── ADMIN VIEW ── */}
      {role === 'ADMIN' && (
        <motion.div initial="hidden" animate="visible" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div custom={0} variants={cardVariants}>
              <div className="bg-cine-onyx border border-cine-border p-8 relative overflow-hidden hover:border-cine-gold/30 transition-colors">
                <Film className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5" />
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Total Projects</h3>
                <p className="font-display text-6xl text-cine-ivory mb-2">
                  {projectsLoading ? '...' : <AnimatedCounter value={totalProjects} />}
                </p>
                <p className="font-mono text-xs text-cine-gold uppercase">Active in Registry</p>
              </div>
            </motion.div>
            <motion.div custom={1} variants={cardVariants}>
              <div className="bg-cine-onyx border border-cine-border p-8 relative overflow-hidden hover:border-cine-gold/30 transition-colors">
                <MonitorPlay className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5" />
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-4">Revenue</h3>
                <p className="font-display text-6xl text-gradient-gold mb-2">₹100+ Cr</p>
                <p className="font-mono text-xs text-cine-gold uppercase">Theatrical & OTT Combined</p>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-in">
            {[
              { label: 'Shooting', value: shootingProjects, color: 'text-cine-gold' },
              { label: 'Released', value: releasedProjects, color: 'text-cine-ivory' },
              { label: 'Development', value: projects?.filter((p: any) => p.status === 'DEVELOPMENT').length || 0, color: 'text-orange-400' },
              { label: 'Post Production', value: projects?.filter((p: any) => p.status === 'POST_PRODUCTION').length || 0, color: 'text-purple-400' },
            ].map((stat) => (
              <div key={stat.label} className="bg-cine-onyx border border-cine-border p-4 hover:border-cine-gold/20 transition-colors">
                <div className="font-mono text-[10px] text-cine-dust uppercase mb-1">{stat.label}</div>
                <div className={`font-display text-3xl ${stat.color}`}>
                  <AnimatedCounter value={stat.value} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── TALENT MANAGER VIEW ── */}
      {role === 'TALENT_MANAGER' && (
        <motion.div initial="hidden" animate="visible" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { to: '/talent', icon: Users, title: 'Talent Registry', sub: 'Manage Global Roster', idx: 0 },
              { to: '/contracts', icon: FileText, title: 'Active Contracts', sub: 'Draft & Sign Agreements', idx: 1 },
              { to: '/scripts', icon: Clapperboard, title: 'Script Vault', sub: 'DRAFT to APPROVED Pipeline', idx: 2 },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.to} custom={card.idx} variants={cardVariants}>
                  <Link to={card.to} className="block group">
                    <div className="bg-cine-onyx border border-cine-border p-5 hover:border-cine-gold/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-cine-void border border-cine-border text-cine-gold group-hover:border-cine-gold/40 transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-display text-xl text-cine-ivory group-hover:text-cine-gold transition-colors">{card.title}</h3>
                          <p className="font-mono text-[10px] text-cine-dust uppercase">{card.sub}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <CineDivider />

          <ScrollReveal>
            <div className="bg-cine-onyx border border-cine-border p-6">
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Contract Status Pipeline
              </h3>
              <div className="space-y-4 font-mono text-xs">
                <div>
                  <div className="flex justify-between mb-1"><span className="text-cine-cream">Completed</span><span className="text-cine-gold">73%</span></div>
                  <div className="w-full bg-cine-void h-2 rounded-full overflow-hidden border border-cine-border/30">
                    <motion.div initial={{ width: 0 }} animate={{ width: '73%' }} transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} className="bg-gradient-to-r from-cine-gold-dim to-cine-gold h-full rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1"><span className="text-cine-cream">Active</span><span className="text-blue-400">27%</span></div>
                  <div className="w-full bg-cine-void h-2 rounded-full overflow-hidden border border-cine-border/30">
                    <motion.div initial={{ width: 0 }} animate={{ width: '27%' }} transition={{ duration: 1.2, delay: 0.7, ease: [0.22, 1, 0.36, 1] }} className="bg-gradient-to-r from-blue-900 to-blue-400 h-full rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </motion.div>
      )}

      {/* ── FINANCE MANAGER VIEW ── */}
      {role === 'FINANCE_MANAGER' && (
        <motion.div initial="hidden" animate="visible" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { to: '/ledger', icon: Wallet, title: 'Expense Ledger', desc: 'Log vendor invoices and track budget burn.', cta: 'Add New Expense →', idx: 0 },
              { to: '/payments', icon: FileText, title: 'Milestone Payments', desc: 'View and clear PENDING / OVERDUE payments.', cta: 'Clear Overdue →', idx: 1 },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.to} custom={card.idx} variants={cardVariants}>
                  <Link to={card.to} className="group block">
                    <div className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/30 transition-colors">
                      <Icon className="w-8 h-8 text-cine-gold mb-4" />
                      <h3 className="font-display text-2xl text-cine-ivory group-hover:text-cine-gold transition-colors">{card.title}</h3>
                      <p className="font-body text-sm text-cine-dust mt-2">{card.desc}</p>
                      <div className="mt-4 font-mono text-[10px] text-cine-gold uppercase tracking-widest">{card.cta}</div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <CineDivider />

          <ScrollReveal>
            <div className="bg-cine-onyx border border-cine-border overflow-hidden">
              <div className="p-4 border-b border-cine-border/30 bg-cine-void/30 flex justify-between items-center">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase italic flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Budget Utilization
                </h3>
              </div>

              <div className="divide-y divide-cine-border/30">
                {projects?.map((p: any, idx: number) => (
                  <motion.div
                    key={p.project_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="p-6 hover:bg-cine-border/5 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                      <div>
                        <h4 className="font-display text-xl text-cine-ivory">{p.title}</h4>
                        <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider">{p.status} • {p.production_house}</p>
                        {p.overspent_flag && <OverrunWarning projectId={p.project_id} />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="w-full bg-cine-void h-2.5 rounded-full overflow-hidden border border-cine-border/30">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(((p.total_used || 0) / p.total_budget) * 100, 100)}%` }}
                          transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                          className={`h-full rounded-full ${p.overspent_flag
                              ? 'bg-gradient-to-r from-red-900 to-red-500'
                              : 'bg-gradient-to-r from-cine-gold-dim to-cine-gold'
                            }`}
                        />
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-cine-dust uppercase tracking-widest">
                        <span>{((p.total_used / p.total_budget) * 100).toFixed(1)}% Used</span>
                        <span>{p.expenses} Invoices</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </motion.div>
      )}

      {/* ── PRODUCTION MANAGER VIEW ── */}
      {role === 'PRODUCTION_MANAGER' && (
        <motion.div initial="hidden" animate="visible" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { to: '/locations', icon: MapPin, title: 'Locations', desc: 'Outdoor, indoor set, and international shoot locations.', idx: 0 },
              { to: '/permits', icon: ShieldCheck, title: 'Permits', desc: 'Manage permit applications and clearances.', idx: 1 },
              { to: '/schedules', icon: Calendar, title: 'Schedules', desc: 'Plan shoot days and manage call times.', idx: 2 },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.to} custom={card.idx} variants={cardVariants}>
                  <Link to={card.to} className="group block">
                    <div className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/30 transition-colors">
                      <Icon className="w-8 h-8 text-cine-gold mb-6 group-hover:scale-110 transition-transform" />
                      <h3 className="font-display text-2xl text-cine-ivory mb-2 group-hover:text-cine-gold transition-colors">{card.title}</h3>
                      <p className="font-body text-sm text-cine-dust">{card.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <CineDivider />

          <ScrollReveal>
            <div className="bg-cine-onyx border border-cine-border p-6">
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6">
                Production Status
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono stagger-in">
                {[
                  { label: 'Active Units', value: prodStats?.active_units || 0, color: 'text-cine-ivory' },
                  { label: 'Scheduled Today', value: prodStats?.scheduled_today || 0, color: 'text-cine-gold' },
                  { label: 'Pending Permits', value: prodStats?.pending_permits || 0, color: prodStats?.pending_permits > 0 ? 'text-orange-400' : 'text-cine-ivory' },
                  { label: 'Postponed', value: prodStats?.weather_alerts || 0, color: prodStats?.weather_alerts > 0 ? 'text-red-500' : 'text-green-400' },
                ].map((stat) => (
                  <div key={stat.label} className="p-4 bg-cine-void border border-cine-border">
                    <div className="text-[10px] text-cine-dust mb-1 uppercase">{stat.label}</div>
                    <div className={`text-3xl ${stat.color}`}>
                      {prodLoading ? '...' : <AnimatedCounter value={stat.value} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </motion.div>
      )}

      
      {/* ── DISTRIBUTION MANAGER VIEW ── */}
      {role === 'DISTRIBUTION_MANAGER' && (
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { to: '/distribution', icon: MonitorPlay, title: 'OTT Deals & Box Office', desc: 'Manage OTT platform licenses and theatre release collections.', idx: 0 },
            { to: '/music', icon: Music, title: 'Music Catalog', desc: 'Register songs, link singers, and manage recordings.', idx: 1 },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.to}
                custom={card.idx}
                variants={cardVariants}
                className="flex" // Forces the motion wrapper to behave as a flex item
              >
                <Link to={card.to} className="group block w-full h-full"> {/* h-full ensures Link fills the height */}
                  <div className="bg-cine-onyx border border-cine-border p-8 relative overflow-hidden hover:border-cine-gold/30 transition-colors h-full flex flex-col"> {/* h-full + flex-col makes the card itself stretch */}
                    <Icon className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5 group-hover:text-cine-gold/10 transition-colors duration-700" />

                    <p className="font-display text-3xl text-cine-ivory mb-2 group-hover:text-cine-gold transition-colors">
                      {card.title}
                    </p>

                    <p className="font-body text-sm text-cine-dust max-w-sm flex-grow"> {/* flex-grow pushes the bottom border if content is short */}
                      {card.desc}
                    </p>

                    <div className="mt-6 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-cine-gold to-transparent transition-all duration-700" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}