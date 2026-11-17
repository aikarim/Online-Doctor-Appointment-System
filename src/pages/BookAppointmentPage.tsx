import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  Building2,
  UserCheck,
  ShieldCheck,
  ArrowLeft,
  ArrowRight,
  Lock,
  Sparkles,
  FileText,
  MapPin,
  Search,
  AlertCircle,
} from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { usePlatformStore, useAuthStore } from '../store';
import {
  Button,
  Card,
  Input,
  Textarea,
  Badge,
  Avatar,
  StarRating,
} from '../components/ui';
import {
  formatCurrency,
  getDayName,
  generateTimeSlots,
  validateBookingStep,
  cn,
} from '../utils';
import { sounds } from '../utils/sounds';
import type { BookingDraft, Appointment } from '../types';

const STEPS = [
  { id: 1, label: 'Specialist', shortLabel: 'Doctor' },
  { id: 2, label: 'Format', shortLabel: 'Type' },
  { id: 3, label: 'Date', shortLabel: 'Date' },
  { id: 4, label: 'Time Slot', shortLabel: 'Time' },
  { id: 5, label: 'Patient Info', shortLabel: 'Details' },
  { id: 6, label: 'Review', shortLabel: 'Review' },
  { id: 7, label: 'Confirmed', shortLabel: 'Done' },
];

