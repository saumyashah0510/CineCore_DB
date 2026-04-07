import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Plus, X, Clock, Film, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';

const statusColors: Record<string, string> = {
  PLANNED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  COMPLETED: 'text-green-400 bg-green-400/10 border-green-400/20',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
  POSTPONED: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
};

const emptyForm = {
  project_id: '',
  location_id: '',
  schedule_date: '',
  scene_nos: '',
  call_time: '06:00',
  status: 'PLANNED',
  director_notes: '',
};

export default function Schedules() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [editingSchedule, setEditingSchedule] = useState<number | null>(null);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects/')).data,
  });

  const { data: locations } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => (await api.get('/locations/')).data,
  });

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['schedules', selectedProject],
    queryFn: async () => (await api.get(`/locations/schedules/project/${selectedProject}`)).data,
    enabled: !!selectedProject,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/locations/schedules/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', selectedProject] });
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to create schedule. Location may be double-booked.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: any }) =>
      (await api.patch(`/locations/schedules/${id}`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules', selectedProject] });
      setEditingSchedule(null);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to update schedule');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      project_id: selectedProject || Number(formData.project_id),
      location_id: Number(formData.location_id),
      schedule_date: formData.schedule_date,
      scene_nos: formData.scene_nos,
      call_time: formData.call_time,
      status: formData.status,
      director_notes: formData.director_notes || null,
    });
  };

  const handleStatusChange = (scheduleId: number, newStatus: string, delayReason?: string) => {
    const payload: any = { status: newStatus };
    if (newStatus === 'POSTPONED' || newStatus === 'CANCELLED') {
      const reason = delayReason || prompt('Enter delay/cancellation reason:');
      if (!reason) return;
      payload.delay_reason = reason;
    }
    updateMutation.mutate({ id: scheduleId, payload });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Production Manager
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Shoot Schedules</h1>
          <p className="font-body text-sm text-cine-dust mt-2">
            Plan and track shoot days — DB Trigger 4 prevents location double-booking.
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
              <Plus className="w-4 h-4" /> New Schedule
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!selectedProject && (
        <div className="bg-cine-onyx border border-cine-border p-16 text-center">
          <Calendar className="w-12 h-12 text-cine-gold/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-cine-dust">Select a project to view schedules</p>
          <p className="font-mono text-xs text-cine-dust/50 mt-2 uppercase tracking-widest">
            Showing shoot_schedule table filtered by project_id
          </p>
        </div>
      )}

      {/* Schedule Table */}
      {selectedProject && (
        <div className="bg-cine-onyx border border-cine-border overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Call Time</div>
            <div className="col-span-2">Location</div>
            <div className="col-span-2">Scenes</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Notes</div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-2 border-cine-gold border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : schedules?.length === 0 ? (
            <div className="p-8 text-center font-mono text-xs text-cine-dust uppercase">
              No schedules found for this project.
            </div>
          ) : (
            <div className="divide-y divide-cine-border/50">
              {schedules?.map((sch: any, idx: number) => (
                <motion.div
                  key={sch.schedule_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/10 transition-colors"
                >
                  <div className="col-span-2">
                    <div className="font-display text-lg text-cine-ivory">
                      {new Date(sch.schedule_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </div>
                    <div className="font-mono text-[10px] text-cine-dust">
                      {new Date(sch.schedule_date).getFullYear()}
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-cine-gold" />
                    <span className="font-mono text-sm text-cine-cream">{sch.call_time?.slice(0, 5)}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="font-body text-sm text-cine-ivory truncate">{sch.location_name}</div>
                    <div className="font-mono text-[10px] text-cine-dust uppercase">{sch.city}</div>
                  </div>
                  <div className="col-span-2 font-mono text-xs text-cine-cream">{sch.scene_nos}</div>
                  <div className="col-span-2">
                    {editingSchedule === sch.schedule_id ? (
                      <select
                        defaultValue={sch.status}
                        onChange={(e) => handleStatusChange(sch.schedule_id, e.target.value)}
                        onBlur={() => setEditingSchedule(null)}
                        autoFocus
                        className="bg-cine-void border border-cine-gold text-cine-ivory text-xs p-1.5 focus:outline-none"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="POSTPONED">Postponed</option>
                      </select>
                    ) : (
                      <button
                        onClick={() => setEditingSchedule(sch.schedule_id)}
                        className={`px-2.5 py-1 border font-mono text-[10px] tracking-widest uppercase cursor-pointer hover:opacity-80 ${statusColors[sch.status] || 'text-cine-dust border-cine-border'}`}
                      >
                        {sch.status}
                      </button>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="font-body text-xs text-cine-dust truncate" title={sch.director_notes || sch.delay_reason || ''}>
                      {sch.delay_reason && <span className="text-orange-400">[DELAY] </span>}
                      {sch.director_notes || sch.delay_reason || '—'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Schedule Modal */}
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

              <h2 className="font-display text-3xl text-cine-ivory mb-6">New Shoot Day</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Location</label>
                    <select required value={formData.location_id} onChange={(e) => setFormData({ ...formData, location_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="">Select Location...</option>
                      {locations?.map((l: any) => (
                        <option key={l.location_id} value={l.location_id}>
                          {l.location_name} ({l.city})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Schedule Date</label>
                    <input required type="date" value={formData.schedule_date} onChange={(e) => setFormData({ ...formData, schedule_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Call Time</label>
                    <input required type="time" value={formData.call_time} onChange={(e) => setFormData({ ...formData, call_time: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Scene Numbers</label>
                    <input required type="text" placeholder="e.g. 12, 13, 14A" value={formData.scene_nos} onChange={(e) => setFormData({ ...formData, scene_nos: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Director Notes</label>
                    <textarea value={formData.director_notes} onChange={(e) => setFormData({ ...formData, director_notes: e.target.value })} rows={2} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors resize-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createMutation.isPending ? 'Scheduling...' : 'Lock Schedule'}
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
