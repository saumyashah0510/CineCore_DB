import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Info } from 'lucide-react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';

const fetchProjects = async () => {
  const { data } = await api.get('/projects/');
  return data;
};

export default function Portfolio() {
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
  });

  // State to track the currently visible film
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter for RELEASED films only
  const releasedFilms = projects?.filter((p: any) => p.status === 'RELEASED') || [];

  // Auto-scroll logic: Changes the slide every 5 seconds
  useEffect(() => {
    if (releasedFilms.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % releasedFilms.length);
    }, 5000); // 5000ms = 5 seconds
    
    return () => clearInterval(timer);
  }, [releasedFilms.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cine-void flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-cine-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (releasedFilms.length === 0) {
    return (
      <div className="min-h-screen bg-cine-void flex items-center justify-center font-display text-3xl text-cine-dust">
        No masterpieces released yet.
      </div>
    );
  }

  const currentFilm = releasedFilms[currentIndex];

  return (
    <div className="relative w-full h-screen bg-cine-void overflow-hidden text-cine-ivory">
      {/* AnimatePresence handles the crossfade between slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFilm.project_id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full flex items-center"
        >
          {/* 1. Atmospheric Blurred Background */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110"
            style={{
              backgroundImage: `url('/posters/project_${currentFilm.project_id}.jpg')`,
              backgroundColor: '#111010'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-cine-void via-cine-void/90 to-transparent" />

          {/* 2. Main Content Container */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-center md:justify-start gap-8 md:gap-16 h-full py-12">
            
            {/* 3. The Uncropped Poster (Guaranteed to be fully visible) */}
            <Link to={`/project/${currentFilm.project_id}`} className="shrink-0 group relative mt-12 md:mt-0">
              <motion.img
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                src={`/posters/project_${currentFilm.project_id}.jpg`}
                alt={currentFilm.title}
                // h-[50vh] on mobile, h-[75vh] on desktop ensures it fits the screen
                className="h-[45vh] md:h-[75vh] w-auto max-w-full object-contain rounded-md shadow-[0_0_50px_rgba(0,0,0,0.6)] group-hover:scale-[1.02] transition-transform duration-500 border border-cine-border/20"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x600/111010/d4af37?text=Poster+Coming+Soon';
                }}
              />
            </Link>

            {/* 4. Film Details & Typography */}
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col items-center md:items-start text-center md:text-left max-w-2xl"
            >
              <div className="font-caption text-xs tracking-cinema text-cine-gold uppercase mb-4">
                {currentFilm.production_house} Presents
              </div>

              <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-cine-ivory mb-6 leading-none">
                {currentFilm.title}
              </h2>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-mono text-xs text-cine-cream uppercase tracking-widest mb-10">
                <span>{currentFilm.genre}</span>
                <span className="w-1 h-1 bg-cine-gold rounded-full" />
                <span>{currentFilm.theatre_cities > 0 ? 'Theatrical Release' : 'OTT Premiere'}</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                <button className="w-full sm:w-auto flex items-center justify-center gap-3 bg-cine-gold text-cine-void px-8 py-4 font-caption text-sm font-bold tracking-ultra uppercase hover:bg-cine-gold-light transition-colors">
                  <PlayCircle className="w-5 h-5" /> Watch Trailer
                </button>
                <Link to={`/project/${currentFilm.project_id}`} className="w-full sm:w-auto">
                  <button className="w-full flex items-center justify-center gap-3 border border-cine-border bg-cine-onyx/30 backdrop-blur-md text-cine-ivory px-8 py-4 font-caption text-sm tracking-ultra uppercase hover:border-cine-gold transition-colors">
                    <Info className="w-5 h-5 text-cine-gold" /> Details
                  </button>
                </Link>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </AnimatePresence>

      {/* 5. Progress Indicator Dots (Optional but good for UX) */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-20">
        {releasedFilms.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all duration-500 rounded-full ${
              idx === currentIndex 
                ? 'w-8 h-1.5 bg-cine-gold' 
                : 'w-2 h-1.5 bg-cine-border/50 hover:bg-cine-ivory/50'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}