export const BookAppointmentPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { doctors, appointments, patientProfile, createAppointment } = usePlatformStore();
  const { user } = useAuthStore();

  const initialDoctorId = searchParams.get('doctor') || '';
  const initialType = (searchParams.get('type') as 'online' | 'in-person') || 'in-person';
  const initialDate = searchParams.get('date') || format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const initialTime = searchParams.get('time') || '';

  const [step, setStep] = useState<number>(() => {
    if (initialDoctorId && initialDate && initialTime) return 5;
    if (initialDoctorId) return 2;
    return 1;
  });

  const [doctorSearch, setDoctorSearch] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('');

  const [draft, setDraft] = useState<BookingDraft>({
    doctorId: initialDoctorId || doctors[0]?.id || 'dr-sarah-mitchell',
    consultationType: initialType === 'online' ? 'online' : 'in-person',
    date: initialDate,
    time: initialTime || '10:00',
    patientFirstName: user?.firstName || patientProfile.firstName || 'Eleanor',
    patientLastName: user?.lastName || patientProfile.lastName || 'Vance',
    patientEmail: user?.email || patientProfile.email || 'eleanor.vance@mediconnect.health',
    patientPhone: user?.phone || patientProfile.phone || '+1 (212) 555-0194',
    patientDob: patientProfile.dateOfBirth || '1989-04-16',
    reason: 'Comprehensive specialist evaluation and clinical consultation',
    symptoms: '',
    insuranceProvider: patientProfile.insuranceProvider || 'Aetna Private Health',
    notes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      setDraft((prev) => ({
        ...prev,
        patientFirstName: prev.patientFirstName || user.firstName,
        patientLastName: prev.patientLastName || user.lastName,
        patientEmail: prev.patientEmail || user.email,
      }));
    }
  }, [user]);

  const selectedDoctor = useMemo(
    () => doctors.find((d) => d.id === draft.doctorId) || doctors[0],
    [doctors, draft.doctorId]
  );

  const filteredDoctors = useMemo(() => {
    return doctors.filter((d) => {
      if (d.verificationStatus === 'rejected') return false;
      const matchesQuery =
        !doctorSearch.trim() ||
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.specialty.toLowerCase().includes(doctorSearch.toLowerCase()) ||
        d.hospital.toLowerCase().includes(doctorSearch.toLowerCase());
      const matchesSpec = !specialtyFilter || d.specialty === specialtyFilter;
      return matchesQuery && matchesSpec;
    });
  }, [doctors, doctorSearch, specialtyFilter]);

  // Interactive 14-day calendar dates
  const calendarDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, idx) => {
      const dateObj = addDays(today, idx);
      const dateStr = format(dateObj, 'yyyy-MM-dd');
      const dayName = getDayName(dateObj);
      const schedule = selectedDoctor?.availability.find(
        (a) => a.day === dayName && a.isActive
      );
      return {
        dateObj,
        dateStr,
        dayShort: format(dateObj, 'EEE'),
        dayNum: format(dateObj, 'dd'),
        monthShort: format(dateObj, 'MMM'),
        isAvailableDay: Boolean(schedule),
        schedule,
      };
    });
  }, [selectedDoctor]);

  // Available slots for selected doctor + date
  const timeSlots = useMemo(() => {
    if (!selectedDoctor || !draft.date) return [];
    const targetDayObj = calendarDates.find((d) => d.dateStr === draft.date);
    const schedule =
      targetDayObj?.schedule ||
      selectedDoctor.availability.find((a) => a.isActive) || {
        startTime: '09:00',
        endTime: '17:00',
        slotDuration: 30,
      };

    const bookedTimes = appointments
      .filter(
        (apt) =>
          apt.doctorId === selectedDoctor.id &&
          apt.date === draft.date &&
          apt.status !== 'cancelled'
      )
      .map((apt) => apt.time);

    return generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration || 30,
      bookedTimes
    );
  }, [selectedDoctor, draft.date, calendarDates, appointments]);

  const currentFee = useMemo(() => {
    if (!selectedDoctor) return 220;
    return draft.consultationType === 'online'
      ? selectedDoctor.onlineFee
      : selectedDoctor.consultationFee;
  }, [selectedDoctor, draft.consultationType]);

  const handleNextStep = () => {
    const validation = validateBookingStep(step, draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      sounds.error();
      return;
    }
    setErrors({});
    sounds.click();
    setStep((prev) => Math.min(prev + 1, 7));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrevStep = () => {
    setErrors({});
    sounds.click();
    setStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmBooking = async () => {
    const validation = validateBookingStep(5, draft);
    if (!validation.valid) {
      setErrors(validation.errors);
      setStep(5);
      sounds.error();
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      const created = await createAppointment({
        doctorId: selectedDoctor.id,
        consultationType: draft.consultationType,
        date: draft.date,
        time: draft.time,
        patientName: `${draft.patientFirstName.trim()} ${draft.patientLastName.trim()}`,
        patientEmail: draft.patientEmail.trim(),
        patientPhone: draft.patientPhone.trim(),
        reason: draft.reason.trim(),
        symptoms: draft.symptoms.trim(),
        notes: draft.notes.trim(),
      });
      setConfirmedAppointment(created);
      sounds.confirm();
      setStep(7);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to complete booking.';
      setErrors({ submit: msg });
      sounds.error();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              to="/doctors"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/55 hover:text-forest mb-2 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Specialist Directory
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl text-charcoal tracking-tight">
              Schedule a Private Consultation
            </h1>
          </div>
          <div className="flex items-center gap-2 text-xs text-charcoal/60">
            <Lock size={14} className="text-forest" />
            <span>HIPAA-Compliant Encrypted Scheduling</span>
          </div>
        </div>

        {/* 7-Step Progress Bar */}
        <div className="bg-white border border-charcoal/8 rounded-2xl p-4 sm:p-5 mb-8 shadow-xs">
          <div className="grid grid-cols-7 gap-2">
            {STEPS.map((s) => {
              const isCurrent = step === s.id;
              const isCompleted = step > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  disabled={s.id >= step || step === 7}
                  onClick={() => {
                    if (s.id < step && step !== 7) {
                      setStep(s.id);
                    }
                  }}
                  className={cn(
                    'flex flex-col items-start text-left p-2 rounded-xl transition-all',
                    s.id < step && step !== 7 ? 'cursor-pointer hover:bg-ivory' : 'cursor-default'
                  )}
                >
                  <div className="flex items-center gap-2 w-full mb-1.5">
                    <span
                      className={cn(
                        'w-6 h-6 rounded-full text-xs font-mono font-semibold flex items-center justify-center shrink-0 transition-colors',
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isCurrent
                          ? 'bg-forest text-white ring-4 ring-forest/15'
                          : 'bg-charcoal/8 text-charcoal/50'
                      )}
                    >
                      {isCompleted ? '✓' : s.id}
                    </span>
                    <div
                      className={cn(
                        'h-1 flex-1 rounded-full hidden sm:block',
                        isCompleted
                          ? 'bg-emerald-600'
                          : isCurrent
                          ? 'bg-forest/40'
                          : 'bg-charcoal/8'
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium truncate w-full',
                      isCurrent ? 'text-forest font-semibold' : 'text-charcoal/55'
                    )}
                  >
                    <span className="hidden md:inline">{s.label}</span>
                    <span className="md:hidden">{s.shortLabel}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Active Step */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {/* STEP 1: SELECT A DOCTOR */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg">
                    <div className="mb-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                        Step 1 of 7
                      </span>
                      <h2 className="font-serif text-2xl text-charcoal mt-1">
                        Select Your Attending Physician
                      </h2>
                      <p className="text-sm text-charcoal/60 mt-1">
                        Choose from our board-certified specialists across New York’s premier medical institutions.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                      <Input
                        placeholder="Search by doctor name, specialty, or hospital..."
                        value={doctorSearch}
                        onChange={(e) => setDoctorSearch(e.target.value)}
                        icon={<Search size={16} />}
                      />
                      <select
                        value={specialtyFilter}
                        onChange={(e) => setSpecialtyFilter(e.target.value)}
                        aria-label="Filter by specialty"
                        className="w-full bg-white border border-charcoal/12 rounded-xl px-4 py-2.5 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20"
                      >
                        <option value="">All Clinical Specialties</option>
                        {Array.from(new Set(doctors.map((d) => d.specialty))).map((spec) => (
                          <option key={spec} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                      {filteredDoctors.map((doc) => {
                        const isSelected = draft.doctorId === doc.id;
                        return (
                          <div
                            key={doc.id}
                            onClick={() => {
                              sounds.click();
                              setDraft((prev) => ({ ...prev, doctorId: doc.id }));
                            }}
                            className={cn(
                              'p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
                              isSelected
                                ? 'border-forest bg-forest/[0.03] shadow-xs'
                                : 'border-charcoal/10 hover:border-forest/30 bg-white'
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <Avatar
                                src={doc.avatar}
                                alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                                size="lg"
                              />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-semibold text-charcoal">
                                    Dr. {doc.firstName} {doc.lastName}
                                  </h3>
                                  {doc.verified && <Badge variant="verified">Verified MD</Badge>}
                                </div>
                                <p className="text-xs text-charcoal/65 mt-0.5">
                                  {doc.specialty} · {doc.experience} yrs exp · {doc.hospital}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                  <StarRating rating={doc.rating} showCount={doc.reviewCount} />
                                </div>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-charcoal/8">
                              <div className="text-left sm:text-right">
                                <span className="text-xs text-charcoal/50 block">Consultation</span>
                                <span className="text-base font-mono font-semibold text-charcoal tabular-nums">
                                  {formatCurrency(doc.consultationFee)}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  'mt-1 text-xs font-semibold',
                                  isSelected ? 'text-forest' : 'text-charcoal/40'
                                )}
                              >
                                {isSelected ? 'Selected ✓' : 'Select →'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {errors.doctorId && (
                      <p className="mt-3 text-xs text-red-600 font-medium">{errors.doctorId}</p>
                    )}

                    <div className="mt-8 pt-6 border-t border-charcoal/8 flex justify-end">
                      <Button
                        size="lg"
                        onClick={handleNextStep}
                        iconRight={<ArrowRight size={16} />}
                      >
                        Continue to Consultation Format
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 2: CONSULTATION TYPE */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg">
                    <div className="mb-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                        Step 2 of 7
                      </span>
                      <h2 className="font-serif text-2xl text-charcoal mt-1">
                        Choose Consultation Format
                      </h2>
                      <p className="text-sm text-charcoal/60 mt-1">
                        Select how you would like to meet with Dr. {selectedDoctor.firstName}{' '}
                        {selectedDoctor.lastName}.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* In-Person Option */}
                      <div
                        onClick={() => {
                          sounds.toggle(true);
                          setDraft((prev) => ({ ...prev, consultationType: 'in-person' }));
                        }}
                        className={cn(
                          'p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                          draft.consultationType === 'in-person'
                            ? 'border-forest bg-forest/[0.03] shadow-sm'
                            : 'border-charcoal/10 hover:border-charcoal/25 bg-white'
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                              <Building2 size={22} />
                            </div>
                            <span className="font-mono text-lg font-semibold text-charcoal tabular-nums">
                              {formatCurrency(selectedDoctor.consultationFee)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-charcoal">
                            In-Person Clinic Consultation
                          </h3>
                          <p className="text-sm text-charcoal/60 mt-1.5 leading-relaxed">
                            Comprehensive physical examination and diagnostic consultation at{' '}
                            {selectedDoctor.hospital}.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-charcoal/8 flex items-center justify-between text-xs text-charcoal/65">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-forest" />
                            {selectedDoctor.location}
                          </span>
                          <span className="font-semibold text-forest">
                            {draft.consultationType === 'in-person' ? 'Selected ✓' : 'Select'}
                          </span>
                        </div>
                      </div>

                      {/* Online Video Option */}
                      <div
                        onClick={() => {
                          sounds.toggle(false);
                          setDraft((prev) => ({ ...prev, consultationType: 'online' }));
                        }}
                        className={cn(
                          'p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between',
                          draft.consultationType === 'online'
                            ? 'border-forest bg-forest/[0.03] shadow-sm'
                            : 'border-charcoal/10 hover:border-charcoal/25 bg-white'
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-11 h-11 rounded-xl bg-forest/10 text-forest flex items-center justify-center">
                              <Video size={22} />
                            </div>
                            <span className="font-mono text-lg font-semibold text-charcoal tabular-nums">
                              {formatCurrency(selectedDoctor.onlineFee)}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-charcoal">
                            Private HD Video Consultation
                          </h3>
                          <p className="text-sm text-charcoal/60 mt-1.5 leading-relaxed">
                            Encrypted telehealth consultation from home with instant digital
                            prescription transmission.
                          </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-charcoal/8 flex items-center justify-between text-xs text-charcoal/65">
                          <span className="flex items-center gap-1.5">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            End-to-End Encrypted Room
                          </span>
                          <span className="font-semibold text-forest">
                            {draft.consultationType === 'online' ? 'Selected ✓' : 'Select'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-charcoal/8 flex items-center justify-between">
                      <Button variant="ghost" onClick={handlePrevStep} icon={<ArrowLeft size={16} />}>
                        Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNextStep}
                        iconRight={<ArrowRight size={16} />}
                      >
                        Continue to Date Selection
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 3: INTERACTIVE CALENDAR DATE */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg">
                    <div className="mb-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                        Step 3 of 7
                      </span>
                      <h2 className="font-serif text-2xl text-charcoal mt-1">
                        Select Appointment Date
                      </h2>
                      <p className="text-sm text-charcoal/60 mt-1">
                        Showing upcoming clinical availability for Dr. {selectedDoctor.firstName}{' '}
                        {selectedDoctor.lastName}.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                      {calendarDates.map((d) => {
                        const isSelected = draft.date === d.dateStr;
                        return (
                          <button
                            key={d.dateStr}
                            type="button"
                            disabled={!d.isAvailableDay}
                            onClick={() => {
                              sounds.click();
                              setDraft((prev) => ({ ...prev, date: d.dateStr }));
                            }}
                            className={cn(
                              'p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer',
                              !d.isAvailableDay
                                ? 'opacity-40 cursor-not-allowed bg-charcoal/[0.02] border-charcoal/8'
                                : isSelected
                                ? 'bg-forest text-white border-forest shadow-sm'
                                : 'bg-white border-charcoal/10 hover:border-forest/40 text-charcoal'
                            )}
                          >
                            <span
                              className={cn(
                                'text-xs font-medium uppercase',
                                isSelected ? 'text-white/80' : 'text-charcoal/50'
                              )}
                            >
                              {d.dayShort}
                            </span>
                            <span className="text-xl font-mono font-semibold my-1 tabular-nums">
                              {d.dayNum}
                            </span>
                            <span
                              className={cn(
                                'text-[11px]',
                                isSelected ? 'text-white/80' : 'text-charcoal/55'
                              )}
                            >
                              {d.monthShort}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {errors.date && (
                      <p className="mt-3 text-xs text-red-600 font-medium">{errors.date}</p>
                    )}

                    <div className="mt-8 pt-6 border-t border-charcoal/8 flex items-center justify-between">
                      <Button variant="ghost" onClick={handlePrevStep} icon={<ArrowLeft size={16} />}>
                        Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNextStep}
                        iconRight={<ArrowRight size={16} />}
                      >
                        Select Time Slot
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 4: SELECT AVAILABLE TIME SLOT */}
              {step === 4 && (
                <motion.div
                  key="step-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg">
                    <div className="mb-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                        Step 4 of 7
                      </span>
                      <h2 className="font-serif text-2xl text-charcoal mt-1">
                        Choose an Available Time Slot
                      </h2>
                      <p className="text-sm text-charcoal/60 mt-1">
                        Available times for{' '}
                        <span className="font-semibold text-charcoal">
                          {format(parseISO(draft.date), 'EEEE, MMMM d, yyyy')}
                        </span>{' '}
                        (Eastern Time). Booked slots are automatically locked to prevent conflicts.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {timeSlots.map((slot) => {
                        const isSelected = draft.time === slot.time && slot.available;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => {
                              sounds.click();
                              setDraft((prev) => ({ ...prev, time: slot.time }));
                            }}
                            className={cn(
                              'py-3 px-3 rounded-xl border font-mono text-sm font-medium transition-all tabular-nums',
                              !slot.available
                                ? 'bg-charcoal/[0.03] border-charcoal/8 text-charcoal/30 line-through cursor-not-allowed'
                                : isSelected
                                ? 'bg-forest text-white border-forest shadow-xs cursor-pointer'
                                : 'bg-white border-charcoal/12 text-charcoal hover:border-forest/40 cursor-pointer'
                            )}
                          >
                            {slot.time}
                            {!slot.available && (
                              <span className="block text-[10px] font-sans no-underline">
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {errors.time && (
                      <p className="mt-3 text-xs text-red-600 font-medium">{errors.time}</p>
                    )}

                    <div className="mt-8 pt-6 border-t border-charcoal/8 flex items-center justify-between">
                      <Button variant="ghost" onClick={handlePrevStep} icon={<ArrowLeft size={16} />}>
                        Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNextStep}
                        iconRight={<ArrowRight size={16} />}
                      >
                        Continue to Patient Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 5: PATIENT INFORMATION */}
              {step === 5 && (
                <motion.div
                  key="step-5"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg">
                    <div className="mb-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                        Step 5 of 7
                      </span>
                      <h2 className="font-serif text-2xl text-charcoal mt-1">
                        Patient Intake Information
                      </h2>
                      <p className="text-sm text-charcoal/60 mt-1">
                        Provide accurate clinical details so Dr. {selectedDoctor.lastName} can
                        prepare for your consultation.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Patient First Name *"
                        value={draft.patientFirstName}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, patientFirstName: e.target.value }))
                        }
                        error={errors.patientFirstName}
                      />
                      <Input
                        label="Patient Last Name *"
                        value={draft.patientLastName}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, patientLastName: e.target.value }))
                        }
                        error={errors.patientLastName}
                      />
                      <Input
                        label="Email Address *"
                        type="email"
                        value={draft.patientEmail}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, patientEmail: e.target.value }))
                        }
                        error={errors.patientEmail}
                      />
                      <Input
                        label="Mobile Phone *"
                        type="tel"
                        value={draft.patientPhone}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, patientPhone: e.target.value }))
                        }
                        error={errors.patientPhone}
                      />
                      <Input
                        label="Date of Birth"
                        type="date"
                        value={draft.patientDob}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, patientDob: e.target.value }))
                        }
                      />
                      <Input
                        label="Insurance Provider (Optional)"
                        value={draft.insuranceProvider}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, insuranceProvider: e.target.value }))
                        }
                        placeholder="e.g. Aetna Private Health, Self-Pay"
                      />
                    </div>

                    <div className="mt-4 space-y-4">
                      <Input
                        label="Primary Reason for Visit *"
                        value={draft.reason}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, reason: e.target.value }))
                        }
                        error={errors.reason}
                        placeholder="e.g. Annual cardiovascular evaluation, migraine follow-up"
                      />
                      <Textarea
                        label="Current Symptoms or Clinical Notes (Optional)"
                        rows={3}
                        value={draft.symptoms}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, symptoms: e.target.value }))
                        }
                        placeholder="Describe any symptoms, onset duration, or current medications..."
                      />
                    </div>

                    <div className="mt-8 pt-6 border-t border-charcoal/8 flex items-center justify-between">
                      <Button variant="ghost" onClick={handlePrevStep} icon={<ArrowLeft size={16} />}>
                        Back
                      </Button>
                      <Button
                        size="lg"
                        onClick={handleNextStep}
                        iconRight={<ArrowRight size={16} />}
                      >
                        Review Consultation Details
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 6: REVIEW & CONFIRM */}
              {step === 6 && (
                <motion.div
                  key="step-6"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card padding="lg">
                    <div className="mb-6">
                      <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
                        Step 6 of 7
                      </span>
                      <h2 className="font-serif text-2xl text-charcoal mt-1">
                        Review & Confirm Appointment
                      </h2>
                      <p className="text-sm text-charcoal/60 mt-1">
                        Please verify your appointment summary before final confirmation.
                      </p>
                    </div>

                    {errors.submit && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700">
                        <AlertCircle size={18} className="shrink-0" />
                        <span>{errors.submit}</span>
                      </div>
                    )}

                    <div className="bg-ivory/70 rounded-2xl p-5 border border-charcoal/8 space-y-5">
                      <div className="flex items-center gap-4 pb-4 border-b border-charcoal/8">
                        <Avatar
                          src={selectedDoctor.avatar}
                          alt={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                          size="lg"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-charcoal">
                              Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                            </h3>
                            <Badge variant="verified">Verified MD</Badge>
                          </div>
                          <p className="text-xs text-charcoal/60 mt-0.5">
                            {selectedDoctor.specialty} · {selectedDoctor.hospital}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs text-charcoal/50 block">Date & Time</span>
                          <span className="font-semibold text-charcoal font-mono">
                            {format(parseISO(draft.date), 'MMM d, yyyy')} at {draft.time} EST
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-charcoal/50 block">Consultation Format</span>
                          <span className="font-semibold text-charcoal capitalize">
                            {draft.consultationType === 'online'
                              ? 'Online HD Video Consultation'
                              : `In-Person (${selectedDoctor.hospital})`}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-charcoal/50 block">Patient Name</span>
                          <span className="font-semibold text-charcoal">
                            {draft.patientFirstName} {draft.patientLastName}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-charcoal/50 block">Contact</span>
                          <span className="font-semibold text-charcoal">
                            {draft.patientEmail} · {draft.patientPhone}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-xs text-charcoal/50 block">Reason for Visit</span>
                          <span className="font-medium text-charcoal">{draft.reason}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-forest/[0.04] border border-forest/15 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-forest block">
                          Protected Clinical Hold
                        </span>
                        <p className="text-xs text-charcoal/65 mt-0.5">
                          No charge until consultation completion. Free rescheduling up to 12 hours prior.
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-charcoal/50 block">Total Fee</span>
                        <span className="text-xl font-mono font-bold text-forest tabular-nums">
                          {formatCurrency(currentFee)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-charcoal/8 flex items-center justify-between">
                      <Button variant="ghost" onClick={handlePrevStep} icon={<ArrowLeft size={16} />}>
                        Edit Details
                      </Button>
                      <Button
                        size="xl"
                        loading={isSubmitting}
                        onClick={handleConfirmBooking}
                        icon={<CheckCircle2 size={18} />}
                      >
                        Confirm & Issue Appointment Pass
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* STEP 7: ANIMATED BOOKING CONFIRMATION */}
              {step === 7 && confirmedAppointment && (
                <motion.div
                  key="step-7"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35 }}
                >
                  <Card padding="lg" className="text-center relative overflow-hidden">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/12 text-emerald-700 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle2 size={34} />
                    </div>

                    <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-semibold">
                      Appointment Confirmed · {confirmedAppointment.appointmentCode}
                    </span>

                    <h2 className="font-serif text-3xl text-charcoal mt-2">
                      Your Consultation is Scheduled
                    </h2>
                    <p className="text-sm text-charcoal/65 max-w-md mx-auto mt-2">
                      A clinical calendar invitation and encrypted access pass have been sent to{' '}
                      <span className="font-medium text-charcoal">
                        {confirmedAppointment.patientEmail}
                      </span>
                      .
                    </p>

                    <div className="mt-8 bg-ivory rounded-2xl p-6 border border-charcoal/10 text-left max-w-xl mx-auto space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-charcoal/8">
                        <div>
                          <span className="text-xs text-charcoal/50 block">Booking Reference ID</span>
                          <span className="font-mono text-base font-bold text-forest">
                            {confirmedAppointment.appointmentCode}
                          </span>
                        </div>
                        <Badge variant="confirmed">Confirmed</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs text-charcoal/50 block">Attending Physician</span>
                          <span className="font-semibold text-charcoal">
                            {confirmedAppointment.doctorName}
                          </span>
                          <span className="block text-xs text-charcoal/55">
                            {confirmedAppointment.doctorSpecialty}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-charcoal/50 block">Date & Time</span>
                          <span className="font-mono font-semibold text-charcoal">
                            {confirmedAppointment.date} · {confirmedAppointment.time} EST
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-charcoal/50 block">Consultation Mode</span>
                          <span className="font-medium text-charcoal capitalize">
                            {confirmedAppointment.consultationType}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-charcoal/50 block">Consultation Fee</span>
                          <span className="font-mono font-semibold text-charcoal tabular-nums">
                            {formatCurrency(confirmedAppointment.fee)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <Button
                        size="lg"
                        onClick={() =>
                          navigate(`/patient/appointments/${confirmedAppointment.appointmentCode}`)
                        }
                        icon={<FileText size={16} />}
                      >
                        View Appointment Pass
                      </Button>
                      <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => navigate('/patient/appointments')}
                      >
                        Manage My Appointments
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Live Sticky Summary */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <Card padding="md" className="bg-white/90 backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-charcoal/8">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-charcoal/65">
                  Consultation Summary
                </h3>
                <Sparkles size={15} className="text-forest" />
              </div>

              {selectedDoctor && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3.5">
                    <Avatar
                      src={selectedDoctor.avatar}
                      alt={`Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
                      size="lg"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-charcoal">
                        Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                      </h4>
                      <p className="text-xs text-charcoal/60">{selectedDoctor.specialty}</p>
                      <p className="text-xs text-charcoal/45 mt-0.5">{selectedDoctor.hospital}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-charcoal/8 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/55 flex items-center gap-1.5">
                        {draft.consultationType === 'online' ? (
                          <Video size={14} className="text-forest" />
                        ) : (
                          <Building2 size={14} className="text-forest" />
                        )}
                        Format
                      </span>
                      <span className="font-semibold text-charcoal capitalize">
                        {draft.consultationType === 'online' ? 'Online Video' : 'In-Person Clinic'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/55 flex items-center gap-1.5">
                        <Calendar size={14} className="text-forest" />
                        Date
                      </span>
                      <span className="font-mono font-semibold text-charcoal">
                        {draft.date ? format(parseISO(draft.date), 'MMM d, yyyy') : 'Select Date'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/55 flex items-center gap-1.5">
                        <Clock size={14} className="text-forest" />
                        Time Slot
                      </span>
                      <span className="font-mono font-semibold text-charcoal">
                        {draft.time ? `${draft.time} EST` : 'Select Time'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/55 flex items-center gap-1.5">
                        <UserCheck size={14} className="text-forest" />
                        Patient
                      </span>
                      <span className="font-semibold text-charcoal">
                        {draft.patientFirstName} {draft.patientLastName}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-charcoal/8 flex items-center justify-between">
                    <span className="text-xs font-medium text-charcoal/60">Consultation Fee</span>
                    <span className="text-lg font-mono font-bold text-forest tabular-nums">
                      {formatCurrency(currentFee)}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
