import React, { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { usePlatformStore, useAuthStore } from './store';
import { PublicLayout, DashboardLayout } from './components/layout';

// Public Pages (1–6)
import { HomePage } from './pages/HomePage';
import { FindDoctorsPage } from './pages/FindDoctorsPage';
import { DoctorProfilePage } from './pages/DoctorProfilePage';
import { SpecialtiesPage, AboutPage, ContactPage } from './pages/PublicPages';

// Auth Pages (7–10)
import {
  LoginPage,
  PatientRegisterPage,
  DoctorRegisterPage,
  ForgotPasswordPage,
} from './pages/AuthPages';

// Booking Page (12)
import { BookAppointmentPage } from './pages/BookAppointmentPage';

// Patient Pages (11, 13–19)
import {
  PatientDashboardPage,
  MyAppointmentsPage,
  AppointmentDetailsPage,
  MedicalHistoryPage,
  PrescriptionsPage,
  SavedDoctorsPage,
  NotificationsPage,
  PatientProfilePage,
} from './pages/PatientPages';

// Doctor Pages (20–25)
import {
  DoctorDashboardPage,
  DoctorAppointmentsPage,
  DoctorPatientsPage,
  DoctorAvailabilityPage,
  DoctorHistoryPage,
  DoctorProfileManagePage,
} from './pages/DoctorPages';

// Admin Pages (26–30)
import {
  AdminDashboardPage,
  AdminVerificationsPage,
  AdminPatientsPage,
  AdminAppointmentsPage,
  AdminAnalyticsPage,
} from './pages/AdminPages';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const AppRoutes: React.FC = () => {
  const { pathname } = useLocation();
  const hasEnteredPlatform = useAuthStore((s) => s.hasEnteredPlatform);

  const isAuthAuxiliaryRoute =
    pathname === '/register' ||
    pathname === '/register/patient' ||
    pathname === '/register/doctor' ||
    pathname === '/forgot-password';

  if (!hasEnteredPlatform && !isAuthAuxiliaryRoute) {
    return <LoginPage isInitialGate />;
  }

  return (
    <Routes>
      {/* PUBLIC PAGES (1–6) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/doctors" element={<FindDoctorsPage />} />
      <Route path="/doctors/:doctorId" element={<DoctorProfilePage />} />
      <Route path="/specialties" element={<SpecialtiesPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* AUTH PAGES (7–10) */}
      <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/register/patient" replace />} />
        <Route path="/register/patient" element={<PatientRegisterPage />} />
        <Route path="/register/doctor" element={<DoctorRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* 7-STEP BOOKING SYSTEM (12) */}
        <Route
          path="/book"
          element={
            <PublicLayout>
              <div className="pt-16">
                <BookAppointmentPage />
              </div>
            </PublicLayout>
          }
        />

        {/* PATIENT PORTAL PAGES (11, 13–19) */}
        <Route
          path="/patient/dashboard"
          element={
            <DashboardLayout
              title="Patient Clinical Overview"
              subtitle="Longitudinal health records, upcoming consultations, and active prescriptions"
              roleOverride="patient"
            >
              <PatientDashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/appointments"
          element={
            <DashboardLayout
              title="My Appointments"
              subtitle="Scheduled consultations, telehealth rooms, and booking history"
              roleOverride="patient"
            >
              <MyAppointmentsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/appointments/:appointmentId"
          element={
            <DashboardLayout
              title="Appointment Pass & Clinical Summary"
              subtitle="Encrypted booking confirmation and visit details"
              roleOverride="patient"
            >
              <AppointmentDetailsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/medical-history"
          element={
            <DashboardLayout
              title="Medical History & Lab Panels"
              subtitle="Verified clinical records, vital signs, and diagnostic reports"
              roleOverride="patient"
            >
              <MedicalHistoryPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/prescriptions"
          element={
            <DashboardLayout
              title="Digital Prescriptions"
              subtitle="Active medication regimens and downloadable clinical scripts"
              roleOverride="patient"
            >
              <PrescriptionsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/saved-doctors"
          element={
            <DashboardLayout
              title="Saved Specialists"
              subtitle="Bookmarked physicians in your personal care team"
              roleOverride="patient"
            >
              <SavedDoctorsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/notifications"
          element={
            <DashboardLayout
              title="Clinical Notifications"
              subtitle="Appointment reminders, prescription updates, and system alerts"
              roleOverride="patient"
            >
              <NotificationsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/profile"
          element={
            <DashboardLayout
              title="Patient Profile & Settings"
              subtitle="Personal identity, insurance details, and sound preferences"
              roleOverride="patient"
            >
              <PatientProfilePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/patient/settings"
          element={
            <DashboardLayout
              title="Patient Profile & Settings"
              subtitle="Personal identity, insurance details, and sound preferences"
              roleOverride="patient"
            >
              <PatientProfilePage />
            </DashboardLayout>
          }
        />

        {/* DOCTOR PORTAL PAGES (20–25) */}
        <Route
          path="/doctor/dashboard"
          element={
            <DashboardLayout
              title="Attending Physician Console"
              subtitle="Daily clinical queue, patient volume metrics, and practice revenue"
              roleOverride="doctor"
            >
              <DoctorDashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/doctor/appointments"
          element={
            <DashboardLayout
              title="Appointment Queue Management"
              subtitle="Accept, complete, or reschedule incoming patient consultations"
              roleOverride="doctor"
            >
              <DoctorAppointmentsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/doctor/patients"
          element={
            <DashboardLayout
              title="Patient Roster & Clinical Charts"
              subtitle="Longitudinal patient records and consultation history"
              roleOverride="doctor"
            >
              <DoctorPatientsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/doctor/availability"
          element={
            <DashboardLayout
              title="Availability & Scheduling"
              subtitle="Configure weekly clinical hours and consultation slot durations"
              roleOverride="doctor"
            >
              <DoctorAvailabilityPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/doctor/history"
          element={
            <DashboardLayout
              title="Consultation History"
              subtitle="Completed patient encounters and fee settlement archive"
              roleOverride="doctor"
            >
              <DoctorHistoryPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/doctor/profile"
          element={
            <DashboardLayout
              title="Physician Profile Management"
              subtitle="Public directory biography, hospital affiliation, and fee schedule"
              roleOverride="doctor"
            >
              <DoctorProfileManagePage />
            </DashboardLayout>
          }
        />
        <Route
          path="/doctor/settings"
          element={
            <DashboardLayout
              title="Physician Profile Management"
              subtitle="Public directory biography, hospital affiliation, and fee schedule"
              roleOverride="doctor"
            >
              <DoctorProfileManagePage />
            </DashboardLayout>
          }
        />

        {/* ADMIN PORTAL PAGES (26–30) */}
        <Route
          path="/admin/dashboard"
          element={
            <DashboardLayout
              title="Executive Governance Overview"
              subtitle="Network KPIs, physician credentialing, and live governance audit trail"
              roleOverride="admin"
            >
              <AdminDashboardPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/verifications"
          element={
            <DashboardLayout
              title="Doctor Credential Verification"
              subtitle="Inspect medical board licenses and approve specialist profiles"
              roleOverride="admin"
            >
              <AdminVerificationsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/patients"
          element={
            <DashboardLayout
              title="Platform Patient Registry"
              subtitle="Registered patient directory and insurance verification status"
              roleOverride="admin"
            >
              <AdminPatientsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <DashboardLayout
              title="Appointment Monitoring"
              subtitle="Real-time oversight of all scheduled and completed consultations"
              roleOverride="admin"
            >
              <AdminAppointmentsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <DashboardLayout
              title="Platform Analytics"
              subtitle="Department utilization, monthly revenue, and consultation throughput"
              roleOverride="admin"
            >
              <AdminAnalyticsPage />
            </DashboardLayout>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <DashboardLayout
              title="Platform Analytics & Governance"
              subtitle="Department utilization, monthly revenue, and consultation throughput"
              roleOverride="admin"
            >
              <AdminAnalyticsPage />
            </DashboardLayout>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default function App() {
  const fetchBootstrap = usePlatformStore((s) => s.fetchBootstrap);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRoutes />
    </BrowserRouter>
  );
}
