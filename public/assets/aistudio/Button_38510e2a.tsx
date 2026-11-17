import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils';
import { sounds } from '../../utils/sounds';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'sage' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-forest text-white hover:bg-forest-600 shadow-sm hover:shadow-md focus:ring-forest/30',
  secondary: 'bg-white text-forest border border-forest/20 hover:bg-forest/5 shadow-sm focus:ring-forest/20',
  ghost: 'text-charcoal hover:bg-black/5 focus:ring-black/10',
  sage: 'bg-sage/20 text-forest border border-sage/30 hover:bg-sage/30 focus:ring-sage/30',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md focus:ring-red-300',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-sm rounded-xl gap-2',
  xl: 'px-8 py-4 text-base rounded-xl gap-2.5',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, fullWidth, children, className, onClick, disabled, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      sounds.click();
      onClick?.(e);
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        onClick={handleClick}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon}
        {children}
        {!loading && iconRight}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
