import { create } from 'zustand';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import type {
  User,
  UserRole,
  Doctor,
  Specialty,
  Appointment,
  Prescription,
  MedicalRecord,
  NotificationItem,
  PatientProfile,
  PaymentRecord,
  AdminActivity,
} from '../types';
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
  REVIEWS,
} from '../data/mockData';
import { generateAppointmentCode } from '../utils';

// In-memory auth token storage (never stored in localStorage per Cloud SQL security guidelines)
let inMemoryAuthToken: string | null = 'mc_session_' + btoa(JSON.stringify({
  uid: 'demo-patient-uid',
  email: 'eleanor.vance@mediconnect.health',
  role: 'patient',
  name: 'Eleanor Vance',
}));

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (inMemoryAuthToken) {
    headers['Authorization'] = `Bearer ${inMemoryAuthToken}`;
  }
  return headers;
}

const DEMO_USERS: Record<UserRole, User> = {
  patient: {
    uid: 'demo-patient-uid',
    email: 'eleanor.vance@mediconnect.health',
    firstName: 'Eleanor',
    lastName: 'Vance',
    role: 'patient',
    phone: '+1 (212) 555-0194',
    avatar: REVIEWS['dr-sarah-mitchell'][0].patientAvatar,
  },
  doctor: {
    uid: 'demo-doctor-uid',
    email: 'sarah.mitchell@mediconnect.health',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    role: 'doctor',
    phone: '+1 (212) 555-0110',
    avatar: DOCTORS[0].avatar,
    doctorSlug: 'dr-sarah-mitchell',
  },
  admin: {
    uid: 'demo-admin-uid',
    email: 'admin@mediconnect.health',
    firstName: 'Alexander',
    lastName: 'Sterling',
    role: 'admin',
    phone: '+1 (212) 555-0100',
    avatar: DOCTORS[5].avatar,
  },
};

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  hasEnteredPlatform: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password?: string, role?: UserRole) => Promise<User>;
  loginWithGoogle: (role?: UserRole) => Promise<User>;
  registerUser: (data: {
    email: string;
    password?: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    specialty?: string;
    hospital?: string;
    licenseNumber?: string;
  }) => Promise<User>;
  continueAsGuest: (guestName?: string) => User;
  switchDemoRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const initialSessionState = (() => {
  if (typeof window !== 'undefined') {
    try {
      const entered = window.sessionStorage.getItem('mediconnect_entered') === 'true';
      const savedUserRaw = window.sessionStorage.getItem('mediconnect_session_user');
      if (entered && savedUserRaw) {
        const parsedUser = JSON.parse(savedUserRaw) as User;
        return {
          user: parsedUser,
          isAuthenticated: true,
          isGuest: Boolean(parsedUser.isGuest),
          hasEnteredPlatform: true,
        };
      }
    } catch {
      // ignore
    }
  }
  return {
    user: DEMO_USERS.patient,
    isAuthenticated: false,
    isGuest: false,
    hasEnteredPlatform: false,
  };
})();

