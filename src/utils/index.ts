import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Doctor, DoctorFilters, Appointment, BookingDraft } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getInitials(firstName?: string, lastName?: string): string {
  const f = (firstName || 'M').trim().charAt(0).toUpperCase();
  const l = (lastName || 'C').trim().charAt(0).toUpperCase();
  return `${f}${l}`;
}

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export function getDayName(date: Date): (typeof DAYS_OF_WEEK)[number] {
  return DAYS_OF_WEEK[date.getDay()];
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  slotDuration: number = 30,
  bookedTimes: string[] = []
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);

  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const bookedSet = new Set(bookedTimes);

  while (currentMinutes + slotDuration <= endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    // Skip lunch hour 12:30
    if (formatted !== '12:30') {
      slots.push({
        time: formatted,
        available: !bookedSet.has(formatted),
      });
    }
    currentMinutes += slotDuration;
  }

  return slots;
}

export function checkAppointmentConflict(
  existingAppointments: Pick<Appointment, 'doctorId' | 'date' | 'time' | 'status'>[],
  doctorId: string,
  date: string,
  time: string
): boolean {
  return existingAppointments.some(
    (apt) =>
      apt.doctorId === doctorId &&
      apt.date === date &&
      apt.time === time &&
      apt.status !== 'cancelled'
  );
}

export function generateAppointmentCode(suffix?: string): string {
  const rand = suffix || Math.random().toString(36).substring(2, 7).toUpperCase();
  return `APT-2026-${rand}`;
}

