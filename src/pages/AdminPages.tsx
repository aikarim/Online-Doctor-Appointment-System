import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Search,
  Activity,
  TrendingUp,
  Building2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { usePlatformStore, useUIStore } from '../store';
import {
  Button,
  Card,
  Input,
  Badge,
  Avatar,
} from '../components/ui';
import { formatCurrency, cn } from '../utils';
import { sounds } from '../utils/sounds';

const PLATFORM_REVENUE_SERIES = [
  { month: 'Oct', revenue: 142000, bookings: 610 },
  { month: 'Nov', revenue: 158400, bookings: 680 },
  { month: 'Dec', revenue: 171200, bookings: 735 },
  { month: 'Jan', revenue: 189500, bookings: 812 },
  { month: 'Feb', revenue: 204800, bookings: 890 },
  { month: 'Mar', revenue: 228600, bookings: 965 },
];

const SPECIALTY_VOLUME_DATA = [
  { name: 'Cardiology', consultations: 310 },
  { name: 'Dermatology', consultations: 275 },
  { name: 'Neurology', consultations: 210 },
  { name: 'Pediatrics', consultations: 195 },
  { name: 'Orthopedics', consultations: 180 },
  { name: 'Internal Med', consultations: 240 },
];

// ============================================================================
// PAGE 26: ADMIN DASHBOARD
// ============================================================================
export const AdminDashboardPage: React.FC = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';
  const {
    doctors,
    appointments,
    payments,
    adminActivities,
    updateDoctorVerification,
  } = usePlatformStore();

  const pendingDoctors = useMemo(
    () => doctors.filter((d) => d.verificationStatus === 'pending' || !d.verified),
    [doctors]
  );

  const totalPlatformRevenue = useMemo(
    () => payments.reduce((acc, p) => acc + p.amount, 0) + 228600,
    [payments]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
            Executive Governance Console
          </span>
          <h1 className="font-serif text-3xl text-charcoal mt-1">
            Platform Operations & Clinical Oversight
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Real-time credential verification, appointment monitoring, and network analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/verifications">
            <Button variant="secondary" icon={<ShieldCheck size={15} />}>
              Credential Queue ({pendingDoctors.length})
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button icon={<TrendingUp size={15} />}>Full Analytics</Button>
          </Link>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Registered Patients</span>
            <Users size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">14,820</p>
          <p className="text-xs text-emerald-700 font-medium mt-1">+8.4% active growth</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Board-Certified Doctors</span>
            <ShieldCheck size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {doctors.length}
          </p>
          <p className="text-xs text-charcoal/55 mt-1">
            {pendingDoctors.length} awaiting credential review
          </p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Active Appointments</span>
            <Calendar size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {appointments.length}
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-1">99.2% fulfillment rate</p>
        </Card>

        <Card padding="md">
          <div className="flex items-center justify-between text-xs text-charcoal/55 mb-2">
            <span>Gross Network Volume</span>
            <DollarSign size={15} className="text-forest" />
          </div>
          <p className="text-2xl font-mono font-bold text-charcoal tabular-nums">
            {formatCurrency(totalPlatformRevenue)}
          </p>
          <p className="text-xs text-emerald-700 font-medium mt-1">+16.8% YoY trajectory</p>
        </Card>
      </div>

      {/* Main Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-charcoal">
                  Platform Revenue & Consultation Trajectory
                </h2>
                <p className="text-xs text-charcoal/55">
                  Monthly gross consultation settlement volume (USD)
                </p>
              </div>
              <Badge variant="verified">Q1 Target Exceeded</Badge>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PLATFORM_REVENUE_SERIES}>
                  <defs>
                    <linearGradient id="adminRevGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={isDark ? '#6EE7C8' : '#123C32'}
                        stopOpacity={0.32}
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
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke={isDark ? '#6EE7C8' : '#123C32'}
                    strokeWidth={2}
                    fill="url(#adminRevGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Quick Credential Review */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-charcoal">
                Physician Credential Verification Queue
              </h2>
              <Link
                to="/admin/verifications"
                className="text-xs font-semibold text-forest hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {doctors.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-xl border border-charcoal/8 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={doc.avatar}
                      alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                      size="md"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-charcoal">
                          Dr. {doc.firstName} {doc.lastName}
                        </h3>
                        <Badge
                          variant={
                            doc.verificationStatus === 'verified'
                              ? 'verified'
                              : doc.verificationStatus === 'pending'
                              ? 'pending'
                              : 'cancelled'
                          }
                        >
                          {doc.verificationStatus}
                        </Badge>
                      </div>
                      <p className="text-xs text-charcoal/55 font-mono">
                        {doc.specialty} · License #{doc.licenseNumber}
                      </p>
                    </div>
                  </div>

                  {doc.verificationStatus !== 'verified' ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        sounds.confirm();
                        updateDoctorVerification(doc.id, 'verified');
                      }}
                    >
                      Approve MD
                    </Button>
                  ) : (
                    <span className="text-xs text-emerald-700 font-medium">Active</span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Live Governance Audit Trail */}
        <div className="lg:col-span-5">
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-charcoal">Governance Audit Log</h2>
              <Activity size={16} className="text-forest" />
            </div>
            <div className="space-y-3">
              {Array.from(
                new Map(
                  adminActivities.map((act) => [`${act.actionType}:${act.targetName}`, act])
                ).values()
              )
                .slice(0, 6)
                .map((act) => {
                  const formattedTime = act.createdAt?.includes('T')
                    ? act.createdAt.slice(0, 16).replace('T', ' · ') + ' UTC'
                    : act.createdAt;
                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl bg-ivory/60 border border-charcoal/8 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-forest">{act.actionType}</span>
                        <span className="font-mono text-charcoal/45">{formattedTime}</span>
                      </div>
                      <p className="text-charcoal font-medium">{act.targetName}</p>
                      <p className="text-charcoal/65">{act.details}</p>
                    </div>
                  );
                })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE 27: ADMIN DOCTOR VERIFICATION
