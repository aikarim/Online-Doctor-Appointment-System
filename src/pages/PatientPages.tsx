import React, { useState, useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  FileText,
  Pill,
  Heart,
  Bell,
  User,
  CheckCircle2,
  ArrowRight,
  Search,
  Download,
  RefreshCw,
  XCircle,
  Activity,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, addDays } from 'date-fns';
import {
  usePlatformStore,
  useAuthStore,
  useNotificationsStore,
  useUIStore,
} from '../store';
import {
  Button,
  Card,
  Input,
  Badge,
  Avatar,
  Modal,
  EmptyState,
  ThemeToggle,
} from '../components/ui';
import { DoctorCard } from '../components/doctors/DoctorCard';
import { formatCurrency, cn } from '../utils';
import { sounds } from '../utils/sounds';
import type { Prescription } from '../types';

const WELLNESS_TREND_DATA = [
  { month: 'Oct', systolic: 118, heartRate: 68, wellnessScore: 91 },
  { month: 'Nov', systolic: 116, heartRate: 66, wellnessScore: 93 },
  { month: 'Dec', systolic: 117, heartRate: 65, wellnessScore: 94 },
  { month: 'Jan', systolic: 115, heartRate: 64, wellnessScore: 95 },
  { month: 'Feb', systolic: 114, heartRate: 64, wellnessScore: 96 },
  { month: 'Mar', systolic: 114, heartRate: 62, wellnessScore: 98 },
];