function persistSessionUser(user: User | null, entered: boolean) {
  if (typeof window === 'undefined') return;
  try {
    if (entered && user) {
      window.sessionStorage.setItem('mediconnect_entered', 'true');
      window.sessionStorage.setItem('mediconnect_session_user', JSON.stringify(user));
    } else {
      window.sessionStorage.removeItem('mediconnect_entered');
      window.sessionStorage.removeItem('mediconnect_session_user');
    }
  } catch {
    // ignore
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialSessionState.user,
  isAuthenticated: initialSessionState.isAuthenticated,
  isGuest: initialSessionState.isGuest,
  hasEnteredPlatform: initialSessionState.hasEnteredPlatform,
  isLoading: false,
  error: null,

  loginWithEmail: async (email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Invalid credentials');
      }
      const data = await res.json();
      inMemoryAuthToken = data.token;
      const loggedUser: User = { ...data.user, isGuest: false };
      persistSessionUser(loggedUser, true);
      set({
        user: loggedUser,
        isAuthenticated: true,
        isGuest: false,
        hasEnteredPlatform: true,
        isLoading: false,
      });
      return loggedUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  loginWithGoogle: async (role = 'patient') => {
    set({ isLoading: true, error: null });
    try {
      const cred = await signInWithPopup(auth, googleAuthProvider);
      const idToken = await cred.user.getIdToken();
      inMemoryAuthToken = idToken;

      const res = await fetch('/api/auth/firebase-sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          displayName: cred.user.displayName || 'Eleanor Vance',
          role,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const syncedUser: User = { ...data.user, isGuest: false };
        persistSessionUser(syncedUser, true);
        set({
          user: syncedUser,
          isAuthenticated: true,
          isGuest: false,
          hasEnteredPlatform: true,
          isLoading: false,
        });
        return syncedUser;
      }
      const fallbackUser: User = {
        uid: cred.user.uid,
        email: cred.user.email || 'user@mediconnect.health',
        firstName: (cred.user.displayName || 'Eleanor').split(' ')[0],
        lastName: (cred.user.displayName || 'Vance').split(' ').slice(1).join(' ') || 'Vance',
        role,
        avatar: cred.user.photoURL || DEMO_USERS.patient.avatar,
        isGuest: false,
      };
      persistSessionUser(fallbackUser, true);
      set({
        user: fallbackUser,
        isAuthenticated: true,
        isGuest: false,
        hasEnteredPlatform: true,
        isLoading: false,
      });
      return fallbackUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In could not be completed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  registerUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Registration failed');
      }
      const data = await res.json();
      inMemoryAuthToken = data.token;
      const registeredUser: User = { ...data.user, isGuest: false };
      persistSessionUser(registeredUser, true);
      set({
        user: registeredUser,
        isAuthenticated: true,
        isGuest: false,
        hasEnteredPlatform: true,
        isLoading: false,
      });
      if (payload.role === 'doctor') {
        usePlatformStore.getState().fetchBootstrap();
      }
      return registeredUser;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      set({ error: msg, isLoading: false });
      throw err;
    }
  },

  continueAsGuest: (guestName?: string) => {
    const cleaned = (guestName || '').trim() || 'Guest Patient';
    const parts = cleaned.split(/\s+/);
    const firstName = parts[0] || 'Guest';
    const lastName = parts.slice(1).join(' ') || (firstName.toLowerCase() === 'guest' ? 'Patient' : 'Guest');
    const guestUser: User = {
      uid: 'guest-patient-uid',
      email: `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest'}@guest.mediconnect.health`,
      firstName,
      lastName,
      role: 'patient',
      phone: '+1 (212) 555-0199',
      avatar: DEMO_USERS.patient.avatar,
      isGuest: true,
    };
    inMemoryAuthToken =
      'mc_session_' +
      btoa(
        JSON.stringify({
          uid: guestUser.uid,
          email: guestUser.email,
          role: 'patient',
          name: `${guestUser.firstName} ${guestUser.lastName}`,
        })
      );
    persistSessionUser(guestUser, true);
    set({
      user: guestUser,
      isAuthenticated: true,
      isGuest: true,
      hasEnteredPlatform: true,
      error: null,
    });
    return guestUser;
  },

  switchDemoRole: (role: UserRole) => {
    const targetUser: User = { ...DEMO_USERS[role], isGuest: false };
    inMemoryAuthToken =
      'mc_session_' +
      btoa(
        JSON.stringify({
          uid: targetUser.uid,
          email: targetUser.email,
          role: targetUser.role,
          name: `${targetUser.firstName} ${targetUser.lastName}`,
        })
      );
    persistSessionUser(targetUser, true);
    set({
      user: targetUser,
      isAuthenticated: true,
      isGuest: false,
      hasEnteredPlatform: true,
      error: null,
    });
  },

  logout: async () => {
    try {
      await signOut(auth).catch(() => {});
    } finally {
      inMemoryAuthToken = null;
      persistSessionUser(null, false);
      set({
        user: null,
        isAuthenticated: false,
        isGuest: false,
        hasEnteredPlatform: false,
      });
    }
  },
}));

// ---- UI Store ----
export type ThemeMode = 'dark' | 'light';

function applyThemeToDOM(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  root.setAttribute('data-theme', theme);
}

const initialTheme: ThemeMode = (() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = window.localStorage.getItem('mediconnect_theme');
      if (saved === 'light' || saved === 'dark') {
        applyThemeToDOM(saved);
        return saved;
      }
    } catch {
      // ignore
    }
    applyThemeToDOM('dark');
  }
  return 'dark';
})();

interface UIState {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  soundEnabled: boolean;
  theme: ThemeMode;
  setSidebarOpen: (open: boolean) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleSound: () => void;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  soundEnabled:
    typeof window !== 'undefined'
      ? window.localStorage.getItem('mediconnect_sound_enabled') !== 'false'
      : true,
  theme: initialTheme,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  toggleSound: () =>
    set((state) => {
      const next = !state.soundEnabled;
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('mediconnect_sound_enabled', String(next));
        } catch {
          // ignore
        }
      }
      return { soundEnabled: next };
    }),
  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === 'dark' ? 'light' : 'dark';
      applyThemeToDOM(next);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('mediconnect_theme', next);
        } catch {
          // ignore
        }
      }
      return { theme: next };
    }),
  setTheme: (theme) =>
    set(() => {
      applyThemeToDOM(theme);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('mediconnect_theme', theme);
        } catch {
          // ignore
        }
      }
      return { theme };
    }),
}));

