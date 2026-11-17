import React from 'react';
import { Link } from 'react-router-dom';
import { Stethoscope, Mail, Phone, MapPin, ArrowRight, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';

const footerLinks = {
  'Platform': [
    { label: 'Find Doctors', href: '/doctors' },
    { label: 'Medical Specialties', href: '/specialties' },
    { label: 'Book Appointment', href: '/book' },
    { label: 'How It Works', href: '/#how-it-works' },
  ],
  'Company': [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
  ],
  'Support': [
    { label: 'Help Center', href: '/help' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
  ],
};

export const Footer: React.FC = () => {
  return (
    <footer className="bg-charcoal text-white">
      <div className="section-container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-sage/20 border border-sage/20 flex items-center justify-center">
                <Stethoscope size={18} className="text-sage" />
              </div>
              <span className="font-semibold text-white text-base">MediConnect</span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs">
              Connecting patients with exceptional doctors for a better healthcare experience. Trusted by over 12,000 patients nationwide.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Mail size={15} className="text-sage/70" />
                hello@mediconnect.health
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Phone size={15} className="text-sage/70" />
                1-800-MEDI-NOW
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <MapPin size={15} className="text-sage/70" />
                123 Healthcare Ave, New York, NY 10001
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 pt-12 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div>
              <h4 className="text-base font-semibold text-white mb-1">Stay informed</h4>
              <p className="text-sm text-white/50">Get health tips and platform updates in your inbox.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 bg-white/8 border border-white/12 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-sage/40 focus:border-transparent transition-all"
              />
              <button className="px-4 py-2.5 bg-sage/80 hover:bg-sage text-forest font-medium text-sm rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap">
                Subscribe <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} MediConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Linkedin, Facebook, Instagram].map((Icon, i) => (
              <button
                key={i}
                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/8 transition-all"
              >
                <Icon size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