export function filterAndSortDoctors(doctors: Doctor[], filters: DoctorFilters): Doctor[] {
  let result = [...doctors].filter((d) => d.verificationStatus !== 'rejected');

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    result = result.filter(
      (d) =>
        `dr. ${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q) ||
        d.hospital.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.expertise.some((e) => e.toLowerCase().includes(q))
    );
  }

  if (filters.specialty) {
    result = result.filter(
      (d) =>
        d.specialtyId.toLowerCase() === filters.specialty.toLowerCase() ||
        d.specialty.toLowerCase() === filters.specialty.toLowerCase()
    );
  }

  if (filters.minExperience > 0) {
    result = result.filter((d) => d.experience >= filters.minExperience);
  }

  if (filters.maxFee < 500) {
    result = result.filter(
      (d) => Math.min(d.consultationFee, d.onlineFee) <= filters.maxFee
    );
  }

  if (filters.minRating > 0) {
    result = result.filter((d) => d.rating >= filters.minRating);
  }

  if (filters.availability === 'today') {
    result = result.filter((d) => d.nextAvailable.toLowerCase().includes('today'));
  } else if (filters.availability === 'tomorrow') {
    result = result.filter(
      (d) =>
        d.nextAvailable.toLowerCase().includes('today') ||
        d.nextAvailable.toLowerCase().includes('tomorrow')
    );
  }

  if (filters.consultationType === 'online') {
    result = result.filter((d) => d.online);
  } else if (filters.consultationType === 'in-person') {
    result = result.filter((d) => d.consultationFee > 0);
  }

  switch (filters.sortBy) {
    case 'rating':
      result.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'fee':
      result.sort(
        (a, b) =>
          Math.min(a.consultationFee, a.onlineFee) -
          Math.min(b.consultationFee, b.onlineFee)
      );
      break;
    case 'experience':
      result.sort((a, b) => b.experience - a.experience);
      break;
    case 'relevance':
    default:
      result.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);
      break;
  }

  return result;
}

export function validateBookingStep(
  step: number,
  draft: BookingDraft
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!draft.doctorId) {
      errors.doctorId = 'Please select a physician to continue.';
    }
  } else if (step === 2) {
    if (draft.consultationType !== 'online' && draft.consultationType !== 'in-person') {
      errors.consultationType = 'Please choose a consultation format.';
    }
  } else if (step === 3) {
    if (!draft.date || !/^\d{4}-\d{2}-\d{2}$/.test(draft.date)) {
      errors.date = 'Please select a valid appointment date.';
    }
  } else if (step === 4) {
    if (!draft.time || !/^\d{2}:\d{2}$/.test(draft.time)) {
      errors.time = 'Please select an available time slot.';
    }
  } else if (step === 5) {
    if (!draft.patientFirstName.trim()) {
      errors.patientFirstName = 'First name is required.';
    }
    if (!draft.patientLastName.trim()) {
      errors.patientLastName = 'Last name is required.';
    }
    if (!draft.patientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.patientEmail)) {
      errors.patientEmail = 'Valid email address is required.';
    }
    if (!draft.patientPhone.trim() || draft.patientPhone.trim().length < 7) {
      errors.patientPhone = 'Valid phone number is required.';
    }
    if (!draft.reason.trim() || draft.reason.trim().length < 3) {
      errors.reason = 'Please state the primary reason for your visit.';
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// High-craft deterministic SVG editorial portraits (zero external network dependency)
export function createDoctorPortraitSvg(options: {
  initials: string;
  bgPrimary: string;
  bgSecondary: string;
  skinTone: string;
  hairColor: string;
  coatColor?: string;
  gender?: 'female' | 'male';
}): string {
  const {
    bgPrimary,
    bgSecondary,
    skinTone,
    hairColor,
    coatColor = '#FFFFFF',
    gender = 'female',
  } = options;

  const hairPath =
    gender === 'female'
      ? `<path d="M95 72 C95 36, 165 36, 165 72 C172 95, 172 135, 162 150 C158 120, 155 95, 130 90 C105 95, 102 120, 98 150 C88 135, 88 95, 95 72 Z" fill="${hairColor}"/>`
      : `<path d="M98 76 C98 44, 162 44, 162 76 C162 64, 148 56, 130 56 C112 56, 98 64, 98 76 Z" fill="${hairColor}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 260" width="260" height="260">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${bgPrimary}" />
        <stop offset="100%" stop-color="${bgSecondary}" />
      </linearGradient>
      <radialGradient id="glow" cx="0.75" cy="0.2" r="0.6">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22" />
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
      </radialGradient>
    </defs>
    <rect width="260" height="260" fill="url(#bg)" />
    <circle cx="200" cy="50" r="110" fill="url(#glow)" />
    <!-- Shoulders & Medical Coat -->
    <path d="M42 260 C46 196, 86 176, 130 176 C174 176, 214 196, 218 260 Z" fill="${coatColor}" />
    <!-- Inner Scrubs / Collar -->
    <path d="M106 176 L130 226 L154 176 Z" fill="#123C32" />
    <!-- Coat Lapels -->
    <path d="M95 178 L124 238 L108 260 L82 260 Z" fill="#F0F3F0" />
    <path d="M165 178 L136 238 L152 260 L178 260 Z" fill="#F0F3F0" />
    <!-- Stethoscope -->
    <path d="M100 184 C94 212, 104 236, 120 242" stroke="#2A6D62" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <path d="M160 184 C166 212, 156 236, 144 240" stroke="#2A6D62" stroke-width="4.5" fill="none" stroke-linecap="round"/>
    <circle cx="144" cy="242" r="7" fill="#A8B9AA" stroke="#123C32" stroke-width="2.5"/>
    <!-- Neck -->
    <rect x="117" y="142" width="26" height="40" rx="10" fill="${skinTone}" />
    <!-- Hair back -->
    ${hairPath}
    <!-- Face -->
    <ellipse cx="130" cy="108" rx="31" ry="38" fill="${skinTone}" />
    <!-- Forehead Hair -->
    <path d="M99 98 C102 65, 158 65, 161 98 C153 78, 138 74, 124 76 C110 78, 103 86, 99 98 Z" fill="${hairColor}" />
    <!-- Eyes & Brows -->
    <path d="M112 99 Q118 95 124 99" stroke="${hairColor}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <path d="M136 99 Q142 95 148 99" stroke="${hairColor}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
    <circle cx="118" cy="106" r="2.8" fill="#202724" />
    <circle cx="142" cy="106" r="2.8" fill="#202724" />
    <!-- Subtle Smile -->
    <path d="M121 126 Q130 133 139 126" stroke="#8C584C" stroke-width="2.2" fill="none" stroke-linecap="round"/>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createHeroEditorialSvg(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 960" width="800" height="960">
    <defs>
      <linearGradient id="heroBg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#123C32" />
        <stop offset="55%" stop-color="#1D5346" />
        <stop offset="100%" stop-color="#0D2E26" />
      </linearGradient>
      <radialGradient id="warmLight" cx="0.7" cy="0.25" r="0.55">
        <stop offset="0%" stop-color="#A8B9AA" stop-opacity="0.38" />
        <stop offset="100%" stop-color="#A8B9AA" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="coatGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFFFFF" />
        <stop offset="100%" stop-color="#E8ECE9" />
      </linearGradient>
    </defs>
    <rect width="800" height="960" fill="url(#heroBg)" />
    <circle cx="560" cy="240" r="420" fill="url(#warmLight)" />
    <!-- Architectural Glass Grid Lines -->
    <line x1="120" y1="0" x2="120" y2="960" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
    <line x1="400" y1="0" x2="400" y2="960" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
    <line x1="680" y1="0" x2="680" y2="960" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
    <line x1="0" y1="240" x2="800" y2="240" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
    <line x1="0" y1="520" x2="800" y2="520" stroke="#ffffff" stroke-opacity="0.05" stroke-width="1" />
    <!-- Subtle Halo Arch -->
    <path d="M210 960 L210 350 A190 190 0 0 1 590 350 L590 960 Z" fill="#ffffff" fill-opacity="0.05" stroke="#ffffff" stroke-opacity="0.12" stroke-width="1.5" />
    <!-- Senior Physician Figure -->
    <path d="M165 960 C180 680, 285 600, 400 600 C515 600, 620 680, 635 960 Z" fill="url(#coatGrad)" />
    <!-- Forest Green Inner Attire -->
    <path d="M335 600 L400 790 L465 600 Z" fill="#123C32" />
    <!-- Tailored Lapels -->
    <path d="M310 605 L385 815 L340 960 L265 960 Z" fill="#F4F6F4" />
    <path d="M490 605 L415 815 L460 960 L535 960 Z" fill="#F4F6F4" />
    <!-- Stethoscope -->
    <path d="M315 620 C290 720, 320 805, 365 825" stroke="#2A6D62" stroke-width="10" fill="none" stroke-linecap="round" />
    <path d="M485 620 C510 720, 480 805, 440 820" stroke="#2A6D62" stroke-width="10" fill="none" stroke-linecap="round" />
    <circle cx="440" cy="825" r="18" fill="#A8B9AA" stroke="#123C32" stroke-width="6" />
    <!-- Neck -->
    <rect x="366" y="495" width="68" height="125" rx="28" fill="#E6B89C" />
    <!-- Hair -->
    <path d="M300 320 C300 210, 500 210, 500 320 C515 390, 512 495, 488 535 C476 460, 468 380, 400 365 C332 380, 324 460, 312 535 C288 495, 285 390, 300 320 Z" fill="#2A211D" />
    <!-- Face -->
    <ellipse cx="400" cy="400" rx="86" ry="106" fill="#F0C6AC" />
    <!-- Hairline -->
    <path d="M314 375 C322 280, 478 280, 486 375 C464 320, 420 310, 382 315 C344 320, 326 342, 314 375 Z" fill="#2A211D" />
    <!-- Eyes & Brows -->
    <path d="M350 375 Q368 364 384 375" stroke="#2A211D" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M416 375 Q432 364 450 375" stroke="#2A211D" stroke-width="5" fill="none" stroke-linecap="round" />
    <circle cx="367" cy="394" r="7" fill="#202724" />
    <circle cx="433" cy="394" r="7" fill="#202724" />
    <!-- Nose & Smile -->
    <path d="M400 395 L395 426 L406 429" stroke="#C9967B" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M376 452 Q400 470 424 452" stroke="#9E6252" stroke-width="5" fill="none" stroke-linecap="round" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
