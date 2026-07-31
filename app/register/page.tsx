'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAuth } from '@/context/AuthContext';

import { ArrowLeft } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await registerUser({
        firstName,
        lastName,
        email,
        password,
        organizationName: organizationName || undefined,
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6 text-text-primary relative">
      <button
        type="button"
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-mono text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-xs"
        title="Go to previous page"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link href="/" title="Go to Home Landing Page" className="inline-block group cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden mx-auto shadow-xs group-hover:border-primary/50 transition-colors">
              <img src="/logo.png" alt="Froncort.Ai" className="w-full h-full object-contain p-1" />
            </div>
          </Link>
          <h1 className="text-[24px] font-semibold text-text-primary tracking-tight">
            Create your account
          </h1>
          <p className="text-xs text-text-secondary">
            Get started with your unified organization workspace
          </p>
        </div>

        {/* Register Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-[10px] border border-border bg-surface shadow-xs space-y-4"
        >
          {error && (
            <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="First Name"
              placeholder="Aarav"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <FormInput
              label="Last Name"
              type="text"
              placeholder="Mehta"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <FormInput
            label="Work Email"
            type="email"
            placeholder="aarav@acme.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <PasswordInput
            label="Password"
            placeholder="Min 8 chars, uppercase, digit, symbol"
            helperText="At least 8 characters with 1 uppercase, 1 lowercase, 1 number & 1 symbol."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <FormInput
            label="Organization Name (Optional)"
            placeholder="Acme Workspace"
            helperText="Leave empty to auto-generate a workspace name."
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />

          <LoadingButton
            type="submit"
            isLoading={isLoading}
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2.5 rounded-md shadow-xs"
          >
            Register Account
          </LoadingButton>
        </form>

        {/* Sign in prompt */}
        <p className="text-center text-xs text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
