import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Calendar, Clock, FileText, Pill, Heart,
  Bell, User, Settings, LogOut, ChevronLeft, ChevronRight,
  Stethoscope, Users, BarChart3, CheckSquare, Shield, X
} from 'lucide-react';
import { useAuthStore, useUIStore } from '../../store';
import { Avatar, Badge } from '../ui';
import { getInitials } from '../../utils';
import { sounds } from '../../utils/sounds';
import { cn } from '../../utils';

const patientNav = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Book Appointment', href: '/book', icon: Calendar },
  { label: 'My Appointments', href: '/patient/appointments', icon: Clock },
  { label: 'Medical History', href: '/patient/medical-history', icon: FileText },
  { label: 'Prescriptions', href: '/patient/prescriptions', icon: Pill },
  { label: 'Saved Doctors', href: '/patient/saved-doctors', icon: Heart },
  { label: 'Notifications', href: '/patient/notifications', icon: Bell },
  { label: 'Profile', href: '/patient/profile', icon: User },
  { label: 'Settings', href: '/patient/settings', icon: Settings },
];

const doctorNav = [
  { label: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/doctor/appointments', icon: Calendar },
  { label: 'Patients', href: '/doctor/patients', icon: Users },
  { label: 'Availability', href: '/doctor/availability', icon: Clock },
  { label: 'History', href: '/doctor/history', icon: FileText },
  { label: 'Notifications', href: '/doctor/notifications', icon: Bell },
  { label: 'Profile', href: '/doctor/profile', icon: User },
  { label: 'Settings', href: '/doctor/settings', icon: Settings },
];

const adminNav = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Doctor Verification', href: '/admin/verifications', icon: CheckSquare },
  { label: 'Patients', href: '/admin/patients', icon: Users },
  { label: 'Appointments', href: '/admin/appointments', icon: Calendar },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Shield },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, mobileMenuOpen, setMobileMenuOpen } = useUIStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const navItems = user.role === 'patient' ? patientNav
    : user.role === 'doctor' ? doctorNav
    : adminNav;

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const handleLogout = () => {
    sounds.click();
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-black/5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
            <Stethoscope size={15} className="text-white" />
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-charcoal text-sm">
              Medi<span className="text-forest">Connect</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => { setSidebarOpen(!sidebarOpen); sounds.toggle(); }}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-black/5 text-charcoal/40 transition-all"
        >
          {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-black/5 text-charcoal/40"
        >
          <X size={16} />
        </button>
      </div>

      {/* User Info */}
      <div className={cn('p-4 border-b border-black/5', !sidebarOpen && 'flex justify-center')}>
        {sidebarOpen ? (
          <div className="flex items-center gap-3">
            <Avatar
              src={user.avatar}
              initials={getInitials(user.firstName, user.lastName)}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-charcoal truncate">
                {user.firstName} {user.lastName}
              </p>
              <Badge variant={user.role === 'admin' ? 'forest' : user.role === 'doctor' ? 'sage' : 'default'}>
                {user.role}
              </Badge>
            </div>
          </div>
        ) : (
          <Avatar src={user.avatar} initials={getInitials(user.firstName, user.lastName)} size="sm" />
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => { sounds.click(); setMobileMenuOpen(false); }}
              className={cn(
                'flex items-center rounded-xl text-sm font-medium transition-all duration-150',
                sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5',
                active
                  ? 'bg-forest/10 text-forest'
                  : 'text-charcoal/60 hover:bg-black/5 hover:text-charcoal'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <Icon size={17} className="flex-shrink-0" />
              {sidebarOpen && item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-black/5">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all w-full',
            sidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'
          )}
          title={!sidebarOpen ? 'Sign Out' : undefined}
        >
          <LogOut size={17} />
          {sidebarOpen && 'Sign Out'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col flex-shrink-0 h-screen bg-white border-r border-black/5 sticky top-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-charcoal/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-glass-xl lg:hidden overflow-hidden"
          >
            <SidebarContent />
          </motion.aside>
        </>
      )}
    </>
  );
};
