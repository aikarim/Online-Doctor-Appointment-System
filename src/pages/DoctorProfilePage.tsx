import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Video,
  CheckCircle2,
  Star,
  Calendar,
  GraduationCap,
  Award,
  Heart,
  ChevronLeft,
  Building2,
  Globe,
  Users,
} from 'lucide-react';
import { addDays, format, startOfToday } from 'date-fns';
import { PublicLayout } from '../components/layout';
import { REVIEWS, generateTimeSlots } from '../data/mockData';
import { Button, Badge, StarRating, Card, Avatar, Divider } from '../components/ui';
import { formatCurrency, getDayName, cn } from '../utils';
import { usePlatformStore } from '../store';
import { sounds } from '../utils/sounds';

export const DoctorProfilePage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { doctors, appointments, savedDoctorIds, toggleSavedDoctor } = usePlatformStore();

  const doctor = doctors.find((d) => d.id === doctorId);
  const [consultationType, setConsultationType] = useState<'online' | 'in-person'>('online');
  const [selectedDayOffset, setSelectedDayOffset] = useState(0);
  const [selectedTime, setSelectedTime] = useState<string | null>('10:00');

  if (!doctor) {
    return (
      <PublicLayout>
        <div className="pt-36 pb-24 text-center section-container">
          <h1 className="font-serif text-3xl text-charcoal mb-4">Physician profile not found</h1>
          <Link to="/doctors">
            <Button variant="primary">Return to Physician Directory</Button>
          </Link>
        </div>
      </PublicLayout>
    );
  }

  const isSaved = savedDoctorIds.includes(doctor.id);
  const reviews = REVIEWS[doctor.id] || REVIEWS['dr-sarah-mitchell'] || [];
  const fee = consultationType === 'online' ? doctor.onlineFee : doctor.consultationFee;
  const today = startOfToday();

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(today, i);
    const dayName = getDayName(date);
    const avail = doctor.availability.find((a) => a.day === dayName && a.isActive);
    return {
      date,
      formattedDate: format(date, 'yyyy-MM-dd'),
      dayName,
      available: Boolean(avail),
      avail,
    };
  });

  const selectedDay = days[selectedDayOffset];
  const bookedTimesForSelectedDate = appointments
    .filter(
      (a) =>
        a.doctorId === doctor.id &&
        a.date === selectedDay.formattedDate &&
        a.status !== 'cancelled'
    )
    .map((a) => a.time);

  const timeSlots = selectedDay.avail
    ? generateTimeSlots(
        selectedDay.avail.startTime,
        selectedDay.avail.endTime,
        selectedDay.avail.slotDuration,
        bookedTimesForSelectedDate
      )
    : [];

  const handleBook = () => {
    sounds.click();
    const params = new URLSearchParams({
      doctor: doctor.id,
      type: consultationType,
      date: selectedDay.formattedDate,
    });
    if (selectedTime) params.set('time', selectedTime);
    navigate(`/book?${params.toString()}`);
  };

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 bg-ivory">
        <div className="section-container">
          <div className="py-4">
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-charcoal/65 hover:text-forest transition-colors"
            >
              <ChevronLeft size={16} /> Back to Physician Directory
            </Link>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Comprehensive Clinical Profile */}
            <div className="lg:col-span-8 space-y-6">
              {/* Primary Profile Header Card */}
              <div className="bg-white rounded-2xl border border-charcoal/8 overflow-hidden shadow-card">
                <div className="bg-forest p-6 sm:p-8 text-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <Avatar
                      src={doctor.avatar}
                      alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
                      size="2xl"
                      className="ring-4 ring-white/20"
                    />
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-white">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h1>
                        {doctor.verified && (
                          <span className="text-xs font-mono uppercase tracking-wider text-sage">
                            · Verified MD ({doctor.licenseNumber})
                          </span>
                        )}
                      </div>
                      <p className="text-sage font-medium text-base">{doctor.specialty}</p>
                      <p className="text-white/70 text-xs">{doctor.qualifications.join(' · ')}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-charcoal/70 tabular-nums">
                    <StarRating rating={doctor.rating} size="md" showCount={doctor.reviewCount} />
                    <span className="inline-flex items-center gap-1.5">
                      <Building2 size={15} className="text-forest" /> {doctor.hospital}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={15} className="text-forest" /> {doctor.location}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={15} className="text-forest" /> {doctor.experience} years experience
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Users size={15} className="text-forest" /> {doctor.totalPatients.toLocaleString()} patients treated
                    </span>
                  </div>

                  <div className="mt-5 pt-5 border-t border-charcoal/8 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs text-charcoal/65">
                      <Globe size={14} className="text-forest" />
                      <span>Languages spoken:</span>
                      <span className="font-medium text-charcoal">
                        {doctor.languages.join(' · ')}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        sounds.toggle();
                        toggleSavedDoctor(doctor.id);
                      }}
                      className={cn(
                        'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer',
                        isSaved
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : 'border-charcoal/12 text-charcoal/70 hover:bg-charcoal/5'
                      )}
                    >
                      <Heart size={14} className={isSaved ? 'fill-red-500' : ''} />
                      {isSaved ? 'Saved to My Doctors' : 'Save Physician'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Clinical Biography & Subspecialties */}
              <Card>
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-3">
                  Clinical Biography
                </h2>
                <p className="text-sm text-charcoal/75 leading-relaxed mb-6">{doctor.bio}</p>

                <h3 className="text-xs font-mono uppercase tracking-wider text-charcoal/55 mb-3">
                  Areas of Clinical Expertise
                </h3>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {doctor.expertise.map((exp) => (
                    <div
                      key={exp}
                      className="flex items-center gap-2.5 p-3 rounded-xl bg-ivory border border-charcoal/6"
                    >
                      <CheckCircle2 size={15} className="text-forest shrink-0" />
                      <span className="text-sm font-medium text-charcoal">{exp}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Interactive Slot Preview */}
              <Card>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-charcoal">
                      Available Consultation Windows
                    </h2>
                    <p className="text-xs text-charcoal/55 mt-0.5">
                      Select a date and time below to pre-fill your appointment reservation.
                    </p>
                  </div>
                  <Badge variant="confirmed">Live Schedule Synced</Badge>
                </div>

                {/* 7-Day Selector */}
                <div className="grid grid-cols-7 gap-2 mb-5 tabular-nums">
                  {days.map((day, idx) => (
                    <button
                      key={day.formattedDate}
                      type="button"
                      disabled={!day.available}
                      onClick={() => {
                        setSelectedDayOffset(idx);
                        setSelectedTime(null);
                        sounds.toggle();
                      }}
                      className={cn(
                        'flex flex-col items-center py-2.5 px-2 rounded-xl border text-xs transition-all cursor-pointer',
                        !day.available && 'opacity-35 cursor-not-allowed bg-charcoal/5',
                        selectedDayOffset === idx && day.available
                          ? 'bg-forest text-white border-forest shadow-xs'
                          : 'bg-white border-charcoal/10 text-charcoal hover:border-forest/30'
                      )}
                    >
                      <span className="text-[10px] uppercase opacity-75">
                        {format(day.date, 'EEE')}
                      </span>
                      <span className="text-base font-mono font-bold mt-0.5">
                        {format(day.date, 'd')}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Time Slots Grid */}
                {selectedDay.available ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 tabular-nums">
                    {timeSlots.slice(0, 10).map(({ time, available }) => (
                      <button
                        key={time}
                        type="button"
                        disabled={!available}
                        onClick={() => {
                          setSelectedTime(time);
                          sounds.toggle();
                        }}
                        className={cn(
                          'py-2.5 px-3 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer',
                          !available &&
                            'opacity-35 cursor-not-allowed line-through bg-charcoal/5 border-charcoal/8',
                          available &&
                            selectedTime === time &&
                            'bg-forest text-white border-forest shadow-xs',
                          available &&
                            selectedTime !== time &&
                            'bg-white border-charcoal/12 text-charcoal hover:border-forest/35'
                        )}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-charcoal/55 py-4">
                    Dr. {doctor.lastName} does not hold clinic hours on {selectedDay.dayName}s.
                  </p>
                )}
              </Card>

              {/* Medical Education & Board Certifications */}
              <Card>
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-5">
                  Education & Board Certifications
                </h2>
                <div className="space-y-4">
                  {doctor.education.map((edu, i) => (
                    <div key={i} className="flex items-start gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0 mt-0.5">
                        <GraduationCap size={17} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-charcoal">{edu.degree}</p>
                        <p className="text-xs text-charcoal/65">
                          {edu.institution} · <span className="font-mono">{edu.year}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {doctor.certifications.length > 0 && (
                  <>
                    <Divider className="my-5" label="Board Licensure" />
                    <div className="space-y-4">
                      {doctor.certifications.map((cert, i) => (
                        <div key={i} className="flex items-start gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-sage/25 text-forest flex items-center justify-center shrink-0 mt-0.5">
                            <Award size={17} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-charcoal">{cert.name}</p>
                            <p className="text-xs text-charcoal/65">
                              {cert.issuer} · <span className="font-mono">{cert.year}</span>
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </Card>

              {/* Verified Patient Reviews */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-semibold text-charcoal">
                      Verified Patient Feedback
                    </h2>
                    <p className="text-xs text-charcoal/55 mt-0.5">
                      Submitted by confirmed patients following completed consultations.
                    </p>
                  </div>
                  <StarRating rating={doctor.rating} size="lg" showCount={doctor.reviewCount} />
                </div>

                <div className="space-y-5 divide-y divide-charcoal/8">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="pt-5 first:pt-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Avatar src={rev.patientAvatar} alt={rev.patientName} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-charcoal">{rev.patientName}</p>
                            <p className="text-[11px] text-emerald-700 font-medium">
                              Verified Consultation · <span className="font-mono">{rev.date}</span>
                            </p>
                          </div>
                        </div>
                        <div className="flex text-amber-500 text-xs">
                          {Array.from({ length: rev.rating }).map((_, idx) => (
                            <Star key={idx} size={13} className="fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-charcoal/75 leading-relaxed mt-2">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right 4 Columns: Sticky Liquid-Glass Booking Panel */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="glass-strong rounded-2xl shadow-glass-xl p-6 space-y-5">
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-charcoal/55 mb-2">
                    Select Consultation Format
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-charcoal/5 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setConsultationType('online');
                        sounds.toggle();
                      }}
                      className={cn(
                        'py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        consultationType === 'online'
                          ? 'bg-forest text-white shadow-xs'
                          : 'text-charcoal/65 hover:text-charcoal'
                      )}
                    >
                      <Video size={14} /> Online Video
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConsultationType('in-person');
                        sounds.toggle();
                      }}
                      className={cn(
                        'py-2.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5',
                        consultationType === 'in-person'
                          ? 'bg-forest text-white shadow-xs'
                          : 'text-charcoal/65 hover:text-charcoal'
                      )}
                    >
                      <Building2 size={14} /> In-Person
                    </button>
                  </div>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-charcoal/8 tabular-nums">
                  <div>
                    <p className="text-xs text-charcoal/55">Consultation Fee</p>
                    <p className="text-[11px] text-charcoal/45">Includes 30-min specialist visit</p>
                  </div>
                  <p className="font-mono text-3xl font-bold text-charcoal">
                    {formatCurrency(fee)}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-ivory border border-charcoal/8 space-y-1.5 text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-charcoal/55">Selected Date:</span>
                    <span className="font-semibold text-charcoal">
                      {format(selectedDay.date, 'EEE, MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/55">Selected Time:</span>
                    <span className="font-mono font-semibold text-forest">
                      {selectedTime || 'Choose slot'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/55">Location:</span>
                    <span className="font-medium text-charcoal truncate max-w-[180px]">
                      {consultationType === 'online' ? 'Encrypted Video Room' : doctor.hospital}
                    </span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  icon={<Calendar size={16} />}
                  onClick={handleBook}
                >
                  Continue to Booking
                </Button>

                <div className="space-y-2 pt-2 border-t border-charcoal/8 text-xs text-charcoal/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-forest shrink-0" />
                    <span>Instant confirmation & calendar invite</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-forest shrink-0" />
                    <span>Free rescheduling up to 24h before visit</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};
