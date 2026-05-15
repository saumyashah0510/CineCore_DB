import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Film, Users, X, ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

// ── Types ────────────────────────────────────────────────────────────────────
interface SearchResult {
  id: string;
  category: 'Project' | 'Talent';
  title: string;
  subtitle: string;
  path: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function GlobalSearch({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch data — React Query uses cache if already loaded, otherwise fetches fresh
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projectsAll'],
    queryFn: async () => (await api.get('/projects/')).data,
    staleTime: 5 * 60 * 1000, // 5 minutes — use cached data if fresh
    enabled: isOpen,
  });

  const { data: persons, isLoading: personsLoading } = useQuery({
    queryKey: ['talentRegistryAdmin'],
    queryFn: async () => (await api.get('/persons/')).data,
    staleTime: 5 * 60 * 1000,
    enabled: isOpen,
  });

  const isLoading = projectsLoading || personsLoading;

  // ── Focus input when modal opens ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // ── Close on Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // ── Build Results ─────────────────────────────────────────────────────────
  const q = query.toLowerCase().trim();

  const results: SearchResult[] = [];

  if (q.length > 0) {
    // Project results
    const matchedProjects: SearchResult[] = (projects || [])
      .filter((p: any) =>
        p.title?.toLowerCase().includes(q) ||
        p.production_house?.toLowerCase().includes(q) ||
        p.status?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((p: any) => ({
        id: `project-${p.project_id}`,
        category: 'Project' as const,
        title: p.title,
        subtitle: `${p.production_house} · ${p.status?.replace('_', ' ')}`,
        path: '/all-projects',
      }));

    // Talent results
    const matchedPersons: SearchResult[] = (persons || [])
      .filter((p: any) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.primary_profession?.toLowerCase().includes(q) ||
        p.screen_name?.toLowerCase().includes(q)
      )
      .slice(0, 5)
      .map((p: any) => ({
        id: `person-${p.person_id}`,
        category: 'Talent' as const,
        title: p.full_name,
        subtitle: `${p.primary_profession}${p.screen_name ? ` · AKA ${p.screen_name}` : ''}`,
        path: '/talent',
      }));

    results.push(...matchedProjects, ...matchedPersons);
  }

  // ── Keyboard Navigation ───────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      handleSelect(results[activeIndex]);
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.path);
    onClose();
  };

  // ── Category Icon ──────────────────────────────────────────────────────────
  const CategoryIcon = ({ cat }: { cat: SearchResult['category'] }) => {
    if (cat === 'Project') return <Film className="w-3.5 h-3.5 text-cine-gold" />;
    return <Users className="w-3.5 h-3.5 text-blue-400" />;
  };

  const categoryColor = (cat: SearchResult['category']) =>
    cat === 'Project' ? 'text-cine-gold' : 'text-blue-400';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-cine-void/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-[15vh] left-1/2 -translate-x-1/2 z-[101] w-full max-w-2xl px-4"
          >
            <div className="bg-cine-onyx border border-cine-border shadow-2xl overflow-hidden">

              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-cine-border">
                {isLoading
                  ? <Loader2 className="w-5 h-5 text-cine-gold animate-spin shrink-0" />
                  : <Search className="w-5 h-5 text-cine-gold shrink-0" />
                }
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search projects, talent, roles..."
                  className="flex-1 bg-transparent text-cine-ivory font-body text-base placeholder:text-cine-dust/50 focus:outline-none"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-cine-dust hover:text-cine-ivory transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 border border-cine-border font-mono text-[10px] text-cine-dust uppercase">
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-[50vh] overflow-y-auto">
                {q.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="font-mono text-xs text-cine-dust uppercase tracking-widest">
                      Start typing to search across projects and talent
                    </p>
                    <div className="flex justify-center gap-6 mt-4">
                      {[
                        { icon: Film, label: 'Projects', color: 'text-cine-gold' },
                        { icon: Users, label: 'Talent', color: 'text-blue-400' },
                      ].map(({ icon: Icon, label, color }) => (
                        <div key={label} className="flex items-center gap-2">
                          <Icon className={`w-3.5 h-3.5 ${color}`} />
                          <span className={`font-mono text-[10px] uppercase ${color}`}>{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : results.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="font-mono text-xs text-cine-dust uppercase tracking-widest">
                      No results for "{query}"
                    </p>
                  </div>
                ) : (
                  <div className="py-2">
                    {results.map((result, idx) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => handleSelect(result)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left group ${
                          activeIndex === idx
                            ? 'bg-cine-border/30'
                            : 'hover:bg-cine-border/15'
                        }`}
                      >
                        {/* Category icon */}
                        <div className="shrink-0 w-7 h-7 flex items-center justify-center border border-cine-border bg-cine-void">
                          <CategoryIcon cat={result.category} />
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base text-cine-ivory truncate">
                            {result.title}
                          </p>
                          <p className="font-mono text-[10px] text-cine-dust uppercase tracking-widest truncate">
                            <span className={categoryColor(result.category)}>{result.category}</span>
                            {' · '}{result.subtitle}
                          </p>
                        </div>

                        {/* Arrow */}
                        <ArrowRight className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                          activeIndex === idx ? 'text-cine-gold translate-x-0' : 'text-cine-dust -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                        }`} />
                      </motion.button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-2.5 border-t border-cine-border bg-cine-void/40 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 border border-cine-border font-mono text-[9px] text-cine-dust">↑↓</kbd>
                  <span className="font-mono text-[9px] text-cine-dust uppercase">Navigate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 border border-cine-border font-mono text-[9px] text-cine-dust">↵</kbd>
                  <span className="font-mono text-[9px] text-cine-dust uppercase">Go</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 border border-cine-border font-mono text-[9px] text-cine-dust">Esc</kbd>
                  <span className="font-mono text-[9px] text-cine-dust uppercase">Close</span>
                </div>
                <div className="ml-auto font-mono text-[9px] text-cine-dust uppercase">
                  {results.length > 0 && `${results.length} result${results.length !== 1 ? 's' : ''}`}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
