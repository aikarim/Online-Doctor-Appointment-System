import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Stethoscope,
  HeartPulse,
  Brain,
  Sparkles,
  Baby,
  Bone,
  Eye,
  Activity,
  ShieldCheck,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Building2,
  Award,
  Users,
} from 'lucide-react';
import { PublicLayout } from '../components/layout';
import { Button, Input, Textarea, Card, Badge } from '../components/ui';
import { usePlatformStore } from '../store';
import { sounds } from '../utils/sounds';

const ICON_MAP: Record<string, React.ElementType> = {
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

// ---- 4. Medical Specialties Page ----
export const SpecialtiesPage: React.FC = () => {
  const { specialties, doctors } = usePlatformStore();

  return (
    <PublicLayout>
      <section className="bg-forest text-white pt-28 pb-14">
        <div className="section-container">
          <p className="text-xs font-mono uppercase tracking-widest text-sage mb-2">
            Clinical Taxonomy
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
            Medical Specialties & Departments
          </h1>
          <p className="text-sm text-sage/85 max-w-2xl">
            Explore our multi-disciplinary departments staffed by board-certified attending physicians and researchers.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {specialties.map((spec) => {
              const Icon = ICON_MAP[spec.icon] || Stethoscope;
              const matchingDocs = doctors.filter((d) => d.specialtyId === spec.id);
              return (
                <Card key={spec.id} className="flex flex-col justify-between p-7">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                        <Icon size={22} />
                      </div>
                      <span className="text-xs font-mono text-charcoal/55 tabular-nums">
                        {spec.doctorCount} Specialists
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-charcoal mb-2">
                      {spec.name}
                    </h2>
                    <p className="text-sm text-charcoal/65 leading-relaxed mb-5">
                      {spec.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-charcoal/8 flex items-center justify-between">
                    <span className="text-xs text-charcoal/55">
                      {matchingDocs.length > 0
                        ? `Lead: Dr. ${matchingDocs[0].lastName}`
                        : 'Available Today'}
                    </span>
                    <Link to={`/doctors?specialty=${spec.id}`}>
                      <Button variant="secondary" size="sm" iconRight={<ArrowRight size={14} />}>
                        View Doctors
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

// ---- 5. About Us Page ----
export const AboutPage: React.FC = () => {
  return (
    <PublicLayout>
      <section className="bg-forest text-white pt-28 pb-16">
        <div className="section-container">
          <p className="text-xs font-mono uppercase tracking-widest text-sage mb-2">
            Our Mission & Clinical Standards
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl text-white max-w-3xl leading-tight mb-4">
            Elevating access to extraordinary physicians through thoughtful technology.
          </h1>
          <p className="text-base text-sage/85 max-w-2xl leading-relaxed">
            Founded in New York by physicians and clinical systems architects, MediConnect eliminates administrative friction between patients and board-certified specialists.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container space-y-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                icon: ShieldCheck,
                title: 'Rigorous Credentialing',
                desc: 'Only fewer than 8% of applying physicians pass our clinical governance board verification, ensuring every listed doctor holds active board certification and hospital privileges.',
              },
              {
                icon: Building2,
                title: 'Academic Medical Affiliates',
                desc: 'Our specialists practice at premier institutions including Mount Sinai, NYU Langone, Weill Cornell, and Hospital for Special Surgery.',
              },
              {
                icon: Users,
                title: 'Longitudinal Continuity',
                desc: 'Whether you consult online via encrypted video or visit a Manhattan suite in person, your diagnostic records and prescriptions stay unified.',
              },
            ].map((item) => (
              <Card key={item.title} padding="lg">
                <div className="w-11 h-11 rounded-xl bg-forest/10 text-forest flex items-center justify-center mb-4">
                  <item.icon size={20} />
                </div>
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-2">
                  {item.title}
                </h2>
                <p className="text-sm text-charcoal/65 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-charcoal/8 p-8 sm:p-12 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <Badge variant="verified">Clinical Advisory Board</Badge>
              <h2 className="font-serif text-2xl sm:text-3xl text-charcoal">
                Experience healthcare designed with clinical precision
              </h2>
              <p className="text-sm text-charcoal/65 leading-relaxed max-w-2xl">
                Browse our directory of 284+ specialists or register your patient profile to manage appointments, lab history, and prescriptions in one place.
              </p>
            </div>
            <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
              <Link to="/doctors">
                <Button variant="secondary" size="lg">
                  Explore Doctors
                </Button>
              </Link>
              <Link to="/book">
                <Button variant="primary" size="lg">
                  Book Appointment
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

// ---- 6. Contact Us Page ----
export const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    topic: 'Patient Concierge & Scheduling',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrs: Record<string, string> = {};
    if (!form.name.trim()) nextErrs.name = 'Full name is required.';
    if (!form.email.trim() || !form.email.includes('@'))
      nextErrs.email = 'Valid email address is required.';
    if (!form.message.trim() || form.message.trim().length < 10)
      nextErrs.message = 'Please enter a message of at least 10 characters.';

    if (Object.keys(nextErrs).length > 0) {
      setErrors(nextErrs);
      sounds.error();
      return;
    }

    setErrors({});
    sounds.confirm();
    setSubmitted(true);
  };

  return (
    <PublicLayout>
      <section className="bg-forest text-white pt-28 pb-14">
        <div className="section-container">
          <p className="text-xs font-mono uppercase tracking-widest text-sage mb-2">
            24/7 Patient & Physician Concierge
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
            Contact MediConnect
          </h1>
          <p className="text-sm text-sage/85 max-w-xl">
            Our dedicated care coordinators assist with specialist matching, insurance verification, and institutional onboarding.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <h2 className="font-serif text-xl font-semibold text-charcoal mb-4">
                  Direct Concierge Channels
                </h2>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">Telephone Triage & Support</p>
                      <p className="text-xs text-charcoal/60 font-mono mt-0.5">
                        +1 (800) 555-MEDI · Mon–Sun, 7:00 AM – 11:00 PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">Clinical Concierge Desk</p>
                      <p className="text-xs text-charcoal/60 font-mono mt-0.5">
                        concierge@mediconnect.health
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0">
                      <MapPin size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal">Flagship Headquarters</p>
                      <p className="text-xs text-charcoal/60 mt-0.5">
                        740 Park Avenue, Suite 400, New York, NY 10021
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-forest text-white border-0">
                <Award size={22} className="text-sage mb-3" />
                <h3 className="font-serif text-lg font-semibold text-white mb-1.5">
                  Are you a board-certified specialist?
                </h3>
                <p className="text-xs text-sage/85 leading-relaxed mb-4">
                  Join our verified physician network to manage your private practice and telemedicine consultations.
                </p>
                <Link to="/register/doctor">
                  <Button variant="sage" size="sm" className="bg-sage text-forest hover:bg-sage-200">
                    Apply for Physician Verification
                  </Button>
                </Link>
              </Card>
            </div>

            <div className="lg:col-span-7">
              <Card padding="lg">
                {submitted ? (
                  <div className="py-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                      <CheckCircle2 size={28} />
                    </div>
                    <h2 className="font-serif text-2xl font-semibold text-charcoal">
                      Inquiry Received
                    </h2>
                    <p className="text-sm text-charcoal/65 max-w-md mx-auto">
                      Thank you, <strong>{form.name}</strong>. A MediConnect care coordinator will respond to <strong>{form.email}</strong> within 2 business hours.
                    </p>
                    <Button variant="secondary" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <h2 className="font-serif text-2xl font-semibold text-charcoal">
                      Send a Message to Our Care Team
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name"
                        placeholder="Eleanor Vance"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        error={errors.name}
                      />
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="eleanor@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={errors.email}
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Phone Number (Optional)"
                        placeholder="+1 (212) 555-0194"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                      <div>
                        <label
                          htmlFor="contact-topic"
                          className="block text-sm font-medium text-charcoal mb-1.5"
                        >
                          Inquiry Department
                        </label>
                        <select
                          id="contact-topic"
                          value={form.topic}
                          onChange={(e) => setForm({ ...form, topic: e.target.value })}
                          className="w-full bg-white border border-charcoal/12 rounded-xl px-4 py-2.5 text-sm text-charcoal min-h-[42px]"
                        >
                          <option>Patient Concierge & Scheduling</option>
                          <option>Physician Credentialing & Onboarding</option>
                          <option>Medical Records & Prescriptions</option>
                          <option>Billing & Insurance Verification</option>
                        </select>
                      </div>
                    </div>
                    <Textarea
                      label="How can we assist you?"
                      rows={4}
                      placeholder="Please share details about your scheduling request or question..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      error={errors.message}
                    />
                    <Button type="submit" variant="primary" size="lg">
                      Submit Inquiry
                    </Button>
                  </form>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};
