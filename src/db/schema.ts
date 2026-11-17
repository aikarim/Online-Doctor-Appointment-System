import { relations } from 'drizzle-orm';
import { boolean, integer, numeric, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// 1. Users table (uses Firebase Auth UID or authenticated session UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  passwordHash: text('password_hash'),
  firstName: text('first_name').notNull().default('Patient'),
  lastName: text('last_name').notNull().default('User'),
  role: text('role').notNull().default('patient'), // 'patient' | 'doctor' | 'admin'
  phone: text('phone').default(''),
  avatar: text('avatar').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Patients table
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull().unique(),
  dateOfBirth: text('date_of_birth').default('1990-05-14'),
  gender: text('gender').default('Female'),
  bloodGroup: text('blood_group').default('O+'),
  allergies: text('allergies').default('Penicillin, Pollen'),
  chronicConditions: text('chronic_conditions').default('Mild Seasonal Asthma'),
  emergencyContactName: text('emergency_contact_name').default('michael.chen@example.com'),
  emergencyContactPhone: text('emergency_contact_phone').default('+1 (555) 234-8910'),
  insuranceProvider: text('insurance_provider').default('Aetna Premier Health'),
  insurancePolicyNumber: text('insurance_policy_number').default('AET-9948271-NY'),
  address: text('address').default('420 Park Avenue, Apt 14B, New York, NY 10022'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Specialties table
export const specialties = pgTable('specialties', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull(),
  doctorCount: integer('doctor_count').notNull().default(12),
});

// 4. Doctors table
export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  userUid: text('user_uid').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  specialtyId: text('specialty_id').notNull(),
  specialty: text('specialty').notNull(),
  qualifications: text('qualifications').notNull(), // JSON array string
  experience: integer('experience').notNull().default(10),
  consultationFee: integer('consultation_fee').notNull().default(200),
  onlineFee: integer('online_fee').notNull().default(150),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('4.90'),
  reviewCount: integer('review_count').notNull().default(120),
  verified: boolean('verified').notNull().default(true),
  verificationStatus: text('verification_status').notNull().default('verified'), // 'verified' | 'pending' | 'rejected'
  online: boolean('online').notNull().default(true),
  hospital: text('hospital').notNull(),
  location: text('location').notNull(),
  bio: text('bio').notNull(),
  languages: text('languages').notNull(), // JSON array string
  expertise: text('expertise').notNull(), // JSON array string
  education: text('education').notNull(), // JSON array string
  certifications: text('certifications').notNull(), // JSON array string
  avatar: text('avatar').notNull(),
  nextAvailable: text('next_available').notNull().default('Today, 2:00 PM'),
  totalPatients: integer('total_patients').notNull().default(1450),
  licenseNumber: text('license_number').notNull().default('NY-MED-884920'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Doctor Availability table
export const doctorAvailability = pgTable('doctor_availability', {
  id: serial('id').primaryKey(),
  doctorSlug: text('doctor_slug').notNull(),
  dayOfWeek: text('day_of_week').notNull(), // 'Monday', 'Tuesday', etc.
  startTime: text('start_time').notNull().default('09:00'),
  endTime: text('end_time').notNull().default('17:00'),
  slotDuration: integer('slot_duration').notNull().default(30),
  isActive: boolean('is_active').notNull().default(true),
});

// 6. Appointments table
export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  appointmentCode: text('appointment_code').notNull().unique(),
  patientUid: text('patient_uid').notNull(),
  patientName: text('patient_name').notNull(),
  patientEmail: text('patient_email').notNull(),
  patientPhone: text('patient_phone').notNull(),
  doctorSlug: text('doctor_slug').notNull(),
  doctorName: text('doctor_name').notNull(),
  doctorSpecialty: text('doctor_specialty').notNull(),
  doctorAvatar: text('doctor_avatar').notNull(),
  hospital: text('hospital').notNull(),
  consultationType: text('consultation_type').notNull(), // 'online' | 'in-person'
  appointmentDate: text('appointment_date').notNull(), // YYYY-MM-DD
  appointmentTime: text('appointment_time').notNull(), // HH:mm
  status: text('status').notNull().default('confirmed'), // 'confirmed' | 'pending' | 'completed' | 'cancelled'
  fee: integer('fee').notNull().default(180),
  reason: text('reason').notNull(),
  symptoms: text('symptoms').default(''),
  notes: text('notes').default(''),
  meetingLink: text('meeting_link').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Prescriptions table
export const prescriptions = pgTable('prescriptions', {
  id: serial('id').primaryKey(),
  prescriptionCode: text('prescription_code').notNull().unique(),
  appointmentCode: text('appointment_code').notNull(),
  patientUid: text('patient_uid').notNull(),
  patientName: text('patient_name').notNull(),
  doctorSlug: text('doctor_slug').notNull(),
  doctorName: text('doctor_name').notNull(),
  doctorSpecialty: text('doctor_specialty').notNull(),
  diagnosis: text('diagnosis').notNull(),
  medications: text('medications').notNull(), // JSON array of { name, dosage, frequency, duration, instructions }
  instructions: text('instructions').notNull(),
  issuedDate: text('issued_date').notNull(),
  validUntil: text('valid_until').notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'completed' | 'expired'
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. Medical Records table
export const medicalRecords = pgTable('medical_records', {
  id: serial('id').primaryKey(),
  patientUid: text('patient_uid').notNull(),
  patientName: text('patient_name').notNull(),
  doctorName: text('doctor_name').notNull(),
  specialty: text('specialty').notNull(),
  recordType: text('record_type').notNull(), // 'Consultation' | 'Lab Result' | 'Imaging' | 'Vaccination'
  title: text('title').notNull(),
  summary: text('summary').notNull(),
  vitalSigns: text('vital_signs').notNull(), // JSON object { bp, heartRate, temp, weight }
  recordDate: text('record_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Reviews table
export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  doctorSlug: text('doctor_slug').notNull(),
  patientUid: text('patient_uid').notNull(),
  patientName: text('patient_name').notNull(),
  patientAvatar: text('patient_avatar').notNull(),
  rating: integer('rating').notNull().default(5),
  comment: text('comment').notNull(),
  helpfulCount: integer('helpful_count').notNull().default(12),
  reviewDate: text('review_date').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Notifications table
export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  role: text('role').notNull().default('patient'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull().default('appointment'), // 'appointment' | 'prescription' | 'verification' | 'system'
  isRead: boolean('is_read').notNull().default(false),
  actionUrl: text('action_url').default('/patient/appointments'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Payments table
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  transactionId: text('transaction_id').notNull().unique(),
  appointmentCode: text('appointment_code').notNull(),
  patientUid: text('patient_uid').notNull(),
  patientName: text('patient_name').notNull(),
  doctorSlug: text('doctor_slug').notNull(),
  doctorName: text('doctor_name').notNull(),
  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('USD'),
  paymentMethod: text('payment_method').notNull().default('Mock Demo Card •••• 4242'),
  status: text('status').notNull().default('paid'), // 'paid' | 'refunded' | 'pending'
  paidAt: timestamp('paid_at').defaultNow(),
});

// 12. Admin Activities table
export const adminActivities = pgTable('admin_activities', {
  id: serial('id').primaryKey(),
  actorName: text('actor_name').notNull(),
  actionType: text('action_type').notNull(),
  targetName: text('target_name').notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Saved Doctors table
export const savedDoctors = pgTable('saved_doctors', {
  id: serial('id').primaryKey(),
  userUid: text('user_uid').notNull(),
  doctorSlug: text('doctor_slug').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
}));
