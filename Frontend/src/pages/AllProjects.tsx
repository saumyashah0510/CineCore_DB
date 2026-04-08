import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Clapperboard, ArrowUpRight, X, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { PageSkeleton } from '../components/CinematicEffects';

const fetchAllProjects = async () => {
  const { data } = await api.get('/projects/');
  return data;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'RELEASED': return 'text-green-400 bg-green-400/10 border-green-400/20';
    case 'SHOOTING': return 'text-cine-gold bg-cine-gold/10 border-cine-gold/20';
    case 'PRE_PRODUCTION': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    case 'POST_PRODUCTION': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
    case 'DEVELOPMENT': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
    case 'SHELVED': return 'text-red-400 bg-red-400/10 border-red-400/20';
    default: return 'text-cine-dust bg-cine-onyx border-cine-border';
  }
};

export default function AllProjects() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // FIXED: Format matches DB exactly, Status removed
  const [formData, setFormData] = useState({
    title: '',
    house_id: '1', 
    genre: 'Drama',
    language: 'Hindi',
    format: 'Feature Film', 
    start_date: '',
    expected_release_date: '', 
    total_budget: '', 
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['allProjectsAdmin'],
    queryFn: fetchAllProjects,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        const { data } = await api.post('/projects/', payload);
        return data;
      } catch (error: any) {
        const details = error.response?.data?.detail;
        if (Array.isArray(details)) {
          // Pydantic 422 Errors
          const missingFields = details.map((err: any) => err.loc[err.loc.length - 1]).join(', ');
          alert(`FastAPI Form Error! Check these fields: \n\n${missingFields}`);
        } else {
          // PostgreSQL 400 Errors (Constraint violations, etc.)
          alert(`Database Error:\n\n${details}`);
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProjectsAdmin'] });
      setIsModalOpen(false); 
      setFormData({ title: '', house_id: '1', genre: 'Drama', language: 'Hindi', format: 'Feature Film', start_date: '', expected_release_date: '', total_budget: '' }); 
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: number) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProjectsAdmin'] });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      house_id: Number(formData.house_id),
      genre: formData.genre,
      language: formData.language,
      format: formData.format,
      start_date: formData.start_date,
      expected_release_date: formData.expected_release_date || null,
      total_budget: Number(formData.total_budget),
    };
    createProjectMutation.mutate(payload);
  };

  const handleDeleteClick = (projectId: number, projectTitle: string) => {
    if (window.confirm(`CRITICAL WARNING: Are you sure you want to permanently delete "${projectTitle}"?`)) {
      deleteProjectMutation.mutate(projectId);
    }
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  const filteredProjects = projects?.filter((p: any) => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.production_house?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full relative">
      
      {/* ── HEADER & CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            System Admin Module
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search registry..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-cine-gold transition-colors w-64"
            />
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* ── DATA GRID (TABLE) ── */}
      <div className="bg-cine-onyx border border-cine-border overflow-hidden">
        {/* Updated Headers: Removed Target Date, expanded Title and House */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
          <div className="col-span-5">Project Title</div>
          <div className="col-span-4">Production House</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        <div className="divide-y divide-cine-border/50">
          {filteredProjects.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-cine-dust uppercase">No records found.</div>
          ) : (
            filteredProjects.map((project: any, idx: number) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={project.project_id} 
                className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/20 transition-colors group"
              >
                <div className="col-span-5 flex items-center gap-4">
                  <div className="w-10 h-10 bg-cine-void border border-cine-border flex items-center justify-center shrink-0">
                    <Clapperboard className="w-4 h-4 text-cine-gold/50" />
                  </div>
                  <div>
                    <div className="font-display text-xl text-cine-ivory group-hover:text-cine-gold transition-colors truncate">
                      {project.title}
                    </div>
                    <div className="font-mono text-[10px] text-cine-dust uppercase tracking-wider">
                      {project.genre} • {project.censor_rating || 'Unrated'}
                    </div>
                  </div>
                </div>

                <div className="col-span-4 font-body text-sm text-cine-cream truncate">
                  {project.production_house}
                </div>

                <div className="col-span-2">
                  <span className={`inline-block px-2.5 py-1 border font-mono text-[10px] tracking-widest uppercase ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="col-span-1 flex items-center justify-end gap-3">
                  <Link to={`/project/${project.project_id}`} className="text-cine-dust hover:text-cine-gold transition-colors" title="View Public Page">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                  <button 
                    onClick={() => handleDeleteClick(project.project_id, project.title)}
                    className="text-cine-dust hover:text-red-500 transition-colors" 
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* ── CREATE PROJECT MODAL ── */}
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
              className="relative w-full max-w-2xl bg-cine-onyx border border-cine-border p-8 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display text-3xl text-cine-ivory mb-6">Greenlight Project</h2>

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Title</label>
                    <input 
                      required type="text"
                      value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Production House</label>
                    <select 
                      required 
                      value={formData.house_id} onChange={(e) => setFormData({...formData, house_id: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors"
                    >
                      <option value="1">Saumya Studios</option>
                      <option value="2">Aura Films</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Genre</label>
                    <select 
                      value={formData.genre} onChange={(e) => setFormData({...formData, genre: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors"
                    >
                      <option value="Action">Action</option>
                      <option value="Drama">Drama</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Thriller">Thriller</option>
                      <option value="Romance">Romance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Language</label>
                    <select 
                      value={formData.language} onChange={(e) => setFormData({...formData, language: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors"
                    >
                      <option value="Hindi">Hindi</option>
                      <option value="English">English</option>
                      <option value="Gujarati">Gujarati</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Format</label>
                    <select 
                      value={formData.format} onChange={(e) => setFormData({...formData, format: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors"
                    >
                      {/* FIXED TO MATCH DATABASE SCHEMA */}
                      <option value="Feature Film">Feature Film</option>
                      <option value="Web Series">Web Series</option>
                      <option value="Short Film">Short Film</option>
                      <option value="Documentary">Documentary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Start Date</label>
                    <input 
                      required type="date"
                      value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Target Release Date</label>
                    <input 
                      type="date"
                      value={formData.expected_release_date} onChange={(e) => setFormData({...formData, expected_release_date: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Total Budget (₹)</label>
                    <input 
                      required type="number" step="0.01" 
                      value={formData.total_budget} onChange={(e) => setFormData({...formData, total_budget: e.target.value})}
                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={createProjectMutation.isPending}
                    className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50"
                  >
                    {createProjectMutation.isPending ? 'Committing to DB...' : 'Create Registry Entry'}
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