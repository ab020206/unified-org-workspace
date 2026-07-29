'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, ShieldCheck, ChevronDown, ChevronUp, KeyRound } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAuth } from '@/context/AuthContext';
import { DEMO_USERS } from '../../../packages/shared-config/demoUsers';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoRoles, setShowDemoRoles] = useState(false);

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

  const handleQuickLogin = async (loginEmail: string, loginPassword: string) => {
    setEmail(loginEmail);
    setPassword(loginPassword);
    setError('');
    setIsLoading(true);

    try {
      await login({ email: loginEmail, password: loginPassword });
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Authentication failed.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 md:p-8 font-sans relative overflow-x-hidden flex flex-col justify-between items-center select-none">
      {/* Brand Header & Theme Toggle */}
      <header className="w-full max-w-md flex items-center justify-between pt-6 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-xs">
            <Layers className="w-5 h-5" />
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

      {/* Centered Login Card */}
      <main className="w-full max-w-md my-auto py-6 relative z-10 space-y-4">
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-[10px] border border-border bg-surface shadow-xs space-y-5"
        >
          <div className="space-y-1 text-center pb-3 border-b border-border">
            <h1 className="text-[20px] font-semibold text-text-primary tracking-tight">Sign in to workspace</h1>
            <p className="text-xs text-text-secondary">Enter your credentials or choose a quick demo account</p>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-error/10 border border-error/20 text-error text-xs font-medium text-center">
              {error}
            </div>
          )}

          <FormInput
            label="Email Address"
            type="email"
            placeholder="superadmin@platform.demo"
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

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-border space-y-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('superadmin@platform.demo', 'Demo@12345')}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-md bg-surface-secondary hover:bg-surface border border-border text-primary text-xs font-medium transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>One-Click Sign In as Platform Super Admin</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDemoRoles(!showDemoRoles)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-primary" />
                <span>Other Demo Accounts ({DEMO_USERS.length})</span>
              </span>
              {showDemoRoles ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoRoles && (
              <div className="grid grid-cols-1 gap-1.5 pt-1 max-h-48 overflow-y-auto pr-1">
                {DEMO_USERS.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleQuickLogin(user.email, user.password)}
                    className="flex items-center justify-between px-3 py-2 rounded-md bg-surface-secondary/60 hover:bg-surface-secondary border border-border text-left transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-xs font-medium text-text-primary group-hover:text-primary">
                        {user.roleTitle}
                      </div>
                      <div className="text-[10px] text-text-secondary font-mono">{user.email}</div>
                    </div>
                    <span className="text-[9px] font-mono font-medium uppercase px-1.5 py-0.5 rounded bg-surface text-primary border border-border">
                      {user.roleBadge}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-xs text-text-secondary pt-1">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline">
              Register here
            </Link>
          </p>
        </form>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-md text-center text-xs font-mono text-text-secondary pb-6 relative z-10">
        Froncort.ai Workspace &copy; 2026. Enterprise Edition.
      </footer>
    </div>
  );
}
