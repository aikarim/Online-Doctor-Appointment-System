import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Video, CheckCircle, Star, Calendar } from 'lucide-react';
import type { Doctor } from '../../types';
import { Avatar, Badge, StarRating, Button } from '../ui';
import { formatCurrency } from '../../utils';
import { sounds } from '../../utils/sounds';

interface DoctorCardProps {
  doctor: Doctor;
  layout?: 'grid' | 'list';
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, layout = 'grid' }) => {
  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        className="bg-white rounded-2xl border border-black/5 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden"
      >
        <div className="flex gap-5 p-5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar src={doctor.avatar} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} size="xl" />
            {doctor.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle size={10} className="text-white" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-charcoal">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </h3>
                  {doctor.verified && <Badge variant="verified">Verified</Badge>}
                </div>
                <p className="text-sm text-forest font-medium mt-0.5">{doctor.specialty}</p>
                <p className="text-xs text-charcoal/50 mt-0.5">{doctor.qualifications.join(' · ')}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-charcoal/50 mb-1">From</p>
                <p className="text-lg font-semibold text-charcoal">{formatCurrency(Math.min(doctor.consultationFee, doctor.onlineFee))}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
              <StarRating rating={doctor.rating} showCount={doctor.reviewCount} />
              <span className="text-xs text-charcoal/50">{doctor.experience} yrs exp</span>
              <div className="flex items-center gap-1 text-xs text-charcoal/50">
                <MapPin size={11} /> {doctor.location}
              </div>
              {doctor.online && (
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <Video size={11} /> Online
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {doctor.expertise.slice(0, 3).map((exp) => (
                <span key={exp} className="text-xs px-2 py-0.5 rounded-full bg-sage/15 text-forest/80">
                  {exp}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 justify-center flex-shrink-0">
            <div className="flex items-center gap-1 text-xs text-charcoal/50 mb-1">
              <Clock size={11} />
              <span>{doctor.nextAvailable}</span>
            </div>
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
      </motion.div>
    );
  }

  // Grid layout
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-black/5 shadow-card hover:shadow-card-hover transition-shadow duration-300 overflow-hidden group"
    >
      {/* Top section */}
      <div className="relative p-5 pb-0">
        <div className="flex items-start justify-between mb-4">
          <div className="relative">
            <Avatar
              src={doctor.avatar}
              alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
              size="xl"
            />
            {doctor.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle size={10} className="text-white" />
              </div>
            )}
          </div>
          <div className="text-right">
            {doctor.online && (
              <div className="flex items-center gap-1 text-xs text-emerald-600 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </div>
            )}
            <p className="text-xs text-charcoal/50">From</p>
            <p className="text-base font-semibold text-charcoal">{formatCurrency(Math.min(doctor.consultationFee, doctor.onlineFee))}</p>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-charcoal text-sm">Dr. {doctor.firstName} {doctor.lastName}</h3>
          </div>
          <p className="text-sm text-forest font-medium">{doctor.specialty}</p>
          <p className="text-xs text-charcoal/50 mt-0.5">{doctor.qualifications.join(' · ')}</p>
        </div>

        <div className="flex items-center gap-3 mt-3">
          <StarRating rating={doctor.rating} showCount={doctor.reviewCount} />
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
          <div className="flex items-center gap-1 text-xs text-charcoal/50">
            <MapPin size={11} /> {doctor.location}
          </div>
          <span className="text-xs text-charcoal/50">{doctor.experience} yrs</span>
        </div>
      </div>

      {/* Expertise tags */}
      <div className="px-5 py-3 flex flex-wrap gap-1.5">
        {doctor.expertise.slice(0, 2).map((exp) => (
          <span key={exp} className="text-xs px-2 py-0.5 rounded-full bg-sage/15 text-forest/80">
            {exp}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 border-t border-black/5 pt-4">
        <div className="flex items-center gap-1.5 text-xs text-charcoal/50 mb-3">
          <Clock size={11} />
          <span>Next available: <span className="text-forest font-medium">{doctor.nextAvailable}</span></span>
        </div>
        <div className="flex gap-2">
          <Link to={`/doctors/${doctor.id}`} className="flex-1">
            <Button variant="secondary" size="sm" fullWidth>Profile</Button>
          </Link>
          <Link to={`/book?doctor=${doctor.id}`} className="flex-1">
            <Button variant="primary" size="sm" fullWidth icon={<Calendar size={13} />}>
              Book
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
