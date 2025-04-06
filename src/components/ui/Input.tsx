'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', fullWidth = true, icon, ...props }, ref) => {
    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            htmlFor={props.id} 
            className="block text-sm font-medium text-foreground mb-1"
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/50">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              px-4 py-2 bg-white dark:bg-neutral border border-neutral/30 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              transition-colors w-full ${icon ? 'pl-10' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/30 focus:border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 