import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react';
import { PublicLayout } from '../components/layout';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { DOCTORS, SPECIALTIES } from '../data/mockData';
import { Button, Badge, Spinner, EmptyState, Skeleton } from '../components/ui';
import type { DoctorFilters } from '../types';
import { cn } from '../utils';
import { sounds } from '../utils/sounds';

const initialFilters: DoctorFilters = {
  search: '',
  specialty: '',
  minExperience: 0,
  maxFee: 500,
  minRating: 0,
  availability: '',
  consultationType: '',
  sortBy: 'relevance',
};

export const FindDoctorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState<DoctorFilters>({
    ...initialFilters,
    search: searchParams.get('search') || '',
    specialty: searchParams.get('specialty') || '',
  });
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const updateFilter = <K extends keyof DoctorFilters>(key: K, value: DoctorFilters[K]) => {
    sounds.toggle();
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    sounds.click();
    setFilters(initialFilters);
  };

  const hasActiveFilters = filters.search || filters.specialty || filters.minExperience > 0
    || filters.maxFee < 500 || filters.minRating > 0 || filters.availability || filters.consultationType;

  const filteredDoctors = useMemo(() => {
    let result = [...DOCTORS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(d =>
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q)
      );
    }
    if (filters.specialty) {
      result = result.filter(d => d.specialtyId === filters.specialty);
    }
    if (filters.minExperience > 0) {
      result = result.filter(d => d.experience >= filters.minExperience);
    }
    if (filters.maxFee < 500) {
      result = result.filter(d => Math.min(d.consultationFee, d.onlineFee) <= filters.maxFee);
    }
    if (filters.minRating > 0) {
      result = result.filter(d => d.rating >= filters.minRating);
    }
    if (filters.consultationType === 'online') {
      result = result.filter(d => d.online);
    }
    if (filters.consultationType === 'in-person') {
      result = result.filter(d => !d.online || true);
    }

    switch (filters.sortBy) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'fee': result.sort((a, b) => Math.min(a.consultationFee, a.onlineFee) - Math.min(b.consultationFee, b.onlineFee)); break;
      case 'experience': result.sort((a, b) => b.experience - a.experience); break;
    }

    return result;
  }, [filters]);

  const FilterPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-charcoal text-sm">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-forest hover:underline flex items-center gap-1">
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Specialty */}
      <div>
        <label className="block text-xs font-medium text-charcoal/60 mb-2 uppercase tracking-wide">Specialty</label>
        <select
          value={filters.specialty}
          onChange={(e) => updateFilter('specialty', e.target.value)}
          className="w-full text-sm border border-black/10 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 text-charcoal"
        >
          <option value="">All Specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-xs font-medium text-charcoal/60 mb-2 uppercase tracking-wide">
          Min. Experience: <span className="text-forest">{filters.minExperience}+ years</span>
        </label>
        <input
          type="range" min={0} max={25} value={filters.minExperience}
          onChange={(e) => updateFilter('minExperience', Number(e.target.value))}
          className="w-full accent-forest"
        />
        <div className="flex justify-between text-xs text-charcoal/40 mt-1"><span>0</span><span>25+</span></div>
      </div>

      {/* Max Fee */}
      <div>
        <label className="block text-xs font-medium text-charcoal/60 mb-2 uppercase tracking-wide">
          Max. Fee: <span className="text-forest">${filters.maxFee}</span>
        </label>
        <input
          type="range" min={50} max={500} step={10} value={filters.maxFee}
          onChange={(e) => updateFilter('maxFee', Number(e.target.value))}
          className="w-full accent-forest"
        />
        <div className="flex justify-between text-xs text-charcoal/40 mt-1"><span>$50</span><span>$500</span></div>
      </div>

      {/* Min Rating */}
      <div>
        <label className="block text-xs font-medium text-charcoal/60 mb-2 uppercase tracking-wide">Minimum Rating</label>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => updateFilter('minRating', r)}
              className={cn(
                'flex-1 py-1.5 text-xs rounded-lg border transition-all',
                filters.minRating === r
                  ? 'bg-forest text-white border-forest'
                  : 'border-black/10 text-charcoal/60 hover:border-forest/30'
              )}
            >
              {r === 0 ? 'Any' : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Consultation Type */}
      <div>
        <label className="block text-xs font-medium text-charcoal/60 mb-2 uppercase tracking-wide">Consultation Type</label>
        <div className="flex gap-2">
          {[
            { value: '', label: 'Any' },
            { value: 'online', label: 'Online' },
            { value: 'in-person', label: 'In-Person' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('consultationType', opt.value)}
              className={cn(
                'flex-1 py-1.5 text-xs rounded-lg border transition-all',
                filters.consultationType === opt.value
                  ? 'bg-forest text-white border-forest'
                  : 'border-black/10 text-charcoal/60 hover:border-forest/30'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PublicLayout>
      {/* Page Header */}
      <div className="bg-forest pt-32 pb-12">
        <div className="section-container">
          <Badge className="bg-sage/20 text-sage mb-4">Find Doctors</Badge>
          <h1 className="font-serif text-display-sm text-white mb-4">Find the right doctor for you</h1>
          <p className="text-sage/80 max-w-lg">Search from 284+ verified specialists across 20+ medical specialties.</p>

          {/* Search Bar */}
          <form onSubmit={(e) => e.preventDefault()} className="mt-6 max-w-2xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Search doctor name, specialty, hospital..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sage/50 focus:bg-white/15"
                />
              </div>
              <Button variant="sage" size="lg" type="submit">Search</Button>
            </div>
          </form>
        </div>
      </div>

      <div className="section-container py-10">
        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-black/5 shadow-card p-5 sticky top-24">
              <FilterPanel />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-charcoal/60">
                  <span className="font-semibold text-charcoal">{filteredDoctors.length}</span> doctors found
                </span>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-forest bg-forest/10 px-2.5 py-1 rounded-full hover:bg-forest/15">
                    <X size={11} /> Clear filters
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile filter button */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<SlidersHorizontal size={14} />}
                  className="lg:hidden"
                  onClick={() => { setMobileFiltersOpen(true); sounds.click(); }}
                >
                  Filters
                </Button>

                {/* Sort */}
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                    className="text-sm border border-black/10 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 text-charcoal pr-8 appearance-none cursor-pointer"
                  >
                    <option value="relevance">Sort: Relevance</option>
                    <option value="rating">Sort: Rating</option>
                    <option value="fee">Sort: Price (Low)</option>
                    <option value="experience">Sort: Experience</option>
                  </select>
                </div>

                {/* Layout toggle */}
                <div className="flex border border-black/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => { setLayout('grid'); sounds.toggle(); }}
                    className={cn('p-2.5 transition-all', layout === 'grid' ? 'bg-forest text-white' : 'text-charcoal/50 hover:bg-black/5')}
                  >
                    <Grid3X3 size={15} />
                  </button>
                  <button
                    onClick={() => { setLayout('list'); sounds.toggle(); }}
                    className={cn('p-2.5 transition-all', layout === 'list' ? 'bg-forest text-white' : 'text-charcoal/50 hover:bg-black/5')}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* Results */}
            {loading ? (
              <div className={cn('grid gap-5', layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}>
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-black/5">
                    <div className="flex gap-4 mb-4">
                      <Skeleton className="w-16 h-16 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredDoctors.length === 0 ? (
              <EmptyState
                icon={<Search size={40} />}
                title="No doctors found"
                description="Try adjusting your filters or search term to find more results."
                action={<Button onClick={clearFilters} variant="primary">Clear all filters</Button>}
              />
            ) : (
              <motion.div
                className={cn('grid gap-5', layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1')}
                layout
              >
                <AnimatePresence mode="popLayout">
                  {filteredDoctors.map((doctor, i) => (
                    <motion.div
                      key={doctor.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                    >
                      <DoctorCard doctor={doctor} layout={layout} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-glass-xl overflow-y-auto lg:hidden"
            >
              <div className="p-5">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-semibold text-charcoal">Filter Doctors</h3>
                  <button onClick={() => setMobileFiltersOpen(false)} className="p-2 hover:bg-black/5 rounded-lg">
                    <X size={18} />
                  </button>
                </div>
                <FilterPanel />
                <Button fullWidth variant="primary" className="mt-6" onClick={() => setMobileFiltersOpen(false)}>
                  Apply Filters ({filteredDoctors.length} results)
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </PublicLayout>
  );
};
