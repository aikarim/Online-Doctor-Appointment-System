# MediConnect — Online Doctor Appointment & Clinical Care Platform

MediConnect is a full-stack online doctor appointment and clinical care platform built with React 19, TypeScript, Tailwind CSS v4, Express, Firebase Authentication, and Google Cloud SQL for PostgreSQL (managed with Drizzle ORM).

## Visual Identity & Design Architecture

- **Primary Background**: Warm Ivory (`#F7F8F6`)
- **Primary Accent**: Deep Forest Green (`#123C32`)
- **Secondary Accent**: Muted Sage (`#A8B9AA`)
- **Primary Text**: Deep Charcoal (`#202724`)
- **Surfaces**: Translucent liquid-glass (`rgba(255, 255, 255, 0.72)`) with subtle backdrop blur
- **Typography**: `Playfair Display` (editorial serif headings), `Plus Jakarta Sans` (clinical UI), and `JetBrains Mono` (`tabular-nums` for appointment codes, fees, and vital metrics)

## Complete 30-Page Route Structure

### Public & Authentication Pages (1–10)
1. `/` — Home / Editorial Landing Page
2. `/doctors` — Find Doctors (search, specialty/fee/rating/experience/availability filters, sort, grid/list toggle)
3. `/doctors/:doctorId` — Doctor Profile (credentials, 7-day slot selector, reviews, sticky booking panel)
4. `/specialties` — Medical Specialties Directory
5. `/about` — About MediConnect & Clinical Governance
6. `/contact` — Contact & Concierge Support
7. `/login` — Role-Based Sign In (Email/Password, Google Sign-In, and 1-Click Role Switcher)
8. `/register/patient` — Patient Registration
9. `/register/doctor` — Physician Credential Registration
10. `/forgot-password` — Password Recovery

### Patient Portal Pages (11–19)
11. `/patient/dashboard` — Patient Clinical Overview & Cardiovascular Trend Chart
12. `/book` — 7-Step Interactive Appointment Booking Flow
13. `/patient/appointments` — My Appointments (filter, search, reschedule, cancel)
14. `/patient/appointments/:appointmentId` — Appointment Pass & Encrypted Telehealth Room
15. `/patient/medical-history` — Longitudinal Medical History & Lab Results
16. `/patient/prescriptions` — Active Medications & Official Script Viewer
17. `/patient/saved-doctors` — Saved Care Team
18. `/patient/notifications` — Clinical Notifications
19. `/patient/profile` (`/patient/settings`) — Patient Profile, Insurance & Sound Preferences

### Doctor Portal Pages (20–25)
20. `/doctor/dashboard` — Attending Physician Console & Weekly Revenue Chart
21. `/doctor/appointments` — Appointment Queue Management (Accept / Complete / Decline)
22. `/doctor/patients` — Patient Roster & Clinical Chart Viewer
23. `/doctor/availability` — Weekly Schedule & Slot Duration Editor
24. `/doctor/history` — Consultation History & Fee Archive
25. `/doctor/profile` (`/doctor/settings`) — Public Directory Profile Management

### Admin Portal Pages (26–30)
26. `/admin/dashboard` — Executive Governance Overview & Audit Trail
27. `/admin/verifications` — Medical Board Credential Verification Queue
28. `/admin/patients` — Platform Patient Registry
29. `/admin/appointments` — Live Appointment Monitoring
30. `/admin/analytics` (`/admin/settings`) — Platform Intelligence & Department Utilization

## Database Schema (Cloud SQL PostgreSQL + Drizzle ORM)

Defined in `src/db/schema.ts`:
- `users`
- `patients`
- `specialties`
- `doctors`
- `doctor_availability`
- `appointments`
- `prescriptions`
- `medical_records`
- `reviews`
- `notifications`
- `payments`
- `admin_activities`
- `saved_doctors`

## Environment Variables

See `.env.example` for all required environment variables:
- `SQL_HOST`, `SQL_DB_NAME`, `SQL_USER`, `SQL_PASSWORD` (application runtime connection)
- `SQL_ADMIN_USER`, `SQL_ADMIN_PASSWORD` (schema migration privileges)
- `GEMINI_API_KEY`, `APP_URL`

## Development & Verification Commands

```bash
# Start full-stack Express + Vite server on port 3000
npm run dev

# Run unit tests for booking validation, slot conflict detection, and filtering
npx tsx --test src/utils/booking.test.ts

# Build for production
npm run build
```
