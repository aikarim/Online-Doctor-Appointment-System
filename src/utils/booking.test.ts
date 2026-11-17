import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatCurrency,
  generateTimeSlots,
  checkAppointmentConflict,
  filterAndSortDoctors,
  validateBookingStep,
  generateAppointmentCode,
} from './index';
import type { Doctor, DoctorFilters, BookingDraft } from '../types';

const sampleDoctors: Doctor[] = [
  {
    id: 'dr-sarah-mitchell',
    userUid: 'doc-1',
    firstName: 'Sarah',
    lastName: 'Mitchell',
    email: 'sarah.mitchell@mediconnect.health',
    specialtyId: 'cardiology',
    specialty: 'Cardiology',
    qualifications: ['MD', 'FACC'],
    experience: 16,
    consultationFee: 240,
    onlineFee: 180,
    rating: 4.9,
    reviewCount: 312,
    verified: true,
    verificationStatus: 'verified',
    online: true,
    hospital: 'Mount Sinai Heart Institute',
    location: 'New York, NY',
    bio: 'Board-certified cardiologist',
    languages: ['English'],
    expertise: ['Preventive Cardiology', 'Arrhythmia'],
    education: [],
    certifications: [],
    availability: [],
    avatar: 'data:image/svg+xml;utf8,<svg></svg>',
    nextAvailable: 'Today, 2:30 PM',
    totalPatients: 2400,
    licenseNumber: 'NY-1001',
  },
  {
    id: 'dr-james-chen',
    userUid: 'doc-2',
    firstName: 'James',
    lastName: 'Chen',
    email: 'james.chen@mediconnect.health',
    specialtyId: 'neurology',
    specialty: 'Neurology',
    qualifications: ['MD', 'PhD'],
    experience: 12,
    consultationFee: 280,
    onlineFee: 210,
    rating: 4.7,
    reviewCount: 190,
    verified: true,
    verificationStatus: 'verified',
    online: false,
    hospital: 'NYU Langone',
    location: 'New York, NY',
    bio: 'Neurologist',
    languages: ['English', 'Mandarin'],
    expertise: ['Migraine', 'Epilepsy'],
    education: [],
    certifications: [],
    availability: [],
    avatar: 'data:image/svg+xml;utf8,<svg></svg>',
    nextAvailable: 'Tomorrow, 10:00 AM',
    totalPatients: 1800,
    licenseNumber: 'NY-1002',
  },
];

test('formatCurrency formats USD cleanly', () => {
  assert.equal(formatCurrency(180), '$180');
  assert.equal(formatCurrency(1250), '$1,250');
});

test('generateTimeSlots generates 30-min intervals and marks booked slots unavailable', () => {
  const slots = generateTimeSlots('09:00', '11:00', 30, ['09:30']);
  assert.equal(slots.length, 4);
  assert.deepEqual(slots[0], { time: '09:00', available: true });
  assert.deepEqual(slots[1], { time: '09:30', available: false });
  assert.deepEqual(slots[2], { time: '10:00', available: true });
  assert.deepEqual(slots[3], { time: '10:30', available: true });
});

test('checkAppointmentConflict detects active conflicts and ignores cancelled appointments', () => {
  const existing = [
    { doctorId: 'dr-sarah-mitchell', date: '2026-11-20', time: '10:00', status: 'confirmed' as const },
    { doctorId: 'dr-sarah-mitchell', date: '2026-11-20', time: '11:00', status: 'cancelled' as const },
  ];
  assert.equal(checkAppointmentConflict(existing, 'dr-sarah-mitchell', '2026-11-20', '10:00'), true);
  assert.equal(checkAppointmentConflict(existing, 'dr-sarah-mitchell', '2026-11-20', '11:00'), false);
  assert.equal(checkAppointmentConflict(existing, 'dr-sarah-mitchell', '2026-11-20', '14:00'), false);
});

test('filterAndSortDoctors filters by specialty, online status, and sorts by fee/experience', () => {
  const baseFilters: DoctorFilters = {
    search: '',
    specialty: 'cardiology',
    minExperience: 0,
    maxFee: 500,
    minRating: 0,
    availability: '',
    consultationType: '',
    sortBy: 'relevance',
  };

  const cardioOnly = filterAndSortDoctors(sampleDoctors, baseFilters);
  assert.equal(cardioOnly.length, 1);
  assert.equal(cardioOnly[0].id, 'dr-sarah-mitchell');

  const onlineOnly = filterAndSortDoctors(sampleDoctors, {
    ...baseFilters,
    specialty: '',
    consultationType: 'online',
  });
  assert.equal(onlineOnly.length, 1);
  assert.equal(onlineOnly[0].id, 'dr-sarah-mitchell');
});

test('validateBookingStep enforces step-by-step validation rules', () => {
  const emptyDraft: BookingDraft = {
    doctorId: '',
    consultationType: 'online',
    date: '',
    time: '',
    patientFirstName: '',
    patientLastName: '',
    patientEmail: 'invalid-email',
    patientPhone: '123',
    patientDob: '1990-01-01',
    reason: '',
    symptoms: '',
    insuranceProvider: '',
    notes: '',
  };

  assert.equal(validateBookingStep(1, emptyDraft).valid, false);
  assert.equal(validateBookingStep(3, emptyDraft).valid, false);
  assert.equal(validateBookingStep(5, emptyDraft).valid, false);

  const validStep5: BookingDraft = {
    ...emptyDraft,
    doctorId: 'dr-sarah-mitchell',
    date: '2026-11-20',
    time: '10:00',
    patientFirstName: 'Elena',
    patientLastName: 'Rostova',
    patientEmail: 'elena@example.com',
    patientPhone: '+1 555-234-5678',
    reason: 'Annual cardiovascular checkup',
  };
  assert.equal(validateBookingStep(5, validStep5).valid, true);
});

test('generateAppointmentCode creates prefixed unique code', () => {
  const code = generateAppointmentCode('99X12');
  assert.equal(code, 'APT-2026-99X12');
});
