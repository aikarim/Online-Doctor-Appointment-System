import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle,
  Search,
  Activity,
  FileText,
  Star,
  Video,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePlatformStore, useAuthStore, useUIStore } from '../store';
import {
  Button,
  Card,
  Input,
  Textarea,
  Badge,
  Avatar,
  Modal,
  EmptyState,
} from '../components/ui';
import { formatCurrency, cn } from '../utils';
import { sounds } from '../utils/sounds';
import type { DoctorAvailabilitySlot } from '../types';

const DOCTOR_EARNINGS_DATA = [
  { week: 'Wk 1', revenue: 4650, consultations: 19 },
  { week: 'Wk 2', revenue: 5200, consultations: 22 },
  { week: 'Wk 3', revenue: 4950, consultations: 20 },
  { week: 'Wk 4', revenue: 6100, consultations: 25 },
  { week: 'Wk 5', revenue: 5800, consultations: 24 },
  { week: 'Wk 6', revenue: 6450, consultations: 27 },
];

// ============================================================================
// PAGE 20: DOCTOR DASHBOARD
// ============================================================================
export const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const { doctors, appointments, updateAppointmentStatus } = usePlatformStore();

  const currentDoctor = useMemo(
    () =>
      doctors.find((d) => d.id === (user?.doctorSlug || 'dr-sarah-mitchell')) ||
      doctors[0],
    [doctors, user]
  );

  const doctorAppointments = useMemo(
    () =>
      appointments.filter(
        (a) => a.doctorId === currentDoctor.id || a.doctorName.includes(currentDoctor.lastName)
      ),
    [appointments, currentDoctor]
  );

  const pendingRequests = useMemo(
    () => doctorAppointments.filter((a) => a.status === 'pending' || a.status === 'confirmed'),
    [doctorAppointments]
  );

  const totalRevenue = useMemo(
    () =>
      doctorAppointments
        .filter((a) => a.status !== 'cancelled')
        .reduce((sum, a) => sum + a.fee, 0),
    [doctorAppointments]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
            Attending Physician Workspace · {currentDoctor.hospital}
          </span>
          <h1 className="font-serif text-3xl text-charcoal mt-1">
            Dr. {currentDoctor.firstName} {currentDoctor.lastName}
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            {currentDoctor.specialty} · License #{currentDoctor.licenseNumber}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/doctor/availability">
            <Button variant="secondary" icon={<Clock size={15} />}>
              Manage Hours
            </Button>
          </Link>
          <Link to="/doctor/appointments">
            <Button icon={<Calendar size={15} />}>All Appointments</Button>
          </Link>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Active Schedule</span>
            <Calendar size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {pendingRequests.length}
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-1">Upcoming consultations</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Total Patients Treated</span>
            <Users size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {currentDoctor.totalPatients.toLocaleString()}
          </p>
          <p className="text-xs text-charcoal/55 mt-1">98.4% follow-up retention</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Clinical Rating</span>
            <Star size={15} className="text-amber-500" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {currentDoctor.rating.toFixed(2)}
          </p>
          <p className="text-xs text-charcoal/55 mt-1">
            Across {currentDoctor.reviewCount} verified reviews
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Period Revenue</span>
            <DollarSign size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {formatCurrency(totalRevenue + 28400)}
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-1">+14.2% vs prior period</p>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upcoming Patient Queue */}
        <div className="lg:col-span-7">
          <Card padding="md">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">
                  Upcoming Consultation Queue
                </h2>
                <p className="text-xs text-charcoal/55">
                  Accept, complete, or manage incoming patient appointments
                </p>
              </div>
              <Link
                to="/doctor/appointments"
                className="text-xs font-semibold text-forest hover:underline"
              >
                Full Queue →
              </Link>
            </div>

            <div className="space-y-3">
              {doctorAppointments.slice(0, 5).map((apt) => (
                <div
                  key={apt.appointmentCode}
                  className="p-4 rounded-2xl border border-charcoal/8 bg-ivory/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-forest">
                        {apt.appointmentCode}
                      </span>
                      <Badge variant={apt.status}>{apt.status}</Badge>
                    </div>
                    <h3 className="text-sm font-semibold text-charcoal mt-1">
                      {apt.patientName}
                    </h3>
                    <p className="text-xs text-charcoal/60 mt-0.5">{apt.reason}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs font-mono text-charcoal/65">
                      <span>{apt.date}</span>
                      <span>· {apt.time} EST</span>
                      <span className="capitalize">· {apt.consultationType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {apt.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          sounds.confirm();
                          updateAppointmentStatus(apt.appointmentCode, 'confirmed');
                        }}
                      >
                        Accept
                      </Button>
                    )}
                    {apt.status === 'confirmed' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          sounds.success();
                          updateAppointmentStatus(apt.appointmentCode, 'completed');
                        }}
                      >
                        Mark Completed
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Weekly Practice Revenue Chart */}
        <div className="lg:col-span-5">
          <Card padding="md">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-charcoal">
                Weekly Practice Revenue
              </h2>
              <p className="text-xs text-charcoal/55">
                6-week consultation fee settlement overview (USD)
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DOCTOR_EARNINGS_DATA}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? 'rgba(236,244,241,0.08)' : 'rgba(32,39,36,0.06)'}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12, fill: isDark ? '#9BB5AC' : '#5A6560' }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: isDark ? '#9BB5AC' : '#5A6560' }} />
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
                  <Bar
                    dataKey="revenue"
                    name="Revenue ($)"
                    fill={isDark ? '#34D399' : '#123C32'}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 21: DOCTOR APPOINTMENT MANAGEMENT
