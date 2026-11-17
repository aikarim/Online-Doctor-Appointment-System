import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Calendar,
  Bell,
  Volume2,
  VolumeX,
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  Clock,
  FileText,
  Pill,
  Heart,
  Users,
  BarChart3,
  CheckSquare,
  Shield,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import { useAuthStore, useUIStore, useNotificationsStore } from '../../store';
import { Button, Avatar, ThemeToggle } from '../ui';
import { getInitials, cn } from '../../utils';
import { sounds } from '../../utils/sounds';
import type { UserRole } from '../../types';

// Strict 3-Zone Top Bar Contract for Public Pages
const NAV_LINKS = [
  { label: 'Find Doctors', href: '/doctors' },
  { label: 'Specialties', href: '/specialties' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Sign In', href: '/login' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const { user, isAuthenticated, isGuest } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, setMobileMenuOpen]);

  const getDashboardLink = () => {
    if (!user || !isAuthenticated) return '/login';
    switch (user.role) {
      case 'doctor':
        return '/doctor/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/patient/dashboard';
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-200 glass-nav',
        scrolled ? 'shadow-glass py-3.5' : 'py-4'
      )}
    >
      <div className="section-container flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (single text element) */}
        <Link
          to="/"
          onClick={() => sounds.click()}
          className="font-serif text-xl font-semibold tracking-tight text-forest whitespace-nowrap shrink-0"
        >
          MediConnect
        </Link>

        {/* Zone 2: 4-5 concise single-line navigation links */}
        <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const isLoginLink = link.href === '/login';
            const targetHref =
              isLoginLink && isAuthenticated && !isGuest ? getDashboardLink() : link.href;
            const linkLabel = isLoginLink
              ? isAuthenticated
                ? isGuest
                  ? `Login (${user?.firstName || 'Guest'})`
                  : 'Portal'
                : link.label
              : link.label;

            return (
              <Link
                key={link.href}
                to={targetHref}
                onClick={() => sounds.click()}
                className={cn(
                  'transition-colors whitespace-nowrap shrink-0 py-1 border-b-2',
                  isActive(link.href)
                    ? 'text-forest border-forest font-semibold'
                    : 'text-charcoal/70 border-transparent hover:text-forest'
                )}
              >
                {linkLabel}
              </Link>
            );
          })}
          {isAuthenticated && isGuest && (
            <Link
              to={getDashboardLink()}
              onClick={() => sounds.click()}
              className="transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 border-transparent text-charcoal/70 hover:text-forest"
            >
              Portal
            </Link>
          )}
        </nav>

        {/* Zone 3: Theme Switcher + Primary Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <ThemeToggle />
          <Link to="/book" className="hidden sm:inline-flex">
            <Button variant="primary" size="md" icon={<Calendar size={15} />}>
              Book Appointment
            </Button>
          </Link>
          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              sounds.click();
            }}
            className="md:hidden p-2 rounded-xl hover:bg-charcoal/5 text-charcoal"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden liquid-glass-strong border-b border-charcoal/10 px-5 py-4 space-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href === '/login' && isAuthenticated ? getDashboardLink() : link.href}
              className="block py-2.5 text-sm font-medium text-charcoal hover:text-forest"
            >
              {link.href === '/login' && isAuthenticated ? 'Dashboard Portal' : link.label}
            </Link>
          ))}
          <div className="pt-2 border-t border-charcoal/8 flex items-center justify-between gap-3">
            <ThemeToggle showLabel className="flex-1" />
            <Link to="/book" className="flex-1">
              <Button variant="primary" fullWidth icon={<Calendar size={15} />}>
                Book
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

// ---- Footer ----
export const Footer: React.FC = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail && newsletterEmail.includes('@')) {
      sounds.success();
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#081612] text-white border-t border-white/10">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="font-serif text-2xl font-semibold text-white tracking-tight block">
              MediConnect
            </Link>
            <p className="text-white/65 text-sm leading-relaxed max-w-sm">
              Private-grade clinical care coordination and specialist scheduling. Connecting discerning patients with board-certified physicians across 20+ specialties.
            </p>
            <div className="space-y-2 pt-2 text-xs text-white/60">
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-sage" /> concierge@mediconnect.health
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-sage" /> +1 (800) 555-MEDI
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-sage" /> 740 Park Avenue, Suite 400, New York, NY 10021
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sage mb-4">Discovery</h3>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li><Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link></li>
              <li><Link to="/specialties" className="hover:text-white transition-colors">Medical Specialties</Link></li>
              <li><Link to="/book" className="hover:text-white transition-colors">Book Appointment</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About MediConnect</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Concierge</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sage mb-4">Role Portals</h3>
            <ul className="space-y-2.5 text-sm text-white/65">
              <li><Link to="/patient/dashboard" className="hover:text-white transition-colors">Patient Dashboard</Link></li>
              <li><Link to="/doctor/dashboard" className="hover:text-white transition-colors">Physician Workspace</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-white transition-colors">Admin Command Center</Link></li>
              <li><Link to="/register/patient" className="hover:text-white transition-colors">Patient Registration</Link></li>
              <li><Link to="/register/doctor" className="hover:text-white transition-colors">Physician Onboarding</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-sage mb-4">Clinical Digest</h3>
            <p className="text-xs text-white/60 leading-relaxed mb-3">
              Receive monthly preventive medicine briefings from our medical board.
            </p>
            {subscribed ? (
              <p className="text-xs text-emerald-300 font-medium py-2">
                Subscribed to the MediConnect Clinical Digest.
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-label="Email for clinical digest"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sage/50"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-sage text-forest font-semibold text-xs hover:bg-sage-200 transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/45">
          <p>© {new Date().getFullYear()} MediConnect Health Technologies Inc. Synthetic demonstration environment.</p>
          <div className="flex items-center gap-6">
            <Link to="/about" className="hover:text-white transition-colors">Privacy Architecture</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Clinical Governance</Link>
            <Link to="/login" className="hover:text-white transition-colors">Account Access</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ---- Public Layout ----
export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-ivory">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// ---- Dashboard Sidebar ----
const patientNav = [
  { label: 'Overview', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Book Appointment', href: '/book', icon: Calendar },
  { label: 'My Appointments', href: '/patient/appointments', icon: Clock },
  { label: 'Medical History', href: '/patient/medical-history', icon: FileText },
  { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
  { label: 'Saved Doctors', href: '/patient/saved-doctors', icon: Heart },
  { label: 'Notifications', href: '/patient/notifications', icon: Bell },
  { label: 'Profile & Settings', href: '/patient/profile', icon: User },
];

const doctorNav = [
  { label: 'Doctor Console', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { label: 'Patient Directory', href: '/doctor/patients', icon: Users },
  { label: 'Availability & Slots', href: '/doctor/availability', icon: Clock },
  { label: 'Consultation History', href: '/doctor/history', icon: FileText },
  { label: 'Profile Management', href: '/doctor/profile', icon: Settings },
];

const adminNav = [
  { label: 'Executive Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Doctor Verification', href: '/admin/verifications', icon: CheckSquare },
  { label: 'Patient Directory', href: '/admin/patients', icon: Users },
  { label: 'Appointment Monitor', href: '/admin/appointments', icon: Calendar },
  { label: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
];

export const DashboardLayout: React.FC<{
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  roleOverride?: UserRole;
}> = ({ children, title, subtitle, roleOverride }) => {
  const { user, switchDemoRole, logout } = useAuthStore();
  const { soundEnabled, toggleSound } = useUIStore();
  const { unreadCount } = useNotificationsStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeRole: UserRole = roleOverride || user?.role || 'patient';
  const navItems =
    activeRole === 'doctor' ? doctorNav : activeRole === 'admin' ? adminNav : patientNav;

  useEffect(() => {
    if (roleOverride && user?.role !== roleOverride) {
      switchDemoRole(roleOverride);
    }
  }, [roleOverride, user?.role, switchDemoRole]);

  const handleRoleSwitch = (role: UserRole) => {
    sounds.toggle();
    switchDemoRole(role);
    if (role === 'patient') navigate('/patient/dashboard');
    if (role === 'doctor') navigate('/doctor/dashboard');
    if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-ivory">
      {/* Desktop Sidebar (260px fixed Liquid Glass) */}
      <aside className="hidden lg:flex flex-col w-64 liquid-glass border-r border-charcoal/10 shrink-0 sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-charcoal/10 flex items-center justify-between">
          <Link to="/" className="font-serif text-xl font-semibold text-forest tracking-tight">
            MediConnect
          </Link>
          <span className="text-xs font-mono uppercase tracking-wider text-forest/80">
            {activeRole}
          </span>
        </div>

        {/* Role Workspace Switcher for effortless evaluation */}
        <div className="px-4 py-3 border-b border-charcoal/10 bg-charcoal/[0.03]">
          <p className="text-[11px] font-medium text-charcoal/55 mb-2">Active Role Workspace</p>
          <div className="grid grid-cols-3 gap-1 p-1 bg-charcoal/5 rounded-xl">
            {(['patient', 'doctor', 'admin'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSwitch(r)}
                className={cn(
                  'py-1.5 text-xs font-medium rounded-lg capitalize transition-all cursor-pointer',
                  activeRole === r
                    ? 'bg-forest text-white shadow-xs'
                    : 'text-charcoal/65 hover:text-charcoal'
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Links */}
        <nav aria-label="Workspace Navigation" className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => sounds.click()}
                className={cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-forest text-white'
                    : 'text-charcoal/70 hover:bg-charcoal/5 hover:text-charcoal'
                )}
              >
                <Icon size={16} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Profile & Sign Out */}
        <div className="p-4 border-t border-charcoal/8 space-y-3">
          {user && (
            <div className="flex items-center gap-3">
              <Avatar
                src={user.avatar}
                initials={getInitials(user.firstName, user.lastName)}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-charcoal truncate">
                  {user.firstName} {user.lastName}
                  {user.isGuest ? ' (Guest)' : ''}
                </p>
                <p className="text-[11px] text-charcoal/50 truncate">
                  {user.isGuest ? 'Guest Session · Login Later' : user.email}
                </p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex-1 text-center py-2 px-3 rounded-lg text-xs font-medium text-charcoal/70 hover:bg-charcoal/5 border border-charcoal/10"
            >
              Public Site
            </Link>
            {user?.isGuest ? (
              <Link
                to="/login"
                onClick={() => sounds.click()}
                className="py-2 px-3 rounded-lg text-xs font-semibold text-forest hover:bg-forest/10 border border-forest/25 flex items-center gap-1.5 cursor-pointer"
              >
                <User size={13} /> Sign In
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sounds.click();
                  logout();
                  navigate('/login');
                }}
                className="py-2 px-3 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 border border-red-200/60 flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={13} /> Exit
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Workspace Header */}
        <header className="glass-nav px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Toggle workspace sidebar"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-charcoal/5 text-charcoal"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-charcoal truncate">{title}</h1>
              {subtitle && <p className="text-xs text-charcoal/55 truncate">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <ThemeToggle />

            <button
              type="button"
              onClick={() => {
                toggleSound();
                sounds.toggle();
              }}
              aria-label={soundEnabled ? 'Mute interface audio' : 'Unmute interface audio'}
              title={soundEnabled ? 'Sound feedback enabled' : 'Sound feedback muted'}
              className="liquid-glass p-2 rounded-xl text-charcoal/70 hover:text-charcoal transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <Link
              to="/patient/notifications"
              aria-label="Notifications"
              className="liquid-glass relative p-2 rounded-xl text-charcoal/70 hover:text-charcoal transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-forest text-white text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            <Link to="/book">
              <Button variant="primary" size="sm" icon={<Calendar size={14} />}>
                New Booking
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-charcoal/45 backdrop-blur-xs"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col z-10 p-5">
            <div className="flex items-center justify-between pb-4 border-b border-charcoal/8">
              <span className="font-serif text-xl font-semibold text-forest">MediConnect</span>
              <button
                type="button"
                aria-label="Close sidebar"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-charcoal/5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-3 border-b border-charcoal/8">
              <div className="grid grid-cols-3 gap-1 p-1 bg-charcoal/5 rounded-xl">
                {(['patient', 'doctor', 'admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      handleRoleSwitch(r);
                      setMobileSidebarOpen(false);
                    }}
                    className={cn(
                      'py-1.5 text-xs font-medium rounded-lg capitalize',
                      activeRole === r ? 'bg-forest text-white' : 'text-charcoal/65'
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileSidebarOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-charcoal/80 hover:bg-forest/8 hover:text-forest"
                  >
                    <Icon size={16} /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}
    </div>
  );
};

// ---- Auth Layout ----
export const AuthLayout: React.FC<{
  children: React.ReactNode;
  heading: string;
  subheading: string;
}> = ({ children, heading, subheading }) => {
  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row">
      {/* Left Editorial Panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-forest text-white p-12 flex-col justify-between relative overflow-hidden">
        <div>
          <Link to="/" className="font-serif text-2xl font-semibold text-white tracking-tight">
            MediConnect
          </Link>
        </div>

        <div className="max-w-md space-y-6 my-auto">
          <p className="text-xs font-mono uppercase tracking-widest text-sage">
            Private Clinical Network
          </p>
          <h2 className="font-serif text-4xl leading-tight text-white">
            Healthcare, thoughtfully connected.
          </h2>
          <p className="text-sage/85 text-sm leading-relaxed">
            Direct scheduling with board-certified physicians from Mount Sinai, NYU Langone, Weill Cornell, and Hospital for Special Surgery.
          </p>

          <div className="pt-6 border-t border-white/12 grid grid-cols-3 gap-6 tabular-nums">
            <div>
              <p className="font-serif text-2xl font-semibold text-white">284</p>
              <p className="text-xs text-sage/80 mt-0.5">Verified Specialists</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-white">12.8k</p>
              <p className="text-xs text-sage/80 mt-0.5">Active Patients</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-white">4.95★</p>
              <p className="text-xs text-sage/80 mt-0.5">Clinical Rating</p>
            </div>
          </div>
        </div>

        <div className="text-xs text-sage/60">
          Encrypted patient health records · Role-based clinical access
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex-1 flex flex-col p-6 sm:p-12 relative">
        <div className="flex items-center justify-between lg:justify-end mb-6">
          <Link
            to="/"
            className="lg:hidden font-serif text-2xl font-semibold text-forest tracking-tight inline-block"
          >
            MediConnect
          </Link>
          <ThemeToggle showLabel />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md liquid-glass rounded-3xl p-7 sm:p-9">
            <div className="mb-7">
              <h1 className="font-serif text-3xl font-semibold text-charcoal">{heading}</h1>
              <p className="text-sm text-charcoal/60 mt-2">{subheading}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
