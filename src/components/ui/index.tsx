import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, Clock, AlertCircle, ShieldCheck, Sun, Moon } from 'lucide-react';
import { cn } from '../../utils';
import { sounds } from '../../utils/sounds';
import { useUIStore } from '../../store';

// ---- Theme Toggle (Liquid Glass Dark / Light Switcher) ----
export const ThemeToggle: React.FC<{
  showLabel?: boolean;
  className?: string;
}> = ({ showLabel = false, className }) => {
  const { theme, toggleTheme } = useUIStore();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    sounds.toggle(!isDark);
    toggleTheme();
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={cn(
        'liquid-glass inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-charcoal/85 hover:text-charcoal hover:border-forest/40 cursor-pointer active:scale-[0.97] min-h-[38px]',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="sun"
            initial={{ rotate: -65, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 65, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22 }}
            className="inline-flex items-center justify-center text-amber-400"
          >
            <Sun size={15} />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ rotate: 65, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -65, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.22 }}
            className="inline-flex items-center justify-center text-forest"
          >
            <Moon size={15} />
          </motion.span>
        )}
      </AnimatePresence>
      {showLabel && (
        <span className="tracking-tight">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
      )}
    </button>
  );
};

// ---- Button ----
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sage' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary:
    'bg-forest text-white hover:bg-forest-600 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.22),0_4px_14px_rgba(18,60,50,0.25)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_6px_20px_rgba(18,60,50,0.35)] focus-visible:ring-forest/30',
  secondary:
    'liquid-glass text-forest border border-forest/25 hover:bg-forest/10 focus-visible:ring-forest/20',
  ghost: 'text-charcoal hover:bg-charcoal/8 focus-visible:ring-charcoal/15',
  sage: 'bg-sage/20 text-forest border border-sage/35 hover:bg-sage/30 backdrop-blur-md focus-visible:ring-sage/40',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-xs hover:shadow-sm focus-visible:ring-red-300',
};

const buttonSizes = {
  sm: 'px-3.5 py-2 text-xs rounded-lg gap-1.5 min-h-[36px]',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2 min-h-[40px]',
  lg: 'px-6 py-3 text-sm rounded-xl gap-2 min-h-[44px]',
  xl: 'px-8 py-4 text-base rounded-xl gap-2.5 min-h-[48px]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      iconRight,
      fullWidth,
      children,
      className,
      onClick,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      sounds.click();
      onClick?.(e);
    };

    return (
      <button
        ref={ref}
        type={type}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer active:scale-[0.98]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonVariants[variant],
          buttonSizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          icon
        )}
        {children}
        {!loading && iconRight}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ---- Input ----
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/45 pointer-events-none z-10">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'liquid-glass-input w-full border rounded-xl px-4 py-2.5 text-sm text-charcoal min-h-[42px]',
              'placeholder:text-charcoal/40 transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              error
                ? 'border-red-400 focus:ring-red-200'
                : 'border-charcoal/14 hover:border-charcoal/28 focus:ring-forest/30 focus:border-forest/50',
              icon && 'pl-10',
              iconRight && 'pr-10',
              className
            )}
            {...props}
          />
          {iconRight && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal/45 z-10">
              {iconRight}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-charcoal/55">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ---- Textarea ----
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'liquid-glass-input w-full border rounded-xl px-4 py-3 text-sm text-charcoal',
            'placeholder:text-charcoal/40 transition-colors duration-150 resize-none',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-charcoal/14 hover:border-charcoal/28 focus:ring-forest/30 focus:border-forest/50',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-charcoal/55">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

// ---- Select ----
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'liquid-glass-input w-full border rounded-xl px-4 py-2.5 text-sm text-charcoal min-h-[42px]',
            'transition-colors duration-150 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            error
              ? 'border-red-400 focus:ring-red-200'
              : 'border-charcoal/14 hover:border-charcoal/28 focus:ring-forest/30 focus:border-forest/50',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ---- Status / Semantic Label (Unboxed clean text + icon per Zero-Pill Discipline) ----
interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'forest'
    | 'sage'
    | 'verified'
    | 'pending'
    | 'confirmed'
    | 'cancelled'
    | 'completed';
  className?: string;
}

