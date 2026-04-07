import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plus, Search, X, Building2, TreePine, Plane } from 'lucide-react';
import { api } from '../lib/api';

const typeIcons: Record<string, any> = {
  INDOOR_SET: Building2,
  OUTDOOR: TreePine,
  FOREIGN: Plane,
};

const typeColors: Record<string, string> = {
  INDOOR_SET: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  OUTDOOR: 'text-green-400 bg-green-400/10 border-green-400/20',
  FOREIGN: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

const emptyForm = {
  location_name: '',
  type: 'OUTDOOR',
  address: '',
  city: '',
  state: '',
  country: 'India',
  contact_person: '',
  contact_phone: '',
  daily_rental_cost: '',
  facilities_available: '',
  permits_required: false,
  permit_authority: '',
};

export default function Locations() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });

  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: async () => (await api.get('/locations/')).data,
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/locations/', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
    },
    onError: (err: any) => {
      alert(err.response?.data?.detail || 'Failed to create location');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      daily_rental_cost: formData.daily_rental_cost ? Number(formData.daily_rental_cost) : null,
      facilities_available: formData.facilities_available || null,
      permit_authority: formData.permits_required ? formData.permit_authority : null,
      state: formData.state || null,
      address: formData.address || null,
    });
  };

  const filtered = locations?.filter((loc: any) => {
    const matchSearch =
      loc.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = typeFilter === 'ALL' || loc.type === typeFilter;
    return matchSearch && matchType;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-cine-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="font-mono text-xs tracking-widest text-cine-gold uppercase mb-2 block">
            Production Manager
          </span>
          <h1 className="font-display text-4xl text-cine-ivory">Location Registry</h1>
          <p className="font-body text-sm text-cine-dust mt-2">
            Manage OUTDOOR, INDOOR_SET, and FOREIGN shoot locations across all projects.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cine-dust absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm pl-10 pr-4 py-2 focus:outline-none focus:border-cine-gold transition-colors w-64"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-cine-onyx border border-cine-border text-cine-ivory font-body text-sm px-4 py-2 focus:outline-none focus:border-cine-gold transition-colors"
          >
            <option value="ALL">All Types</option>
            <option value="OUTDOOR">Outdoor</option>
            <option value="INDOOR_SET">Indoor Set</option>
            <option value="FOREIGN">Foreign</option>
          </select>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-cine-gold text-cine-void px-5 py-2 font-caption text-xs font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Location
          </button>
        </div>
      </div>

      {/* Location Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center font-mono text-xs text-cine-dust uppercase">
            No locations found.
          </div>
        ) : (
          filtered.map((loc: any, idx: number) => {
            const TypeIcon = typeIcons[loc.type] || MapPin;
            return (
              <motion.div
                key={loc.location_id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="bg-cine-onyx border border-cine-border p-6 hover:border-cine-gold/40 transition-all duration-500 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-cine-void border border-cine-border group-hover:border-cine-gold/30 transition-colors">
                    <TypeIcon className="w-5 h-5 text-cine-gold" strokeWidth={1.5} />
                  </div>
                  <span className={`px-2.5 py-1 border font-mono text-[10px] tracking-widest uppercase ${typeColors[loc.type] || 'text-cine-dust border-cine-border'}`}>
                    {loc.type.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="font-display text-xl text-cine-ivory mb-1 group-hover:text-cine-gold transition-colors">
                  {loc.location_name}
                </h3>
                <p className="font-mono text-[10px] text-cine-dust uppercase tracking-wider mb-4">
                  {loc.city}, {loc.state ? `${loc.state}, ` : ''}{loc.country}
                </p>

                {loc.address && (
                  <p className="font-body text-xs text-cine-cream/60 mb-3 line-clamp-2">{loc.address}</p>
                )}

                <div className="border-t border-cine-border pt-4 mt-auto space-y-2">
                  <div className="flex justify-between font-mono text-[10px] text-cine-dust uppercase">
                    <span>Contact</span>
                    <span className="text-cine-cream">{loc.contact_person}</span>
                  </div>
                  {loc.daily_rental_cost && (
                    <div className="flex justify-between font-mono text-[10px] text-cine-dust uppercase">
                      <span>Daily Rental</span>
                      <span className="text-cine-gold">₹{Number(loc.daily_rental_cost).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-mono text-[10px] text-cine-dust uppercase">
                    <span>Permits Required</span>
                    <span className={loc.permits_required ? 'text-orange-400' : 'text-green-400'}>
                      {loc.permits_required ? 'YES' : 'NO'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
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

              <h2 className="font-display text-3xl text-cine-ivory mb-6">Register Location</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Location Name</label>
                    <input required type="text" value={formData.location_name} onChange={(e) => setFormData({ ...formData, location_name: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Type</label>
                    <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="OUTDOOR">Outdoor</option>
                      <option value="INDOOR_SET">Indoor Set</option>
                      <option value="FOREIGN">Foreign</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">City</label>
                    <input required type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">State</label>
                    <input type="text" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Country</label>
                    <input required type="text" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Address</label>
                    <input type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Contact Person</label>
                    <input required type="text" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Contact Phone</label>
                    <input required type="text" value={formData.contact_phone} onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Daily Rental Cost (₹)</label>
                    <input type="number" step="0.01" value={formData.daily_rental_cost} onChange={(e) => setFormData({ ...formData, daily_rental_cost: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                  </div>
                  <div>
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Permits Required</label>
                    <select value={formData.permits_required ? 'true' : 'false'} onChange={(e) => setFormData({ ...formData, permits_required: e.target.value === 'true' })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors">
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                  {formData.permits_required && (
                    <div className="col-span-2">
                      <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Permit Authority</label>
                      <input type="text" value={formData.permit_authority} onChange={(e) => setFormData({ ...formData, permit_authority: e.target.value })} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors" />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block font-mono text-xs text-cine-dust uppercase tracking-widest mb-2">Facilities Available</label>
                    <textarea value={formData.facilities_available} onChange={(e) => setFormData({ ...formData, facilities_available: e.target.value })} rows={2} className="w-full bg-cine-void border border-cine-border text-cine-ivory p-3 focus:outline-none focus:border-cine-gold transition-colors resize-none" />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={createMutation.isPending} className="w-full bg-cine-gold text-cine-void py-3 font-caption text-sm font-bold tracking-widest uppercase hover:bg-cine-gold-light transition-colors disabled:opacity-50">
                    {createMutation.isPending ? 'Registering...' : 'Register Location'}
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
