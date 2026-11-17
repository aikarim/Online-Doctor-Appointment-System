import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Video, Calendar, Heart } from 'lucide-react';
import type { Doctor } from '../../types';
import { Avatar, Badge, StarRating, Button } from '../ui';
import { formatCurrency, cn } from '../../utils';
import { usePlatformStore } from '../../store';
import { sounds } from '../../utils/sounds';

interface DoctorCardProps {
  doctor: Doctor;
  layout?: 'grid' | 'list';
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, layout = 'grid' }) => {
  const { savedDoctorIds, toggleSavedDoctor } = usePlatformStore();
  const isSaved = savedDoctorIds.includes(doctor.id);
  const minFee = Math.min(doctor.consultationFee, doctor.onlineFee);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sounds.toggle();
    toggleSavedDoctor(doctor.id);
  };

  if (layout === 'list') {
    return (
      <article className="bg-white rounded-2xl border border-charcoal/8 hover:border-forest/25 hover:shadow-card-hover transition-all duration-200 p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar
            src={doctor.avatar}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            size="2xl"
          />

          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-3">
                  <Link
                    to={`/doctors/${doctor.id}`}
                    className="font-serif text-xl font-semibold text-charcoal hover:text-forest transition-colors"
                  >
                    Dr. {doctor.firstName} {doctor.lastName}
                  </Link>
                  {doctor.verified && <Badge variant="verified">Verified MD</Badge>}
                </div>
                <p className="text-sm text-forest font-medium mt-0.5">
                  {doctor.specialty}
                  <span aria-hidden="true" className="mx-2 text-charcoal/30">·</span>
                  <span className="text-charcoal/60 font-normal">{doctor.qualifications.join(', ')}</span>
                </p>
              </div>

              <div className="text-left md:text-right tabular-nums">
                <p className="text-xs text-charcoal/50">Consultation from</p>
                <p className="text-xl font-mono font-semibold text-charcoal">{formatCurrency(minFee)}</p>
              </div>
            </div>

            {/* Unboxed metadata row with middot separators */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal/65 pt-1 tabular-nums">
              <StarRating rating={doctor.rating} showCount={doctor.reviewCount} />
              <span aria-hidden="true">·</span>
              <span>{doctor.experience} yrs experience</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} className="text-forest" /> {doctor.hospital}, {doctor.location}
              </span>
              {doctor.online && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                    <Video size={12} /> Video & In-Person
                  </span>
                </>
              )}
            </div>

            <p className="text-xs text-charcoal/55 pt-1">
              Clinical focus: {doctor.expertise.slice(0, 4).join(' · ')}
            </p>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2.5 pt-4 md:pt-0 border-t md:border-t-0 border-charcoal/8 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-forest font-medium tabular-nums">
              <Clock size={12} />
              <span>{doctor.nextAvailable}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                aria-label={isSaved ? `Remove Dr. ${doctor.lastName} from saved` : `Save Dr. ${doctor.lastName}`}
                className={cn(
                  'p-2.5 rounded-xl border transition-colors cursor-pointer',
                  isSaved
                    ? 'border-red-200 bg-red-50 text-red-600'
                    : 'border-charcoal/12 text-charcoal/50 hover:text-charcoal'
                )}
              >
                <Heart size={15} className={isSaved ? 'fill-red-500' : ''} />
              </button>
              <Link to={`/doctors/${doctor.id}`}>
                <Button variant="secondary" size="sm">View Profile</Button>
              </Link>
              <Link to={`/book?doctor=${doctor.id}`}>
                <Button variant="primary" size="sm" icon={<Calendar size={13} />}>
                  Book
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid Layout
  return (
    <article className="bg-white rounded-2xl border border-charcoal/8 hover:border-forest/25 hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between p-6">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <Avatar
            src={doctor.avatar}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            size="xl"
          />
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {doctor.verified && <Badge variant="verified">Verified</Badge>}
              <button
                type="button"
                onClick={handleSave}
                aria-label={isSaved ? `Remove Dr. ${doctor.lastName} from saved` : `Save Dr. ${doctor.lastName}`}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  isSaved ? 'text-red-600 bg-red-50' : 'text-charcoal/40 hover:text-charcoal hover:bg-charcoal/5'
                )}
              >
                <Heart size={14} className={isSaved ? 'fill-red-500' : ''} />
              </button>
            </div>
            <div className="text-right tabular-nums mt-1">
              <span className="text-[11px] text-charcoal/50 block">From</span>
              <span className="text-base font-mono font-semibold text-charcoal">
                {formatCurrency(minFee)}
              </span>
            </div>
          </div>
        </div>

        <Link
          to={`/doctors/${doctor.id}`}
          className="font-serif text-lg font-semibold text-charcoal hover:text-forest transition-colors block"
        >
          Dr. {doctor.firstName} {doctor.lastName}
        </Link>
        <p className="text-sm text-forest font-medium mt-0.5">{doctor.specialty}</p>
        <p className="text-xs text-charcoal/55 mt-0.5 truncate">{doctor.qualifications.join(' · ')}</p>

        <div className="mt-3 pt-3 border-t border-charcoal/6 space-y-1.5 text-xs text-charcoal/65 tabular-nums">
          <div className="flex items-center justify-between">
            <StarRating rating={doctor.rating} showCount={doctor.reviewCount} />
            <span>{doctor.experience} yrs exp</span>
          </div>
          <div className="flex items-center gap-1.5 text-charcoal/60 truncate">
            <MapPin size={12} className="text-forest shrink-0" />
            <span className="truncate">{doctor.hospital}</span>
          </div>
          <p className="text-[11px] text-charcoal/50 truncate pt-0.5">
            {doctor.expertise.slice(0, 2).join(' · ')}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-charcoal/8">
        <div className="flex items-center justify-between text-xs text-charcoal/60 mb-3 tabular-nums">
          <span className="inline-flex items-center gap-1">
            <Clock size={12} className="text-forest" /> Next slot:
          </span>
          <span className="font-medium text-forest">{doctor.nextAvailable}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link to={`/doctors/${doctor.id}`}>
            <Button variant="secondary" size="sm" fullWidth>
              View Profile
            </Button>
          </Link>
          <Link to={`/book?doctor=${doctor.id}`}>
            <Button variant="primary" size="sm" fullWidth icon={<Calendar size={13} />}>
              Book Slot
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
};
