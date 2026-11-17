export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id?: number;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  doctorSlug?: string;
  isGuest?: boolean;
  createdAt?: string;
}

export interface PatientProfile {
  id?: number;
  userUid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup: string;
  allergies: string;
  chronicConditions: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  address: string;
}

export interface Specialty {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  doctorCount: number;
}

export interface DoctorEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface DoctorCertification {
  name: string;
  issuer: string;
  year: string;
}

export interface DoctorAvailabilitySlot {
  id?: number;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  slotDuration: number;
  isActive: boolean;
}

export interface Doctor {
  id: string; // slug
  dbId?: number;
  userUid: string;
  firstName: string;
  lastName: string;
  email: string;
  specialtyId: string;
  specialty: string;
  qualifications: string[];
  experience: number;
  consultationFee: number;
  onlineFee: number;
  rating: number;
  reviewCount: number;
  verified: boolean;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  online: boolean;
  hospital: string;
  location: string;
  bio: string;
  languages: string[];
  expertise: string[];
  education: DoctorEducation[];
  certifications: DoctorCertification[];
  availability: DoctorAvailabilitySlot[];
  avatar: string;
  nextAvailable: string;
  totalPatients: number;
  licenseNumber: string;
}

export interface DoctorFilters {
  search: string;
  specialty: string;
  minExperience: number;
  maxFee: number;
  minRating: number;
  availability: string;
  consultationType: string;
  sortBy: 'relevance' | 'rating' | 'fee' | 'experience';
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';

export interface Appointment {
  id: string; // appointmentCode
  dbId?: number;
  appointmentCode: string;
  patientUid: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatar: string;
  hospital: string;
  consultationType: 'online' | 'in-person';
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: AppointmentStatus;
  fee: number;
  reason: string;
  symptoms?: string;
  notes?: string;
  meetingLink?: string;
  createdAt?: string;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  appointmentCode: string;
  patientUid: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  diagnosis: string;
  medications: MedicationItem[];
  instructions: string;
  issuedDate: string;
  validUntil: string;
  status: 'active' | 'completed' | 'expired';
}

export interface MedicalRecord {
  id: number;
  patientUid: string;
  patientName: string;
  doctorName: string;
  specialty: string;
  recordType: 'Consultation' | 'Lab Result' | 'Imaging' | 'Vaccination' | 'Procedure';
  title: string;
  summary: string;
  vitalSigns: {
    bp: string;
    heartRate: string;
    temp: string;
    weight: string;
  };
  recordDate: string;
}

export interface Review {
  id: string;
  doctorId: string;
  patientUid: string;
  patientName: string;
  patientAvatar: string;
  rating: number;
  comment: string;
  helpful: number;
  date: string;
}

export interface NotificationItem {
  id: number;
  userUid: string;
  role: UserRole;
  title: string;
  message: string;
  type: 'appointment' | 'prescription' | 'verification' | 'system' | 'reminder';
  isRead: boolean;
  actionUrl: string;
  createdAt: string;
}

export interface PaymentRecord {
  id: number;
  transactionId: string;
  appointmentCode: string;
  patientUid: string;
  patientName: string;
  doctorSlug: string;
  doctorName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'paid' | 'refunded' | 'pending';
  paidAt: string;
}

export interface AdminActivity {
  id: number;
  actorName: string;
  actionType: string;
  targetName: string;
  details: string;
  createdAt: string;
}

export interface BookingDraft {
  doctorId: string;
  consultationType: 'online' | 'in-person';
  date: string;
  time: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string;
  patientDob: string;
  reason: string;
  symptoms: string;
  insuranceProvider: string;
  notes: string;
}
