'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5 w-full">
        <label htmlFor={inputId} className="block text-[14px] font-medium text-text-primary">
          {label}
        </label>
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-sm text-text-primary shadow-xs transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-muted-text',
            error ? 'border-error focus:ring-error text-error' : 'border-border',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error font-medium">{error}</p>}
        {helperText && !error && <p className="text-[13px] text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';
