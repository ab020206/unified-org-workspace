'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive';
}

export function LoadingButton({
  children,
  isLoading = false,
  variant = 'primary',
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium text-[14px] rounded-md px-4 py-2.5 transition-all shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#174D38] text-white hover:bg-[#123A2B] focus:ring-[#174D38]',
    secondary: 'bg-[#F2F2F2] text-[#1F1F1F] hover:bg-[#CBCBCB]/40 focus:ring-[#174D38]',
    outline:
      'border border-[#D9D9D9] bg-white text-[#1F1F1F] hover:bg-[#F2F2F2] focus:ring-[#174D38]',
    destructive:
      'bg-[#4D1717] text-white hover:bg-[#381010] focus:ring-[#4D1717]',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {children}
    </button>
  );
}
