import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, Clock, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../lib/api';

// ── API Fetchers ─────────────────────────────────────────────────────────────
const fetchAllScripts = async () => {
  const { data } = await api.get('/scripts/');
  return data;
};
const fetchAllProjects = async () => {
  const { data } = await api.get('/projects/');
  return data;
};
const fetchAllPersons = async () => {
  const { data } = await api.get('/persons/');
  return data;
};

// Helper for Status Badges
const getStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'UNDER_REVIEW': return 'text-cine-gold bg-cine-gold/10 border-cine-gold/20';
    case 'DRAFT': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'REJECTED': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-cine-dust bg-cine-onyx border-cine-border';
  }
};

export default function Scripts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State mapped to DDL
  const [formData, setFormData] = useState({
    project_id: '',
    version_no: '',
    written_by: '',
    submitted_date: '',
    word_count: '',
    notes: '',
    status: 'DRAFT'
  });

  // Queries
  const { data: scripts, isLoading: scriptsLoading } = useQuery({ queryKey: ['allScripts'], queryFn: fetchAllScripts });
  const { data: projects } = useQuery({ queryKey: ['allProjectsAdmin'], queryFn: fetchAllProjects });
  const { data: persons } = useQuery({ queryKey: ['talentRegistryAdmin'], queryFn: fetchAllPersons });

  // Mutations
  const createScriptMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const { data } = await api.post('/scripts/', payload);
        return data;
      } catch (error: any) {
        alert(`Failed to save draft:\n\n${error.response?.data?.detail || 'Unknown Error'}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allScripts'] });
      setIsModalOpen(false); 
      setFormData({ project_id: '', version_no: '', written_by: '', submitted_date: '', word_count: '', notes: '', status: 'DRAFT' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      await api.patch(`/scripts/${id}`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allScripts'] })
  });

  const deleteScriptMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/scripts/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['allScripts'] })
  });

  // Handlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      project_id: Number(formData.project_id),
      version_no: Number(formData.version_no),
      written_by: Number(formData.written_by),
      submitted_date: formData.submitted_date,
      word_count: formData.word_count ? Number(formData.word_count) : null,
      notes: formData.notes,
      status: formData.status
    };
    createScriptMutation.mutate(payload);
  };

  const handleDelete = (id: number, title: string, version: number) => {
    if (window.confirm(`Delete Draft v${version} for "${title}" permanently?`)) {
      deleteScriptMutation.mutate(id);
    }
  };

  if (scriptsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cine-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredScripts = scripts?.filter((s: any) => 
    s.project_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.writer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full relative">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Talent Manager Module
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Script Vault</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" placeholder="Search by film or writer..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-cine-gold transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Upload Draft
          </button>
        </div>
      </div>

      {/* ── DATA GRID ── */}
      <div className="bg-cine-onyx border border-cine-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
          <div className="col-span-3">Project & Version</div>
          <div className="col-span-3">Writer</div>
          <div className="col-span-2">Word Count</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-cine-border/50">
          {filteredScripts.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-cine-dust uppercase">No scripts in the vault yet.</div>
          ) : (
            filteredScripts.map((script: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                key={script.script_id} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/20 transition-colors group"
              >
                <div className="col-span-3 flex items-start gap-3">
                  <div className="mt-1 w-8 h-8 bg-cine-void border border-cine-border flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-cine-gold/50" />
                  </div>
                  <div>
                    <div className="font-display text-lg text-cine-ivory truncate">{script.project_title}</div>
                    <div className="font-mono text-[10px] text-cine-gold uppercase tracking-wider">
                      Version {script.version_no}
                    </div>
                  </div>
                </div>

                <div className="col-span-3">
                  <div className="font-body text-sm text-cine-cream truncate">{script.writer_name}</div>
                  <div className="font-mono text-[10px] text-cine-dust flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> Submitted: {script.submitted_date}
                  </div>
                </div>

                <div className="col-span-2 font-mono text-sm text-cine-cream">
                  {script.word_count ? script.word_count.toLocaleString() : '--'} words
                </div>

                <div className="col-span-2">
                  <span className={`inline-block px-2.5 py-1 border font-mono text-[10px] tracking-widest uppercase ${getStatusColor(script.status)}`}>
                    {script.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                  {script.status !== 'APPROVED' && (
                    <>
                      <button onClick={() => updateStatusMutation.mutate({ id: script.script_id, status: 'APPROVED' })} className="p-1.5 text-cine-dust hover:text-green-400 transition-colors" title="Approve Draft">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button onClick={() => updateStatusMutation.mutate({ id: script.script_id, status: 'REJECTED' })} className="p-1.5 text-cine-dust hover:text-orange-400 transition-colors" title="Reject Draft">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(script.script_id, script.project_title, script.version_no)} className="p-1.5 text-cine-dust hover:text-red-500 transition-colors" title="Delete Draft">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {script.notes && (
                  <div className="col-span-12 font-body text-xs text-cine-dust/80 bg-cine-void/30 p-2 mt-2 border-l-2 border-cine-gold/30">
                    <span className="font-bold text-cine-gold/50">Notes:</span> {script.notes}
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── UPLOAD MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-cine-void/80 backdrop-blur-sm" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-cine-onyx border border-cine-border p-8 shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors"><X className="w-5 h-5" /></button>

              <h2 className="font-display text-3xl text-cine-ivory mb-6">Archive Script Draft</h2>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Project *</label>
                    <select required value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="" disabled>-- Select Project --</option>
                      {projects?.map((p: any) => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Writer *</label>
                    <select required value={formData.written_by} onChange={(e) => setFormData({...formData, written_by: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="" disabled>-- Select Writer --</option>
                      {persons?.filter((p:any) => p.primary_profession === 'Writer' || p.primary_profession === 'Director').map((p: any) => 
                        <option key={p.person_id} value={p.person_id}>{p.full_name} ({p.primary_profession})</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Version No. *</label>
                    <input required type="number" min="1" value={formData.version_no} onChange={(e) => setFormData({...formData, version_no: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="1" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Submitted Date *</label>
                    <input required type="date" value={formData.submitted_date} onChange={(e) => setFormData({...formData, submitted_date: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Word Count</label>
                    <input type="number" value={formData.word_count} onChange={(e) => setFormData({...formData, word_count: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="e.g. 24000" />
                  </div>
                </div>

                <div>
                  <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Draft Notes / Feedback</label>
                  <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold custom-scrollbar" placeholder="Enter coverage notes, requested rewrites, etc." />
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={createScriptMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors">
                    {createScriptMutation.isPending ? 'Committing...' : 'Upload Draft to Vault'}
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