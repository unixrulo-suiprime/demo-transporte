import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export const Card = ({ children, title, subtitle, className, headerAction }: CardProps) => {
  return (
    <div className={cn('card-premium p-6', className)}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            {title && <h3 className="text-lg font-semibold text-enterprise-text-light dark:text-enterprise-text-dark leading-none">{title}</h3>}
            {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
