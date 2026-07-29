'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { useAuth } from '@/context/AuthContext';

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
    <div className="min-h-screen bg-[#F2F2F2] flex flex-col justify-center items-center p-6 text-[#1F1F1F]">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-lg bg-[#174D38] text-white flex items-center justify-center font-bold mx-auto shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-[24px] font-semibold text-[#1F1F1F] tracking-tight">Create your account</h1>
          <p className="text-xs text-[#6B7280]">
            Get started with your unified organization workspace
          </p>
        </div>

        {/* Register Form Card */}
        <form
          onSubmit={handleSubmit}
          className="p-8 rounded-[10px] border border-[#D9D9D9] bg-white shadow-xs space-y-4"
        >
          {error && (
            <div className="p-3 rounded-md bg-[#4D1717]/10 border border-[#4D1717]/20 text-[#4D1717] text-xs font-medium">
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

          <LoadingButton type="submit" isLoading={isLoading} className="w-full bg-[#174D38] hover:bg-[#123A2B] text-white font-medium py-2.5 rounded-md shadow-xs">
            Register Account
          </LoadingButton>
        </form>

        {/* Sign in prompt */}
        <p className="text-center text-xs text-[#6B7280]">
          Already have an account?{' '}
          <Link href="/login" className="text-[#174D38] font-medium hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
