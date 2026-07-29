'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DemoCredentialsPanel } from '@/components/auth/DemoCredentialsPanel';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCredential = (selectedEmail: string, selectedPass: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 font-sans relative overflow-x-hidden flex flex-col justify-between items-center select-none">
      {/* Brand Header & Theme Toggle */}
      <header className="w-full max-w-5xl flex items-center justify-between pt-4 pb-2 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden shadow-xs shrink-0">
            <img src="/logo.png" alt="Froncort.ai" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-text-primary block">
              Froncort.ai Workspace
            </span>
            <span className="text-[10px] font-mono text-text-secondary font-medium tracking-wider uppercase">
              Enterprise Multi-Tenant Platform
            </span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Main Container - Responsive 2-column layout on large screens */}
      <main className="w-full max-w-5xl my-auto py-6 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Login Form */}
        <div className="lg:col-span-5 w-full space-y-4">
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-8 rounded-xl border border-border bg-surface shadow-sm space-y-5"
          >
            <div className="space-y-1 text-center pb-3 border-b border-border">
              <h1 className="text-[20px] font-semibold text-text-primary tracking-tight">
                Sign in to workspace
              </h1>
              <p className="text-xs text-text-secondary">
                Enter your credentials or choose a quick demo account
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-xs font-medium text-center">
                {error}
              </div>
            )}

            <FormInput
              label="Email Address"
              type="email"
              placeholder="admin@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-text-secondary select-none">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-primary"
                  defaultChecked
                />
                Remember me
              </label>
              <Link href="/forgot-password" className="text-primary font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <LoadingButton
              type="submit"
              isLoading={isLoading}
              className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2.5 rounded-md transition-all shadow-xs cursor-pointer"
            >
              Sign In
            </LoadingButton>

            <p className="text-center text-xs text-text-secondary pt-1">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Register here
              </Link>
            </p>
          </form>
        </div>

        {/* Right Column: Demo Credentials Panel */}
        <div className="lg:col-span-7 w-full">
          <DemoCredentialsPanel onSelectCredential={handleSelectCredential} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center text-xs font-mono text-text-secondary pb-4 relative z-10">
        Froncort.ai Workspace &copy; 2026. Enterprise Edition.
      </footer>
    </div>
  );
}
