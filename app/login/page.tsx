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

import { ArrowLeft } from 'lucide-react';

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
      {/* Brand Header & Navigation Controls */}
      <header className="w-full max-w-6xl flex items-center justify-between pt-4 pb-2 relative z-10">
        <Link href="/" title="Go to Home Landing Page" className="flex items-center gap-3 group cursor-pointer hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden shadow-xs shrink-0 group-hover:border-primary/50 transition-colors">
            <img src="/logo.png" alt="Froncort.Ai" className="w-full h-full object-contain p-1" />
          </div>
          <div>
            <span className="font-semibold text-base tracking-tight text-text-primary block group-hover:text-primary transition-colors">
              Froncort.Ai Workspace
            </span>
            <span className="text-[10px] font-mono text-text-secondary font-medium tracking-wider uppercase">
              Enterprise Multi-Tenant Platform
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface hover:bg-surface-secondary text-xs font-mono text-text-secondary hover:text-text-primary transition-all cursor-pointer shadow-xs"
            title="Navigate to Landing Page"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container - Responsive 50/50 equal column layout on large screens */}
      <main className="w-full max-w-6xl my-auto py-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Left Column: Login Form (50% Width, 50vh Height) */}
        <div className="w-full h-full">
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-7 rounded-xl border border-border bg-surface shadow-sm flex flex-col justify-between h-full min-h-[440px] max-h-[50vh] space-y-4"
          >
            <div className="space-y-3">
              <div className="space-y-1 text-center pb-2.5 border-b border-border">
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

              <div className="flex items-center justify-between text-xs pt-0.5">
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
            </div>

            <div className="space-y-2.5 pt-2.5 border-t border-border">
              <LoadingButton
                type="submit"
                isLoading={isLoading}
                className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-medium py-2.5 rounded-md transition-all shadow-xs cursor-pointer"
              >
                Sign In
              </LoadingButton>

              <p className="text-center text-xs text-text-secondary">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Register here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Column: Demo Credentials Panel (50% Width, 50vh Height) */}
        <div className="w-full h-full">
          <DemoCredentialsPanel onSelectCredential={handleSelectCredential} />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl text-center text-xs font-mono text-text-secondary pb-4 relative z-10">
        Froncort.Ai Workspace &copy; 2026. Enterprise Edition.
      </footer>
    </div>
  );
}