// ============================================================================
// PAGE 11: PATIENT DASHBOARD
// ============================================================================
export const PatientDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const {
    appointments,
    prescriptions,
    medicalRecords,
    doctors,
    savedDoctorIds,
  } = usePlatformStore();

  const upcomingAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => a.status === 'confirmed' || a.status === 'pending'
      ),
    [appointments]
  );

  const activePrescriptions = useMemo(
    () => prescriptions.filter((p) => p.status === 'active'),
    [prescriptions]
  );

  const savedDoctors = useMemo(
    () => doctors.filter((d) => savedDoctorIds.includes(d.id)),
    [doctors, savedDoctorIds]
  );

  const latestVitals = medicalRecords[0]?.vitalSigns || {
    bp: '114/74 mmHg',
    heartRate: '62 bpm',
    temp: '98.4 °F',
    weight: '134 lbs',
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
            Patient Clinical Portal
          </span>
          <h1 className="font-serif text-3xl text-charcoal mt-1">
            Welcome back, {user?.firstName || 'Eleanor'}
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Your longitudinal health metrics, upcoming consultations, and active prescriptions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/doctors">
            <Button variant="secondary">Explore Specialists</Button>
          </Link>
          <Link to="/book">
            <Button icon={<Calendar size={16} />}>Book Appointment</Button>
          </Link>
        </div>
      </div>

      {/* Vital Metrics Row (Max 4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Blood Pressure</span>
            <Activity size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {latestVitals.bp}
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-1">Optimal Clinical Range</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Resting Heart Rate</span>
            <Heart size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {latestVitals.heartRate}
          </p>
          <p className="text-xs text-charcoal/55 mt-1">Last recorded by Dr. Mitchell</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Upcoming Visits</span>
            <Calendar size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {upcomingAppointments.length}
          </p>
          <p className="text-xs text-charcoal/55 mt-1">
            Next: {upcomingAppointments[0]?.date || 'None scheduled'}
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Active Prescriptions</span>
            <Pill size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {activePrescriptions.length}
          </p>
          <p className="text-xs text-charcoal/55 mt-1">All refills up to date</p>
        </Card>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-7 space-y-4">
          <Card padding="md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">Upcoming Consultations</h2>
                <p className="text-xs text-charcoal/55">
                  Confirmed private clinic and telehealth appointments
                </p>
              </div>
              <Link
                to="/patient/appointments"
                className="text-xs font-semibold text-forest hover:underline inline-flex items-center gap-1"
              >
                View All <ArrowRight size={13} />
              </Link>
            </div>

            {upcomingAppointments.length === 0 ? (
              <EmptyState
                title="No Upcoming Appointments"
                description="Schedule a consultation with one of our verified specialists."
                action={
                  <Link to="/book">
                    <Button size="sm">Schedule Now</Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.slice(0, 3).map((apt) => (
                  <div
                    key={apt.appointmentCode}
                    className="p-4 rounded-2xl border border-charcoal/8 bg-ivory/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <Avatar src={apt.doctorAvatar} alt={apt.doctorName} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-charcoal">{apt.doctorName}</h3>
                          <Badge variant={apt.status}>{apt.status}</Badge>
                        </div>
                        <p className="text-xs text-charcoal/60 mt-0.5">
                          {apt.doctorSpecialty} · {apt.hospital}
                        </p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-charcoal/70">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-forest" />
                            {apt.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-forest" />
                            {apt.time} EST
                          </span>
                          <span className="capitalize">· {apt.consultationType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link to={`/patient/appointments/${apt.appointmentCode}`}>
                        <Button variant="secondary" size="sm">
                          Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Cardiovascular & Wellness Trend Chart */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">
                  Cardiovascular & Wellness Index
                </h2>
                <p className="text-xs text-charcoal/55">
                  6-month longitudinal systolic blood pressure (mmHg) & resting heart rate
                </p>
              </div>
              <Badge variant="verified">Normal Sinus Rhythm</Badge>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WELLNESS_TREND_DATA}>
                  <defs>
                    <linearGradient id="forestGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isDark ? '#6EE7C8' : '#123C32'}
                        stopOpacity={0.28}
                      />
                      <stop
                        offset="95%"
                        stopColor={isDark ? '#6EE7C8' : '#123C32'}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(236,244,241,0.08)' : 'rgba(32,39,36,0.06)'}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: isDark ? '#9BB5AC' : '#5A6560' }}
                  />
                  <YAxis
                    domain={[55, 130]}
                    tick={{ fontSize: 12, fill: isDark ? '#9BB5AC' : '#5A6560' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? 'rgba(13, 33, 28, 0.92)' : '#FFFFFF',
                      color: isDark ? '#ECF4F1' : '#202724',
                      borderRadius: '12px',
                      border: isDark
                        ? '1px solid rgba(168,185,170,0.2)'
                        : '1px solid rgba(32,39,36,0.1)',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke={isDark ? '#6EE7C8' : '#123C32'}
                    strokeWidth={2}
                    fill="url(#forestGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="heartRate"
                    name="Heart Rate (bpm)"
                    stroke={isDark ? '#A8B9AA' : '#2A6D62'}
                    strokeWidth={2}
                    fillOpacity={0}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Right Column: Active Medications & Saved Specialists */}
        <div className="lg:col-span-5 space-y-6">
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-charcoal">Active Medications</h2>
              <Link
                to="/patient/prescriptions"
                className="text-xs font-semibold text-forest hover:underline"
              >
                All Prescriptions
              </Link>
            </div>
            <div className="space-y-3">
              {activePrescriptions.slice(0, 2).map((rx) => (
                <div
                  key={rx.prescriptionCode}
                  className="p-4 rounded-xl bg-ivory/60 border border-charcoal/8"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-semibold text-forest">
                      {rx.prescriptionCode}
                    </span>
                    <Badge variant="confirmed">Active</Badge>
                  </div>
                  <p className="text-sm font-semibold text-charcoal">{rx.diagnosis}</p>
                  <p className="text-xs text-charcoal/55 mt-0.5">Prescribed by {rx.doctorName}</p>
                  <div className="mt-3 pt-2.5 border-t border-charcoal/8 space-y-1.5">
                    {rx.medications.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="font-medium text-charcoal">
                          {m.name} ({m.dosage})
                        </span>
                        <span className="text-charcoal/60">{m.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-charcoal">Saved Care Team</h2>
              <Link
                to="/patient/saved-doctors"
                className="text-xs font-semibold text-forest hover:underline"
              >
                Manage
              </Link>
            </div>
            <div className="space-y-3">
              {savedDoctors.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-charcoal/8 hover:border-forest/25 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={doc.avatar}
                      alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                      size="md"
                    />
                    <div>
                      <h3 className="text-sm font-semibold text-charcoal">
                        Dr. {doc.firstName} {doc.lastName}
                      </h3>
                      <p className="text-xs text-charcoal/55">{doc.specialty}</p>
                    </div>
                  </div>
                  <Link to={`/book?doctor=${doc.id}`}>
                    <Button size="sm" variant="secondary">
                      Book
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 13: MY APPOINTMENTS
// ============================================================================
export const MyAppointmentsPage: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    rescheduleAppointment,
  } = usePlatformStore();

  const [tab, setTab] = useState<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');
  const [rescheduleTarget, setRescheduleTarget] = useState<string | null>(null);
  const [newDate, setNewDate] = useState(format(addDays(new Date(), 3), 'yyyy-MM-dd'));
  const [newTime, setNewTime] = useState('10:30');

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesTab =
        tab === 'all' ||
        (tab === 'confirmed' && (a.status === 'confirmed' || a.status === 'pending')) ||
        a.status === tab;
      const matchesSearch =
        !search.trim() ||
        a.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        a.doctorSpecialty.toLowerCase().includes(search.toLowerCase()) ||
        a.appointmentCode.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [appointments, tab, search]);

  const handleConfirmReschedule = async () => {
    if (!rescheduleTarget) return;
    await rescheduleAppointment(rescheduleTarget, newDate, newTime);
    sounds.confirm();
    setRescheduleTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">My Appointments</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Manage upcoming visits, launch video consultations, or reschedule.
          </p>
        </div>
        <Link to="/book">
          <Button icon={<Calendar size={16} />}>Book New Appointment</Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-charcoal/8">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'confirmed', 'completed', 'cancelled'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                sounds.click();
                setTab(t);
              }}
              className={cn(
                'px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer',
                tab === t
                  ? 'bg-forest text-white'
                  : 'text-charcoal/65 hover:bg-charcoal/5'
              )}
            >
              {t === 'confirmed' ? 'Upcoming' : t}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search by doctor or reference ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>
      </div>

      {/* Appointments List */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No Matching Appointments"
          description="No appointments match your current filter criteria."
          action={
            <Link to="/book">
              <Button size="sm">Schedule Consultation</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <Card key={apt.appointmentCode} padding="md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Avatar src={apt.doctorAvatar} alt={apt.doctorName} size="lg" />
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-forest">
                        {apt.appointmentCode}
                      </span>
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </div>
                    <h3 className="text-base font-semibold text-charcoal mt-1">
                      {apt.doctorName}
                    </h3>
                    <p className="text-xs text-charcoal/60">
                      {apt.doctorSpecialty} · {apt.hospital}
                    </p>
                    <p className="text-xs text-charcoal/70 mt-2">
                      <span className="font-medium">Reason:</span> {apt.reason}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-charcoal/8">
                  <div className="text-left md:text-right">
                    <div className="text-sm font-mono font-semibold text-charcoal">
                      {apt.date} · {apt.time} EST
                    </div>
                    <div className="text-xs text-charcoal/55 capitalize mt-0.5">
                      {apt.consultationType} · {formatCurrency(apt.fee)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Link to={`/patient/appointments/${apt.appointmentCode}`}>
                      <Button variant="secondary" size="sm">
                        View Pass
                      </Button>
                    </Link>
                    {(apt.status === 'confirmed' || apt.status === 'pending') && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<RefreshCw size={13} />}
                          onClick={() => setRescheduleTarget(apt.appointmentCode)}
                        >
                          Reschedule
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          icon={<XCircle size={13} />}
                          onClick={() => {
                            sounds.error();
                            updateAppointmentStatus(apt.appointmentCode, 'cancelled');
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reschedule Modal */}
      <Modal
        isOpen={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Consultation"
        description={`Select a new date and time for appointment ${rescheduleTarget}.`}
      >
        <div className="space-y-4">
          <Input
            label="New Date"
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Select Time Slot (EST)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['09:00', '10:00', '10:30', '11:30', '14:00', '15:30'].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setNewTime(slot)}
                  className={cn(
                    'py-2.5 rounded-xl font-mono text-xs font-semibold border transition-colors cursor-pointer',
                    newTime === slot
                      ? 'bg-forest text-white border-forest'
                      : 'bg-white border-charcoal/12 text-charcoal hover:border-forest/40'
                  )}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setRescheduleTarget(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmReschedule}>Confirm New Schedule</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGE 14: APPOINTMENT DETAILS
// ============================================================================
export const AppointmentDetailsPage: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { appointments, updateAppointmentStatus } = usePlatformStore();
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const appointment = useMemo(
    () =>
      appointments.find(
        (a) => a.appointmentCode === appointmentId || a.id === appointmentId
      ) || appointments[0],
    [appointments, appointmentId]
  );

  if (!appointment) {
    return (
      <EmptyState
        title="Appointment Not Found"
        description="We could not locate that appointment record."
        action={<Button onClick={() => navigate('/patient/appointments')}>Back to List</Button>}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/patient/appointments"
            className="text-xs font-semibold text-forest hover:underline"
          >
            ← Back to My Appointments
          </Link>
          <h1 className="font-serif text-3xl text-charcoal mt-1">
            Clinical Appointment Pass
          </h1>
        </div>
        <Badge variant={appointment.status}>{appointment.status}</Badge>
      </div>

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-charcoal/8">
          <div className="flex items-center gap-4">
            <Avatar src={appointment.doctorAvatar} alt={appointment.doctorName} size="xl" />
            <div>
              <span className="text-xs font-mono font-semibold text-forest">
                Reference #{appointment.appointmentCode}
              </span>
              <h2 className="text-xl font-semibold text-charcoal mt-0.5">
                {appointment.doctorName}
              </h2>
              <p className="text-sm text-charcoal/60">
                {appointment.doctorSpecialty} · {appointment.hospital}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-charcoal/50 block">Consultation Fee</span>
            <span className="text-2xl font-mono font-bold text-forest tabular-nums">
              {formatCurrency(appointment.fee)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-b border-charcoal/8 text-sm">
          <div>
            <span className="text-xs text-charcoal/50 block">Scheduled Date</span>
            <span className="font-mono font-semibold text-charcoal">{appointment.date}</span>
          </div>
          <div>
            <span className="text-xs text-charcoal/50 block">Scheduled Time</span>
            <span className="font-mono font-semibold text-charcoal">{appointment.time} EST</span>
          </div>
          <div>
            <span className="text-xs text-charcoal/50 block">Consultation Format</span>
            <span className="font-semibold text-charcoal capitalize">
              {appointment.consultationType}
            </span>
          </div>
          <div>
            <span className="text-xs text-charcoal/50 block">Patient Name</span>
            <span className="font-semibold text-charcoal">{appointment.patientName}</span>
          </div>
          <div>
            <span className="text-xs text-charcoal/50 block">Patient Email</span>
            <span className="text-charcoal">{appointment.patientEmail}</span>
          </div>
          <div>
            <span className="text-xs text-charcoal/50 block">Patient Phone</span>
            <span className="font-mono text-charcoal">{appointment.patientPhone}</span>
          </div>
        </div>

        <div className="py-6 space-y-4 text-sm">
          <div>
            <span className="text-xs text-charcoal/50 block mb-1">Reason for Consultation</span>
            <p className="text-charcoal font-medium">{appointment.reason}</p>
          </div>
          {appointment.symptoms && (
            <div>
              <span className="text-xs text-charcoal/50 block mb-1">Reported Symptoms</span>
              <p className="text-charcoal/80">{appointment.symptoms}</p>
            </div>
          )}
          {appointment.notes && (
            <div>
              <span className="text-xs text-charcoal/50 block mb-1">Physician Clinical Notes</span>
              <p className="text-charcoal/80">{appointment.notes}</p>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-charcoal/8 flex flex-wrap items-center justify-between gap-3">
          {appointment.consultationType === 'online' && appointment.status === 'confirmed' ? (
            <Button icon={<Video size={16} />} onClick={() => setVideoModalOpen(true)}>
              Launch Encrypted Telehealth Room
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs text-charcoal/60">
              <MapPin size={14} className="text-forest" />
              <span>Arrive 15 minutes prior at {appointment.hospital}</span>
            </div>
          )}

          {appointment.status === 'confirmed' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => updateAppointmentStatus(appointment.appointmentCode, 'cancelled')}
            >
              Cancel Appointment
            </Button>
          )}
        </div>
      </Card>

      <Modal
        isOpen={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        title="MediConnect Encrypted Telehealth Room"
        description={`Room ID: ${appointment.appointmentCode} · Attending: ${appointment.doctorName}`}
      >
        <div className="space-y-4">
          <div className="aspect-video rounded-2xl bg-forest text-white flex flex-col items-center justify-center p-6 text-center">
            <Video size={36} className="text-sage mb-3" />
            <h3 className="text-lg font-semibold">Camera & Microphone Ready</h3>
            <p className="text-xs text-white/75 max-w-sm mt-1">
              {appointment.doctorName} will join the encrypted consultation room at{' '}
              {appointment.time} EST.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setVideoModalOpen(false)}>Close Preview</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGE 15: MEDICAL HISTORY
// ============================================================================
export const MedicalHistoryPage: React.FC = () => {
  const { medicalRecords, patientProfile } = usePlatformStore();
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    if (typeFilter === 'ALL') return medicalRecords;
    return medicalRecords.filter((r) => r.recordType === typeFilter);
  }, [medicalRecords, typeFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Longitudinal Medical History</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Verified clinical summaries, diagnostic laboratory panels, and vital sign logs.
        </p>
      </div>

      {/* Patient Baseline Summary */}
      <Card padding="md" className="bg-forest text-white">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-xs text-white/60 block">Blood Type</span>
            <span className="font-mono text-lg font-bold">{patientProfile.bloodGroup}</span>
          </div>
          <div>
            <span className="text-xs text-white/60 block">Known Allergies</span>
            <span className="font-medium">{patientProfile.allergies || 'None'}</span>
          </div>
          <div>
            <span className="text-xs text-white/60 block">Chronic Conditions</span>
            <span className="font-medium">{patientProfile.chronicConditions || 'None'}</span>
          </div>
          <div>
            <span className="text-xs text-white/60 block">Primary Insurance</span>
            <span className="font-medium">{patientProfile.insuranceProvider}</span>
          </div>
        </div>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {['ALL', 'Consultation', 'Lab Result', 'Imaging', 'Vaccination'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTypeFilter(t)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer',
              typeFilter === t
                ? 'bg-forest text-white'
                : 'bg-white border border-charcoal/8 text-charcoal/70 hover:bg-charcoal/5'
            )}
          >
            {t === 'ALL' ? 'All Clinical Records' : t}
          </button>
        ))}
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filtered.map((rec) => (
          <Card key={rec.id} padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-charcoal/8">
              <div className="flex items-center gap-3">
                <Badge variant="forest">{rec.recordType}</Badge>
                <h3 className="text-base font-semibold text-charcoal">{rec.title}</h3>
              </div>
              <span className="text-xs font-mono text-charcoal/55">{rec.recordDate}</span>
            </div>

            <p className="text-sm text-charcoal/80 mt-3 leading-relaxed">{rec.summary}</p>

            <div className="mt-4 pt-3 border-t border-charcoal/8 flex flex-wrap items-center justify-between gap-4 text-xs text-charcoal/60">
              <span>
                Attending: <strong className="text-charcoal">{rec.doctorName}</strong> ({rec.specialty})
              </span>
              <div className="flex items-center gap-4 font-mono">
                <span>BP: {rec.vitalSigns.bp}</span>
                <span>HR: {rec.vitalSigns.heartRate}</span>
                <span>Temp: {rec.vitalSigns.temp}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 16: PRESCRIPTIONS
// ============================================================================
export const PrescriptionsPage: React.FC = () => {
  const { prescriptions } = usePlatformStore();
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Digital Prescriptions</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Active medications, dosage instructions, and pharmacy-ready clinical scripts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {prescriptions.map((rx) => (
          <Card key={rx.prescriptionCode} padding="md" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-charcoal/8">
                <span className="font-mono text-xs font-bold text-forest">
                  {rx.prescriptionCode}
                </span>
                <Badge variant={rx.status === 'active' ? 'confirmed' : 'completed'}>
                  {rx.status}
                </Badge>
              </div>

              <h3 className="text-lg font-semibold text-charcoal mt-3">{rx.diagnosis}</h3>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Prescribed by {rx.doctorName} ({rx.doctorSpecialty})
              </p>

              <div className="mt-4 space-y-2.5">
                {rx.medications.map((med, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-ivory/70 border border-charcoal/8 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-charcoal">
                      <span>
                        {med.name} · {med.dosage}
                      </span>
                      <span className="font-mono text-forest">{med.duration}</span>
                    </div>
                    <p className="text-charcoal/65 mt-1">
                      {med.frequency} — {med.instructions}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-charcoal/8 flex items-center justify-between text-xs">
              <span className="text-charcoal/55 font-mono">Issued: {rx.issuedDate}</span>
              <Button
                variant="secondary"
                size="sm"
                icon={<Download size={13} />}
                onClick={() => setSelectedRx(rx)}
              >
                View Official Script
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedRx)}
        onClose={() => setSelectedRx(null)}
        title={`Official Clinical Prescription · ${selectedRx?.prescriptionCode}`}
        description={`Issued by ${selectedRx?.doctorName} on ${selectedRx?.issuedDate}`}
      >
        {selectedRx && (
          <div className="space-y-4 text-sm">
            <div className="p-4 rounded-xl bg-ivory border border-charcoal/10 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs text-charcoal/50">Patient</span>
                <span className="font-semibold">{selectedRx.patientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-charcoal/50">Diagnosis</span>
                <span className="font-semibold">{selectedRx.diagnosis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-charcoal/50">Valid Until</span>
                <span className="font-mono">{selectedRx.validUntil}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/55">
                Rx Medications
              </h4>
              {selectedRx.medications.map((m, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-charcoal/10">
                  <p className="font-semibold text-charcoal">
                    {m.name} {m.dosage} ({m.frequency})
                  </p>
                  <p className="text-xs text-charcoal/65 mt-0.5">{m.instructions}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-charcoal/60 italic">{selectedRx.instructions}</p>

            <div className="pt-3 flex justify-end">
              <Button onClick={() => setSelectedRx(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGE 17: SAVED DOCTORS
// ============================================================================
export const SavedDoctorsPage: React.FC = () => {
  const { doctors, savedDoctorIds } = usePlatformStore();

  const savedList = useMemo(
    () => doctors.filter((d) => savedDoctorIds.includes(d.id)),
    [doctors, savedDoctorIds]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Saved Specialists</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Your personal roster of bookmarked physicians for rapid scheduling.
          </p>
        </div>
        <Link to="/doctors">
          <Button variant="secondary">Browse Directory</Button>
        </Link>
      </div>

      {savedList.length === 0 ? (
        <EmptyState
          icon={<Heart size={32} />}
          title="No Saved Specialists Yet"
          description="Bookmark specialists while browsing the directory to build your personal care team."
          action={
            <Link to="/doctors">
              <Button>Explore Specialists</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedList.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} layout="grid" />
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// PAGE 18: NOTIFICATIONS
// ============================================================================
export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotificationsStore();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Clinical Notifications</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Appointment alerts, prescription updates, and platform communications.
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" size="sm" onClick={() => markAllAsRead()}>
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <Card
            key={n.id}
            padding="md"
            className={cn(
              'transition-colors',
              !n.isRead ? 'border-forest/30 bg-forest/[0.02]' : 'opacity-80'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5',
                    !n.isRead ? 'bg-forest text-white' : 'bg-charcoal/8 text-charcoal/55'
                  )}
                >
                  <Bell size={16} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-charcoal">{n.title}</h3>
                    {!n.isRead && <Badge variant="forest">New</Badge>}
                  </div>
                  <p className="text-sm text-charcoal/70 mt-1">{n.message}</p>
                  <span className="text-xs font-mono text-charcoal/45 block mt-2">
                    {n.createdAt}
                  </span>
                </div>
              </div>

              {!n.isRead && (
                <Button variant="ghost" size="sm" onClick={() => markAsRead(n.id)}>
                  Mark Read
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 19: PATIENT PROFILE & SETTINGS
// ============================================================================
export const PatientProfilePage: React.FC = () => {
  const { patientProfile, updatePatientProfile } = usePlatformStore();
  const { soundEnabled, toggleSound } = useUIStore();
  const [form, setForm] = useState(patientProfile);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePatientProfile(form);
    sounds.success();
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Patient Profile & Preferences</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Manage your personal health profile, insurance details, and interface settings.
          </p>
        </div>
        {savedBanner && <Badge variant="confirmed">Changes Saved to Cloud SQL</Badge>}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card padding="lg">
          <h2 className="text-lg font-semibold text-charcoal mb-4">Personal & Clinical Identity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            />
            <Input
              label="Blood Group"
              value={form.bloodGroup}
              onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
            />
            <Input
              label="Known Allergies"
              value={form.allergies}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            />
            <Input
              label="Chronic Conditions"
              value={form.chronicConditions}
              onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })}
            />
          </div>
        </Card>

        <Card padding="lg">
          <h2 className="text-lg font-semibold text-charcoal mb-4">
            Insurance & Emergency Contact
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Insurance Carrier"
              value={form.insuranceProvider}
              onChange={(e) => setForm({ ...form, insuranceProvider: e.target.value })}
            />
            <Input
              label="Policy / Member ID"
              value={form.insurancePolicyNumber}
              onChange={(e) => setForm({ ...form, insurancePolicyNumber: e.target.value })}
            />
            <Input
              label="Emergency Contact Name"
              value={form.emergencyContactName}
              onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
            />
            <Input
              label="Emergency Contact Phone"
              value={form.emergencyContactPhone}
              onChange={(e) => setForm({ ...form, emergencyContactPhone: e.target.value })}
            />
          </div>
        </Card>

        <Card padding="lg" className="space-y-5">
          <div className="flex items-center justify-between pb-5 border-b border-charcoal/10">
            <div>
              <h2 className="text-base font-semibold text-charcoal">
                Liquid Glass Theme Appearance
              </h2>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Switch smoothly between default Obsidian Dark Mode and Warm Ivory Light Mode.
              </p>
            </div>
            <ThemeToggle showLabel />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-charcoal">
                Tactile Sound Feedback
              </h2>
              <p className="text-xs text-charcoal/60 mt-0.5">
                Play subtle acoustic confirmation chimes on bookings, toggles, and actions.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              icon={soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              onClick={() => {
                toggleSound();
                sounds.toggle(!soundEnabled);
              }}
            >
              {soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
            </Button>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" size="lg" icon={<CheckCircle2 size={16} />}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