// ============================================================================
export const AdminVerificationsPage: React.FC = () => {
  const { doctors, updateDoctorVerification } = usePlatformStore();
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return doctors;
    return doctors.filter((d) => d.verificationStatus === filter);
  }, [doctors, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">
          Medical Board Credential Verification
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Inspect state medical license numbers, hospital privileges, and board certifications.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {(['all', 'pending', 'verified', 'rejected'] as const).map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setFilter(st)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer',
              filter === st
                ? 'bg-forest text-white'
                : 'bg-white border border-charcoal/8 text-charcoal/70 hover:bg-charcoal/5'
            )}
          >
            {st}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((doc) => (
          <Card key={doc.id} padding="md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar
                  src={doc.avatar}
                  alt={`Dr. ${doc.firstName} ${doc.lastName}`}
                  size="lg"
                />
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-semibold text-charcoal">
                      Dr. {doc.firstName} {doc.lastName}
                    </h3>
                    <Badge
                      variant={
                        doc.verificationStatus === 'verified'
                          ? 'verified'
                          : doc.verificationStatus === 'pending'
                          ? 'pending'
                          : 'cancelled'
                      }
                    >
                      {doc.verificationStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal/65 mt-0.5">
                    {doc.specialty} · {doc.hospital} · {doc.experience} yrs experience
                  </p>
                  <p className="text-xs font-mono text-forest mt-1.5">
                    License #{doc.licenseNumber} · Qualifications: {doc.qualifications.join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {doc.verificationStatus !== 'verified' && (
                  <Button
                    size="sm"
                    icon={<CheckCircle2 size={14} />}
                    onClick={() => {
                      sounds.confirm();
                      updateDoctorVerification(doc.id, 'verified');
                    }}
                  >
                    Approve Credentials
                  </Button>
                )}
                {doc.verificationStatus !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    icon={<XCircle size={14} />}
                    onClick={() => {
                      sounds.error();
                      updateDoctorVerification(doc.id, 'rejected');
                    }}
                  >
                    Revoke / Reject
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
// PAGE 28: ADMIN PATIENT MANAGEMENT
// ============================================================================
export const AdminPatientsPage: React.FC = () => {
  const { appointments, patientProfile } = usePlatformStore();
  const [search, setSearch] = useState('');

  const patients = useMemo(() => {
    const base = [
      {
        uid: patientProfile.userUid,
        name: `${patientProfile.firstName} ${patientProfile.lastName}`,
        email: patientProfile.email,
        phone: patientProfile.phone,
        insurance: patientProfile.insuranceProvider,
        bloodGroup: patientProfile.bloodGroup,
        status: 'Active Member',
      },
      {
        uid: 'pt-202',
        name: 'harold.kensington@mediconnect.health',
        displayName: 'Harold Kensington',
        email: 'harold.kensington@mediconnect.health',
        phone: '+1 (212) 555-0182',
        insurance: 'UnitedHealthcare Private',
        bloodGroup: 'A+',
        status: 'Active Member',
      },
      {
        uid: 'pt-203',
        name: 'claire.beaumont@mediconnect.health',
        displayName: 'Claire Beaumont',
        email: 'claire.beaumont@mediconnect.health',
        phone: '+1 (212) 555-0149',
        insurance: 'Cigna Global Health',
        bloodGroup: 'O-',
        status: 'Active Member',
      },
    ];

    appointments.forEach((a) => {
      if (!base.some((p) => p.email === a.patientEmail)) {
        base.push({
          uid: a.patientUid,
          name: a.patientName,
          email: a.patientEmail,
          phone: a.patientPhone,
          insurance: 'Aetna Private Health',
          bloodGroup: 'O+',
          status: 'Active Member',
        });
      }
    });

    return base.filter(
      (p) =>
        !search.trim() ||
        (p.displayName || p.name).toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [appointments, patientProfile, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">Patient Registry</h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Platform-wide patient directory, insurance verification, and account status.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search patient registry..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={15} />}
          />
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-charcoal/8 bg-ivory/70 text-xs uppercase tracking-wider text-charcoal/55">
                <th className="py-3.5 px-5">Patient Name</th>
                <th className="py-3.5 px-5">Contact</th>
                <th className="py-3.5 px-5">Insurance Carrier</th>
                <th className="py-3.5 px-5">Blood Group</th>
                <th className="py-3.5 px-5">Account Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/8">
              {patients.map((pt, idx) => (
                <tr key={idx} className="hover:bg-ivory/40">
                  <td className="py-4 px-5 font-semibold text-charcoal">
                    {pt.displayName || pt.name}
                  </td>
                  <td className="py-4 px-5 text-xs text-charcoal/65">
                    {pt.email}
                    <span className="block font-mono">{pt.phone}</span>
                  </td>
                  <td className="py-4 px-5 text-xs text-charcoal">{pt.insurance}</td>
                  <td className="py-4 px-5 font-mono text-xs font-semibold text-forest">
                    {pt.bloodGroup}
                  </td>
                  <td className="py-4 px-5">
                    <Badge variant="verified">{pt.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// PAGE 29: ADMIN APPOINTMENT MONITORING
// ============================================================================
export const AdminAppointmentsPage: React.FC = () => {
  const { appointments, updateAppointmentStatus } = usePlatformStore();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) =>
          !search.trim() ||
          a.appointmentCode.toLowerCase().includes(search.toLowerCase()) ||
          a.patientName.toLowerCase().includes(search.toLowerCase()) ||
          a.doctorName.toLowerCase().includes(search.toLowerCase())
      ),
    [appointments, search]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-charcoal">
            Live Appointment Monitoring
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Audit all scheduled, completed, and cancelled consultations across partner hospitals.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Input
            placeholder="Filter by reference ID, doctor, or patient..."
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
                  <span className="font-mono text-xs font-bold text-forest">
                    {apt.appointmentCode}
                  </span>
                  <Badge variant={apt.status}>{apt.status}</Badge>
                  <span className="font-mono text-xs text-charcoal/55">
                    {apt.date} · {apt.time} EST
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-charcoal mt-1">
                  {apt.patientName} → {apt.doctorName} ({apt.doctorSpecialty})
                </h3>
                <p className="text-xs text-charcoal/60 mt-0.5">
                  {apt.hospital} · Format: <span className="capitalize">{apt.consultationType}</span> · Fee:{' '}
                  <span className="font-mono font-semibold">{formatCurrency(apt.fee)}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {apt.status !== 'completed' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => updateAppointmentStatus(apt.appointmentCode, 'completed')}
                  >
                    Mark Completed
                  </Button>
                )}
                {apt.status !== 'cancelled' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => updateAppointmentStatus(apt.appointmentCode, 'cancelled')}
                  >
                    Cancel
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
// PAGE 30: PLATFORM ANALYTICS
// ============================================================================
export const AdminAnalyticsPage: React.FC = () => {
  const { theme } = useUIStore();
  const isDark = theme === 'dark';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-charcoal">
          Platform Intelligence & Department Utilization
        </h1>
        <p className="text-sm text-charcoal/60 mt-1">
          Longitudinal consultation throughput, specialty demand distribution, and financial performance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-charcoal">
              Consultations by Clinical Specialty
            </h2>
            <p className="text-xs text-charcoal/55">
              Quarterly volume distribution across core medical departments
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPECIALTY_VOLUME_DATA}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? 'rgba(236,244,241,0.08)' : 'rgba(32,39,36,0.06)'}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: isDark ? '#9BB5AC' : '#5A6560' }}
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
                  dataKey="consultations"
                  name="Consultations"
                  fill={isDark ? '#34D399' : '#123C32'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card padding="md">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-charcoal">
              Monthly Booking Throughput
            </h2>
            <p className="text-xs text-charcoal/55">
              Completed online telehealth and in-person clinic bookings
            </p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PLATFORM_REVENUE_SERIES}>
                <defs>
                  <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={isDark ? '#6EE7C8' : '#2A6D62'}
                      stopOpacity={0.32}
                    />
                    <stop
                      offset="95%"
                      stopColor={isDark ? '#6EE7C8' : '#2A6D62'}
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
                <Area
                  type="monotone"
                  dataKey="bookings"
                  name="Completed Bookings"
                  stroke={isDark ? '#6EE7C8' : '#2A6D62'}
                  strokeWidth={2}
                  fill="url(#bookingsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
