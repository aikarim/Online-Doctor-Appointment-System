import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showClose?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-5xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'relative w-full glass-strong rounded-2xl shadow-glass-xl',
              'max-h-[90vh] overflow-auto',
              sizes[size]
            )}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between p-6 pb-0">
                <div>
                  {title && <h2 className="text-lg font-semibold text-charcoal">{title}</h2>}
                  {description && <p className="mt-1 text-sm text-charcoal/60">{description}</p>}
                </div>
                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-4 p-1.5 rounded-lg text-charcoal/40 hover:text-charcoal hover:bg-black/5 transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}
            <div className={cn(title ? 'p-6 pt-4' : 'p-6')}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ---- Badge ----
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'forest' | 'sage' | 'verified' | 'pending' | 'confirmed' | 'cancelled' | 'completed';
  className?: string;
}

const badgeVariants = {
  default: 'bg-black/5 text-charcoal',
  forest: 'bg-forest/10 text-forest',
  sage: 'bg-sage/20 text-forest',
  verified: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  confirmed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
  completed: 'bg-blue-50 text-blue-700',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => (
  <span className={cn(
    'inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full',
    badgeVariants[variant],
    className
  )}>
    {children}
  </span>
);

// ---- Card ----
interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = false,
  hover = false,
  onClick,
  padding = 'md',
}) => {
  const Component = hover ? motion.div : 'div';
  const hoverProps = hover ? {
    whileHover: { y: -2, boxShadow: '0 8px 40px rgba(32, 39, 36, 0.10)' },
    transition: { duration: 0.2 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={cn(
        'rounded-2xl',
        glass ? 'glass shadow-glass' : 'bg-white shadow-card border border-black/5',
        hover && 'cursor-pointer',
        paddings[padding],
        className
      )}
      {...hoverProps}
    >
      {children}
    </Component>
  );
};

// ---- Loading Skeleton ----
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn(
    'animate-pulse rounded-lg bg-gradient-to-r from-black/5 via-black/8 to-black/5',
    className
  )} />
);

// ---- Star Rating ----
interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'sm', showCount }) => {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('flex', sizes[size])}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm font-medium text-charcoal">{rating.toFixed(1)}</span>
      {showCount !== undefined && (
        <span className="text-xs text-charcoal/50">({showCount.toLocaleString()})</span>
      )}
    </div>
  );
};

// ---- Divider ----
export const Divider: React.FC<{ className?: string; label?: string }> = ({ className, label }) => (
  <div className={cn('flex items-center gap-4', className)}>
    <div className="flex-1 border-t border-black/6" />
    {label && <span className="text-xs text-charcoal/40 font-medium">{label}</span>}
    <div className="flex-1 border-t border-black/6" />
  </div>
);

// ---- Avatar ----
interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-24 h-24 text-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({ src, alt, initials, size = 'md', className }) => (
  <div className={cn(
    'rounded-full overflow-hidden bg-sage/30 flex items-center justify-center flex-shrink-0 font-medium text-forest',
    avatarSizes[size],
    className
  )}>
    {src ? (
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    ) : (
      <span>{initials}</span>
    )}
  </div>
);

// ---- Loading Spinner ----
export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={cn(
      'border-2 border-forest/20 border-t-forest rounded-full animate-spin',
      sizes[size],
      className
    )} />
  );
};

// ---- Empty State ----
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    {icon && <div className="mb-4 text-charcoal/20">{icon}</div>}
    <h3 className="text-base font-semibold text-charcoal mb-1">{title}</h3>
    {description && <p className="text-sm text-charcoal/50 max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
