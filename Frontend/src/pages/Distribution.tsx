import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MonitorPlay, Film, Globe, Search, Plus, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

// ── API Fetchers ─────────────────────────────────────────────────────────────
// Assuming you have global endpoints to fetch all deals. 
// (If you get a 404, we will quickly build these in FastAPI next!)
const fetchAllOttDeals = async () => {
  const { data } = await api.get('/distribution/deals/');
  return data;
};

const fetchAllTheatreRuns = async () => {
  const { data } = await api.get('/distribution/theatre/');
  return data;
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Distribution() {
  const [activeTab, setActiveTab] = useState<'OTT' | 'THEATRE'>('OTT');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ottDeals, isLoading: ottLoading } = useQuery({
    queryKey: ['allOttDealsAdmin'],
    queryFn: fetchAllOttDeals,
  });

  const { data: theatreRuns, isLoading: theatreLoading } = useQuery({
    queryKey: ['allTheatreRunsAdmin'],
    queryFn: fetchAllTheatreRuns,
  });

  if (ottLoading || theatreLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cine-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Basic search filtering
  const filteredOtt = ottDeals?.filter((d: any) => 
    d.platform_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.territory?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredTheatre = theatreRuns?.filter((t: any) => 
    t.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.theatre_chain?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Distribution & Licensing
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Global Matrix</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search territories or platforms..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-cine-gold transition-colors w-64 md:w-80"
            />
          </div>
          <button className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> New Deal
          </button>
        </div>
      </div>

      {/* ── CUSTOM TAB TOGGLE ── */}
      <div className="flex items-center gap-2 bg-cine-onyx border border-cine-border p-1 w-fit mb-8">
        <button
          onClick={() => setActiveTab('OTT')}
          className={`flex items-center gap-2 px-6 py-2.5 font-caption text-xs tracking-widest uppercase transition-colors ${
            activeTab === 'OTT' ? 'bg-cine-void text-cine-gold border border-cine-border' : 'text-cine-dust hover:text-cine-cream border border-transparent'
          }`}
        >
          <MonitorPlay className="w-4 h-4" /> Streaming
        </button>
        <button
          onClick={() => setActiveTab('THEATRE')}
          className={`flex items-center gap-2 px-6 py-2.5 font-caption text-xs tracking-widest uppercase transition-colors ${
            activeTab === 'THEATRE' ? 'bg-cine-void text-cine-gold border border-cine-border' : 'text-cine-dust hover:text-cine-cream border border-transparent'
          }`}
        >
          <Film className="w-4 h-4" /> Theatrical
        </button>
      </div>

      {/* ── DATA VIEWS ── */}
      <AnimatePresence mode="wait">
        
        {/* OTT TAB */}
        {activeTab === 'OTT' && (
          <motion.div key="ott" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOtt.length === 0 ? (
                <div className="col-span-full py-12 text-center border border-cine-border bg-cine-onyx/20 font-mono text-cine-dust text-sm uppercase">
                  No active streaming deals found.
                </div>
              ) : (
                filteredOtt.map((deal: any) => {
                  const safeName = deal.platform_name ? deal.platform_name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'unknown';
                  return (
                    <div key={deal.deal_id} className="border border-cine-border bg-cine-onyx p-6 group hover:border-cine-gold/50 transition-colors flex flex-col h-full">
                      <div className="flex justify-between items-start mb-6">
                        <img 
                          src={`/logos/platform_${safeName}.png`} 
                          alt={deal.platform_name}
                          className="h-8 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                          onError={(e) => { 
                            e.currentTarget.style.display = 'none'; 
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                            }
                          }} 
                        />
                        <div className="font-display text-xl text-cine-ivory hidden">
                          {deal.platform_name}
                        </div>
                        <span className="font-mono text-[9px] px-2 py-1 border border-cine-gold/30 text-cine-gold uppercase tracking-widest">
                          {deal.deal_type?.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="mt-auto space-y-4">
                        <div>
                          <div className="font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1">Project</div>
                          <div className="font-body text-sm text-cine-ivory truncate">{deal.project_title || `Project ID: ${deal.project_id}`}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cine-border">
                          <div>
                            <div className="font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Region</div>
                            <div className="font-mono text-xs text-cine-cream truncate">{deal.territory}</div>
                          </div>
                          <div>
                            <div className="font-mono text-[10px] text-cine-dust uppercase tracking-widest mb-1">License Fee</div>
                            <div className="font-mono text-xs text-cine-gold font-bold">
                              {deal.license_fee ? `₹${(deal.license_fee / 10000000).toFixed(2)} Cr` : 'Rev Share'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* THEATRE TAB */}
        {activeTab === 'THEATRE' && (
          <motion.div key="theatre" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <div className="bg-cine-onyx border border-cine-border overflow-hidden">
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-cine-border bg-cine-void/50 font-caption text-xs tracking-widest text-cine-dust uppercase">
                <div className="col-span-3">City / Region</div>
                <div className="col-span-3">Project</div>
                <div className="col-span-2">Theatre Chain</div>
                <div className="col-span-2">Screens</div>
                <div className="col-span-2 text-right">Gross Col.</div>
              </div>

              <div className="divide-y divide-cine-border/50">
                {filteredTheatre.length === 0 ? (
                  <div className="p-8 text-center font-mono text-xs text-cine-dust uppercase">No theatrical runs recorded.</div>
                ) : (
                  filteredTheatre.map((run: any, idx: number) => (
                    <div key={run.theatre_release_id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-cine-border/20 transition-colors">
                      <div className="col-span-3 font-display text-lg text-cine-ivory">{run.city}</div>
                      <div className="col-span-3 font-body text-sm text-cine-cream truncate">{run.project_title || `Project ID: ${run.project_id}`}</div>
                      <div className="col-span-2 font-mono text-xs text-cine-dust uppercase">{run.theatre_chain}</div>
                      <div className="col-span-2 font-mono text-xs text-cine-cream">{run.no_of_screens}</div>
                      <div className="col-span-2 text-right font-mono text-sm text-cine-gold font-bold">
                        {run.total_collection ? `₹${(run.total_collection / 10000000).toFixed(2)} Cr` : '--'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}