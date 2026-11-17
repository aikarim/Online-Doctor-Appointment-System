import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Building2, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/layout';
import { Button, Input, Divider } from '../components/ui';
import { useAuthStore, usePlatformStore } from '../store';
import type { UserRole } from '../types';
import { sounds } from '../utils/sounds';

// ---- 7. Login Page (Also serves as Initial Launch Gate with Guest Skip) ----
export const LoginPage: React.FC<{ isInitialGate?: boolean }> = ({ isInitialGate = false }) => {
  const [email, setEmail] = useState('eleanor.vance@mediconnect.health');
  const [password, setPassword] = useState('Password123!');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');
  const [guestName, setGuestName] = useState('');
  const [localError, setLocalError] = useState('');

  const {
    loginWithEmail,
    loginWithGoogle,
    continueAsGuest,
    switchDemoRole,
    isLoading,
  } = useAuthStore();
  const { updatePatientProfile } = usePlatformStore();
  const navigate = useNavigate();

  const redirectByRole = (role: UserRole) => {
    if (role === 'doctor') navigate('/doctor/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else if (isInitialGate) navigate('/');
    else navigate('/patient/dashboard');
  };

  const handleSkipAsGuest = (e?: React.FormEvent) => {
    e?.preventDefault();
    const guestUser = continueAsGuest(guestName);
    updatePatientProfile({
      firstName: guestUser.firstName,
      lastName: guestUser.lastName,
      email: guestUser.email,
    });
    sounds.confirm();
    if (!isInitialGate) {
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email.trim() || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      sounds.error();
      return;
    }
    if (!password || password.length < 4) {
      setLocalError('Please enter your password.');
      sounds.error();
      return;
    }
    try {
      const user = await loginWithEmail(email, password, selectedRole);
      sounds.success();
      redirectByRole(user.role);
    } catch (err: unknown) {
      sounds.error();
      setLocalError(err instanceof Error ? err.message : 'Invalid credentials');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    sounds.confirm();
    switchDemoRole(role);
    redirectByRole(role);
  };

  const handleGoogleSignIn = async () => {
    setLocalError('');
    try {
      const user = await loginWithGoogle(selectedRole);
      sounds.confirm();
      redirectByRole(user.role);
    } catch {
      handleQuickDemo(selectedRole);
    }
  };

  return (
    <AuthLayout
      heading="Welcome to MediConnect"
      subheading="Sign in to your clinical account or skip to explore immediately with a guest name."
    >
      <div className="space-y-5">
        {/* Skip & Login Later as Guest Card */}
        <form
          onSubmit={handleSkipAsGuest}
          className="liquid-glass p-4 rounded-2xl border border-forest/30 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-forest font-semibold">
              Skip Login · Continue as Guest
            </span>
            <span className="text-[11px] text-charcoal/55 shrink-0">Login later anytime</span>
          </div>

          <div className="space-y-2.5">
            <Input
              aria-label="Guest Name"
              placeholder="Enter your guest name (e.g. Alex Morgan)"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              icon={<User size={15} />}
            />
            <Button
              type="submit"
              variant="sage"
              size="md"
              fullWidth
              iconRight={<ArrowRight size={15} />}
            >
              Skip &amp; Continue as {guestName.trim() || 'Guest'}
            </Button>
          </div>
          <p className="text-[11px] text-charcoal/55">
            Explore doctors and book appointments immediately as{' '}
            <span className="font-medium text-charcoal">
              {guestName.trim() || 'Guest Patient'}
            </span>
            .
          </p>
        </form>

        <Divider label="Or sign in with account" />

        {/* Role Selector Tabs */}
        <div>
          <label className="block text-xs font-medium text-charcoal/60 mb-2">
            Select Portal Role
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-charcoal/6 rounded-xl">
            {(
              [
                { role: 'patient', label: 'Patient', demoEmail: 'eleanor.vance@mediconnect.health' },
                { role: 'doctor', label: 'Doctor', demoEmail: 'sarah.mitchell@mediconnect.health' },
                { role: 'admin', label: 'Admin', demoEmail: 'admin@mediconnect.health' },
              ] as const
            ).map((item) => (
              <button
                key={item.role}
                type="button"
                onClick={() => {
                  setSelectedRole(item.role);
                  setEmail(item.demoEmail);
                  sounds.toggle();
                }}
                className={`py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  selectedRole === item.role
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-charcoal/65 hover:text-charcoal'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={15} />}
            placeholder="name@mediconnect.health"
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={15} />}
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-forest hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {localError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3.5 py-2.5">
              {localError}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
            Sign In as {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
          </Button>
        </form>

        <Divider label="Or continue with" />

        <Button
          variant="secondary"
          fullWidth
          onClick={handleGoogleSignIn}
          icon={
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 15.25 5 12c0-3.25 3.36-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
              />
            </svg>
          }
        >
          Sign in with Google (Firebase Auth)
        </Button>

        {/* One-Click Demo Role Launchers */}
        <div className="p-4 rounded-2xl bg-white border border-charcoal/8 space-y-2.5">
          <p className="text-xs font-semibold text-charcoal">Instant Demo Portal Access</p>
          <div className="grid grid-cols-3 gap-2">
            <Button variant="sage" size="sm" onClick={() => handleQuickDemo('patient')}>
              Patient Demo
            </Button>
            <Button variant="sage" size="sm" onClick={() => handleQuickDemo('doctor')}>
              Doctor Demo
            </Button>
            <Button variant="sage" size="sm" onClick={() => handleQuickDemo('admin')}>
              Admin Demo
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-charcoal/60 space-y-1.5 pt-2">
          <p>
            New patient?{' '}
            <Link to="/register/patient" className="text-forest font-semibold hover:underline">
              Create a Patient Account
            </Link>
          </p>
          <p>
            Practicing physician?{' '}
            <Link to="/register/doctor" className="text-forest font-semibold hover:underline">
              Apply for Physician Verification
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

// ---- 8. Patient Registration Page ----
export const PatientRegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    if (!form.password || form.password.length < 6)
      errs.password = 'Password must be at least 6 characters';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      sounds.error();
      return;
    }

    try {
      await registerUser({
        ...form,
        role: 'patient',
      });
      sounds.confirm();
      navigate('/patient/dashboard');
    } catch (err: unknown) {
      setErrors({ email: err instanceof Error ? err.message : 'Registration failed' });
    }
  };

  return (
    <AuthLayout
      heading="Create your Patient Account"
      subheading="Book verified specialists and access your longitudinal health records."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Eleanor"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            placeholder="Vance"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Email Address"
          type="email"
          placeholder="eleanor.vance@example.com"
          icon={<Mail size={15} />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <Input
          label="Mobile Phone"
          placeholder="+1 (212) 555-0194"
          icon={<Phone size={15} />}
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          error={errors.phone}
        />
        <Input
          label="Create Password"
          type="password"
          placeholder="At least 6 characters"
          icon={<Lock size={15} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
          Complete Patient Registration
        </Button>

        <p className="text-center text-xs text-charcoal/60 pt-2">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

// ---- 9. Doctor Registration Page ----
export const DoctorRegisterPage: React.FC = () => {
  const { specialties } = usePlatformStore();
  const { registerUser, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: 'Cardiology',
    hospital: '',
    licenseNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required';
    if (!form.hospital.trim()) errs.hospital = 'Primary hospital/clinic affiliation required';
    if (!form.licenseNumber.trim()) errs.licenseNumber = 'State medical license number required';
    if (!form.password || form.password.length < 6) errs.password = 'Min 6 characters';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      sounds.error();
      return;
    }

    try {
      await registerUser({
        ...form,
        role: 'doctor',
      });
      sounds.confirm();
      navigate('/doctor/dashboard');
    } catch (err: unknown) {
      setErrors({ email: err instanceof Error ? err.message : 'Registration failed' });
    }
  };

  return (
    <AuthLayout
      heading="Physician Network Onboarding"
      subheading="Submit your credentials to join our verified specialist directory."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Sarah"
            icon={<User size={15} />}
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            error={errors.firstName}
          />
          <Input
            label="Last Name"
            placeholder="Mitchell"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            error={errors.lastName}
          />
        </div>
        <Input
          label="Institutional Email"
          type="email"
          placeholder="s.mitchell@mountsinai.org"
          icon={<Mail size={15} />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="doc-spec"
              className="block text-sm font-medium text-charcoal mb-1.5"
            >
              Specialty
            </label>
            <select
              id="doc-spec"
              value={form.specialty}
              onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              className="w-full bg-white border border-charcoal/12 rounded-xl px-3.5 py-2.5 text-sm text-charcoal min-h-[42px]"
            >
              {specialties.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Medical License #"
            placeholder="NY-MED-884920"
            icon={<Award size={15} />}
            value={form.licenseNumber}
            onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
            error={errors.licenseNumber}
          />
        </div>
        <Input
          label="Hospital / Clinic Affiliation"
          placeholder="Mount Sinai Heart Institute"
          icon={<Building2 size={15} />}
          value={form.hospital}
          onChange={(e) => setForm({ ...form, hospital: e.target.value })}
          error={errors.hospital}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Create password"
          icon={<Lock size={15} />}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isLoading}>
          Submit Physician Application
        </Button>

        <p className="text-center text-xs text-charcoal/60 pt-2">
          Already verified?{' '}
          <Link to="/login" className="text-forest font-semibold hover:underline">
            Sign in to Physician Console
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

// ---- 10. Forgot Password Page ----
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter the email address associated with your account.');
      sounds.error();
      return;
    }
    setError('');
    sounds.confirm();
    setSent(true);
  };

  return (
    <AuthLayout
      heading="Reset Account Password"
      subheading="Enter your registered email to receive a secure password reset link."
    >
      {sent ? (
        <div className="bg-white rounded-2xl border border-charcoal/8 p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 size={24} />
          </div>
          <h2 className="font-serif text-xl font-semibold text-charcoal">Reset Link Dispatched</h2>
          <p className="text-xs text-charcoal/65 leading-relaxed">
            If an account exists for <strong>{email}</strong>, you will receive password recovery instructions within 60 seconds.
          </p>
          <Link to="/login" className="block pt-2">
            <Button variant="primary" fullWidth iconRight={<ArrowRight size={15} />}>
              Return to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Registered Email Address"
            type="email"
            placeholder="eleanor.vance@mediconnect.health"
            icon={<Mail size={15} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error}
          />
          <Button type="submit" variant="primary" size="lg" fullWidth>
            Send Recovery Instructions
          </Button>
          <p className="text-center text-xs text-charcoal/60 pt-2">
            Remembered your password?{' '}
            <Link to="/login" className="text-forest font-semibold hover:underline">
              Back to Sign In
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};
