import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, List, X } from 'lucide-react';
import { PublicLayout } from '../components/layout';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { Button, EmptyState } from '../components/ui';
import { usePlatformStore } from '../store';
import type { DoctorFilters } from '../types';
import { filterAndSortDoctors, cn } from '../utils';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { doctors, specialties } = usePlatformStore();

  const [filters, setFilters] = useState<DoctorFilters>({
    ...initialFilters,
    search: searchParams.get('search') || '',
    specialty: searchParams.get('specialty') || '',
  });
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const updateFilter = <K extends keyof DoctorFilters>(key: K, value: DoctorFilters[K]) => {
    sounds.toggle();
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    sounds.click();
    setFilters(initialFilters);
    setSearchParams({});
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.specialty) ||
    filters.minExperience > 0 ||
    filters.maxFee < 500 ||
    filters.minRating > 0 ||
    Boolean(filters.availability) ||
    Boolean(filters.consultationType);

  const filteredDoctors = useMemo(
    () => filterAndSortDoctors(doctors, filters),
    [doctors, filters]
  );

  const quickSuggestions = ['Cardiology', 'Neurology', 'Dermatology', 'Mount Sinai', 'Migraine'];

  const renderFilterControls = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-charcoal text-sm">Clinical Filters</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-forest font-medium hover:underline flex items-center gap-1 cursor-pointer"
          >
            <X size={12} /> Reset all
          </button>
        )}
      </div>

      {/* Specialty */}
      <div>
        <label
          htmlFor="specialty-filter"
          className="block text-xs font-medium text-charcoal/65 mb-2"
        >
          Medical Specialty
        </label>
        <select
          id="specialty-filter"
          value={filters.specialty}
          onChange={(e) => updateFilter('specialty', e.target.value)}
          className="w-full text-sm border border-charcoal/12 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 text-charcoal cursor-pointer"
        >
          <option value="">All Specialties</option>
          {specialties.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Consultation Type */}
      <div>
        <span className="block text-xs font-medium text-charcoal/65 mb-2">Consultation Format</span>
        <div className="grid grid-cols-3 gap-1 p-1 bg-charcoal/5 rounded-xl">
          {[
            { value: '', label: 'All' },
            { value: 'online', label: 'Video' },
            { value: 'in-person', label: 'Clinic' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter('consultationType', opt.value)}
              className={cn(
                'py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
                filters.consultationType === opt.value
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal/65 hover:text-charcoal'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <span className="block text-xs font-medium text-charcoal/65 mb-2">Availability Window</span>
        <div className="grid grid-cols-3 gap-1 p-1 bg-charcoal/5 rounded-xl">
          {[
            { value: '', label: 'Anytime' },
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Next 48h' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateFilter('availability', opt.value)}
              className={cn(
                'py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
                filters.availability === opt.value
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal/65 hover:text-charcoal'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Minimum Experience */}
      <div className="tabular-nums">
        <div className="flex justify-between text-xs font-medium mb-2">
          <label htmlFor="exp-range" className="text-charcoal/65">
            Minimum Experience
          </label>
          <span className="text-forest font-semibold">{filters.minExperience}+ years</span>
        </div>
        <input
          id="exp-range"
          type="range"
          min={0}
          max={20}
          step={2}
          value={filters.minExperience}
          onChange={(e) => updateFilter('minExperience', Number(e.target.value))}
          className="w-full accent-forest cursor-pointer"
        />
      </div>

      {/* Max Fee */}
      <div className="tabular-nums">
        <div className="flex justify-between text-xs font-medium mb-2">
          <label htmlFor="fee-range" className="text-charcoal/65">
            Maximum Fee
          </label>
          <span className="text-forest font-semibold">${filters.maxFee}</span>
        </div>
        <input
          id="fee-range"
          type="range"
          min={100}
          max={500}
          step={15}
          value={filters.maxFee}
          onChange={(e) => updateFilter('maxFee', Number(e.target.value))}
          className="w-full accent-forest cursor-pointer"
        />
      </div>

      {/* Minimum Rating */}
      <div>
        <span className="block text-xs font-medium text-charcoal/65 mb-2">Minimum Rating</span>
        <div className="grid grid-cols-4 gap-1 p-1 bg-charcoal/5 rounded-xl tabular-nums">
          {[0, 4.5, 4.8, 4.9].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => updateFilter('minRating', r)}
              className={cn(
                'py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer',
                filters.minRating === r
                  ? 'bg-forest text-white shadow-xs'
                  : 'text-charcoal/65 hover:text-charcoal'
              )}
            >
              {r === 0 ? 'All' : `${r}★`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-forest text-white pt-28 pb-12">
        <div className="section-container">
          <p className="text-xs font-mono uppercase tracking-widest text-sage mb-2">
            Physician Directory
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
            Find your specialist
          </h1>
          <p className="text-sm text-sage/85 max-w-xl mb-6">
            Search verified attending physicians by name, specialty, clinical expertise, or hospital affiliation.
          </p>

          <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search by doctor name, specialty, hospital, or condition..."
                aria-label="Search doctors"
                className="w-full pl-11 pr-10 py-3.5 bg-white/12 border border-white/20 rounded-xl text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-sage/60"
              />
              {filters.search && (
                <button
                  type="button"
                  aria-label="Clear search query"
                  onClick={() => updateFilter('search', '')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Search Suggestions */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-sage/80">
              <span>Quick suggestions:</span>
              {quickSuggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateFilter('search', item)}
                  className="text-white/85 hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  {item}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <div className="section-container py-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-24 bg-white rounded-2xl border border-charcoal/8 p-5">
            {renderFilterControls()}
          </aside>

          {/* Main Results Column */}
          <div className="flex-1 min-w-0 w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-charcoal/8">
              <div className="flex items-center gap-3 text-sm text-charcoal/65 tabular-nums">
                <span>
                  Showing <strong className="text-charcoal">{filteredDoctors.length}</strong> verified specialists
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-forest font-medium hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X size={12} /> Clear active filters
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<SlidersHorizontal size={14} />}
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  Filters
                </Button>

                <select
                  aria-label="Sort doctors"
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value as DoctorFilters['sortBy'])}
                  className="text-xs sm:text-sm border border-charcoal/12 rounded-xl px-3 py-2 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 cursor-pointer"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="rating">Sort: Highest Rated</option>
                  <option value="fee">Sort: Lowest Fee</option>
                  <option value="experience">Sort: Most Experienced</option>
                </select>

                <div className="flex border border-charcoal/12 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    aria-label="Grid layout"
                    onClick={() => {
                      setLayout('grid');
                      sounds.toggle();
                    }}
                    className={cn(
                      'p-2 transition-colors cursor-pointer',
                      layout === 'grid' ? 'bg-forest text-white' : 'text-charcoal/55 hover:bg-charcoal/5'
                    )}
                  >
                    <Grid3X3 size={15} />
                  </button>
                  <button
                    type="button"
                    aria-label="List layout"
                    onClick={() => {
                      setLayout('list');
                      sounds.toggle();
                    }}
                    className={cn(
                      'p-2 transition-colors cursor-pointer',
                      layout === 'list' ? 'bg-forest text-white' : 'text-charcoal/55 hover:bg-charcoal/5'
                    )}
                  >
                    <List size={15} />
                  </button>
                </div>
              </div>
            </div>

            {filteredDoctors.length === 0 ? (
              <EmptyState
                icon={<Search size={36} />}
                title="No matching specialists found"
                description="Try broadening your search criteria or resetting the active filters."
                action={
                  <Button variant="primary" onClick={clearFilters}>
                    Reset All Filters
                  </Button>
                }
              />
            ) : (
              <div
                className={cn(
                  'grid gap-6',
                  layout === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'
                )}
              >
                {filteredDoctors.map((doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} layout={layout} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-charcoal/45 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] bg-white h-full p-6 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal/8">
              <h3 className="font-semibold text-charcoal">Filter Specialists</h3>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-charcoal/5"
              >
                <X size={18} />
              </button>
            </div>
            {renderFilterControls()}
            <div className="mt-6 pt-4 border-t border-charcoal/8">
              <Button variant="primary" fullWidth onClick={() => setMobileFiltersOpen(false)}>
                Show {filteredDoctors.length} Doctors
              </Button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
};
