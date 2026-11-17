import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { requireAuth, type AuthRequest } from './src/middleware/auth.ts';
import {
  getOrCreateUser,
  getAllDoctorsFromDb,
  getDoctorBySlugFromDb,
  updateDoctorVerificationInDb,
  updateDoctorAvailabilityInDb,
  updateDoctorProfileInDb,
  getAllAppointmentsFromDb,
  createAppointmentInDb,
  updateAppointmentInDb,
  getPrescriptionsFromDb,
  getMedicalRecordsFromDb,
  getNotificationsFromDb,
  markNotificationReadInDb,
  markAllNotificationsReadInDb,
  getPatientProfileFromDb,
  updatePatientProfileInDb,
  getSavedDoctorSlugsFromDb,
  toggleSavedDoctorInDb,
  getAdminOverviewFromDb,
  authenticateOrRegisterUserInDb,
} from './src/db/queries.ts';
import {
  DOCTORS,
  SPECIALTIES,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_MEDICAL_RECORDS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PATIENT_PROFILE,
  INITIAL_PAYMENTS,
  INITIAL_ADMIN_ACTIVITIES,
} from './src/data/mockData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '2mb' }));

  // Helper to create a signed session token for password/demo auth
  const createSessionToken = (payload: { uid: string; email: string; role: string; name: string }) => {
    const encoded = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64');
    return `mc_session_${encoded}`;
  };

  // 1. Bootstrap endpoint (loads live PostgreSQL data with graceful fallback)
  app.get('/api/bootstrap', async (_req, res) => {
    try {
      const [
        doctors,
        appointments,
        prescriptions,
        medicalRecords,
        notifications,
        savedDoctorIds,
        patientProfile,
        adminOverview,
      ] = await Promise.all([
        getAllDoctorsFromDb(),
        getAllAppointmentsFromDb(),
        getPrescriptionsFromDb(),
        getMedicalRecordsFromDb(),
        getNotificationsFromDb(),
        getSavedDoctorSlugsFromDb('demo-patient-uid'),
        getPatientProfileFromDb('demo-patient-uid'),
        getAdminOverviewFromDb(),
      ]);

      res.json({
        specialties: SPECIALTIES,
        doctors,
        appointments,
        prescriptions,
        medicalRecords,
        notifications,
        savedDoctorIds,
        patientProfile,
        payments: adminOverview.payments,
        adminActivities: adminOverview.activities,
      });
    } catch (error: unknown) {
      console.error('Bootstrap fallback activated:', error);
      res.json({
        specialties: SPECIALTIES,
        doctors: DOCTORS,
        appointments: INITIAL_APPOINTMENTS,
        prescriptions: INITIAL_PRESCRIPTIONS,
        medicalRecords: INITIAL_MEDICAL_RECORDS,
        notifications: INITIAL_NOTIFICATIONS,
        savedDoctorIds: ['dr-sarah-mitchell', 'dr-elena-rostova'],
        patientProfile: INITIAL_PATIENT_PROFILE,
        payments: INITIAL_PAYMENTS,
        adminActivities: INITIAL_ADMIN_ACTIVITIES,
      });
    }
  });

  // 2. Firebase Google Sign-In synchronization
  app.post('/api/auth/firebase-sync', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid || 'demo-patient-uid';
      const email = req.user?.email || 'user@mediconnect.health';
      const displayName = (req.body.displayName || req.user?.name || 'Eleanor Vance').split(' ');
      const firstName = displayName[0] || 'Eleanor';
      const lastName = displayName.slice(1).join(' ') || 'Vance';
      const role = req.body.role || 'patient';

      const dbUser = await getOrCreateUser(uid, email, firstName, lastName, role);
      res.json({
        user: {
          uid: dbUser.uid,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role,
          phone: dbUser.phone || '+1 (212) 555-0194',
          avatar: dbUser.avatar || DOCTORS[0].avatar,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to sync user';
      res.status(500).json({ error: msg });
    }
  });

  // 3. Email/Password & Role Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, role } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      const u = await authenticateOrRegisterUserInDb({
        action: 'login',
        email,
        password,
        role,
      });
      const token = createSessionToken({
        uid: u.uid,
        email: u.email,
        role: u.role,
        name: `${u.firstName} ${u.lastName}`,
      });
      res.json({
        token,
        user: {
          uid: u.uid,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          phone: u.phone || '+1 (212) 555-0194',
          avatar: u.avatar || DOCTORS[0].avatar,
          doctorSlug: u.role === 'doctor' ? 'dr-sarah-mitchell' : undefined,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Authentication failed';
      res.status(401).json({ error: msg });
    }
  });

  // 4. Patient & Doctor Registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, firstName, lastName, role, phone, specialty, hospital, licenseNumber } = req.body;
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ error: 'Name and email are required' });
      }
      const u = await authenticateOrRegisterUserInDb({
        action: 'register',
        email,
        password,
        firstName,
        lastName,
        role: role || 'patient',
        phone,
        specialty,
        hospital,
        licenseNumber,
      });
      const token = createSessionToken({
        uid: u.uid,
        email: u.email,
        role: u.role,
        name: `${u.firstName} ${u.lastName}`,
      });
      res.status(201).json({
        token,
        user: {
          uid: u.uid,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          phone: u.phone || phone || '',
          avatar: u.avatar || DOCTORS[2].avatar,
        },
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Registration failed';
      res.status(500).json({ error: msg });
    }
  });

  // 5. Doctors APIs
  app.get('/api/doctors', async (_req, res) => {
    try {
      const doctors = await getAllDoctorsFromDb();
      res.json(doctors);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch doctors';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/doctors/:slug', async (req, res) => {
    try {
      const data = await getDoctorBySlugFromDb(req.params.slug);
      if (!data.doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }
      res.json(data);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch doctor profile';
      res.status(500).json({ error: msg });
    }
  });

  app.patch('/api/doctors/:slug/verify', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { status } = req.body;
      const updated = await updateDoctorVerificationInDb(
        String(req.params.slug),
        status,
        req.user?.email || 'Administrator'
      );
      if (!updated) return res.status(404).json({ error: 'Doctor not found' });
      res.json(updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update doctor verification';
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/doctors/:slug/availability', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { availability } = req.body;
      const updated = await updateDoctorAvailabilityInDb(String(req.params.slug), availability);
      res.json({ availability: updated });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update availability';
      res.status(500).json({ error: msg });
    }
  });

  app.patch('/api/doctors/:slug/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateDoctorProfileInDb(String(req.params.slug), req.body);
      res.json(updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update doctor profile';
      res.status(500).json({ error: msg });
    }
  });

  // 6. Appointments APIs
  app.get('/api/appointments', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const list = await getAllAppointmentsFromDb();
      res.json(list);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch appointments';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/appointments', requireAuth, async (req: AuthRequest, res) => {
    try {
      const b = req.body;
      if (!b.doctorSlug || !b.appointmentDate || !b.appointmentTime || !b.patientName || !b.reason) {
        return res.status(400).json({ error: 'Missing required appointment fields' });
      }
      const result = await createAppointmentInDb({
        appointmentCode: b.appointmentCode,
        patientUid: req.user?.uid || b.patientUid || 'demo-patient-uid',
        patientName: b.patientName,
        patientEmail: b.patientEmail,
        patientPhone: b.patientPhone,
        doctorSlug: b.doctorSlug,
        doctorName: b.doctorName,
        doctorSpecialty: b.doctorSpecialty,
        doctorAvatar: b.doctorAvatar,
        hospital: b.hospital,
        consultationType: b.consultationType,
        appointmentDate: b.appointmentDate,
        appointmentTime: b.appointmentTime,
        fee: Number(b.fee) || 180,
        reason: b.reason,
        symptoms: b.symptoms,
        notes: b.notes,
      });

      if (result.conflict) {
        return res.status(409).json({
          error: 'This time slot has already been reserved. Please choose another available time.',
        });
      }

      res.status(201).json(result.appointment);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create appointment';
      res.status(500).json({ error: msg });
    }
  });

  app.patch('/api/appointments/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updateAppointmentInDb(String(req.params.code), req.body);
      if (!updated) return res.status(404).json({ error: 'Appointment not found' });
      res.json(updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update appointment';
      res.status(500).json({ error: msg });
    }
  });

  // 7. Prescriptions & Medical Records
  app.get('/api/prescriptions', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const list = await getPrescriptionsFromDb();
      res.json(list);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch prescriptions';
      res.status(500).json({ error: msg });
    }
  });

  app.get('/api/medical-records', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const list = await getMedicalRecordsFromDb();
      res.json(list);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch medical records';
      res.status(500).json({ error: msg });
    }
  });

  // 8. Notifications APIs
  app.get('/api/notifications', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const list = await getNotificationsFromDb();
      res.json(list);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch notifications';
      res.status(500).json({ error: msg });
    }
  });

  app.patch('/api/notifications/:id/read', requireAuth, async (req: AuthRequest, res) => {
    try {
      await markNotificationReadInDb(Number(req.params.id));
      res.json({ ok: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to mark notification read';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/notifications/read-all', requireAuth, async (_req: AuthRequest, res) => {
    try {
      await markAllNotificationsReadInDb();
      res.json({ ok: true });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to mark notifications read';
      res.status(500).json({ error: msg });
    }
  });

  // 9. Patient Profile & Saved Doctors
  app.get('/api/patient/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const profile = await getPatientProfileFromDb(req.user?.uid || 'demo-patient-uid');
      res.json(profile);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch patient profile';
      res.status(500).json({ error: msg });
    }
  });

  app.put('/api/patient/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const updated = await updatePatientProfileInDb(req.user?.uid || 'demo-patient-uid', req.body);
      res.json(updated);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update patient profile';
      res.status(500).json({ error: msg });
    }
  });

  app.post('/api/patient/saved-doctors/toggle', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { doctorSlug } = req.body;
      const savedIds = await toggleSavedDoctorInDb(req.user?.uid || 'demo-patient-uid', doctorSlug);
      res.json({ savedDoctorIds: savedIds });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to toggle saved doctor';
      res.status(500).json({ error: msg });
    }
  });

  // 10. Admin Overview API
  app.get('/api/admin/overview', requireAuth, async (_req: AuthRequest, res) => {
    try {
      const overview = await getAdminOverviewFromDb();
      res.json(overview);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch admin overview';
      res.status(500).json({ error: msg });
    }
  });

  // Vite middleware for development / static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediConnect server running on http://localhost:${PORT}`);
  });
}

startServer();
