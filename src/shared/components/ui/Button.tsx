import React from 'react';
import { cn } from '@/shared/utils/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
      outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
      ghost: 'hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2',
      danger: 'bg-danger-600 text-white hover:bg-danger-700 focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:ring-offset-2',
    };

    const sizes = {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 py-2',
      lg: 'h-12 px-6 text-lg',
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 
