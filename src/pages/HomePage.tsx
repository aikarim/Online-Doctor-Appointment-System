import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Search,
  Calendar,
  Star,
  Shield,
  Clock,
  Video,
  ArrowRight,
  Users,
  Award,
  Heart,
  Plus,
  Minus,
  MapPin,
  Stethoscope,
  Brain,
  Sparkles,
  Baby,
  Bone,
  Eye,
  Activity,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { PublicLayout } from '../components/layout';
import { Button, Badge, Avatar } from '../components/ui';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { HERO_EDITORIAL_IMAGE, TESTIMONIALS } from '../data/mockData';
import { usePlatformStore, useAuthStore } from '../store';
import { sounds } from '../utils/sounds';

const SPECIALTY_ICONS: Record<string, React.ElementType> = {
  HeartPulse,
  Brain,
  Sparkles,
  Baby,
  Bone,
  Eye,
  Activity,
  ShieldCheck,
  Stethoscope,
};

const FAQS = [
  {
    question: 'How do I schedule an online or in-person consultation?',
    answer:
      'Select your preferred specialist by name, specialty, or hospital affiliation. Choose between encrypted HD video telemedicine or an in-person clinic visit, pick an available date and time slot, and confirm your appointment immediately.',
  },
  {
    question: 'How does MediConnect verify physician credentials?',
    answer:
      'Every physician on MediConnect undergoes primary-source verification of medical school diplomas, residency completion, state medical board licenses, DEA registration, and ABMS board certifications prior to activation.',
  },
  {
    question: 'Can I reschedule or cancel an appointment if my schedule changes?',
    answer:
      'Yes. You can reschedule or cancel any upcoming consultation directly from your Patient Dashboard up to 24 hours prior to your appointment slot with zero penalty.',
  },
  {
    question: 'Are prescriptions and diagnostic records available after my visit?',
    answer:
      'Immediately following your consultation, your attending physician posts clinical summaries, vital sign trends, and digital prescriptions directly to your encrypted Patient Portal.',
  },
];

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { doctors, specialties } = usePlatformStore();
  const { switchDemoRole } = useAuthStore();
  const navigate = useNavigate();

  const verifiedDoctors = doctors.filter((d) => d.verified).slice(0, 4);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedSpecialty) params.set('specialty', selectedSpecialty);
    if (selectedLocation.trim()) params.set('location', selectedLocation.trim());
    navigate(`/doctors?${params.toString()}`);
  };

  const launchRolePortal = (role: 'patient' | 'doctor' | 'admin') => {
    sounds.click();
    switchDemoRole(role);
    navigate(`/${role}/dashboard`);
  };

  return (
    <PublicLayout>
      {/* ========== HERO SECTION ========== */}
      <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden border-b border-charcoal/8">
        <div className="section-container">
          <div className="grid lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Copy & Search Widget */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="mb-5">
                <Badge variant="verified">Board-Certified Private Physician Network</Badge>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] text-charcoal leading-[1.08] tracking-tight mb-6">
                Healthcare,{' '}
                <span className="italic text-forest font-normal">thoughtfully</span>{' '}
                connected.
              </h1>

              <p className="text-base sm:text-lg text-charcoal/70 leading-relaxed mb-8 max-w-2xl">
                Exceptional doctors. Effortless appointments. Better healthcare experiences — all in one place.
              </p>

              {/* Liquid-Glass Appointment Search Widget */}
              <form
                onSubmit={handleSearch}
                className="glass-strong rounded-2xl p-3 sm:p-4 shadow-glass-lg mb-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                  <div className="sm:col-span-5 relative">
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none"
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Doctor name or condition..."
                      aria-label="Search by doctor name or medical condition"
                      className="w-full pl-10 pr-3 py-3 bg-white border border-charcoal/10 rounded-xl text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      value={selectedSpecialty}
                      onChange={(e) => setSelectedSpecialty(e.target.value)}
                      aria-label="Filter by medical specialty"
                      className="w-full px-3.5 py-3 bg-white border border-charcoal/10 rounded-xl text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-forest/20 cursor-pointer"
                    >
                      <option value="">All Specialties</option>
                      {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <Button type="submit" variant="primary" fullWidth size="lg" className="h-full">
                      Find Care
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2.5 border-t border-charcoal/6 text-xs text-charcoal/55">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>Popular:</span>
                    {['Cardiology', 'Dermatology', 'Neurology', 'Pediatrics'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          sounds.click();
                          navigate(`/doctors?specialty=${term.toLowerCase()}`);
                        }}
                        className="text-forest hover:underline font-medium cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-charcoal/50">
                    <MapPin size={12} className="text-forest" /> New York · Telehealth Nationwide
                  </span>
                </div>
              </form>

              {/* Primary & Secondary CTAs */}
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/book">
                  <Button variant="primary" size="lg" icon={<Calendar size={16} />}>
                    Book Appointment
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button variant="secondary" size="lg" iconRight={<ArrowRight size={16} />}>
                    Explore Doctors
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Editorial Portrait & Liquid Glass Telemetry Card */}
            <div className="lg:col-span-5 relative flex items-center">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-glass-xl border border-charcoal/10 aspect-4/5 max-h-[540px] mx-auto">
                <img
                  src={HERO_EDITORIAL_IMAGE}
                  alt="Senior attending cardiologist at MediConnect"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />

                {/* Bottom Overlay Card */}
                <div className="absolute bottom-5 left-5 right-5 glass-strong rounded-2xl p-4 shadow-glass-lg">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={doctors[0]?.avatar}
                        alt="Dr. Sarah Mitchell"
                        size="md"
                      />
                      <div>
                        <p className="text-sm font-semibold text-charcoal">Dr. Sarah Mitchell, MD</p>
                        <p className="text-xs text-forest font-medium">
                          Mount Sinai Heart Institute · 4.95 ★
                        </p>
                      </div>
                    </div>
                    <Link to="/book?doctor=dr-sarah-mitchell">
                      <Button variant="primary" size="sm">
                        Book 2:00 PM
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Quantitative Proof Row Below Hero Split */}
          <div className="mt-14 pt-10 border-t border-charcoal/8 grid grid-cols-2 lg:grid-cols-4 gap-6 tabular-nums">
            <div>
              <p className="font-serif text-3xl font-semibold text-forest">12,840+</p>
              <p className="text-xs text-charcoal/60 mt-1">
                Active patients across New York & nationwide telehealth
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-forest">284</p>
              <p className="text-xs text-charcoal/60 mt-1">
                Board-certified specialists from top academic hospitals
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-forest">48,390+</p>
              <p className="text-xs text-charcoal/60 mt-1">
                Completed consultations with zero double-booking conflicts
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-forest">98.4%</p>
              <p className="text-xs text-charcoal/60 mt-1">
                Verified post-consultation patient satisfaction score
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SPECIALTIES SECTION ========== */}
      <section className="section-padding" id="specialties">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-forest mb-2">
                01. Clinical Departments
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
                Specialized medicine for every need
              </h2>
              <p className="text-sm text-charcoal/60 mt-2 max-w-xl">
                Direct access to fellowship-trained physicians across primary, preventive, and surgical subspecialties.
              </p>
            </div>
            <Link to="/specialties">
              <Button variant="secondary" iconRight={<ArrowRight size={15} />}>
                View All Specialties
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {specialties.slice(0, 6).map((spec) => {
              const IconComponent = SPECIALTY_ICONS[spec.icon] || Stethoscope;
              return (
                <Link
                  key={spec.id}
                  to={`/doctors?specialty=${spec.id}`}
                  onClick={() => sounds.click()}
                  className="group bg-white rounded-2xl p-6 border border-charcoal/8 hover:border-forest/30 hover:shadow-card-hover transition-all duration-200 flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-xl bg-forest/8 text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition-colors">
                    <IconComponent size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-forest transition-colors">
                        {spec.name}
                      </h3>
                      <span className="text-xs font-mono text-charcoal/45 tabular-nums">
                        {spec.doctorCount} MDs
                      </span>
                    </div>
                    <p className="text-xs text-charcoal/60 leading-relaxed mt-1.5 line-clamp-2">
                      {spec.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== FEATURED DOCTORS ========== */}
      <section className="section-padding bg-ivory-200/70 border-y border-charcoal/8" id="doctors">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-forest mb-2">
                02. Attending Physicians
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal">
                Consult with leading specialists
              </h2>
              <p className="text-sm text-charcoal/60 mt-2 max-w-xl">
                Every physician profile includes verified board credentials, transparent consultation fees, and real-time slot availability.
              </p>
            </div>
            <Link to="/doctors">
              <Button variant="secondary" iconRight={<ArrowRight size={15} />}>
                Browse All {doctors.length} Physicians
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {verifiedDoctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} layout="grid" />
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS & WHY CHOOSE US ========== */}
      <section className="section-padding" id="how-it-works">
        <div className="section-container">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-mono uppercase tracking-widest text-forest mb-2">
                03. Care Architecture
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-charcoal leading-tight mb-4">
                Designed around clinical clarity and patient time
              </h2>
              <p className="text-sm text-charcoal/65 leading-relaxed mb-6">
                Traditional healthcare scheduling is fragmented across phone trees and disconnected portals. MediConnect unifies discovery, conflict-free booking, telemedicine, and prescription records.
              </p>
              <div className="space-y-4 pt-2">
                {[
                  {
                    icon: Shield,
                    title: 'Primary-Source Credentialing',
                    desc: 'Every physician license and board certification is audited by our clinical governance team.',
                  },
                  {
                    icon: Video,
                    title: 'Hybrid Telemedicine & Clinic Care',
                    desc: 'Switch effortlessly between encrypted video consultations and in-person hospital visits.',
                  },
                  {
                    icon: Clock,
                    title: 'Real-Time Conflict Prevention',
                    desc: 'Transactional slot locking ensures your reserved appointment time is never double-booked.',
                  },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon size={17} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-charcoal">{item.title}</h3>
                      <p className="text-xs text-charcoal/60 leading-relaxed mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-3 gap-5">
              {[
                {
                  num: '01.',
                  title: 'Select Specialist',
                  desc: 'Filter verified physicians by subspecialty, hospital affiliation, consultation fee, and real-time availability.',
                },
                {
                  num: '02.',
                  title: 'Reserve Time Slot',
                  desc: 'Pick online video or in-person care, select your date and 30-minute window, and provide clinical intake notes.',
                },
                {
                  num: '03.',
                  title: 'Consult & Follow Up',
                  desc: 'Join your consultation, review lab metrics, and access digital prescriptions in your longitudinal record.',
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="bg-white rounded-2xl p-6 border border-charcoal/8 flex flex-col justify-between min-h-[240px]"
                >
                  <span className="font-serif text-3xl font-semibold text-forest">{step.num}</span>
                  <div>
                    <h3 className="font-serif text-lg font-semibold text-charcoal mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-charcoal/60 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== PATIENT TESTIMONIALS ========== */}
      <section className="section-padding bg-forest text-white">
        <div className="section-container">
          <div className="mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-sage mb-2">
              04. Patient Outcomes
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">
              Trusted by patients who value precision care
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="glass-dark rounded-2xl p-6 flex flex-col justify-between space-y-6"
              >
                <p className="text-sm text-white/85 leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                  <Avatar src={t.avatar} alt={t.name} size="md" />
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-sage/80">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== INTERACTIVE ROLE PORTAL EXPLORER & FAQ ========== */}
      <section className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Role Portal Quick Switcher */}
            <div className="lg:col-span-5 bg-white rounded-2xl p-7 border border-charcoal/8 shadow-card">
              <p className="text-xs font-mono uppercase tracking-widest text-forest mb-2">
                Interactive Platform Portals
              </p>
              <h2 className="font-serif text-2xl font-semibold text-charcoal mb-3">
                Explore every role workspace
              </h2>
              <p className="text-xs text-charcoal/60 leading-relaxed mb-6">
                MediConnect provides dedicated, role-authorized workspaces for Patients, Attending Physicians, and Platform Administrators.
              </p>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-ivory border border-charcoal/8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Patient Portal</p>
                    <p className="text-xs text-charcoal/55">
                      Appointments, prescriptions, lab records & saved doctors
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => launchRolePortal('patient')}
                  >
                    Open Patient
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-ivory border border-charcoal/8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Physician Console</p>
                    <p className="text-xs text-charcoal/55">
                      Schedule management, patient roster & slot availability
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => launchRolePortal('doctor')}
                  >
                    Open Doctor
                  </Button>
                </div>

                <div className="p-4 rounded-xl bg-ivory border border-charcoal/8 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-charcoal">Admin Command Center</p>
                    <p className="text-xs text-charcoal/55">
                      Doctor license verification, revenue analytics & audit log
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => launchRolePortal('admin')}
                  >
                    Open Admin
                  </Button>
                </div>
              </div>
            </div>

            {/* FAQ Accordion */}
            <div className="lg:col-span-7">
              <p className="text-xs font-mono uppercase tracking-widest text-forest mb-2">
                05. Frequently Asked Questions
              </p>
              <h2 className="font-serif text-3xl text-charcoal mb-6">
                Clinical & scheduling guidance
              </h2>

              <div className="bg-white rounded-2xl border border-charcoal/8 divide-y divide-charcoal/8 px-6">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={faq.question} className="py-5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        onClick={() => {
                          setOpenFaq(isOpen ? null : idx);
                          sounds.toggle();
                        }}
                        className="w-full flex items-center justify-between text-left gap-4 cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-charcoal">{faq.question}</span>
                        {isOpen ? (
                          <Minus size={16} className="text-forest shrink-0" />
                        ) : (
                          <Plus size={16} className="text-charcoal/40 shrink-0" />
                        )}
                      </button>
                      {isOpen && (
                        <p className="text-xs sm:text-sm text-charcoal/65 leading-relaxed mt-3">
                          {faq.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