// ============================================================================
export const DoctorAppointmentsPage: React.FC = () => {
  const { appointments, updateAppointmentStatus } = usePlatformStore();
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const matchesStatus = filter === 'all' || a.status === filter;
      const matchesQuery =
        !search.trim() ||
        a.patientName.toLowerCase().includes(search.toLowerCase()) ||
        a.appointmentCode.toLowerCase().includes(search.toLowerCase()) ||
        a.reason.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [appointments, filter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Appointment Management</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Review patient bookings, accept pending requests, or record completed consultations.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-charcoal/8">
        <div className="flex items-center gap-2 overflow-x-auto">
          {(['all', 'confirmed', 'pending', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={cn(
                'px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer',
                filter === st
                  ? 'bg-forest text-white'
                  : 'text-charcoal/65 hover:bg-charcoal/5'
              )}
            >
              {st}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search patient or booking code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((apt) => (
          <Card key={apt.appointmentCode} padding="md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-forest">
                    {apt.appointmentCode}
                  </span>
                  <Badge variant={apt.status}>{apt.status}</Badge>
                  <span className="text-xs text-charcoal/50 font-mono">
                    {apt.date} · {apt.time} EST
                  </span>
                </div>
                <h3 className="text-base font-semibold text-charcoal mt-1">
                  Patient: {apt.patientName}
                </h3>
                <p className="text-xs text-charcoal/65 mt-0.5">
                  {apt.patientEmail} · {apt.patientPhone} · Format:{' '}
                  <span className="capitalize font-medium">{apt.consultationType}</span>
                </p>
                <p className="text-xs text-charcoal/80 mt-2">
                  <strong>Reason:</strong> {apt.reason}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {apt.status === 'pending' && (
                  <Button
                    size="sm"
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => {
                      sounds.confirm();
                      updateAppointmentStatus(apt.appointmentCode, 'confirmed');
                    }}
                  >
                    Accept
                  </Button>
                )}
                {apt.status === 'confirmed' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => {
                      sounds.success();
                      updateAppointmentStatus(apt.appointmentCode, 'completed');
                    }}
                  >
                    Complete Visit
                  </Button>
                )}
                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    icon={<XCircle size={14} />}
                    onClick={() => {
                      sounds.error();
                      updateAppointmentStatus(apt.appointmentCode, 'cancelled');
                    }}
                  >
                    Decline
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 22: DOCTOR PATIENT MANAGEMENT
// ============================================================================
export const DoctorPatientsPage: React.FC = () => {
  const { appointments, medicalRecords, patientProfile } = usePlatformStore();
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const uniquePatients = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        email: string;
        phone: string;
        lastVisit: string;
        visitCount: number;
        latestReason: string;
      }
    >();

    appointments.forEach((a) => {
      const existing = map.get(a.patientEmail);
      if (!existing) {
        map.set(a.patientEmail, {
          name: a.patientName,
          email: a.patientEmail,
          phone: a.patientPhone,
          lastVisit: a.date,
          visitCount: 1,
          latestReason: a.reason,
        });
      } else {
        existing.visitCount += 1;
      }
    });

    return Array.from(map.values()).filter(
      (p) =>
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [appointments, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Patient Roster & Charts</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Access longitudinal patient histories, vital signs, and consultation notes.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search patient name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {uniquePatients.map((pt) => (
          <Card key={pt.email} padding="md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-charcoal">{pt.name}</h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  {pt.email} · {pt.phone}
                </p>
                <p className="text-xs text-charcoal/75 mt-2">
                  Latest indication: <span className="font-medium">{pt.latestReason}</span>
                </p>
              </div>
              <Badge variant="forest">{pt.visitCount} Visits</Badge>
            </div>
            <div className="mt-4 pt-3 border-t border-charcoal/8 flex items-center justify-between text-xs">
              <span className="font-mono text-charcoal/55">Last seen: {pt.lastVisit}</span>
              <Button
                variant="secondary"
                size="sm"
                icon={<FileText size={13} />}
                onClick={() => setSelectedPatient(pt.name)}
              >
                Open Clinical Chart
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedPatient)}
        onClose={() => setSelectedPatient(null)}
        title={`Clinical Chart · ${selectedPatient}`}
        description="Longitudinal vitals, allergies, and medical record summary"
        size="lg"
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-ivory border border-charcoal/10">
            <div>
              <span className="text-xs text-charcoal/50 block">Blood Group</span>
              <span className="font-mono font-bold text-charcoal">
                {patientProfile.bloodGroup}
              </span>
            </div>
            <div>
              <span className="text-xs text-charcoal/50 block">Allergies</span>
              <span className="font-semibold text-charcoal">{patientProfile.allergies}</span>
            </div>
            <div>
              <span className="text-xs text-charcoal/50 block">Insurance</span>
              <span className="font-semibold text-charcoal">
                {patientProfile.insuranceProvider}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/55">
              Recent Clinical Entries
            </h4>
            {medicalRecords.slice(0, 3).map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-charcoal/10">
                <div className="flex justify-between font-semibold">
                  <span>{r.title}</span>
                  <span className="font-mono text-xs text-charcoal/55">{r.recordDate}</span>
                </div>
                <p className="text-xs text-charcoal/70 mt-1">{r.summary}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 flex justify-end">
            <Button onClick={() => setSelectedPatient(null)}>Close Chart</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ============================================================================
// PAGE 23: DOCTOR AVAILABILITY & SCHEDULING
// ============================================================================
const ALL_DAYS: DoctorAvailabilitySlot['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const DoctorAvailabilityPage: React.FC = () => {
  const { user } = useAuthStore();
  const { doctors, updateDoctorAvailability } = usePlatformStore();

  const currentDoctor = useMemo(
    () =>
      doctors.find((d) => d.id === (user?.doctorSlug || 'dr-sarah-mitchell')) ||
      doctors[0],
    [doctors, user]
  );

  const [slots, setSlots] = useState<DoctorAvailabilitySlot[]>(() =>
    ALL_DAYS.map((day) => {
      const existing = currentDoctor.availability.find((a) => a.day === day);
      return (
        existing || {
          day,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          isActive: false,
        }
      );
    })
  );

  const [savedToast, setSavedToast] = useState(false);

  const handleSaveSchedule = async () => {
    await updateDoctorAvailability(currentDoctor.id, slots);
    sounds.confirm();
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">
            Clinical Availability & Scheduling
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Configure weekly consultation hours and appointment slot durations.
          </p>
        </div>
        {savedToast && <Badge variant="confirmed">Schedule Synced to Cloud SQL</Badge>}
      </div>

      <Card padding="lg">
        <div className="space-y-4">
          {slots.map((slot, index) => (
            <div
              key={slot.day}
              className={cn(
                'p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors',
                slot.isActive
                  ? 'border-forest/25 bg-forest/[0.02]'
                  : 'border-charcoal/8 bg-charcoal/[0.02] opacity-65'
              )}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={slot.isActive}
                  onChange={(e) => {
                    sounds.toggle(e.target.checked);
                    const next = [...slots];
                    next[index] = { ...slot, isActive: e.target.checked };
                    setSlots(next);
                  }}
                  aria-label={`Toggle ${slot.day}`}
                  className="w-4 h-4 accent-forest rounded cursor-pointer"
                />
                <span className="font-semibold text-sm text-charcoal w-28">{slot.day}</span>
                <Badge variant={slot.isActive ? 'confirmed' : 'default'}>
                  {slot.isActive ? 'Active Clinic Day' : 'Off Duty'}
                </Badge>
              </div>

              {slot.isActive && (
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-charcoal/55">Start</span>
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => {
                        const next = [...slots];
                        next[index] = { ...slot, startTime: e.target.value };
                        setSlots(next);
                      }}
                      className="bg-white border border-charcoal/15 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-charcoal/55">End</span>
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => {
                        const next = [...slots];
                        next[index] = { ...slot, endTime: e.target.value };
                        setSlots(next);
                      }}
                      className="bg-white border border-charcoal/15 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                    />
                  </div>
                  <select
                    value={slot.slotDuration}
                    onChange={(e) => {
                      const next = [...slots];
                      next[index] = { ...slot, slotDuration: Number(e.target.value) };
                      setSlots(next);
                    }}
                    aria-label="Slot duration"
                    className="bg-white border border-charcoal/15 rounded-lg px-2.5 py-1.5 font-mono text-xs"
                  >
                    <option value={20}>20 min slots</option>
                    <option value={30}>30 min slots</option>
                    <option value={45}>45 min slots</option>
                    <option value={60}>60 min slots</option>
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-charcoal/8 flex justify-end">
          <Button size="lg" onClick={handleSaveSchedule} icon={<CheckCircle2 size={16} />}>
            Publish Weekly Availability
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// PAGE 24: DOCTOR CONSULTATION HISTORY
// ============================================================================
export const DoctorHistoryPage: React.FC = () => {
  const { appointments } = usePlatformStore();

  const completedList = useMemo(
    () => appointments.filter((a) => a.status === 'completed' || a.status === 'confirmed'),
    [appointments]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">Consultation History</h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Archive of completed patient encounters, clinical notes, and fee settlements.
        </p>
      </div>

      <div className="space-y-3">
        {completedList.map((apt) => (
          <Card key={apt.appointmentCode} padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-forest">
                    {apt.appointmentCode}
                  </span>
                  <Badge variant={apt.status}>{apt.status}</Badge>
                </div>
                <h3 className="text-base font-semibold text-charcoal mt-1">
                  {apt.patientName}
                </h3>
                <p className="text-xs text-charcoal/65 mt-0.5">{apt.reason}</p>
              </div>
              <div className="text-left sm:text-right">
                <span className="font-mono text-sm font-bold text-charcoal block tabular-nums">
                  {formatCurrency(apt.fee)}
                </span>
                <span className="font-mono text-xs text-charcoal/55">
                  {apt.date} · {apt.time} EST
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 25: DOCTOR PROFILE MANAGEMENT
// ============================================================================
export const DoctorProfileManagePage: React.FC = () => {
  const { user } = useAuthStore();
  const { doctors, updateDoctorProfile } = usePlatformStore();

  const currentDoctor = useMemo(
    () =>
      doctors.find((d) => d.id === (user?.doctorSlug || 'dr-sarah-mitchell')) ||
      doctors[0],
    [doctors, user]
  );

  const [hospital, setHospital] = useState(currentDoctor.hospital);
  const [location, setLocation] = useState(currentDoctor.location);
  const [consultationFee, setConsultationFee] = useState(String(currentDoctor.consultationFee));
  const [onlineFee, setOnlineFee] = useState(String(currentDoctor.onlineFee));
  const [bio, setBio] = useState(currentDoctor.bio);
  const [online, setOnline] = useState(currentDoctor.online);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoctorProfile(currentDoctor.id, {
      hospital,
      location,
      consultationFee: Number(consultationFee) || 250,
      onlineFee: Number(onlineFee) || 190,
      bio,
      online,
    });
    sounds.success();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Physician Profile Management</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Update your public directory biography, hospital affiliation, and consultation fees.
          </p>
        </div>
        {saved && <Badge variant="confirmed">Directory Profile Updated</Badge>}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card padding="lg">
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-charcoal/8">
            <Avatar
              src={currentDoctor.avatar}
              alt={`Dr. ${currentDoctor.firstName} ${currentDoctor.lastName}`}
              size="xl"
            />
            <div>
              <h2 className="text-xl font-semibold text-charcoal">
                Dr. {currentDoctor.firstName} {currentDoctor.lastName}
              </h2>
              <p className="text-sm text-charcoal/60">
                {currentDoctor.specialty} · License #{currentDoctor.licenseNumber}
              </p>
              <Badge variant="verified" className="mt-1">
                Board-Certified & Verified
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Primary Hospital / Medical Center"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            />
            <Input
              label="Clinic Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <Input
              label="In-Person Consultation Fee (USD)"
              type="number"
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
            />
            <Input
              label="Online Telehealth Fee (USD)"
              type="number"
              value={onlineFee}
              onChange={(e) => setOnlineFee(e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Clinical Biography"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-charcoal/8 flex items-center justify-between">
            <label className="flex items-center gap-2.5 text-sm font-medium text-charcoal cursor-pointer">
              <input
                type="checkbox"
                checked={online}
                onChange={(e) => setOnline(e.target.checked)}
                className="w-4 h-4 accent-forest rounded"
              />
              Accepting Online HD Video Consultations
            </label>
            <Button type="submit" size="lg" icon={<CheckCircle2 size={16} />}>
              Save Public Profile
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
