import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, UserCircle, Mail, Phone, X, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { PageSkeleton } from '../components/CinematicEffects';

// ── API Fetchers ─────────────────────────────────────────────────────────────
const fetchAllPersons = async () => {
  const { data } = await api.get('/persons/');
  return data;
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function TalentRegistry() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State mapping perfectly to the Person DDL
  const [formData, setFormData] = useState({
    full_name: '',
    screen_name: '',
    nationality: 'Indian',
    dob: '',
    gender: 'Male',
    primary_profession: 'Actor',
    pan_no: '',
    contact_email: '',
    contact_phone: '',
    agent_name: '',
    agent_contact: ''
  });

  const { data: persons, isLoading } = useQuery({
    queryKey: ['talentRegistryAdmin'],
    queryFn: fetchAllPersons,
  });

  const createPersonMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      try {
        const { data } = await api.post('/persons/', payload);
        return data;
      } catch (error: any) {
        const details = error.response?.data?.detail;
        if (Array.isArray(details)) {
          const missingFields = details.map((err: any) => err.loc[err.loc.length - 1]).join(', ');
          alert(`FastAPI Form Error! Check these fields: \n\n${missingFields}`);
        } else {
          // This will catch PostgreSQL UNIQUE constraints (like duplicate PAN numbers)
          alert(`Database Error:\n\n${details}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talentRegistryAdmin'] });
      setIsModalOpen(false); 
      // Reset form
      setFormData({
        full_name: '', screen_name: '', nationality: 'Indian', dob: '', gender: 'Male',
        primary_profession: 'Actor', pan_no: '', contact_email: '', contact_phone: '',
        agent_name: '', agent_contact: ''
      });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: async (personId: number) => {
      await api.delete(`/persons/${personId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['talentRegistryAdmin'] });
    },
    onError: (error: any) => {
      alert(`Cannot delete person! They likely have active contracts in the system.\n\nDetails: ${error.response?.data?.detail || error.message}`);
    }
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPersonMutation.mutate(formData);
  };

  const handleDeleteClick = (personId: number, name: string) => {
    if (window.confirm(`WARNING: Are you sure you want to remove ${name} from the registry?`)) {
      deletePersonMutation.mutate(personId);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  const filteredPersons = persons?.filter((p: any) => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.primary_profession.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full relative">
      
      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Talent Manager Module
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Global Talent Registry</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search talent..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-cine-gold transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Register Person
          </button>
        </div>
      </div>

      {/* ── DATA GRID ── */}
      <div className="bg-cine-onyx border border-cine-border overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
          <div className="col-span-4">Artist Profile</div>
          <div className="col-span-2">Profession</div>
          <div className="col-span-3">Contact Information</div>
          <div className="col-span-2">Agent</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-cine-border/50">
          {filteredPersons.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-cine-dust uppercase">No artists registered yet.</div>
          ) : (
            filteredPersons.map((person: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={person.person_id} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/20 transition-colors group"
              >
                <div className="col-span-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-cine-void border border-cine-border flex items-center justify-center shrink-0 overflow-hidden">
                    <div 
                      className="w-full h-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-500"
                      style={{ backgroundImage: `url('/actors/person_${person.person_id}.jpg')` }}
                    >
                      {/* Fallback Icon if no image exists in public folder */}
                      <UserCircle className="w-full h-full text-cine-border opacity-30" />
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-lg text-cine-ivory truncate group-hover:text-cine-gold transition-colors">
                      {person.full_name}
                    </div>
                    <div className="font-mono text-[10px] text-cine-dust uppercase tracking-wider">
                      {person.screen_name ? `AKA ${person.screen_name}` : person.nationality}
                    </div>
                  </div>
                </div>

                <div className="col-span-2">
                  <span className="inline-block px-2.5 py-1 border border-cine-border bg-cine-void font-mono text-[10px] tracking-widest uppercase text-cine-cream">
                    {person.primary_profession}
                  </span>
                </div>

                <div className="col-span-3 space-y-1">
                  <div className="flex items-center gap-2 font-mono text-[10px] text-cine-dust truncate">
                    <Mail className="w-3 h-3 text-cine-gold/50" /> {person.contact_email}
                  </div>
                  {person.contact_phone && (
                    <div className="flex items-center gap-2 font-mono text-[10px] text-cine-dust">
                      <Phone className="w-3 h-3 text-cine-gold/50" /> {person.contact_phone}
                    </div>
                  )}
                </div>

                <div className="col-span-2 font-body text-xs text-cine-cream truncate">
                  {person.agent_name || 'Independent'}
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  <button 
                    onClick={() => handleDeleteClick(person.person_id, person.full_name)}
                    className="p-1.5 text-cine-dust hover:text-red-500 transition-colors" 
                    title="Remove from Registry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── REGISTRATION MODAL ── */}
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

              <h2 className="font-display text-3xl text-cine-ivory mb-6">Register Talent</h2>

              <form onSubmit={handleCreateSubmit} className="space-y-6">
                
                {/* Identity Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Legal Full Name *</label>
                    <input required type="text" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Screen Name</label>
                    <input type="text" value={formData.screen_name} onChange={(e) => setFormData({...formData, screen_name: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Date of Birth *</label>
                    <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Gender</label>
                    <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Nationality *</label>
                    <input required type="text" value={formData.nationality} onChange={(e) => setFormData({...formData, nationality: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" />
                  </div>
                </div>

                {/* Professional Section */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Primary Profession *</label>
                    <select value={formData.primary_profession} onChange={(e) => setFormData({...formData, primary_profession: e.target.value})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold">
                      <option value="Actor">Actor</option>
                      <option value="Director">Director</option>
                      <option value="Writer">Writer</option>
                      <option value="Music Director">Music Director</option>
                      <option value="Singer">Singer</option>
                      <option value="Cinematographer">Cinematographer</option>
                      <option value="Editor">Editor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Gov. Tax ID (PAN) *</label>
                    <input required type="text" value={formData.pan_no} onChange={(e) => setFormData({...formData, pan_no: e.target.value.toUpperCase()})} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold" placeholder="ABCDE1234F" />
                  </div>
                </div>

                {/* Contact Section */}
                <div className="p-4 border border-cine-border/50 bg-cine-void/50 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1">Direct Email *</label>
                      <input required type="email" value={formData.contact_email} onChange={(e) => setFormData({...formData, contact_email: e.target.value})} className="w-full bg-transparent border-b border-cine-border text-cine-ivory py-2 focus:outline-none focus:border-cine-gold" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1">Direct Phone</label>
                      <input type="text" value={formData.contact_phone} onChange={(e) => setFormData({...formData, contact_phone: e.target.value})} className="w-full bg-transparent border-b border-cine-border text-cine-ivory py-2 focus:outline-none focus:border-cine-gold" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1">Agent Name</label>
                      <input type="text" value={formData.agent_name} onChange={(e) => setFormData({...formData, agent_name: e.target.value})} className="w-full bg-transparent border-b border-cine-border text-cine-ivory py-2 focus:outline-none focus:border-cine-gold" />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1">Agent Contact</label>
                      <input type="text" value={formData.agent_contact} onChange={(e) => setFormData({...formData, agent_contact: e.target.value})} className="w-full bg-transparent border-b border-cine-border text-cine-ivory py-2 focus:outline-none focus:border-cine-gold" />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" disabled={createPersonMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createPersonMutation.isPending ? 'Saving Record...' : 'Complete Registration'}
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