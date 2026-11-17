import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search, Calendar, Star, Shield, Clock, Video, ChevronRight,
  ArrowRight, CheckCircle, Users, Award, Zap, Heart,
  Plus, Minus, ChevronDown, MapPin
} from 'lucide-react';
import { PublicLayout } from '../components/layout';
import { Button, Badge, StarRating, Card, Avatar } from '../components/ui';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { DOCTORS, SPECIALTIES, TESTIMONIALS } from '../data/mockData';
import { sounds } from '../utils/sounds';

// ---- Animated counter ----
const AnimatedCounter: React.FC<{ target: number; suffix?: string; prefix?: string }> = ({ target, suffix = '', prefix = '' }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let start = 0;
        const duration = 2000;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
        observer.disconnect();
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// ---- FAQ Item ----
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/6 py-5">
      <button
        onClick={() => { setOpen(!open); sounds.toggle(); }}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-semibold text-charcoal pr-4">{question}</span>
        {open ? <Minus size={16} className="text-forest flex-shrink-0" /> : <Plus size={16} className="text-charcoal/40 flex-shrink-0" />}
      </button>
      {open && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="text-sm text-charcoal/60 mt-3 leading-relaxed"
        >
          {answer}
        </motion.p>
      )}
    </div>
  );
};

// ---- Section animation wrapper ----
const Section: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className, id }) => (
  <motion.section
    id={id}
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className={className}
  >
    {children}
  </motion.section>
);

const faqs = [
  {
    question: 'How do I book an appointment?',
    answer: 'Simply search for a doctor by name or specialty, view their profile and available slots, choose your preferred date and time, and confirm your booking. You\'ll receive an instant confirmation with all the details.',
  },
  {
    question: 'Are the doctors verified and licensed?',
    answer: 'Yes. Every doctor on MediConnect undergoes a rigorous verification process. We verify medical licenses, board certifications, and professional credentials before granting platform access. Look for the verified badge on doctor profiles.',
  },
  {
    question: 'How do online video consultations work?',
    answer: 'Once you book an online consultation, you\'ll receive a secure meeting link in your confirmation email and dashboard. At the appointment time, simply click the link to join your video consultation directly in your browser — no downloads required.',
  },
  {
    question: 'What is the cancellation policy?',
    answer: 'You can cancel or reschedule your appointment up to 24 hours before the scheduled time for a full refund. Cancellations within 24 hours may be subject to a small cancellation fee. Contact our support team for special circumstances.',
  },
  {
    question: 'Is my medical information kept private?',
    answer: 'Absolutely. We take patient privacy extremely seriously. Your medical records, consultation notes, and personal information are encrypted and stored securely. Only you and your treating doctors can access your health data.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), digital wallets (Apple Pay, Google Pay), and bank transfers. All payments are processed securely.',
  },
];