// ---- Notifications Store ----
interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: (items: NotificationItem[]) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,
  setNotifications: (items) =>
    set({
      notifications: items,
      unreadCount: items.filter((n) => !n.isRead).length,
    }),
  markAsRead: async (id) => {
    set((state) => {
      const updated = state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
    await fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).catch(() => {});
  },
  markAllAsRead: async () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: getAuthHeaders(),
    }).catch(() => {});
  },
  addNotification: (item) =>
    set((state) => {
      const newNotif: NotificationItem = {
        ...item,
        id: Date.now(),
        isRead: false,
        createdAt: 'Just now',
      };
      const next = [newNotif, ...state.notifications];
      return {
        notifications: next,
        unreadCount: next.filter((n) => !n.isRead).length,
      };
    }),
}));

// ---- Platform Data Store (Doctors, Appointments, Prescriptions, Records, Admin) ----
interface PlatformState {
  specialties: Specialty[];
  doctors: Doctor[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  medicalRecords: MedicalRecord[];
  savedDoctorIds: string[];
  patientProfile: PatientProfile;
  payments: PaymentRecord[];
  adminActivities: AdminActivity[];
  isLoaded: boolean;

  fetchBootstrap: () => Promise<void>;
  createAppointment: (payload: {
    doctorId: string;
    consultationType: 'online' | 'in-person';
    date: string;
    time: string;
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    reason: string;
    symptoms?: string;
    notes?: string;
  }) => Promise<Appointment>;
  updateAppointmentStatus: (code: string, status: Appointment['status']) => Promise<void>;
  rescheduleAppointment: (code: string, newDate: string, newTime: string) => Promise<void>;
  toggleSavedDoctor: (doctorId: string) => Promise<void>;
  updatePatientProfile: (profile: Partial<PatientProfile>) => Promise<void>;
  updateDoctorVerification: (doctorId: string, status: 'verified' | 'rejected' | 'pending') => Promise<void>;
  updateDoctorAvailability: (doctorId: string, availability: Doctor['availability']) => Promise<void>;
  updateDoctorProfile: (doctorId: string, updates: Partial<Doctor>) => Promise<void>;
}

export const usePlatformStore = create<PlatformState>((set, get) => ({
  specialties: SPECIALTIES,
  doctors: DOCTORS,
  appointments: INITIAL_APPOINTMENTS,
  prescriptions: INITIAL_PRESCRIPTIONS,
  medicalRecords: INITIAL_MEDICAL_RECORDS,
  savedDoctorIds: ['dr-sarah-mitchell', 'dr-elena-rostova'],
  patientProfile: INITIAL_PATIENT_PROFILE,
  payments: INITIAL_PAYMENTS,
  adminActivities: INITIAL_ADMIN_ACTIVITIES,
  isLoaded: false,

  fetchBootstrap: async () => {
    try {
      const res = await fetch('/api/bootstrap', {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      set({
        specialties: data.specialties || SPECIALTIES,
        doctors: data.doctors?.length ? data.doctors : DOCTORS,
        appointments: data.appointments?.length ? data.appointments : INITIAL_APPOINTMENTS,
        prescriptions: data.prescriptions?.length ? data.prescriptions : INITIAL_PRESCRIPTIONS,
        medicalRecords: data.medicalRecords?.length ? data.medicalRecords : INITIAL_MEDICAL_RECORDS,
        savedDoctorIds: data.savedDoctorIds || ['dr-sarah-mitchell', 'dr-elena-rostova'],
        patientProfile: data.patientProfile || INITIAL_PATIENT_PROFILE,
        payments: data.payments || INITIAL_PAYMENTS,
        adminActivities: data.adminActivities || INITIAL_ADMIN_ACTIVITIES,
        isLoaded: true,
      });
      if (data.notifications) {
        useNotificationsStore.getState().setNotifications(data.notifications);
      }
    } catch {
      set({ isLoaded: true });
    }
  },

  createAppointment: async (payload) => {
    const state = get();
    const doc = state.doctors.find((d) => d.id === payload.doctorId) || state.doctors[0];
    const fee = payload.consultationType === 'online' ? doc.onlineFee : doc.consultationFee;
    const appointmentCode = generateAppointmentCode();
    const currentUser = useAuthStore.getState().user;

    const apiBody = {
      appointmentCode,
      patientUid: currentUser?.uid || 'demo-patient-uid',
      patientName: payload.patientName,
      patientEmail: payload.patientEmail,
      patientPhone: payload.patientPhone,
      doctorSlug: doc.id,
      doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
      doctorSpecialty: doc.specialty,
      doctorAvatar: doc.avatar,
      hospital: doc.hospital,
      consultationType: payload.consultationType,
      appointmentDate: payload.date,
      appointmentTime: payload.time,
      fee,
      reason: payload.reason,
      symptoms: payload.symptoms || '',
      notes: payload.notes || '',
    };

    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(apiBody),
    });

    if (res.status === 409) {
      const err = await res.json();
      throw new Error(err.error || 'Selected time slot is already booked.');
    }

    let created: Appointment;
    if (res.ok) {
      created = await res.json();
    } else {
      created = {
        id: appointmentCode,
        appointmentCode,
        patientUid: apiBody.patientUid,
        patientName: apiBody.patientName,
        patientEmail: apiBody.patientEmail,
        patientPhone: apiBody.patientPhone,
        doctorId: doc.id,
        doctorName: apiBody.doctorName,
        doctorSpecialty: doc.specialty,
        doctorAvatar: doc.avatar,
        hospital: doc.hospital,
        consultationType: payload.consultationType,
        date: payload.date,
        time: payload.time,
        status: 'confirmed',
        fee,
        reason: payload.reason,
        symptoms: payload.symptoms,
        notes: payload.notes,
        meetingLink:
          payload.consultationType === 'online'
            ? `https://telehealth.mediconnect.health/room/${appointmentCode}`
            : '',
        createdAt: new Date().toISOString(),
      };
    }

    set((s) => ({
      appointments: [created, ...s.appointments],
    }));

    useNotificationsStore.getState().addNotification({
      userUid: apiBody.patientUid,
      role: 'patient',
      title: `Appointment Confirmed: Dr. ${doc.firstName} ${doc.lastName}`,
      message: `Scheduled for ${payload.date} at ${payload.time} (${appointmentCode}).`,
      type: 'appointment',
      actionUrl: `/patient/appointments/${appointmentCode}`,
    });

    return created;
  },

  updateAppointmentStatus: async (code, status) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.appointmentCode === code || a.id === code ? { ...a, status } : a
      ),
    }));
    await fetch(`/api/appointments/${code}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).catch(() => {});
  },

  rescheduleAppointment: async (code, newDate, newTime) => {
    set((s) => ({
      appointments: s.appointments.map((a) =>
        a.appointmentCode === code || a.id === code
          ? { ...a, date: newDate, time: newTime, status: 'confirmed' }
          : a
      ),
    }));
    await fetch(`/api/appointments/${code}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'confirmed',
      }),
    }).catch(() => {});
  },

  toggleSavedDoctor: async (doctorId) => {
    set((s) => {
      const exists = s.savedDoctorIds.includes(doctorId);
      return {
        savedDoctorIds: exists
          ? s.savedDoctorIds.filter((id) => id !== doctorId)
          : [...s.savedDoctorIds, doctorId],
      };
    });
    const res = await fetch('/api/patient/saved-doctors/toggle', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ doctorSlug: doctorId }),
    }).catch(() => null);
    if (res && res.ok) {
      const data = await res.json();
      set({ savedDoctorIds: data.savedDoctorIds });
    }
  },

  updatePatientProfile: async (updates) => {
    set((s) => ({
      patientProfile: { ...s.patientProfile, ...updates },
    }));
    const res = await fetch('/api/patient/profile', {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }).catch(() => null);
    if (res && res.ok) {
      const updated = await res.json();
      set({ patientProfile: updated });
    }
  },

  updateDoctorVerification: async (doctorId, status) => {
    set((s) => ({
      doctors: s.doctors.map((d) =>
        d.id === doctorId
          ? { ...d, verified: status === 'verified', verificationStatus: status }
          : d
      ),
    }));
    await fetch(`/api/doctors/${doctorId}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    }).catch(() => {});
  },

  updateDoctorAvailability: async (doctorId, availability) => {
    set((s) => ({
      doctors: s.doctors.map((d) => (d.id === doctorId ? { ...d, availability } : d)),
    }));
    await fetch(`/api/doctors/${doctorId}/availability`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ availability }),
    }).catch(() => {});
  },

  updateDoctorProfile: async (doctorId, updates) => {
    set((s) => ({
      doctors: s.doctors.map((d) => (d.id === doctorId ? { ...d, ...updates } : d)),
    }));
    await fetch(`/api/doctors/${doctorId}/profile`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    }).catch(() => {});
  },
}));