const badgeStyles = {
  default: 'text-charcoal/70',
  forest: 'text-forest font-semibold',
  sage: 'text-forest/85 font-medium',
  verified: 'text-emerald-700 font-semibold',
  pending: 'text-amber-700 font-semibold',
  confirmed: 'text-emerald-700 font-semibold',
  cancelled: 'text-red-700 font-semibold',
  completed: 'text-forest font-semibold',
};

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const renderIcon = () => {
    switch (variant) {
      case 'verified':
        return <ShieldCheck size={13} className="text-emerald-600 shrink-0" />;
      case 'confirmed':
      case 'completed':
        return <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />;
      case 'pending':
        return <Clock size={13} className="text-amber-600 shrink-0" />;
      case 'cancelled':
        return <AlertCircle size={13} className="text-red-600 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs tracking-tight whitespace-nowrap shrink-0',
        badgeStyles[variant],
        className
      )}
    >
      {renderIcon()}
      {children}
    </span>
  );
};

// ---- Card (Liquid Glass Default) ----
interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const cardPaddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glass = true,
  hover = false,
  onClick,
  padding = 'md',
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-2xl transition-all duration-200',
        glass ? 'liquid-glass' : 'liquid-glass',
        hover && 'cursor-pointer hover:border-forest/35 hover:shadow-card-hover',
        cardPaddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// ---- Modal ----
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const modalSizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ duration: 0.18 }}
            className={cn(
              'relative w-full liquid-glass-strong rounded-2xl shadow-glass-xl max-h-[90vh] overflow-y-auto',
              modalSizes[size]
            )}
          >
            <div className="flex items-start justify-between p-6 pb-2">
              <div>
                {title && <h2 className="text-lg font-semibold text-charcoal">{title}</h2>}
                {description && <p className="mt-1 text-sm text-charcoal/60">{description}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="p-2 rounded-lg text-charcoal/45 hover:text-charcoal hover:bg-charcoal/8 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 pt-3">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ---- Star Rating ----
interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'sm', showCount }) => {
  const sizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };
  return (
    <div className="inline-flex items-center gap-1.5 tabular-nums">
      <span className={cn('text-amber-500 font-semibold', sizes[size])}>★</span>
      <span className="text-sm font-semibold text-charcoal">{rating.toFixed(2)}</span>
      {showCount !== undefined && (
        <span className="text-xs text-charcoal/55">({showCount.toLocaleString()} reviews)</span>
      )}
    </div>
  );
};

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

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Portrait',
  initials = 'MC',
  size = 'md',
  className,
}) => {
  const [imgErr, setImgErr] = React.useState(false);

  return (
    <div
      className={cn(
        'rounded-full overflow-hidden bg-forest/15 flex items-center justify-center shrink-0 font-semibold text-forest border border-forest/20',
        avatarSizes[size],
        className
      )}
    >
      {src && !imgErr ? (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImgErr(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// ---- Divider ----
export const Divider: React.FC<{ className?: string; label?: string }> = ({ className, label }) => (
  <div className={cn('flex items-center gap-4', className)}>
    <div className="flex-1 border-t border-charcoal/10" />
    {label && <span className="text-xs text-charcoal/45 font-medium">{label}</span>}
    <div className="flex-1 border-t border-charcoal/10" />
  </div>
);

// ---- Skeleton ----
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse rounded-lg bg-charcoal/8', className)} />
);

// ---- Empty State ----
export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="liquid-glass flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-charcoal/16 rounded-2xl">
    {icon && <div className="mb-3 text-forest/60">{icon}</div>}
    <h3 className="text-base font-semibold text-charcoal mb-1">{title}</h3>
    {description && <p className="text-sm text-charcoal/60 max-w-sm">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);
