import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Plus, X, ChevronDown, Film, AlertCircle, CheckCircle2, XCircle, Clock4 } from 'lucide-react';
import { api } from '../lib/api';
import { TableSkeleton } from '../components/CinematicEffects';

const statusConfig: Record<string, { color: string; icon: any }> = {
  APPLIED: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20', icon: Clock4 },
  APPROVED: { color: 'text-green-400 bg-green-400/10 border-green-400/20', icon: CheckCircle2 },
  REJECTED: { color: 'text-red-400 bg-red-400/10 border-red-400/20', icon: XCircle },
  EXPIRED: { color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: AlertCircle },
};

const permitTypeLabels: Record<string, string> = {
  SHOOTING: '🎬 Shooting',
  PARKING: '🅿️ Parking',
  DRONE_FLIGHT: '🛸 Drone Flight',
  NIGHT_SHOOT: '🌙 Night Shoot',
};

const emptyForm = {
  project_id: '',
  location_id: '',
  issuing_authority: '',
  permit_type: 'SHOOTING',
  application_date: '',
  issued_date: '',
  valid_from: '',
  valid_to: '',
  permit_fee: '',
  status: 'APPLIED',
};

export default function Permits() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects/')).data,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => (await api.get('/locations/')).data,
  });

  const { data: permits, isLoading } = useQuery({
    queryKey: ['permits', selectedProject],
    queryFn: async () => (await api.get(`/locations/permits/project/${selectedProject}`)).data,
    enabled: !!selectedProject,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/locations/permits/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permits', selectedProject] });
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to create permit');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) =>
      (await api.patch(`/locations/permits/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permits', selectedProject] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to update permit');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      project_id: selectedProject || Number(formData.project_id),
      location_id: Number(formData.location_id),
      issuing_authority: formData.issuing_authority,
      permit_type: formData.permit_type,
      application_date: formData.application_date,
      issued_date: formData.issued_date || null,
      valid_from: formData.valid_from || null,
      valid_to: formData.valid_to || null,
      permit_fee: formData.permit_fee ? Number(formData.permit_fee) : null,
      status: formData.status,
    });
  };

  const handleApprove = (permitId: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateMutation.mutate({
      id: permitId,
      payload: { status: 'APPROVED', issued_date: today, valid_from: today },
    });
  };

  const handleReject = (permitId: number) => {
    updateMutation.mutate({ id: permitId, payload: { status: 'REJECTED' } });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Production Manager
          </span>
          <h1 className="font-display text-4xl text-gradient-gold">Permit Authority</h1>
          <p className="font-body text-sm text-cine-dust mt-2">
            Track shooting, drone flight, parking, and night shoot clearances.
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
          {selectedProject && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors"
            >
              <Plus className="w-4 h-4" /> File Permit
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!selectedProject && (
        <div className="bg-cine-onyx border border-cine-border p-16 text-center">
          <ShieldCheck className="w-12 h-12 text-cine-gold/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-cine-dust">Select a project to view permits</p>
          <p className="font-mono text-xs text-cine-dust/50 mt-2 uppercase tracking-widest">
            Showing permit table filtered by project_id
          </p>
        </div>
      )}

      {/* Permit Cards */}
      {selectedProject && (
        <div className="space-y-4">
          {isLoading ? (
            <TableSkeleton />
          ) : permits?.length === 0 ? (
            <div className="bg-cine-onyx border border-cine-border p-8 text-center font-mono text-xs text-cine-dust uppercase">
              No permits filed for this project.
            </div>
          ) : (
            permits?.map((permit: any, idx: number) => {
              const cfg = statusConfig[permit.status] || statusConfig.APPLIED;
              const StatusIcon = cfg.icon;
              return (
                <motion.div
                  key={permit.permit_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/30 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-cine-void border border-cine-border">
                        <StatusIcon className={`w-5 h-5 ${cfg.color.split(' ')[0]}`} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-display text-xl text-cine-ivory">
                            {permitTypeLabels[permit.permit_type] || permit.permit_type}
                          </h3>
                          <span className={`px-2.5 py-0.5 border font-mono text-[10px] tracking-widest uppercase ${cfg.color}`}>
                            {permit.status}
                          </span>
                        </div>
                        <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mt-1">
                          {permit.location_name} • Authority: {permit.issuing_authority}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-mono text-[10px] text-cine-dust uppercase">Applied</div>
                        <div className="font-body text-sm text-cine-cream">
                          {new Date(permit.application_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      {permit.valid_from && (
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-cine-dust uppercase">Valid</div>
                          <div className="font-body text-sm text-cine-cream">
                            {new Date(permit.valid_from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} — {permit.valid_to ? new Date(permit.valid_to).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '∞'}
                          </div>
                        </div>
                      )}
                      {permit.permit_fee && (
                        <div className="text-right">
                          <div className="font-mono text-[10px] text-cine-dust uppercase">Fee</div>
                          <div className="font-body text-sm text-cine-gold">₹{Number(permit.permit_fee).toLocaleString()}</div>
                        </div>
                      )}

                      {permit.status === 'APPLIED' && (
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(permit.permit_id)}
                            className="px-3 py-1.5 bg-green-500/10 border border-green-500/30 text-green-400 font-mono text-[10px] uppercase tracking-widest hover:bg-green-500/20 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(permit.permit_id)}
                            className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Create Permit Modal */}
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
              className="relative w-full max-w-2xl bg-cine-onyx border border-cine-border p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-cine-dust hover:text-cine-ivory transition-colors">
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-display text-3xl text-cine-ivory mb-6">File New Permit</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Location</label>
                    <select required value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="">Select Location...</option>
                      {locations?.map((l: any) => (
                        <option key={l.location_id} value={l.location_id}>{l.location_name} ({l.city})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Permit Type</label>
                    <select required value={formData.permit_type} onChange={(e) => setFormData({ ...formData, permit_type: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="SHOOTING">Shooting</option>
                      <option value="PARKING">Parking</option>
                      <option value="DRONE_FLIGHT">Drone Flight</option>
                      <option value="NIGHT_SHOOT">Night Shoot</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Issuing Authority</label>
                    <input required type="text" value={formData.issuing_authority} onChange={(e) => setFormData({ ...formData, issuing_authority: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Application Date</label>
                    <input required type="date" value={formData.application_date} onChange={(e) => setFormData({ ...formData, application_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Permit Fee (₹)</label>
                    <input type="number" step="0.01" value={formData.permit_fee} onChange={(e) => setFormData({ ...formData, permit_fee: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Valid From</label>
                    <input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Valid To</label>
                    <input type="date" value={formData.valid_to} onChange={(e) => setFormData({ ...formData, valid_to: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createMutation.isPending ? 'Filing...' : 'File Permit Application'}
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
