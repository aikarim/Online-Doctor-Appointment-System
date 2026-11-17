import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Clock, Video, CheckCircle, Star, Calendar,
  GraduationCap, Award, Heart, ChevronLeft, ChevronRight,
  Building2, Globe, Users, ThumbsUp, Share2
} from 'lucide-react';
import { addDays, format, startOfToday } from 'date-fns';
import { PublicLayout } from '../components/layout';
import { DOCTORS, REVIEWS, generateTimeSlots } from '../data/mockData';
import { Button, Badge, StarRating, Card, Avatar, Divider } from '../components/ui';
import { formatCurrency, getDayName } from '../utils';
import { sounds } from '../utils/sounds';
import { cn } from '../utils';

export const DoctorProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const doctor = DOCTORS.find((d) => d.id === doctorId);

  const [consultationType, setConsultationType] = useState<'online' | 'in-person'>('online');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (!doctor) {
    return (
      <PublicLayout>
        <div className="pt-32 pb-20 text-center">
          <h1 className="font-serif text-display-sm text-charcoal mb-4">Doctor not found</h1>
          <Link to="/doctors"><Button variant="primary">Browse all doctors</Button></Link>
        </div>
      </PublicLayout>
    );
  }

  const reviews = REVIEWS[doctor.id] || [];
  const fee = consultationType === 'online' ? doctor.onlineFee : doctor.consultationFee;
  const today = startOfToday();

  // Generate next 7 available days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const dayName = getDayName(date) as any;
    const avail = doctor.availability.find((a) => a.day === dayName && a.isActive);
    return { date, dayName, available: !!avail, avail };
  });

  const selectedDay = days[selectedDayOffset];
  const timeSlots = selectedDay.avail
    ? generateTimeSlots(selectedDay.avail.startTime, selectedDay.avail.endTime, selectedDay.avail.slotDuration)
    : [];

  const handleBook = () => {
    sounds.click();
    navigate(`/book?doctor=${doctor.id}&type=${consultationType}${selectedTime ? `&time=${selectedTime}` : ''}`);
  };

  return (
    <PublicLayout>
      {/* Back + breadcrumb */}
      <div className="pt-24 pb-0 bg-ivory">
        <div className="section-container py-4">
          <Link to="/doctors" className="inline-flex items-center gap-1.5 text-sm text-charcoal/60 hover:text-forest transition-colors">
            <ChevronLeft size={15} /> Back to doctors
          </Link>
        </div>
      </div>

      <div className="section-container pb-20">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* ---- LEFT: Main Profile ---- */}
          <div className="lg:col-span-2 space-y-6">

            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-black/5 shadow-card overflow-hidden"
            >
              <div className="bg-gradient-to-r from-forest to-forest-400 p-6 pb-0">
                <div className="flex items-end gap-5">
                  <div className="relative">
                    <Avatar src={doctor.avatar} alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} size="2xl"
                      className="ring-4 ring-white/30" />
                    {doctor.verified && (
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                        <CheckCircle size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="pb-4 text-white">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="font-serif text-2xl font-semibold">Dr. {doctor.firstName} {doctor.lastName}</h1>
                      {doctor.verified && <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">Verified</Badge>}
                    </div>
                    <p className="text-sage text-sm font-medium">{doctor.specialty}</p>
                    <p className="text-white/60 text-xs mt-0.5">{doctor.qualifications.join(' · ')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex flex-wrap gap-x-6 gap-y-3 mb-5">
                  <StarRating rating={doctor.rating} size="md" showCount={doctor.reviewCount} />
                  <div className="flex items-center gap-1.5 text-sm text-charcoal/60">
                    <Building2 size={14} className="text-forest" /> {doctor.hospital}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-charcoal/60">
                    <MapPin size={14} className="text-forest" /> {doctor.location}
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-charcoal/60">
                    <Clock size={14} className="text-forest" /> {doctor.experience} years experience
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-charcoal/60">
                    <Users size={14} className="text-forest" /> {doctor.totalPatients.toLocaleString()} patients
                  </div>
                  {doctor.online && (
                    <div className="flex items-center gap-1.5 text-sm text-emerald-600">
                      <Video size={14} /> Online consultations
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1 text-xs text-charcoal/50">
                    <Globe size={12} /> Languages:
                  </div>
                  {doctor.languages.map((lang) => (
                    <Badge key={lang} variant="sage">{lang}</Badge>
                  ))}
                </div>

                <div className="flex gap-2 mt-5 pt-5 border-t border-black/5">
                  <button
                    onClick={() => { setSaved(!saved); sounds.toggle(); }}
                    className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border transition-all', saved ? 'bg-red-50 text-red-600 border-red-200' : 'border-black/10 text-charcoal/60 hover:bg-black/5')}
                  >
                    <Heart size={14} className={saved ? 'fill-red-500' : ''} /> {saved ? 'Saved' : 'Save doctor'}
                  </button>
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm border border-black/10 text-charcoal/60 hover:bg-black/5 transition-all">
                    <Share2 size={14} /> Share
                  </button>
                </div>
              </div>
            </motion.div>

            {/* About */}
            <Card>
              <h2 className="font-semibold text-charcoal mb-3">About Dr. {doctor.lastName}</h2>
              <p className="text-sm text-charcoal/70 leading-relaxed">{doctor.bio}</p>
            </Card>

            {/* Expertise */}
            <Card>
              <h2 className="font-semibold text-charcoal mb-4">Areas of Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {doctor.expertise.map((exp) => (
                  <div key={exp} className="flex items-center gap-2 px-3 py-2 bg-sage/15 rounded-xl">
                    <CheckCircle size={13} className="text-forest" />
                    <span className="text-sm text-charcoal">{exp}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education */}
            <Card>
              <h2 className="font-semibold text-charcoal mb-5">Education & Training</h2>
              <div className="space-y-5">
                {doctor.education.map((edu, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-forest/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <GraduationCap size={16} className="text-forest" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal">{edu.degree}</p>
                      <p className="text-sm text-charcoal/60">{edu.institution}</p>
                      <p className="text-xs text-charcoal/40 mt-0.5">{edu.year}</p>
                    </div>
                  </div>
                ))}
              </div>
              {doctor.certifications.length > 0 && (
                <>
                  <Divider className="my-5" label="Certifications" />
                  <div className="space-y-4">
                    {doctor.certifications.map((cert, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Award size={16} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-charcoal">{cert.name}</p>
                          <p className="text-xs text-charcoal/50">{cert.issuer} · {cert.year}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Availability */}
            <Card>
              <h2 className="font-semibold text-charcoal mb-4">Available Slots</h2>

              {/* Day picker */}
              <div className="flex gap-2 mb-5 overflow-x-auto pb-2 no-scrollbar">
                {days.map((day, i) => (
                  <button
                    key={i}
                    onClick={() => { if (day.available) { setSelectedDayOffset(i); setSelectedTime(null); sounds.toggle(); } }}
                    className={cn(
                      'flex flex-col items-center px-3 py-2.5 rounded-xl border text-xs font-medium transition-all flex-shrink-0 min-w-[56px]',
                      !day.available && 'opacity-30 cursor-not-allowed',
                      selectedDayOffset === i && day.available
                        ? 'bg-forest text-white border-forest'
                        : day.available
                          ? 'border-black/10 text-charcoal hover:border-forest/30 hover:bg-forest/5'
                          : 'border-black/10 text-charcoal/40'
                    )}
                  >
                    <span className="text-[10px] uppercase tracking-wide">{format(day.date, 'EEE')}</span>
                    <span className="text-base font-bold">{format(day.date, 'd')}</span>
                  </button>
                ))}
              </div>

              {/* Time slots */}
              {selectedDay.available ? (
                <div className="flex flex-wrap gap-2">
                  {timeSlots.map(({ time, available }) => (
                    <button
                      key={time}
                      onClick={() => { if (available) { setSelectedTime(time); sounds.toggle(); } }}
                      disabled={!available}
                      className={cn(
                        'px-4 py-2 rounded-xl text-sm border font-medium transition-all',
                        !available && 'opacity-30 cursor-not-allowed bg-black/3 text-charcoal/40 border-black/8',
                        available && selectedTime === time && 'bg-forest text-white border-forest',
                        available && selectedTime !== time && 'border-black/10 text-charcoal hover:border-forest/30 hover:bg-forest/5'
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-charcoal/50">No availability on this day.</p>
              )}
            </Card>

            {/* Reviews */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-charcoal">Patient Reviews</h2>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-bold text-charcoal">{doctor.rating}</span>
                  <div>
                    <StarRating rating={doctor.rating} />
                    <p className="text-xs text-charcoal/50">{doctor.reviewCount} reviews</p>
                  </div>
                </div>
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-charcoal/50">No reviews yet.</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-5 border-b border-black/5 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3 mb-3">
                        <Avatar src={review.patientAvatar} initials={review.patientName.split(' ').map(n => n[0]).join('')} size="sm" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-charcoal">{review.patientName}</p>
                            <span className="text-xs text-charcoal/40">{review.date}</span>
                          </div>
                          <div className="flex mt-0.5">
                            {[1,2,3,4,5].map((s) => (
                              <Star key={s} size={12} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-charcoal/70 leading-relaxed">{review.comment}</p>
                      <button className="flex items-center gap-1.5 text-xs text-charcoal/40 hover:text-charcoal mt-2 transition-colors">
                        <ThumbsUp size={12} /> Helpful ({review.helpful})
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* ---- RIGHT: Sticky Booking Panel ---- */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24 glass-strong rounded-2xl shadow-glass-xl border border-white/60 overflow-hidden"
            >
              {/* Fee toggle */}
              <div className="p-5 border-b border-black/5">
                <p className="text-xs text-charcoal/50 mb-3 font-medium uppercase tracking-wide">Consultation Type</p>
                <div className="flex gap-2 mb-5">
                  {(['online', 'in-person'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => { setConsultationType(type); sounds.toggle(); }}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all capitalize',
                        consultationType === type ? 'bg-forest text-white border-forest' : 'border-black/10 text-charcoal/60 hover:bg-black/5'
                      )}
                    >
                      {type === 'online' ? '🎥 ' : '🏥 '}{type}
                    </button>
                  ))}
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-charcoal">{formatCurrency(fee)}</p>
                  <p className="text-xs text-charcoal/50">per consultation</p>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm text-charcoal/60">
                  <Clock size={15} className="text-forest" />
                  Next available: <span className="text-forest font-medium">{doctor.nextAvailable}</span>
                </div>

                {selectedTime && (
                  <div className="flex items-center gap-2 text-sm bg-forest/10 text-forest px-3 py-2 rounded-xl">
                    <CheckCircle size={14} />
                    Selected: {selectedTime} · {format(addDays(today, selectedDayOffset), 'MMM d')}
                  </div>
                )}

                <Button variant="primary" fullWidth size="lg" icon={<Calendar size={16} />} onClick={handleBook}>
                  Book Appointment
                </Button>

                <p className="text-xs text-charcoal/40 text-center">
                  Free cancellation up to 24h before
                </p>

                <Divider />

                <div className="space-y-2">
                  {[
                    { icon: CheckCircle, text: 'Verified & board-certified' },
                    { icon: Clock, text: 'Instant booking confirmation' },
                    { icon: Video, text: doctor.online ? 'Online & in-person available' : 'In-person only' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-charcoal/60">
                      <item.icon size={13} className="text-forest flex-shrink-0" /> {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile sticky booking bar */}
        <div className="fixed bottom-0 inset-x-0 p-4 glass-strong border-t border-white/50 shadow-glass-xl lg:hidden z-30">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-lg font-bold text-charcoal">{formatCurrency(fee)}</p>
              <p className="text-xs text-charcoal/50">per {consultationType} consultation</p>
            </div>
            <Button variant="primary" size="lg" icon={<Calendar size={16} />} onClick={handleBook}>
              Book Appointment
            </Button>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