export const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'doctor' | 'specialty'>('doctor');
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 400], [0, -60]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.6]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}&type=${searchType}`);
  };

  return (
    <PublicLayout>
      {/* ========== HERO SECTION ========== */}
      <section className="relative min-h-[100vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-ivory via-ivory to-transparent" />
        
        {/* Decorative blobs */}
        <motion.div
          className="absolute top-24 right-10 md:right-24 w-72 h-72 md:w-96 md:h-96 rounded-full bg-sage/20 blur-3xl pointer-events-none"
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full bg-forest/8 blur-3xl pointer-events-none"
          animate={{ scale: [1.05, 1, 1.05] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="section-container relative z-10 py-16"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Badge variant="sage" className="mb-6">
                  <CheckCircle size={12} /> Verified Doctors Only
                </Badge>
              </motion.div>

              <h1 className="font-serif text-display-lg md:text-display-xl text-charcoal leading-[1.1] tracking-tight mb-6">
                Healthcare,{' '}
                <span className="italic text-forest">thoughtfully</span>{' '}
                connected.
              </h1>

              <p className="text-lg md:text-xl text-charcoal/60 leading-relaxed mb-8 max-w-lg">
                Exceptional doctors. Effortless appointments. Better healthcare experiences — all in one place.
              </p>

              {/* Search widget */}
              <form onSubmit={handleSearch}>
                <div className="glass-strong rounded-2xl p-2 shadow-glass-lg border border-white/60 mb-4">
                  <div className="flex gap-1 mb-2 p-1">
                    {(['doctor', 'specialty'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => { setSearchType(type); sounds.toggle(); }}
                        className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition-all capitalize ${
                          searchType === type
                            ? 'bg-forest text-white shadow-sm'
                            : 'text-charcoal/60 hover:text-charcoal'
                        }`}
                      >
                        Find by {type}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={searchType === 'doctor' ? 'Search doctor name...' : 'Search specialty...'}
                        className="w-full pl-10 pr-4 py-3 bg-white/80 border border-black/8 rounded-xl text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-forest/20"
                      />
                    </div>
                    <Button type="submit" variant="primary" size="md" className="px-5">
                      Search
                    </Button>
                  </div>
                </div>
              </form>

              <div className="flex flex-wrap items-center gap-4">
                <Link to="/doctors">
                  <Button variant="secondary" iconRight={<ChevronRight size={15} />}>
                    Explore Doctors
                  </Button>
                </Link>
                <Link to="/book">
                  <Button variant="ghost">
                    <Calendar size={15} /> Book Now
                  </Button>
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 mt-8 pt-8 border-t border-black/6">
                {[
                  { icon: Users, value: '12,000+', label: 'Happy patients' },
                  { icon: Award, value: '284', label: 'Verified doctors' },
                  { icon: Star, value: '4.9', label: 'Average rating' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-forest/10 flex items-center justify-center">
                      <item.icon size={13} className="text-forest" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-charcoal leading-none">{item.value}</p>
                      <p className="text-xs text-charcoal/50">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Hero image + floating cards */}
            <motion.div
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-[4/5] max-w-md mx-auto">
                {/* Main image */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-glass-xl">
                  <img
                    src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&h=1000&fit=crop&crop=top"
                    alt="Professional doctor"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/30 to-transparent" />
                </div>

                {/* Floating — Appointment card */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-12 top-16 glass-strong rounded-2xl p-4 shadow-glass-lg w-56"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden">
                      <img src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face" alt="Dr. Mitchell" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-charcoal">Dr. Sarah Mitchell</p>
                      <p className="text-xs text-charcoal/50">Cardiologist</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-charcoal/60">
                    <Clock size={11} className="text-forest" />
                    Tomorrow, 10:00 AM
                  </div>
                  <div className="mt-2 py-1.5 px-3 bg-forest/10 rounded-lg text-xs font-medium text-forest text-center">
                    Confirmed ✓
                  </div>
                </motion.div>

                {/* Floating — Rating card */}
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -right-10 bottom-24 glass-strong rounded-2xl p-4 shadow-glass-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={12} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs font-semibold text-charcoal">Outstanding care</p>
                  <p className="text-xs text-charcoal/50 mt-0.5">312 reviews</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-xs text-charcoal/40">Scroll to explore</span>
          <ChevronDown size={16} className="text-charcoal/30" />
        </motion.div>
      </section>

      {/* ========== STATS SECTION ========== */}
      <Section className="py-16 bg-forest text-white">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 12840, suffix: '+', label: 'Patients Served', icon: Users },
              { value: 284, suffix: '', label: 'Verified Doctors', icon: Award },
              { value: 48392, suffix: '+', label: 'Appointments Completed', icon: Calendar },
              { value: 98, suffix: '%', label: 'Patient Satisfaction', icon: Heart },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-3">
                  <stat.icon size={18} className="text-sage" />
                </div>
                <p className="font-serif text-3xl font-bold text-white mb-1">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-sage/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== SPECIALTIES SECTION ========== */}
      <Section className="section-padding" id="specialties">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="sage" className="mb-4">Medical Specialties</Badge>
            <h2 className="font-serif text-display-sm md:text-display-md text-charcoal mb-4">
              Find care for every need
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              Browse across 20+ medical specialties. Our verified specialists cover the full spectrum of healthcare.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {SPECIALTIES.map((specialty, i) => (
              <motion.div
                key={specialty.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link
                  to={`/doctors?specialty=${specialty.id}`}
                  className="group flex flex-col items-center p-4 rounded-2xl bg-white border border-black/5 hover:border-forest/15 hover:shadow-card-hover transition-all duration-200 text-center"
                >
                  <span className="text-2xl mb-2">{specialty.icon}</span>
                  <span className="text-xs font-semibold text-charcoal group-hover:text-forest transition-colors leading-tight">
                    {specialty.name}
                  </span>
                  <span className="text-xs text-charcoal/40 mt-0.5">{specialty.doctorCount} doctors</span>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link to="/specialties">
              <Button variant="secondary" iconRight={<ArrowRight size={15} />}>
                View all specialties
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* ========== FEATURED DOCTORS ========== */}
      <Section className="section-padding bg-ivory-200" id="doctors">
        <div className="section-container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <Badge variant="sage" className="mb-4">Featured Physicians</Badge>
              <h2 className="font-serif text-display-sm md:text-display-md text-charcoal">
                Meet our top doctors
              </h2>
              <p className="text-charcoal/60 mt-3 max-w-xl">
                Handpicked specialists with exceptional credentials, outstanding patient reviews, and proven expertise.
              </p>
            </div>
            <Link to="/doctors">
              <Button variant="secondary" iconRight={<ArrowRight size={15} />}>
                See all doctors
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {DOCTORS.slice(0, 4).map((doctor, i) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <DoctorCard doctor={doctor} layout="grid" />
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== HOW IT WORKS ========== */}
      <Section className="section-padding" id="how-it-works">
        <div className="section-container">
          <div className="text-center mb-16">
            <Badge variant="forest" className="mb-4">How It Works</Badge>
            <h2 className="font-serif text-display-sm md:text-display-md text-charcoal mb-4">
              Book your appointment in minutes
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              A seamless, three-step process designed around your convenience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: Search,
                title: 'Find your doctor',
                description: 'Search by specialty, location, or doctor name. Filter by availability, fees, and ratings to find your perfect match.',
                color: 'bg-blue-50 text-blue-600',
              },
              {
                step: '02',
                icon: Calendar,
                title: 'Book your slot',
                description: 'Choose between online video consultation or in-person visit. Select your preferred date and time slot instantly.',
                color: 'bg-forest/10 text-forest',
              },
              {
                step: '03',
                icon: Video,
                title: 'Get quality care',
                description: 'Connect with your doctor via our secure platform. Access prescriptions, records, and follow-up care all in one place.',
                color: 'bg-amber-50 text-amber-600',
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative"
              >
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full border-t-2 border-dashed border-black/10 -translate-x-4 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10 p-6 bg-white rounded-2xl border border-black/5 shadow-card">
                  <div className="flex items-center gap-4 mb-5">
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center`}>
                      <step.icon size={22} />
                    </div>
                    <span className="font-serif text-3xl font-bold text-black/8">{step.step}</span>
                  </div>
                  <h3 className="font-semibold text-charcoal text-base mb-2">{step.title}</h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== WHY CHOOSE US ========== */}
      <Section className="section-padding bg-forest text-white overflow-hidden">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-sage/20 text-sage mb-6">Why MediConnect</Badge>
              <h2 className="font-serif text-display-sm md:text-display-md text-white mb-6 leading-tight">
                Healthcare you can trust, delivered with care
              </h2>
              <p className="text-sage/80 text-lg leading-relaxed mb-10">
                We built MediConnect with one goal: making exceptional healthcare accessible to everyone, everywhere.
              </p>

              <div className="space-y-5">
                {[
                  { icon: Shield, title: 'Fully verified doctors', desc: 'Every physician is license-verified with credential checks before listing.' },
                  { icon: Clock, title: 'Available 24/7', desc: 'Find and book appointments any time — including evenings and weekends.' },
                  { icon: Video, title: 'Online & in-person', desc: 'Choose how you want to consult — from anywhere or at the clinic.' },
                  { icon: Zap, title: 'Instant confirmations', desc: 'Your booking is confirmed immediately, with reminders before your visit.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                      <item.icon size={18} className="text-sage" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm mb-0.5">{item.title}</h4>
                      <p className="text-sm text-sage/70">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden shadow-glass-xl aspect-[3/4]">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=800&fit=crop"
                  alt="Doctor consulting patient"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="glass-dark rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=100&h=100&fit=crop&crop=face" alt="Dr" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Dr. Emily Rodriguez</p>
                        <p className="text-xs text-sage/80">Pediatrician · 4.9 ★</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/70">"MediConnect makes it effortless to focus on what matters most — caring for my patients."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ========== TESTIMONIALS ========== */}
      <Section className="section-padding">
        <div className="section-container">
          <div className="text-center mb-12">
            <Badge variant="sage" className="mb-4">Patient Stories</Badge>
            <h2 className="font-serif text-display-sm md:text-display-md text-charcoal mb-4">
              Trusted by thousands
            </h2>
            <p className="text-charcoal/60 max-w-xl mx-auto">
              Real experiences from patients who've transformed their healthcare journey with MediConnect.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-black/5 shadow-card p-6 flex flex-col"
              >
                <div className="flex mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-charcoal/70 leading-relaxed flex-1 mb-5">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center gap-3 pt-5 border-t border-black/5">
                  <Avatar src={testimonial.avatar} alt={testimonial.name} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-charcoal">{testimonial.name}</p>
                    <p className="text-xs text-charcoal/50">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ========== FAQ SECTION ========== */}
      <Section className="section-padding bg-ivory-200">
        <div className="section-container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Badge variant="sage" className="mb-4">FAQ</Badge>
              <h2 className="font-serif text-display-sm text-charcoal mb-4">
                Common questions
              </h2>
            </div>
            <div className="bg-white rounded-2xl border border-black/5 shadow-card px-6 py-2">
              {faqs.map((faq) => (
                <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ========== CTA SECTION ========== */}
      <Section className="section-padding">
        <div className="section-container">
          <div className="relative bg-forest rounded-3xl overflow-hidden px-8 py-16 md:py-20 text-center">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-sage" />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-sage" />
            </div>
            <div className="relative z-10">
              <h2 className="font-serif text-display-md text-white mb-4">
                Ready to take control of your health?
              </h2>
              <p className="text-sage/80 text-lg mb-8 max-w-xl mx-auto">
                Join over 12,000 patients who've already discovered a better way to access healthcare.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register/patient">
                  <Button variant="sage" size="xl">
                    Get Started — It's Free
                  </Button>
                </Link>
                <Link to="/doctors">
                  <Button size="xl" className="bg-white/15 text-white border border-white/20 hover:bg-white/25">
                    Browse Doctors
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
};
