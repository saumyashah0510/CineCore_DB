import { motion } from 'framer-motion';
import {
  Film, Users, Wallet, MapPin, MonitorPlay, FileText, Music, Calendar, Clapperboard, AlertTriangle, ShieldCheck, TrendingUp, BarChart3, PieChart as PieIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { AnimatedCounter, CineDivider, ScrollReveal, Skeleton, SkeletonCard } from '../components/CinematicEffects';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';

// ── Chart Theme ──
const CHART_COLORS = {
  gold: '#B8962E',
  goldLight: '#D4AF37',
  cream: '#F5ECD7',
  dust: '#8A8578',
  void: '#0a0a0a',
  onyx: '#141414',
  border: '#2a2a28',
  blue: '#60A5FA',
  purple: '#A78BFA',
  green: '#4ADE80',
  orange: '#FB923C',
  red: '#F87171',
};

const PIE_COLORS = [CHART_COLORS.gold, CHART_COLORS.blue, CHART_COLORS.purple, CHART_COLORS.orange, CHART_COLORS.green, CHART_COLORS.red];

// ── Custom Tooltip ──
function CineTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-cine-onyx border border-cine-border p-3 shadow-xl">
      <p className="font-caption text-[10px] text-cine-gold uppercase tracking-widest mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="font-mono text-xs text-cine-cream">
          {entry.name}: <span style={{ color: entry.color }} className="font-bold">
            {typeof entry.value === 'number' ? `₹${(entry.value / 10000000).toFixed(2)} Cr` : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="bg-cine-onyx border border-cine-border p-6 w-full">
      <Skeleton className="h-4 w-40 mb-6" />
      <div className="flex items-end gap-3 h-48">
        {[60, 80, 45, 90, 70, 55, 85].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// ── Card Variants ──
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

  const { data: dashStats, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => (await api.get('/analytics/dashboard')).data,
  });

  const { data: budgetHealth, isLoading: budgetLoading } = useQuery({
    queryKey: ['budgetHealth'],
    queryFn: async () => (await api.get('/analytics/budget-health')).data,
    enabled: role === 'ADMIN' || role === 'FINANCE_MANAGER',
  });

  const { data: boxOffice, isLoading: boxOfficeLoading } = useQuery({
    queryKey: ['boxOffice'],
    queryFn: async () => (await api.get('/analytics/box-office')).data,
    enabled: role === 'ADMIN' || role === 'DISTRIBUTION_MANAGER',
  });

  const { data: ottDeals, isLoading: ottLoading } = useQuery({
    queryKey: ['ottDeals'],
    queryFn: async () => (await api.get('/analytics/ott-deals')).data,
    enabled: role === 'ADMIN' || role === 'DISTRIBUTION_MANAGER',
  });

  const { data: houseStats } = useQuery({
    queryKey: ['houseStats'],
    queryFn: async () => (await api.get('/analytics/production-houses')).data,
    enabled: role === 'ADMIN',
  });

  const { data: prodStats, isLoading: prodLoading } = useQuery({
    queryKey: ['productionStats'],
    queryFn: async () => (await api.get('/production/dashboard-stats')).data,
    enabled: role === 'PRODUCTION_MANAGER',
    refetchInterval: 60000,
  });

  const { data: contractSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['contractSummary'],
    queryFn: async () => (await api.get('/analytics/contract-summary')).data,
    enabled: role === 'ADMIN' || role === 'TALENT_MANAGER',
  });

  const { data: shootCalendar } = useQuery({
    queryKey: ['shootCalendar'],
    queryFn: async () => (await api.get('/analytics/shoot-calendar')).data,
    enabled: role === 'PRODUCTION_MANAGER',
  });

  const totalProjects = projects?.length || 0;
  const shootingProjects = projects?.filter((p: any) => p.status === 'SHOOTING').length || 0;
  const releasedProjects = projects?.filter((p: any) => p.status === 'RELEASED').length || 0;
  const displayRole = role.replace('_', ' ');

  // ── Derived chart data ──
  const budgetChartData = projects?.map((p: any) => ({
    name: p.title?.length > 15 ? p.title.slice(0, 15) + '…' : p.title,
    budget: Number(p.total_budget) || 0,
    spent: Number(p.total_used) || 0,
  })) || [];

  const totalContracts = contractSummary?.reduce((acc: number, curr: any) => acc + curr.count, 0) || 0;
  const getContractPercent = (status: string) => {
    if (!totalContracts) return 0;
    const item = contractSummary?.find((x: any) => x.status === status);
    return item ? (item.count / totalContracts) * 100 : 0;
  };

  const getContractCount = (status: string) => {
    return contractSummary?.find((x: any) => x.status === status)?.count || 0;
  };

  const statusPieData = projects ? [
    { name: 'Development', value: projects.filter((p: any) => p.status === 'DEVELOPMENT').length },
    { name: 'Pre-Production', value: projects.filter((p: any) => p.status === 'PRE_PRODUCTION').length },
    { name: 'Shooting', value: projects.filter((p: any) => p.status === 'SHOOTING').length },
    { name: 'Post-Production', value: projects.filter((p: any) => p.status === 'POST_PRODUCTION').length },
    { name: 'Released', value: projects.filter((p: any) => p.status === 'RELEASED').length },
  ].filter(d => d.value > 0) : [];

  const boxOfficeChartData = boxOffice?.reduce((acc: any[], row: any) => {
    const formattedTitle = row.title?.length > 18 ? row.title.slice(0, 18) + '…' : row.title;
    const existing = acc.find((x: any) => x.name === formattedTitle);
    if (existing) {
      existing.total += Number(row.total_collection || 0);
      existing.opening += Number(row.opening_weekend_collection || 0);
    } else {
      acc.push({
        name: formattedTitle,
        total: Number(row.total_collection || 0),
        opening: Number(row.opening_weekend_collection || 0),
      });
    }
    return acc;
  }, []) || [];

  const ottByPlatform = ottDeals?.reduce((acc: any[], deal: any) => {
    const existing = acc.find((x: any) => x.name === deal.platform);
    if (existing) {
      existing.value += Number(deal.license_fee || 0);
    } else {
      acc.push({ name: deal.platform, value: Number(deal.license_fee || 0) });
    }
    return acc;
  }, []) || [];

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
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dashLoading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : (
              [
                { label: 'Total Projects', value: dashStats?.total_projects || totalProjects, icon: Film, color: 'text-cine-ivory' },
                { label: 'Active Contracts', value: dashStats?.active_contracts || 0, icon: FileText, color: 'text-cine-gold' },
                { label: 'Overdue Payments', value: dashStats?.overdue_payments || 0, icon: AlertTriangle, color: dashStats?.overdue_payments > 0 ? 'text-red-400' : 'text-green-400' },
                { label: 'Overspent Heads', value: dashStats?.overspent_heads || 0, icon: Wallet, color: dashStats?.overspent_heads > 0 ? 'text-orange-400' : 'text-green-400' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div key={stat.label} custom={i} variants={cardVariants}>
                    <div className="bg-cine-onyx border border-cine-border p-5 hover:border-cine-gold/30 transition-colors relative overflow-hidden">
                      <Icon className="absolute -bottom-3 -right-3 w-20 h-20 text-cine-gold/5" />
                      <h3 className="font-caption text-[10px] tracking-widest text-cine-dust uppercase mb-3">{stat.label}</h3>
                      <p className={`font-display text-4xl ${stat.color}`}><AnimatedCounter value={stat.value} /></p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Revenue Summary */}
          {dashLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div custom={4} variants={cardVariants}>
                <div className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1"><TrendingUp className="w-4 h-4 text-cine-gold" /><h3 className="font-caption text-[10px] tracking-widest text-cine-dust uppercase">Total Box Office</h3></div>
                  <p className="font-display text-4xl text-gradient-gold">₹{((Number(dashStats?.total_box_office) || 0)/ 10000000).toFixed(1)} Cr</p>
                </div>
              </motion.div>
              <motion.div custom={5} variants={cardVariants}>
                <div className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1"><MonitorPlay className="w-4 h-4 text-blue-400" /><h3 className="font-caption text-[10px] tracking-widest text-cine-dust uppercase">Total OTT Revenue</h3></div>
                  <p className="font-display text-4xl text-blue-400">₹{((Number(dashStats?.total_ott_revenue) || 0)/ 10000000).toFixed(1)} Cr</p>
                </div>
              </motion.div>
            </div>
          )}

          {/* Charts Row 1: Project Status Pie + Budget Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
            <ScrollReveal>
              <div className="bg-cine-onyx border border-cine-border p-6 h-full">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-cine-gold" /> Project Pipeline
                </h3>
                {projectsLoading ? <Skeleton className="h-52 w-full" /> : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" stroke="none">
                        {statusPieData.map((_entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend formatter={(value) => <span className="font-mono text-[10px] text-cine-cream uppercase">{value}</span>} />
                      <Tooltip content={<CineTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-cine-onyx border border-cine-border p-6">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cine-gold" /> Budget vs. Actual Spend
                </h3>
                {projectsLoading ? <SkeletonChart /> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={budgetChartData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                      <XAxis dataKey="name" tick={{ fill: CHART_COLORS.dust, fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={{ stroke: CHART_COLORS.border }} />
                      <YAxis tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} tickFormatter={(v) => `₹${(v / 10000000).toFixed(0)}Cr`} />
                      <Tooltip content={<CineTooltip />} />
                      <Bar dataKey="budget" name="Budget" fill={CHART_COLORS.gold} radius={[2, 2, 0, 0]} opacity={0.4} />
                      <Bar dataKey="spent" name="Spent" fill={CHART_COLORS.gold} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Charts Row 2: Box Office Area + OTT Revenue Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
            <ScrollReveal>
              <div className="bg-cine-onyx border border-cine-border p-6">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cine-gold" /> Box Office Collections
                </h3>
                {boxOfficeLoading ? <SkeletonChart /> : boxOfficeChartData.length === 0 ? (
                  <p className="font-mono text-xs text-cine-dust text-center py-12">No box office data available yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={boxOfficeChartData}>
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                      <XAxis dataKey="name" tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} />
                      <YAxis tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} tickFormatter={(v) => `₹${(v / 10000000).toFixed(0)}Cr`} />
                      <Tooltip content={<CineTooltip />} />
                      <Area type="monotone" dataKey="total" name="Total Collection" stroke={CHART_COLORS.gold} fill="url(#goldGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="opening" name="Opening Weekend" stroke={CHART_COLORS.orange} fill="none" strokeWidth={1.5} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-cine-onyx border border-cine-border p-6 h-full">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 text-blue-400" /> OTT Revenue by Platform
                </h3>
                {ottLoading ? <Skeleton className="h-52 w-full" /> : ottByPlatform.length === 0 ? (
                  <p className="font-mono text-xs text-cine-dust text-center py-12">No OTT deals yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={ottByPlatform} cx="50%" cy="50%" outerRadius={70} dataKey="value" stroke="none" label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {ottByPlatform.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CineTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ScrollReveal>
          </div>

          {/* Production House Stats */}
          {houseStats && houseStats.length > 0 && (
            <ScrollReveal>
              <div className="bg-cine-onyx border border-cine-border p-6">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <Film className="w-4 h-4 text-cine-gold" /> Production House Performance
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {houseStats.map((house: any, i: number) => (
                    <motion.div key={house.house_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                      className="bg-cine-void border border-cine-border p-5 hover:border-cine-gold/20 transition-colors"
                    >
                      <h4 className="font-display text-lg text-cine-ivory mb-1">{house.name}</h4>
                      <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mb-4">{house.headquarter_city} • {house.total_projects} projects</p>
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between"><span className="text-cine-dust">Box Office</span><span className="text-cine-gold">₹{(Number(house.total_box_office) / 10000000).toFixed(1)} Cr</span></div>
                        <div className="flex justify-between"><span className="text-cine-dust">OTT Revenue</span><span className="text-blue-400">₹{(Number(house.total_ott_revenue) / 10000000).toFixed(1)} Cr</span></div>
                        <div className="flex justify-between"><span className="text-cine-dust">Released</span><span className="text-green-400">{house.released}</span></div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
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
                {summaryLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 w-full bg-cine-void/50 animate-pulse rounded" />
                    <div className="h-4 w-full bg-cine-void/50 animate-pulse rounded" />
                  </div>
                ) : totalContracts === 0 ? (
                  <p className="text-cine-dust py-6 italic text-center">No contracts found in registry.</p>
                ) : (
                  ['COMPLETED', 'ACTIVE', 'ON_HOLD', 'TERMINATED'].map((status, i) => {
                    const pct = getContractPercent(status);
                    const count = getContractCount(status);
                    if (count === 0 && status !== 'ACTIVE') return null; 

                    const colorMap: any = {
                      COMPLETED: 'from-cine-gold-dim to-cine-gold',
                      ACTIVE: 'from-blue-900 to-blue-400',
                      ON_HOLD: 'from-orange-900 to-orange-400',
                      TERMINATED: 'from-red-900 to-red-400'
                    };

                    return (
                      <div key={status}>
                        <div className="flex justify-between mb-1">
                          <span className="text-cine-cream capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                          <span className="text-cine-dust">
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-cine-void h-2 rounded-full overflow-hidden border border-cine-border/30">
                          <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${pct}%` }} 
                            transition={{ duration: 1.2, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }} 
                            className={`bg-gradient-to-r ${colorMap[status] || 'from-cine-dust to-cine-cream'} h-full rounded-full`} 
                          />
                        </div>
                      </div>
                    );
                  })
                )}
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

          {/* Budget vs Spend Chart */}
          <ScrollReveal>
            <div className="bg-cine-onyx border border-cine-border p-6">
              <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cine-gold" /> Budget vs. Actual Spend by Project
              </h3>
              {projectsLoading ? <SkeletonChart /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={budgetChartData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                    <XAxis dataKey="name" tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} />
                    <YAxis tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} tickFormatter={(v) => `₹${(v / 10000000).toFixed(0)}Cr`} />
                    <Tooltip content={<CineTooltip />} />
                    <Bar dataKey="budget" name="Allocated Budget" fill={CHART_COLORS.gold} radius={[2, 2, 0, 0]} opacity={0.35} />
                    <Bar dataKey="spent" name="Actual Spend" fill={CHART_COLORS.gold} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </ScrollReveal>

          {/* Budget Utilization Table */}
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
                {projectsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6"><Skeleton className="h-4 w-48 mb-3" /><Skeleton className="h-2.5 w-full mb-2" /><Skeleton className="h-2 w-32" /></div>
                  ))
                ) : (
                  projects?.map((p: any, idx: number) => (
                    <motion.div key={p.project_id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.08 }} className="p-6 hover:bg-cine-border/5 transition-colors">
                      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-5">
                        <div>
                          <h4 className="font-display text-xl text-cine-ivory">{p.title}</h4>
                          <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider">{p.status} • {p.production_house}</p>
                          {p.overspent_flag && <OverrunWarning projectId={p.project_id} />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="w-full bg-cine-void h-2.5 rounded-full overflow-hidden border border-cine-border/30">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(((p.total_used || 0) / p.total_budget) * 100, 100)}%` }} transition={{ duration: 1.5, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            className={`h-full rounded-full ${p.overspent_flag ? 'bg-gradient-to-r from-red-900 to-red-500' : 'bg-gradient-to-r from-cine-gold-dim to-cine-gold'}`}
                          />
                        </div>
                        <div className="flex justify-between font-mono text-[9px] text-cine-dust uppercase tracking-widest">
                          <span>{((p.total_used / p.total_budget) * 100).toFixed(1)}% Used</span>
                          <span>{p.expenses} Invoices</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
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
                {prodLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="p-4 bg-cine-void border border-cine-border"><Skeleton className="h-2 w-16 mb-2" /><Skeleton className="h-8 w-12" /></div>
                  ))
                ) : (
                  [
                    { label: 'Active Units', value: prodStats?.active_units || 0, color: 'text-cine-ivory' },
                    { label: 'Scheduled Today', value: prodStats?.scheduled_today || 0, color: 'text-cine-gold' },
                    { label: 'Pending Permits', value: prodStats?.pending_permits || 0, color: prodStats?.pending_permits > 0 ? 'text-orange-400' : 'text-cine-ivory' },
                    { label: 'Postponed', value: prodStats?.weather_alerts || 0, color: prodStats?.weather_alerts > 0 ? 'text-red-500' : 'text-green-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-4 bg-cine-void border border-cine-border">
                      <div className="text-[10px] text-cine-dust mb-1 uppercase">{stat.label}</div>
                      <div className={`text-3xl ${stat.color}`}><AnimatedCounter value={stat.value} /></div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Upcoming Shoots */}
          {shootCalendar && shootCalendar.length > 0 && (
            <ScrollReveal>
              <div className="bg-cine-onyx border border-cine-border p-6">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-cine-gold" /> Upcoming Shoots
                </h3>
                <div className="space-y-3">
                  {shootCalendar.slice(0, 5).map((shoot: any) => (
                    <div key={shoot.schedule_id} className="flex items-center justify-between p-4 bg-cine-void border border-cine-border hover:border-cine-gold/20 transition-colors">
                      <div>
                        <h4 className="font-display text-base text-cine-ivory">{shoot.project_title}</h4>
                        <p className="font-mono text-[10px] text-cine-dust uppercase mt-0.5">{shoot.location_name}, {shoot.city} • Scenes: {shoot.scene_nos || 'TBD'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-xs text-cine-gold">{new Date(shoot.schedule_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        <p className="font-mono text-[10px] text-cine-dust">{shoot.call_time || '--:--'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}
        </motion.div>
      )}


      {/* ── DISTRIBUTION MANAGER VIEW ── */}
      {role === 'DISTRIBUTION_MANAGER' && (
        <motion.div initial="hidden" animate="visible" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { to: '/distribution', icon: MonitorPlay, title: 'OTT Deals & Box Office', desc: 'Manage OTT platform licenses and theatre release collections.', idx: 0 },
              { to: '/music', icon: Music, title: 'Music Catalog', desc: 'Register songs, link singers, and manage recordings.', idx: 1 },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div key={card.to} custom={card.idx} variants={cardVariants} className="flex">
                  <Link to={card.to} className="group block w-full h-full">
                    <div className="bg-cine-onyx border border-cine-border p-8 relative overflow-hidden hover:border-cine-gold/30 transition-colors h-full flex flex-col">
                      <Icon className="absolute -bottom-4 -right-4 w-32 h-32 text-cine-gold/5 group-hover:text-cine-gold/10 transition-colors duration-700" />
                      <p className="font-display text-3xl text-cine-ivory mb-2 group-hover:text-cine-gold transition-colors">{card.title}</p>
                      <p className="font-body text-sm text-cine-dust max-w-sm flex-grow">{card.desc}</p>
                      <div className="mt-6 h-[1px] w-0 group-hover:w-full bg-gradient-to-r from-cine-gold to-transparent transition-all duration-700" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Box Office + OTT Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ScrollReveal>
              <div className="bg-cine-onyx border border-cine-border p-6">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cine-gold" /> Box Office Collections
                </h3>
                {boxOfficeLoading ? <SkeletonChart /> : boxOfficeChartData.length === 0 ? (
                  <p className="font-mono text-xs text-cine-dust text-center py-12">No box office data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={boxOfficeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.border} />
                      <XAxis dataKey="name" tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} />
                      <YAxis tick={{ fill: CHART_COLORS.dust, fontSize: 10 }} axisLine={{ stroke: CHART_COLORS.border }} tickFormatter={(v) => `₹${(v / 10000000).toFixed(0)}Cr`} />
                      <Tooltip content={<CineTooltip />} />
                      <Bar dataKey="total" name="Total Collection" fill={CHART_COLORS.gold} radius={[3, 3, 0, 0]} />
                      <Bar dataKey="opening" name="Opening Weekend" fill={CHART_COLORS.orange} radius={[3, 3, 0, 0]} opacity={0.7} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <div className="bg-cine-onyx border border-cine-border p-6 h-full">
                <h3 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-6 flex items-center gap-2">
                  <MonitorPlay className="w-4 h-4 text-blue-400" /> OTT Revenue Split
                </h3>
                {ottLoading ? <Skeleton className="h-52 w-full" /> : ottByPlatform.length === 0 ? (
                  <p className="font-mono text-xs text-cine-dust text-center py-12">No OTT deals yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={ottByPlatform} cx="50%" cy="50%" innerRadius={40} outerRadius={75} paddingAngle={3} dataKey="value" stroke="none">
                        {ottByPlatform.map((_: any, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Legend formatter={(value) => <span className="font-mono text-[10px] text-cine-cream uppercase">{value}</span>} />
                      <Tooltip content={<CineTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </ScrollReveal>
          </div>
        </motion.div>
      )}
    </div>
  );
}