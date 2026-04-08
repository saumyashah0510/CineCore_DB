import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Users, Music, MonitorPlay, Film } from 'lucide-react';
import { api } from '../lib/api';

// ── API Fetchers ─────────────────────────────────────────────────────────────
const fetchProjectData = async (id: string) => {
  const [proj, contracts, persons, songs, ott, theatre] = await Promise.all([
    api.get(`/projects/${id}`).then(res => res.data),
    api.get(`/contracts/project/${id}`).then(res => res.data),
    api.get(`/persons/`).then(res => res.data),
    api.get(`/songs/project/${id}`).then(res => res.data),
    api.get(`/distribution/deals/project/${id}`).then(res => res.data),
    api.get(`/distribution/theatre/project/${id}`).then(res => res.data),
  ]);
  return { proj, contracts, persons, songs, ott, theatre };
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'CAST' | 'MUSIC' | 'DISTRIBUTION'>('CAST');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['projectData', id],
    queryFn: () => fetchProjectData(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cine-void flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-cine-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-cine-void flex items-center justify-center text-cine-ivory font-display text-3xl">
        Masterpiece not found.
      </div>
    );
  }

  const { proj, contracts, persons, songs, ott, theatre } = data;

  // TypeScript fix: changed 'int' to 'number'
  const getPersonName = (personId: number) => {
    const person = persons.find((p: any) => p.person_id === personId);
    return person ? person.full_name : 'Unknown Artist';
  };

  const actors = contracts.filter((c: any) => c.role === 'ACTOR');
  const director = contracts.find((c: any) => c.role === 'DIRECTOR');

  return (
    <div className="min-h-screen bg-cine-void text-cine-ivory selection:bg-cine-gold/30">
      
      {/* ── HERO SECTION ── */}
      <div className="relative h-[70vh] w-full overflow-hidden border-b border-cine-border">
        {/* Full Screen Poster */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url('/posters/project_${proj.project_id}.jpg')`,
            backgroundColor: '#0a0a0a' 
          }}
        />
        
        {/* Film Grain */}
        <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
        
        {/* Targeted Gradients */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-cine-void via-cine-void/80 to-transparent" />
        <div className="absolute top-0 bottom-0 left-0 w-full md:w-2/3 bg-gradient-to-r from-cine-void via-cine-void/60 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-16">
          <Link to="/portfolio" className="flex items-center gap-2 text-cine-gold hover:text-cine-ivory transition-colors font-caption text-xs tracking-widest uppercase mb-8 w-fit relative z-10">
            <ChevronLeft className="w-4 h-4" /> Return to Archives
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-cine-ivory mb-4 leading-tight tracking-tight">
              {proj.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 md:gap-6 font-mono text-xs md:text-sm text-cine-cream uppercase tracking-widest mb-8">
              <span className="border border-cine-gold/50 px-3 py-1 text-cine-gold">{proj.censor_rating || 'UA'}</span>
              <span>{proj.genre}</span>
              <span>•</span>
              <span>{proj.runtime_minutes ? `${proj.runtime_minutes} MINS` : 'TBD'}</span>
              <span>•</span>
              <span>{new Date(proj.actual_release_date || proj.expected_release_date).getFullYear()}</span>
              {director && (
                <>
                  <span>•</span>
                  <span className="text-cine-dust">Dir: <span className="text-cine-ivory">{getPersonName(director.person_id)}</span></span>
                </>
              )}
            </div>

          </motion.div>
        </div>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className="sticky top-[64px] z-40 bg-cine-void/90 backdrop-blur-md border-b border-cine-border">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center gap-8 overflow-x-auto custom-scrollbar">
          {[
            { id: 'CAST', icon: Users, label: 'Cast & Crew' },
            { id: 'MUSIC', icon: Music, label: 'Soundtrack' },
            { id: 'DISTRIBUTION', icon: MonitorPlay, label: 'Where to Watch' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-5 font-caption text-xs md:text-sm tracking-widest uppercase transition-colors whitespace-nowrap relative ${activeTab === tab.id ? 'text-cine-gold font-bold' : 'text-cine-dust hover:text-cine-cream'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-0.5 bg-cine-gold" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 min-h-[50vh]">
        <AnimatePresence mode="wait">
          
          {/* CAST & CREW TAB */}
          {activeTab === 'CAST' && (
            <motion.div key="cast" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                {actors.length === 0 ? <p className="font-mono text-cine-dust col-span-full">No cast members recorded yet.</p> : actors.map((actor: any) => (
                  <div key={actor.contract_id} className="group">
                    <div className="relative aspect-[2/3] w-full bg-cine-onyx border border-cine-border mb-4 overflow-hidden flex items-center justify-center">
                      <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('/actors/person_${actor.person_id}.jpg')` }}
                      />
                      <Users className="w-12 h-12 text-cine-border opacity-50 absolute -z-10" />
                    </div>
                    <h3 className="font-display text-xl text-cine-ivory">{getPersonName(actor.person_id)}</h3>
                    <p className="font-mono text-xs text-cine-gold uppercase tracking-widest mt-1">
                      As {actor.character_name || 'Unknown'}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* SOUNDTRACK TAB */}
          {activeTab === 'MUSIC' && (
            <motion.div key="music" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl">
              {songs.length === 0 ? (
                <p className="font-mono text-cine-dust">No audio tracks registered in the database.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {songs.map((song: any, idx: number) => (
                    <div key={song.song_id} className="flex items-center justify-between p-4 border border-cine-border bg-cine-onyx hover:border-cine-gold/50 transition-colors group">
                      <div className="flex items-center gap-6">
                        <span className="font-mono text-cine-dust text-sm">{(idx + 1).toString().padStart(2, '0')}</span>
                        <div className="text-cine-gold opacity-50 group-hover:opacity-100 transition-opacity">
                          <Music className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-display text-xl text-cine-ivory">{song.title}</h4>
                          <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mt-1">
                            Music: {song.music_director_name || 'TBD'} {song.lyricist_name ? `• Lyrics: ${song.lyricist_name}` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="font-mono text-sm text-cine-cream">
                        {song.duration_seconds ? `${Math.floor(song.duration_seconds / 60)}:${(song.duration_seconds % 60).toString().padStart(2, '0')}` : '--:--'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* DISTRIBUTION TAB */}
          {activeTab === 'DISTRIBUTION' && (
            <motion.div key="dist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              {/* Show this if absolutely no distribution deals exist yet */}
              {ott.length === 0 && theatre.length === 0 && (
                <div className="py-12 text-center border border-cine-border bg-cine-onyx/20">
                  <p className="font-mono text-cine-dust text-sm uppercase tracking-widest">No distribution data available yet.</p>
                </div>
              )}

              {/* Only render OTT section if deals exist */}
              {ott.length > 0 && (
                <div className="mb-16">
                  <h3 className="font-caption text-lg tracking-widest text-cine-gold uppercase mb-6 flex items-center gap-3">
                    <MonitorPlay className="w-5 h-5" /> Streaming Platforms
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {ott.map((deal: any) => {
                      const safeName = deal.platform_name ? deal.platform_name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unknown';
                      return (
                        <div key={deal.deal_id} className="border border-cine-border bg-cine-onyx p-6 flex flex-col items-center justify-center text-center group hover:border-cine-gold transition-colors relative overflow-hidden h-40">
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-cine-gold/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          
                          <img 
                            src={`/logos/platform_${safeName}.png`} 
                            alt={deal.platform_name || 'Platform'}
                            className="max-h-16 max-w-full object-contain opacity-70 group-hover:opacity-100 transition-opacity relative z-10"
                            onError={(e) => { 
                              e.currentTarget.style.display = 'none'; 
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                              }
                            }} 
                          />
                          
                          <div className="font-display text-2xl text-cine-ivory relative z-10 hidden">
                            {deal.platform_name || 'Platform Deal'}
                          </div>

                          <div className="absolute bottom-4 font-mono text-[9px] text-cine-dust uppercase tracking-widest z-10">
                            {deal.territory} • {deal.deal_type ? deal.deal_type.replace('_', ' ') : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Only render Theatre section if releases exist */}
              {theatre.length > 0 && (
                <div>
                  <h3 className="font-caption text-lg tracking-widest text-cine-gold uppercase mb-6 flex items-center gap-3">
                    <Film className="w-5 h-5" /> Theatrical Run
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {theatre.map((run: any) => (
                      <div key={run.theatre_release_id} className="border border-cine-border bg-cine-void p-6 hover:border-cine-gold/40 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                          <span className="font-display text-2xl text-cine-ivory">{run.city}</span>
                          <span className="border border-cine-gold/30 text-cine-gold px-2 py-1 font-mono text-[10px] uppercase">
                            {run.theatre_chain}
                          </span>
                        </div>
                        <div className="space-y-3 font-mono text-xs uppercase tracking-widest">
                          <div className="flex justify-between text-cine-dust">
                            <span>Screens</span> <span className="text-cine-cream">{run.no_of_screens}</span>
                          </div>
                          <div className="flex justify-between text-cine-dust">
                            <span>Weeks</span> <span className="text-cine-cream">{run.weeks_running || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between text-cine-dust pt-3 border-t border-cine-border">
                            <span>Gross</span> 
                            <span className="text-cine-gold font-bold">
                              {run.total_collection ? `₹${(run.total_collection / 10000000).toFixed(2)} Cr` : 'TBD'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}