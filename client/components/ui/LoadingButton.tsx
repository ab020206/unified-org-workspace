'use client';

import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonMotionProps } from '@/lib/motion';

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
    'inline-flex items-center justify-center gap-2 font-medium text-[14px] rounded-md px-4 py-2 transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary-hover focus:ring-primary',
    secondary:
      'bg-surface-secondary text-text-primary hover:bg-surface border border-border focus:ring-primary',
    outline:
      'border border-border bg-surface text-text-primary hover:bg-surface-secondary focus:ring-primary',
    destructive: 'bg-error text-white hover:opacity-90 focus:ring-error',
  };

  return (
    <motion.button
      {...buttonMotionProps}
      className={cn(baseStyles, variants[variant], className)}
      disabled={isLoading || disabled}
      {...(props as any)}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />}
      {children}
    </motion.button>
  );
}
