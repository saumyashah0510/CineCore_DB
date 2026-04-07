import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Plus, X, Film, ChevronDown, Trash2, History, Landmark, Tv } from 'lucide-react';
import { api } from '../lib/api';

const dealTypeColors: Record<string, string> = {
  EXCLUSIVE: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  NON_EXCLUSIVE: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  OTT_PREMIERE: 'text-cine-gold bg-cine-gold/10 border-cine-gold/20',
};

export default function Distribution() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'ott' | 'theatre'>('ott');
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isOttModalOpen, setIsOttModalOpen] = useState(false);
  const [isTheatreModalOpen, setIsTheatreModalOpen] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [auditDealId, setAuditDealId] = useState<number | null>(null);

  // OTT form
  const [ottForm, setOttForm] = useState({
    platform_id: '', deal_type: 'EXCLUSIVE', territory: 'India', license_fee: '',
    revenue_share_percent: '', deal_signing_date: '', streaming_start_date: '',
    deal_expiry_date: '', languages: 'Hindi',
  });

  // Theatre form
  const [theatreForm, setTheatreForm] = useState({
    city: '', theatre_chain: '', no_of_screens: '', release_date: '',
    opening_weekend_collection: '', total_collection: '', weeks_running: '',
  });

  // Platform form
  const [platformForm, setPlatformForm] = useState({
    name: '', hq_country: 'India', subscriber_base_millions: '',
    contact_person: '', contact_email: '',
  });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects/')).data,
  });

  const { data: platforms } = useQuery({
    queryKey: ['platforms'],
    queryFn: async () => (await api.get('/distribution/platforms')).data,
  });

  const { data: deals, isLoading: dealsLoading } = useQuery({
    queryKey: ['deals', selectedProject],
    queryFn: async () => (await api.get(`/distribution/deals/project/${selectedProject}`)).data,
    enabled: !!selectedProject && activeTab === 'ott',
  });

  const { data: theatreReleases, isLoading: theatreLoading } = useQuery({
    queryKey: ['theatre', selectedProject],
    queryFn: async () => (await api.get(`/distribution/theatre/project/${selectedProject}`)).data,
    enabled: !!selectedProject && activeTab === 'theatre',
  });

  const { data: auditLog } = useQuery({
    queryKey: ['audit', auditDealId],
    queryFn: async () => (await api.get(`/distribution/deals/${auditDealId}/audit`)).data,
    enabled: !!auditDealId,
  });

  // Mutations
  const createDealMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/distribution/deals', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals', selectedProject] });
      setIsOttModalOpen(false);
      setOttForm({ platform_id: '', deal_type: 'EXCLUSIVE', territory: 'India', license_fee: '', revenue_share_percent: '', deal_signing_date: '', streaming_start_date: '', deal_expiry_date: '', languages: 'Hindi' });
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to create deal'),
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (dealId: number) => await api.delete(`/distribution/deals/${dealId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deals', selectedProject] }),
  });

  const createTheatreMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/distribution/theatre', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theatre', selectedProject] });
      setIsTheatreModalOpen(false);
      setTheatreForm({ city: '', theatre_chain: '', no_of_screens: '', release_date: '', opening_weekend_collection: '', total_collection: '', weeks_running: '' });
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to create theatre release'),
  });

  const updateTheatreMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) =>
      (await api.patch(`/distribution/theatre/${id}`, payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['theatre', selectedProject] }),
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to update'),
  });

  const createPlatformMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/distribution/platforms', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['platforms'] });
      setIsPlatformModalOpen(false);
      setPlatformForm({ name: '', hq_country: 'India', subscriber_base_millions: '', contact_person: '', contact_email: '' });
    },
    onError: (err: any) => alert(err.response?.data?.detail || 'Failed to create platform'),
  });

  const handleOttSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDealMutation.mutate({
      project_id: selectedProject,
      platform_id: Number(ottForm.platform_id),
      deal_type: ottForm.deal_type,
      territory: ottForm.territory,
      license_fee: ottForm.license_fee ? Number(ottForm.license_fee) : null,
      revenue_share_percent: ottForm.revenue_share_percent ? Number(ottForm.revenue_share_percent) : null,
      deal_signing_date: ottForm.deal_signing_date,
      streaming_start_date: ottForm.streaming_start_date,
      deal_expiry_date: ottForm.deal_expiry_date,
      languages: ottForm.languages || null,
    });
  };

  const handleTheatreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTheatreMutation.mutate({
      project_id: selectedProject,
      city: theatreForm.city,
      theatre_chain: theatreForm.theatre_chain,
      no_of_screens: Number(theatreForm.no_of_screens),
      release_date: theatreForm.release_date,
      opening_weekend_collection: theatreForm.opening_weekend_collection ? Number(theatreForm.opening_weekend_collection) : null,
      total_collection: theatreForm.total_collection ? Number(theatreForm.total_collection) : null,
      weeks_running: theatreForm.weeks_running ? Number(theatreForm.weeks_running) : null,
    });
  };

  const handlePlatformSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPlatformMutation.mutate({
      name: platformForm.name,
      hq_country: platformForm.hq_country,
      subscriber_base_millions: platformForm.subscriber_base_millions ? Number(platformForm.subscriber_base_millions) : null,
      contact_person: platformForm.contact_person,
      contact_email: platformForm.contact_email,
    });
  };

  const handleUpdateCollection = (releaseId: number) => {
    const total = prompt('Enter updated Total Collection (₹):');
    const weeks = prompt('Enter Weeks Running:');
    if (total || weeks) {
      const payload: any = {};
      if (total) payload.total_collection = Number(total);
      if (weeks) payload.weeks_running = Number(weeks);
      updateTheatreMutation.mutate({ id: releaseId, payload });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Distribution Manager
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Distribution Matrix</h1>
          <p className="font-body text-sm text-cine-dust mt-2">
            OTT deals with audit trail (Trigger 3) and Theatre box office tracking.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Film className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(Number(e.target.value) || null)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-8 py-2 focus:outline-none focus:border-cine-gold transition-colors appearance-none min-w-[250px]"
            >
              <option value="">Select a Project...</option>
              {projects?.map((p: any) => (
                <option key={p.project_id} value={p.project_id}>{p.title}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-cine-dust absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <button
            onClick={() => setIsPlatformModalOpen(true)}
            className="flex items-center gap-2 bg-cine-onyx border border-cine-border text-cine-ivory px-4 py-2 font-caption text-xs tracking-widest uppercase hover:border-cine-gold transition-colors"
          >
            <Tv className="w-3.5 h-3.5" /> + Platform
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 mb-8 border-b border-cine-border">
        <button
          onClick={() => setActiveTab('ott')}
          className={`px-6 py-3 font-caption text-xs tracking-widest uppercase border-b-2 transition-colors ${
            activeTab === 'ott' ? 'border-cine-gold text-cine-gold' : 'border-transparent text-cine-dust hover:text-cine-cream'
          }`}
        >
          <MonitorPlay className="w-4 h-4 inline mr-2" />OTT Deals
        </button>
        <button
          onClick={() => setActiveTab('theatre')}
          className={`px-6 py-3 font-caption text-xs tracking-widest uppercase border-b-2 transition-colors ${
            activeTab === 'theatre' ? 'border-cine-gold text-cine-gold' : 'border-transparent text-cine-dust hover:text-cine-cream'
          }`}
        >
          <Landmark className="w-4 h-4 inline mr-2" />Theatre Releases
        </button>
      </div>

      {/* Empty State */}
      {!selectedProject && (
        <div className="bg-cine-onyx border border-cine-border p-16 text-center">
          <MonitorPlay className="w-12 h-12 text-cine-gold/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-cine-dust">Select a project to manage distribution</p>
        </div>
      )}

      {/* ── OTT DEALS TAB ── */}
      {selectedProject && activeTab === 'ott' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsOttModalOpen(true)} className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors">
              <Plus className="w-4 h-4" /> New OTT Deal
            </button>
          </div>

          {dealsLoading ? (
            <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-cine-gold border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : deals?.length === 0 ? (
            <div className="bg-cine-onyx border border-cine-border p-8 text-center font-mono text-xs text-cine-dust uppercase">No OTT deals for this project.</div>
          ) : (
            <div className="space-y-4">
              {deals?.map((deal: any, idx: number) => (
                <motion.div key={deal.deal_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                  className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/30 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-cine-void border border-cine-border">
                        <MonitorPlay className="w-5 h-5 text-cine-gold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-xl text-cine-ivory">{deal.platform_name}</h3>
                          <span className={`px-2.5 py-0.5 border font-mono text-[10px] tracking-widest uppercase ${dealTypeColors[deal.deal_type] || 'text-cine-dust border-cine-border'}`}>
                            {deal.deal_type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mt-1">
                          Territory: {deal.territory} • Languages: {deal.languages || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {deal.license_fee && (
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-cine-dust uppercase">License Fee</div>
                          <div className="font-display text-xl text-cine-gold">₹{Number(deal.license_fee).toLocaleString()}</div>
                        </div>
                      )}
                      {deal.revenue_share_percent && (
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-cine-dust uppercase">Rev Share</div>
                          <div className="font-display text-xl text-cine-ivory">{deal.revenue_share_percent}%</div>
                        </div>
                      )}
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-cine-dust uppercase">Streaming</div>
                        <div className="font-body text-sm text-cine-cream">
                          {new Date(deal.streaming_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-cine-dust uppercase">Expires</div>
                        <div className="font-body text-sm text-cine-cream">
                          {new Date(deal.deal_expiry_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setAuditDealId(auditDealId === deal.deal_id ? null : deal.deal_id)} className="p-2 text-cine-dust hover:text-cine-gold transition-colors" title="View Audit Log">
                          <History className="w-4 h-4" />
                        </button>
                        <button onClick={() => { if (confirm(`Delete deal with ${deal.platform_name}?`)) deleteDealMutation.mutate(deal.deal_id); }} className="p-2 text-cine-dust hover:text-red-500 transition-colors" title="Delete Deal">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Audit Log */}
                  {auditDealId === deal.deal_id && auditLog && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 border-t border-cine-border pt-4">
                      <h4 className="font-caption text-xs tracking-widest text-cine-dust uppercase mb-3 flex items-center gap-2">
                        <History className="w-3.5 h-3.5" /> Change Data Capture — Trigger 3 Audit Log
                      </h4>
                      {auditLog.length === 0 ? (
                        <p className="font-mono text-xs text-cine-dust">No audit entries.</p>
                      ) : (
                        <div className="space-y-2">
                          {auditLog.map((entry: any) => (
                            <div key={entry.audit_id} className="flex items-center gap-4 font-mono text-[10px] text-cine-cream bg-cine-void p-3 border border-cine-border">
                              <span className={`px-2 py-0.5 uppercase tracking-widest ${
                                entry.operation === 'INSERT' ? 'text-green-400' : entry.operation === 'UPDATE' ? 'text-blue-400' : 'text-red-400'
                              }`}>{entry.operation}</span>
                              <span className="text-cine-dust">{new Date(entry.changed_at).toLocaleString()}</span>
                              {entry.old_license_fee !== null && entry.new_license_fee !== null && (
                                <span>Fee: ₹{entry.old_license_fee} → ₹{entry.new_license_fee}</span>
                              )}
                              {entry.old_territory !== null && entry.new_territory !== null && entry.old_territory !== entry.new_territory && (
                                <span>Territory: {entry.old_territory} → {entry.new_territory}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── THEATRE RELEASES TAB ── */}
      {selectedProject && activeTab === 'theatre' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsTheatreModalOpen(true)} className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors">
              <Plus className="w-4 h-4" /> Add Theatre Release
            </button>
          </div>

          {theatreLoading ? (
            <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-cine-gold border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : theatreReleases?.length === 0 ? (
            <div className="bg-cine-onyx border border-cine-border p-8 text-center font-mono text-xs text-cine-dust uppercase">No theatre releases for this project.</div>
          ) : (
            <div className="bg-cine-onyx border border-cine-border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
                <div className="col-span-2">City</div>
                <div className="col-span-2">Chain</div>
                <div className="col-span-1">Screens</div>
                <div className="col-span-2">Release</div>
                <div className="col-span-2">Opening WE</div>
                <div className="col-span-2">Total</div>
                <div className="col-span-1">Action</div>
              </div>
              <div className="divide-y divide-cine-border/50">
                {theatreReleases?.map((tr: any, idx: number) => (
                  <motion.div key={tr.theatre_release_id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                    className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/10 transition-colors"
                  >
                    <div className="col-span-2 font-display text-lg text-cine-ivory">{tr.city}</div>
                    <div className="col-span-2 font-body text-sm text-cine-cream">{tr.theatre_chain}</div>
                    <div className="col-span-1 font-mono text-sm text-cine-ivory">{tr.no_of_screens}</div>
                    <div className="col-span-2 font-body text-sm text-cine-cream">
                      {new Date(tr.release_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </div>
                    <div className="col-span-2 font-mono text-sm text-cine-gold">
                      {tr.opening_weekend_collection ? `₹${Number(tr.opening_weekend_collection).toLocaleString()}` : '—'}
                    </div>
                    <div className="col-span-2">
                      <div className="font-mono text-sm text-cine-ivory">
                        {tr.total_collection ? `₹${Number(tr.total_collection).toLocaleString()}` : '—'}
                      </div>
                      {tr.weeks_running && (
                        <div className="font-mono text-[10px] text-cine-dust">{tr.weeks_running} weeks</div>
                      )}
                    </div>
                    <div className="col-span-1">
                      <button onClick={() => handleUpdateCollection(tr.theatre_release_id)} className="px-2 py-1 bg-cine-void border border-cine-border text-cine-dust font-mono text-[10px] uppercase tracking-widest hover:border-cine-gold hover:text-cine-gold transition-colors">
                        Update
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── OTT DEAL MODAL ── */}
      <AnimatePresence>
        {isOttModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOttModalOpen(false)} className="absolute inset-0 bg-cine-void/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-cine-onyx border border-cine-border p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setIsOttModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors"><X className="w-5 h-5" /></button>
              <h2 className="font-display text-3xl text-cine-ivory mb-6">New OTT Deal</h2>
              <form onSubmit={handleOttSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Platform</label>
                    <select required value={ottForm.platform_id} onChange={(e) => setOttForm({ ...ottForm, platform_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="">Select Platform...</option>
                      {platforms?.map((p: any) => (<option key={p.ott_id} value={p.ott_id}>{p.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Deal Type</label>
                    <select required value={ottForm.deal_type} onChange={(e) => setOttForm({ ...ottForm, deal_type: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="EXCLUSIVE">Exclusive</option>
                      <option value="NON_EXCLUSIVE">Non-Exclusive</option>
                      <option value="OTT_PREMIERE">OTT Premiere</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Territory</label>
                    <input required type="text" value={ottForm.territory} onChange={(e) => setOttForm({ ...ottForm, territory: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Languages</label>
                    <input type="text" value={ottForm.languages} onChange={(e) => setOttForm({ ...ottForm, languages: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">License Fee (₹)</label>
                    <input type="number" step="0.01" value={ottForm.license_fee} onChange={(e) => setOttForm({ ...ottForm, license_fee: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Revenue Share (%)</label>
                    <input type="number" step="0.01" value={ottForm.revenue_share_percent} onChange={(e) => setOttForm({ ...ottForm, revenue_share_percent: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Signing Date</label>
                    <input required type="date" value={ottForm.deal_signing_date} onChange={(e) => setOttForm({ ...ottForm, deal_signing_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Streaming Start</label>
                    <input required type="date" value={ottForm.streaming_start_date} onChange={(e) => setOttForm({ ...ottForm, streaming_start_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Deal Expiry Date</label>
                    <input required type="date" value={ottForm.deal_expiry_date} onChange={(e) => setOttForm({ ...ottForm, deal_expiry_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createDealMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createDealMutation.isPending ? 'Signing Deal...' : 'Sign OTT Deal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── THEATRE RELEASE MODAL ── */}
      <AnimatePresence>
        {isTheatreModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTheatreModalOpen(false)} className="absolute inset-0 bg-cine-void/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-cine-onyx border border-cine-border p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button onClick={() => setIsTheatreModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors"><X className="w-5 h-5" /></button>
              <h2 className="font-display text-3xl text-cine-ivory mb-6">Add Theatre Release</h2>
              <form onSubmit={handleTheatreSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">City</label>
                    <input required type="text" value={theatreForm.city} onChange={(e) => setTheatreForm({ ...theatreForm, city: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Theatre Chain</label>
                    <input required type="text" value={theatreForm.theatre_chain} onChange={(e) => setTheatreForm({ ...theatreForm, theatre_chain: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Screens</label>
                    <input required type="number" value={theatreForm.no_of_screens} onChange={(e) => setTheatreForm({ ...theatreForm, no_of_screens: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Release Date</label>
                    <input required type="date" value={theatreForm.release_date} onChange={(e) => setTheatreForm({ ...theatreForm, release_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Opening Weekend (₹)</label>
                    <input type="number" step="0.01" value={theatreForm.opening_weekend_collection} onChange={(e) => setTheatreForm({ ...theatreForm, opening_weekend_collection: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Total Collection (₹)</label>
                    <input type="number" step="0.01" value={theatreForm.total_collection} onChange={(e) => setTheatreForm({ ...theatreForm, total_collection: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createTheatreMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createTheatreMutation.isPending ? 'Adding...' : 'Add Theatre Release'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── PLATFORM MODAL ── */}
      <AnimatePresence>
        {isPlatformModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPlatformModalOpen(false)} className="absolute inset-0 bg-cine-void/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-cine-onyx border border-cine-border p-8 shadow-2xl">
              <button onClick={() => setIsPlatformModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors"><X className="w-5 h-5" /></button>
              <h2 className="font-display text-3xl text-cine-ivory mb-6">Add OTT Platform</h2>
              <form onSubmit={handlePlatformSubmit} className="space-y-4">
                <div>
                  <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Name</label>
                  <input required type="text" value={platformForm.name} onChange={(e) => setPlatformForm({ ...platformForm, name: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">HQ Country</label>
                    <input required type="text" value={platformForm.hq_country} onChange={(e) => setPlatformForm({ ...platformForm, hq_country: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Subscribers (M)</label>
                    <input type="number" step="0.01" value={platformForm.subscriber_base_millions} onChange={(e) => setPlatformForm({ ...platformForm, subscriber_base_millions: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Contact Person</label>
                    <input required type="text" value={platformForm.contact_person} onChange={(e) => setPlatformForm({ ...platformForm, contact_person: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Contact Email</label>
                    <input required type="email" value={platformForm.contact_email} onChange={(e) => setPlatformForm({ ...platformForm, contact_email: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createPlatformMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createPlatformMutation.isPending ? 'Adding...' : 'Register Platform'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
