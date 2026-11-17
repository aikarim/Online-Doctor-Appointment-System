import React from 'react';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

// ---- Dashboard Layout ----
import { Sidebar } from './Sidebar';
import { Bell, Menu, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore, useUIStore, useNotificationsStore } from '../../store';
import { Avatar } from '../ui';
import { getInitials } from '../../utils';
import { sounds } from '../../utils/sounds';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const { user } = useAuthStore();
  const { setMobileMenuOpen } = useUIStore();
  const { unreadCount } = useNotificationsStore();

  const getNotifLink = () => {
    if (!user) return '/';
    return `/${user.role}/notifications`;
  };

  return (
    <div className="flex h-screen bg-ivory overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-black/5 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => { setMobileMenuOpen(true); sounds.click(); }}
              className="lg:hidden p-2 rounded-xl hover:bg-black/5 text-charcoal/50 transition-all"
            >
              <Menu size={20} />
            </button>
            {title && (
              <div>
                <h1 className="text-lg font-semibold text-charcoal">{title}</h1>
                {subtitle && <p className="text-xs text-charcoal/50">{subtitle}</p>}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={getNotifLink()}
              className="relative p-2 rounded-xl text-charcoal/50 hover:text-charcoal hover:bg-black/5 transition-all"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-forest text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {user && (
              <Link to={`/${user.role}/profile`} className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-black/5 transition-all">
                <Avatar
                  src={user.avatar}
                  initials={getInitials(user.firstName, user.lastName)}
                  size="sm"
                />
                <span className="hidden sm:block text-sm font-medium text-charcoal">
                  {user.firstName} {user.lastName}
                </span>
              </Link>
            )}
          </div>
        </header>

        {/* Page Content */}
        <motion.main
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

// ---- Auth Layout ----
interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-ivory flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest relative overflow-hidden items-center justify-center">
        {/* Decorative circles */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-sage" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-sage/60" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/20" />
        </div>
        <div className="relative z-10 max-w-sm text-center px-8">
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          </div>
          <h2 className="font-serif text-3xl text-white mb-4 leading-tight">
            Healthcare, thoughtfully connected.
          </h2>
          <p className="text-sage-200 text-sm leading-relaxed">
            Join over 12,000 patients who trust MediConnect for seamless access to exceptional healthcare.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '284+', label: 'Doctors' },
              { value: '12k+', label: 'Patients' },
              { value: '48k+', label: 'Appointments' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-sage/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-semibold text-sm">Medi<span className="text-forest">Connect</span></span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
};
