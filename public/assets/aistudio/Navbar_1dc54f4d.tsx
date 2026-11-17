import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Calendar, ChevronDown, Bell, Volume2, VolumeX,
  User, LogOut, Settings, LayoutDashboard, Stethoscope
} from 'lucide-react';
import { useAuthStore, useUIStore, useNotificationsStore } from '../../store';
import { Button, Avatar } from '../ui';
import { getInitials } from '../../utils';
import { sounds } from '../../utils/sounds';
import { cn } from '../../utils';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Find Doctors', href: '/doctors' },
  { label: 'Specialties', href: '/specialties' },
  { label: 'About', href: '/about' },
];

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { mobileMenuOpen, setMobileMenuOpen, soundEnabled, toggleSound } = useUIStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { unreadCount } = useNotificationsStore();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    sounds.click();
    logout();
    navigate('/');
    setUserMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'patient': return '/patient/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'admin': return '/admin/dashboard';
      default: return '/';
    }
  };

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/';
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <motion.header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          scrolled ? 'glass-nav shadow-glass py-3' : 'bg-transparent py-5'
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <div className="section-container">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <Stethoscope size={18} className="text-white" />
              </div>
              <div>
                <span className="font-semibold text-charcoal text-base tracking-tight">Medi</span>
                <span className="font-semibold text-forest text-base tracking-tight">Connect</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(link.href)
                      ? 'text-forest bg-forest/8'
                      : 'text-charcoal/70 hover:text-charcoal hover:bg-black/5'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="hidden md:flex items-center gap-2">
              {/* Sound Toggle */}
              <button
                onClick={() => { toggleSound(); sounds.toggle(); }}
                className="p-2 rounded-xl text-charcoal/50 hover:text-charcoal hover:bg-black/5 transition-all"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {isAuthenticated && user ? (
                <>
                  {/* Notifications */}
                  <Link
                    to={`/${user.role}/notifications`}
                    className="relative p-2 rounded-xl text-charcoal/50 hover:text-charcoal hover:bg-black/5 transition-all"
                  >
                    <Bell size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-forest text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => { setUserMenuOpen(!userMenuOpen); sounds.click(); }}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl hover:bg-black/5 transition-all"
                    >
                      <Avatar
                        src={user.avatar}
                        initials={getInitials(user.firstName, user.lastName)}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-charcoal">{user.firstName}</span>
                      <ChevronDown size={14} className={cn('text-charcoal/40 transition-transform', userMenuOpen && 'rotate-180')} />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 4 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-56 glass-strong rounded-2xl shadow-glass-lg border border-white/60 overflow-hidden"
                        >
                          <div className="p-3 border-b border-black/5">
                            <p className="text-sm font-semibold text-charcoal">{user.firstName} {user.lastName}</p>
                            <p className="text-xs text-charcoal/50 capitalize">{user.role}</p>
                          </div>
                          <div className="p-2">
                            <Link
                              to={getDashboardLink()}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal hover:bg-black/5 transition-all"
                            >
                              <LayoutDashboard size={15} /> Dashboard
                            </Link>
                            <Link
                              to={`/${user.role}/profile`}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal hover:bg-black/5 transition-all"
                            >
                              <User size={15} /> Profile
                            </Link>
                            <Link
                              to={`/${user.role}/settings`}
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-charcoal hover:bg-black/5 transition-all"
                            >
                              <Settings size={15} /> Settings
                            </Link>
                            <div className="border-t border-black/5 mt-2 pt-2">
                              <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all w-full text-left"
                              >
                                <LogOut size={15} /> Sign Out
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="md">Sign In</Button>
                  </Link>
                  <Link to="/book">
                    <Button variant="primary" size="md" icon={<Calendar size={15} />}>
                      Book Appointment
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => { setMobileMenuOpen(!mobileMenuOpen); sounds.click(); }}
              className="md:hidden p-2 rounded-xl hover:bg-black/5 transition-all text-charcoal"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-0 z-30 pt-20 glass-strong border-b border-white/60 shadow-glass-lg md:hidden"
          >
            <nav className="section-container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive(link.href)
                      ? 'text-forest bg-forest/8'
                      : 'text-charcoal/70'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-black/6 mt-2 pt-4 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to={getDashboardLink()} className="btn-primary text-center">Dashboard</Link>
                    <button onClick={handleLogout} className="btn-secondary text-center">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary text-center">Sign In</Link>
                    <Link to="/book" className="btn-primary text-center">Book Appointment</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close user menu */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
};
