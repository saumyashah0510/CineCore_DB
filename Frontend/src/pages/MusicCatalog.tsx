import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Plus, X, Film, ChevronDown, ChevronRight, Mic2, Trash2, Clock, Disc3 } from 'lucide-react';
import { api } from '../lib/api';
import { TableSkeleton } from '../components/CinematicEffects';

const voiceTypeColors: Record<string, string> = {
  LEAD_MALE: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  LEAD_FEMALE: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  CHORUS: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

const emptyForm = {
  title: '',
  duration_seconds: '',
  music_director_id: '',
  lyricist_id: '',
  recording_studio: '',
  recording_date: '',
  isrc_code: '',
};

const emptySingerForm = {
  singer_id: '',
  voice_type: 'LEAD_MALE',
};

export default function MusicCatalog() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [expandedSong, setExpandedSong] = useState<number | null>(null);
  const [singerForm, setSingerForm] = useState({ ...emptySingerForm });
  const [showSingerForm, setShowSingerForm] = useState(false);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await api.get('/projects/')).data,
  });

  const { data: persons } = useQuery({
    queryKey: ['persons'],
    queryFn: async () => (await api.get('/persons/')).data,
  });

  const { data: songs, isLoading } = useQuery({
    queryKey: ['songs', selectedProject],
    queryFn: async () => (await api.get(`/songs/project/${selectedProject}`)).data,
    enabled: !!selectedProject,
  });

  const { data: singers } = useQuery({
    queryKey: ['singers', expandedSong],
    queryFn: async () => (await api.get(`/songs/${expandedSong}/singers`)).data,
    enabled: !!expandedSong,
  });

  const createSongMutation = useMutation({
    mutationFn: async (payload: any) => (await api.post('/songs/', payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songs', selectedProject] });
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to create song');
    },
  });

  const addSingerMutation = useMutation({
    mutationFn: async ({ songId, payload }: { songId: number; payload: any }) =>
      (await api.post(`/songs/${songId}/singers`, payload)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['singers', expandedSong] });
      setSingerForm({ ...emptySingerForm });
      setShowSingerForm(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to add singer');
    },
  });

  const removeSingerMutation = useMutation({
    mutationFn: async ({ songId, singerId }: { songId: number; singerId: number }) =>
      await api.delete(`/songs/${songId}/singers/${singerId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['singers', expandedSong] });
    },
  });

  const handleSongSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSongMutation.mutate({
      project_id: selectedProject,
      title: formData.title,
      duration_seconds: formData.duration_seconds ? Number(formData.duration_seconds) : null,
      music_director_id: Number(formData.music_director_id),
      lyricist_id: formData.lyricist_id ? Number(formData.lyricist_id) : null,
      recording_studio: formData.recording_studio || null,
      recording_date: formData.recording_date || null,
      isrc_code: formData.isrc_code || null,
    });
  };

  const handleAddSinger = (songId: number) => {
    addSingerMutation.mutate({
      songId,
      payload: {
        song_id: songId,
        singer_id: Number(singerForm.singer_id),
        voice_type: singerForm.voice_type,
      },
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Filter persons by music-related professions for dropdowns
  const musicDirectors = persons?.filter((p: any) =>
    ['Music Director', 'Composer', 'Music Composer'].includes(p.primary_profession)
  ) || [];
  const allPersons = persons || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Distribution Manager
          </span>
          <h1 className="font-display text-4xl text-gradient-gold">Music Catalog</h1>
          <p className="font-body text-sm text-cine-dust mt-2">
            Register songs, assign singers, and manage recording metadata.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Film className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedProject || ''}
              onChange={(e) => { setSelectedProject(Number(e.target.value) || null); setExpandedSong(null); }}
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
              <Plus className="w-4 h-4" /> Add Song
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {!selectedProject && (
        <div className="bg-cine-onyx border border-cine-border p-16 text-center">
          <Music className="w-12 h-12 text-cine-gold/30 mx-auto mb-4" />
          <p className="font-display text-2xl text-cine-dust">Select a project to view its soundtrack</p>
          <p className="font-mono text-xs text-cine-dust/50 mt-2 uppercase tracking-widest">
            Showing song + song_singer tables filtered by project_id
          </p>
        </div>
      )}

      {/* Song Cards */}
      {selectedProject && (
        <div className="space-y-4">
          {isLoading ? (
            <TableSkeleton />
          ) : songs?.length === 0 ? (
            <div className="bg-cine-onyx border border-cine-border p-8 text-center font-mono text-xs text-cine-dust uppercase">
              No songs registered for this project.
            </div>
          ) : (
            songs?.map((song: any, idx: number) => {
              const isExpanded = expandedSong === song.song_id;
              return (
                <motion.div
                  key={song.song_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-cine-onyx border border-cine-border overflow-hidden hover:border-cine-gold/30 transition-colors"
                >
                  {/* Song Header */}
                  <div
                    className="p-6 cursor-pointer flex items-center justify-between"
                    onClick={() => setExpandedSong(isExpanded ? null : song.song_id)}
                  >
                    <div className="flex items-center gap-5">
                      <div className="p-3 bg-cine-void border border-cine-border">
                        <Disc3 className={`w-5 h-5 text-cine-gold ${isExpanded ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                      </div>
                      <div>
                        <h3 className="font-display text-xl text-cine-ivory">{song.title}</h3>
                        <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mt-1">
                          Music: {song.music_director_name}
                          {song.lyricist_name && ` • Lyrics: ${song.lyricist_name}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {song.duration_seconds && (
                        <div className="flex items-center gap-2 text-right">
                          <Clock className="w-3.5 h-3.5 text-cine-gold" />
                          <span className="font-mono text-sm text-cine-cream">{formatDuration(song.duration_seconds)}</span>
                        </div>
                      )}
                      {song.isrc_code && (
                        <div className="text-right hidden md:block">
                          <div className="font-mono text-[10px] text-cine-dust uppercase">ISRC</div>
                          <div className="font-mono text-xs text-cine-cream">{song.isrc_code}</div>
                        </div>
                      )}
                      {song.recording_studio && (
                        <div className="text-right hidden lg:block">
                          <div className="font-mono text-[10px] text-cine-dust uppercase">Studio</div>
                          <div className="font-body text-xs text-cine-cream">{song.recording_studio}</div>
                        </div>
                      )}
                      <ChevronRight className={`w-5 h-5 text-cine-dust transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Singer Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-cine-border bg-cine-void/50"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-caption text-xs tracking-widest text-cine-dust uppercase flex items-center gap-2">
                              <Mic2 className="w-4 h-4" /> Vocal Artists — Song_Singer Junction Table
                            </h4>
                            <button
                              onClick={(e) => { e.stopPropagation(); setShowSingerForm(!showSingerForm); }}
                              className="flex items-center gap-1 px-3 py-1.5 bg-cine-onyx border border-cine-border text-cine-gold font-mono text-[10px] uppercase tracking-widest hover:border-cine-gold transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add Singer
                            </button>
                          </div>

                          {/* Singer List */}
                          {singers?.length === 0 ? (
                            <p className="font-mono text-xs text-cine-dust italic">No singers assigned yet.</p>
                          ) : (
                            <div className="space-y-2 mb-4">
                              {singers?.map((singer: any) => (
                                <div key={`${singer.song_id}-${singer.singer_id}`} className="flex items-center justify-between p-3 bg-cine-onyx border border-cine-border">
                                  <div className="flex items-center gap-3">
                                    <Mic2 className="w-4 h-4 text-cine-gold/50" />
                                    <span className="font-body text-sm text-cine-ivory">{singer.singer_name}</span>
                                    <span className={`px-2 py-0.5 border font-mono text-[9px] tracking-widest uppercase ${voiceTypeColors[singer.voice_type] || 'text-cine-dust border-cine-border'}`}>
                                      {singer.voice_type.replace('_', ' ')}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove ${singer.singer_name} from this song?`))
                                        removeSingerMutation.mutate({ songId: song.song_id, singerId: singer.singer_id });
                                    }}
                                    className="text-cine-dust hover:text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Singer Form */}
                          <AnimatePresence>
                            {showSingerForm && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                className="border-t border-cine-border pt-4 mt-4"
                              >
                                <div className="flex items-end gap-4">
                                  <div className="flex-1">
                                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Singer</label>
                                    <select
                                      value={singerForm.singer_id}
                                      onChange={(e) => setSingerForm({ ...singerForm, singer_id: e.target.value })}
                                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-2.5 text-sm focus:outline-none focus:border-cine-gold transition-colors"
                                    >
                                      <option value="">Select Person...</option>
                                      {allPersons.map((p: any) => (
                                        <option key={p.person_id} value={p.person_id}>{p.full_name} ({p.primary_profession})</option>
                                      ))}
                                    </select>
                                  </div>
                                  <div className="w-44">
                                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Voice Type</label>
                                    <select
                                      value={singerForm.voice_type}
                                      onChange={(e) => setSingerForm({ ...singerForm, voice_type: e.target.value })}
                                      className="w-full bg-cine-void border border-cine-border text-cine-ivory p-2.5 text-sm focus:outline-none focus:border-cine-gold transition-colors"
                                    >
                                      <option value="LEAD_MALE">Lead Male</option>
                                      <option value="LEAD_FEMALE">Lead Female</option>
                                      <option value="CHORUS">Chorus</option>
                                    </select>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleAddSinger(song.song_id)}
                                    disabled={!singerForm.singer_id || addSingerMutation.isPending}
                                    className="px-5 py-2.5 bg-cine-gold text-cine-void font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50"
                                  >
                                    {addSingerMutation.isPending ? '...' : 'Add'}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Create Song Modal */}
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

              <h2 className="font-display text-3xl text-cine-ivory mb-6">Register New Song</h2>

              <form onSubmit={handleSongSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Song Title</label>
                    <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Music Director</label>
                    <select required value={formData.music_director_id} onChange={(e) => setFormData({ ...formData, music_director_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="">Select...</option>
                      {/* Show all persons — music directors may have any profession label */}
                      {(musicDirectors.length > 0 ? musicDirectors : allPersons).map((p: any) => (
                        <option key={p.person_id} value={p.person_id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Lyricist (optional)</label>
                    <select value={formData.lyricist_id} onChange={(e) => setFormData({ ...formData, lyricist_id: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="">None (Instrumental)</option>
                      {allPersons.map((p: any) => (
                        <option key={p.person_id} value={p.person_id}>{p.full_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Duration (seconds)</label>
                    <input type="number" value={formData.duration_seconds} onChange={(e) => setFormData({ ...formData, duration_seconds: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" placeholder="e.g. 240" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">ISRC Code</label>
                    <input type="text" value={formData.isrc_code} onChange={(e) => setFormData({ ...formData, isrc_code: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" placeholder="e.g. INS012600001" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Recording Studio</label>
                    <input type="text" value={formData.recording_studio} onChange={(e) => setFormData({ ...formData, recording_studio: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Recording Date</label>
                    <input type="date" value={formData.recording_date} onChange={(e) => setFormData({ ...formData, recording_date: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors [color-scheme:dark]" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createSongMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createSongMutation.isPending ? 'Recording...' : 'Register Song'}
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
