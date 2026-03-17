import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm active:scale-95',
      secondary: 'bg-enterprise-card-light dark:bg-enterprise-card-dark text-enterprise-text-light dark:text-enterprise-text-dark border border-enterprise-border-light dark:border-enterprise-border-dark hover:bg-slate-100 dark:hover:bg-slate-700 active:scale-95',
      ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-enterprise-text-light dark:text-enterprise-text-dark active:scale-95',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:scale-95',
      outline: 'bg-transparent border-2 border-primary-500 text-primary-500 hover:bg-primary-50 active:scale-95',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 disabled:opacity-50 disabled:pointer-events-none',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
