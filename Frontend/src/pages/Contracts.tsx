import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, FileSignature, X, User } from 'lucide-react';
import { api } from '../lib/api';

// ── API Fetchers ─────────────────────────────────────────────────────────────
const fetchAllContracts = async () => {
  const { data } = await api.get('/contracts/');
  return data;
};
const fetchAllPersons = async () => {
  const { data } = await api.get('/persons/');
  return data;
};
const fetchAllProjects = async () => {
  const { data } = await api.get('/projects/');
  return data;
};

// Helper for UI Colors
const getStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'COMPLETED': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'ON_HOLD': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'TERMINATED': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-cine-dust bg-cine-onyx border-cine-border';
  }
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Contracts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State matching sp_sign_contract exactly
  const [formData, setFormData] = useState({
    person_id: '',
    project_id: '',
    role: 'ACTOR',
    character_name: '',
    contract_fee: '',
    signing_date: '',
    start_date: '',
    end_date: '',
  });

  // Fetch Data
  const { data: contracts, isLoading: contractsLoading } = useQuery({ queryKey: ['allContracts'], queryFn: fetchAllContracts });
  const { data: persons } = useQuery({ queryKey: ['talentRegistryAdmin'], queryFn: fetchAllPersons });
  const { data: projects } = useQuery({ queryKey: ['allProjectsAdmin'], queryFn: fetchAllProjects });

  const createContractMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const { data } = await api.post('/contracts/', payload);
        return data;
      } catch (error: any) {
        // This will catch the custom SQL Exception: "Person X already has a contract on Project Y"
        alert(`Contract Failed:\n\n${error.response?.data?.detail || 'Unknown Error'}`);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allContracts'] });
      setIsModalOpen(false); 
      setFormData({ person_id: '', project_id: '', role: 'ACTOR', character_name: '', contract_fee: '', signing_date: '', start_date: '', end_date: '' });
      alert("Contract signed successfully! The 3 payment milestones have been auto-generated for the Finance Manager.");
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      person_id: Number(formData.person_id),
      project_id: Number(formData.project_id),
      contract_fee: Number(formData.contract_fee),
      end_date: formData.end_date || null // End date is optional
    };
    createContractMutation.mutate(payload);
  };

  if (contractsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cine-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const filteredContracts = contracts?.filter((c: any) => 
    c.person_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.project_title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full relative">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Talent Manager Module
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Active Contracts</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search talent or project..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-cine-gold transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Sign Contract
          </button>
        </div>
      </div>

      {/* ── DATA GRID ── */}
      <div className="bg-cine-onyx border border-cine-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
          <div className="col-span-3">Talent</div>
          <div className="col-span-3">Project & Role</div>
          <div className="col-span-2">Agreed Fee</div>
          <div className="col-span-2">Dates</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        <div className="divide-y divide-cine-border/50">
          {filteredContracts.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-cine-dust uppercase">No contracts drafted yet.</div>
          ) : (
            filteredContracts.map((contract: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                key={contract.contract_id} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/20 transition-colors group"
              >
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-cine-void border border-cine-border flex items-center justify-center shrink-0">
                    <User className="w-3 h-3 text-cine-gold/50" />
                  </div>
                  <div className="font-display text-lg text-cine-ivory truncate">{contract.person_name}</div>
                </div>

                <div className="col-span-3">
                  <div className="font-body text-sm text-cine-cream truncate">{contract.project_title}</div>
                  <div className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mt-0.5">
                    {contract.role} {contract.character_name && `• As "${contract.character_name}"`}
                  </div>
                </div>

                <div className="col-span-2 font-mono text-sm text-cine-gold font-bold">
                  ₹{(contract.contract_fee / 100000).toFixed(2)} L
                </div>

                <div className="col-span-2 font-mono text-[10px] text-cine-dust uppercase tracking-widest space-y-1">
                  <div><span className="opacity-50">Signed:</span> {contract.signing_date}</div>
                  <div><span className="opacity-50">Starts:</span> {contract.start_date}</div>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <span className={`inline-block px-2.5 py-1 border font-mono text-[10px] tracking-widest uppercase ${getStatusColor(contract.status)}`}>
                    {contract.status.replace('_', ' ')}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── SIGN CONTRACT MODAL ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-cine-void/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl bg-cine-onyx border border-cine-border p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors">
                <X className="w-5 h-5" />
              </button>

              <div className="mb-6 border-l-2 border-cine-gold pl-4">
                <h2 className="font-display text-3xl text-cine-ivory">Draft Agreement</h2>
                <p className="font-mono text-[10px] text-cine-dust uppercase tracking-widest mt-1">Payment milestones will be generated automatically.</p>
              </div>

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Select Talent *</label>
                    <select required value={formData.person_id} onChange={(e) => setFormData({...formData, person_id: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="" disabled>-- Select from Registry --</option>
                      {persons?.map((p: any) => <option key={p.person_id} value={p.person_id}>{p.full_name} ({p.primary_profession})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Select Project *</label>
                    <select required value={formData.project_id} onChange={(e) => setFormData({...formData, project_id: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="" disabled>-- Select active Project --</option>
                      {projects?.map((p: any) => <option key={p.project_id} value={p.project_id}>{p.title}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Production Role *</label>
                    <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="ACTOR">Actor</option>
                      <option value="DIRECTOR">Director</option>
                      <option value="WRITER">Writer</option>
                      <option value="MUSIC_COMPOSER">Music Composer</option>
                      <option value="DOP">DOP / Cinematographer</option>
                      <option value="EDITOR">Editor</option>
                      <option value="CHOREOGRAPHER">Choreographer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Character Name (If Actor)</label>
                    <input type="text" value={formData.character_name} onChange={(e) => setFormData({...formData, character_name: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="e.g. Inspector Raj" />
                  </div>
                </div>

                <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Total Contract Fee (₹) *</label>
                    <input required type="number" step="0.01" min="0" value={formData.contract_fee} onChange={(e) => setFormData({...formData, contract_fee: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold font-mono" placeholder="Enter total amount" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Signing Date *</label>
                    <input required type="date" value={formData.signing_date} onChange={(e) => setFormData({...formData, signing_date: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Shoot Start Date *</label>
                    <input required type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Expected Wrap Date</label>
                    <input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={createContractMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    <FileSignature className="w-4 h-4" /> {createContractMutation.isPending ? 'Processing...' : 'Execute Contract'}
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