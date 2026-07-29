'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingButton } from '@/components/ui/LoadingButton';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col justify-center items-center p-6 text-[#1F1F1F]">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#174D38] text-white flex items-center justify-center font-bold mx-auto shadow-xs">
            <KeyRound className="w-5 h-5" />
          </div>
          <h1 className="text-[24px] font-semibold text-[#1F1F1F] tracking-tight">Forgot Password</h1>
          <p className="text-xs text-[#6B7280]">
            Enter your email to receive password reset instructions
          </p>
        </div>

        <div className="p-8 rounded-[10px] border border-[#D9D9D9] bg-white shadow-xs space-y-4">
          {submitted ? (
            <div className="p-4 rounded-md bg-[#15803D]/10 border border-[#15803D]/20 text-center space-y-2">
              <p className="text-sm font-semibold text-[#15803D]">
                Reset Link Sent
              </p>
              <p className="text-xs text-[#6B7280]">
                If an account exists for {email}, password reset instructions have been sent.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                label="Email Address"
                type="email"
                placeholder="aarav@acme.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <LoadingButton type="submit" isLoading={isLoading} className="w-full bg-[#174D38] hover:bg-[#123A2B] text-white font-medium py-2.5 rounded-md shadow-xs">
                Send Reset Link
              </LoadingButton>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6B7280] hover:text-[#174D38] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
