'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ArrowLeft,
  UserCheck,
  CheckCircle2,
  Copy,
  Download,
  Check,
  ShieldCheck,
  Key,
  Mail,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { ProtectedLayoutPlaceholder } from '@/components/ProtectedLayoutPlaceholder';
import { useAuth } from '@/context/AuthContext';
import { OnboardOrganizationResponse, Permission } from '@workspace/shared-types';

export default function CreateOrganizationPage() {
  const { onboardOrganization } = useAuth();
  const router = useRouter();

  // Wizard Step State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Org Details
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [logo, setLogo] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [timezone, setTimezone] = useState('UTC');
  const [description, setDescription] = useState('');

  // Step 2: Admin Details
  const [authMode, setAuthMode] = useState<'DIRECT' | 'INVITATION'>('DIRECT');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Execution & Step 3 Output State
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<OnboardOrganizationResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Organization Name is required');
      return;
    }
    setError('');
    setCurrentStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminFirstName.trim() || !adminLastName.trim() || !adminEmail.trim()) {
      setError('First Name, Last Name, and Email Address are required for Administrator');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await onboardOrganization({
        name,
        slug: slug || undefined,
        logo: logo || undefined,
        industry,
        timezone,
        description,
        authMode,
        adminFirstName,
        adminLastName,
        adminEmail,
        adminPhone: adminPhone || undefined,
        adminPassword: adminPassword || undefined,
      });

      setResultData(res);
      setCurrentStep(3);
    } catch (err: any) {
      setError(err?.message || 'Failed to onboard organization and administrator');
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pass = 'Pass!';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(pass);
  };

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadCredentials = () => {
    if (!resultData) return;
    const content = `====================================================
ENTERPRISE WORKSPACE CREDENTIALS & ONBOARDING SUMMARY
====================================================

ORGANIZATION DETAILS:
---------------------
Name: ${resultData.organization.name}
Slug: ${resultData.organization.slug}
ID: ${resultData.organization.id}
Created At: ${resultData.organization.createdAt}

ORGANIZATION ADMINISTRATOR:
---------------------------
Name: ${resultData.administrator.firstName} ${resultData.administrator.lastName}
Email: ${resultData.administrator.email}
Role: ${resultData.administrator.role}

AUTHENTICATION CREDENTIALS:
---------------------------
Auth Mode: ${resultData.authMode}
Login URL: ${window.location.origin}/login
${resultData.temporaryPassword ? `Temporary Password: ${resultData.temporaryPassword}\n(Force password change on first login required)` : ''}
${resultData.invitationToken ? `Invitation Token: ${resultData.invitationToken}\nInvitation Link: ${window.location.origin}/accept?token=${resultData.invitationToken}` : ''}

====================================================
Confidential - Keep Secure
====================================================`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resultData.organization.slug}-credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ProtectedLayoutPlaceholder permission={Permission.ORG_CREATE}>
      <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-12">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => (currentStep === 2 ? setCurrentStep(1) : router.back())}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 2 ? 'Back to Step 1' : 'Back to Organizations'}
          </button>
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
            Enterprise Provisioning Engine
          </span>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Provision New Organization
          </h1>
          <p className="text-xs text-text-secondary">
            Set up a multi-tenant enterprise workspace and provision its primary Organization
            Administrator.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl border border-border bg-surface shadow-xs">
          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
              currentStep === 1
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : currentStep > 1
                  ? 'bg-success/10 text-success font-semibold border border-success/20'
                  : 'text-text-secondary'
            }`}
          >
            {currentStep > 1 ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Building2 className="w-4 h-4 shrink-0" />
            )}
            <span className="text-xs font-mono truncate">1. Workspace Info</span>
          </div>

          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
              currentStep === 2
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : currentStep > 2
                  ? 'bg-success/10 text-success font-semibold border border-success/20'
                  : 'text-text-secondary'
            }`}
          >
            {currentStep > 2 ? (
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            ) : (
              <UserCheck className="w-4 h-4 shrink-0" />
            )}
            <span className="text-xs font-mono truncate">2. Admin Provisioning</span>
          </div>

          <div
            className={`flex items-center gap-2 p-2.5 rounded-lg transition-all ${
              currentStep === 3
                ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                : 'text-text-secondary'
            }`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span className="text-xs font-mono truncate">3. Credentials Handover</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-error/10 border border-error/20 text-error text-xs font-semibold font-mono">
            {error}
          </div>
        )}

        {/* STEP 1: Organization Details */}
        {currentStep === 1 && (
          <form
            onSubmit={handleStep1Submit}
            className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-5"
          >
            <div className="border-b border-border pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <h3 className="font-extrabold text-sm text-text-primary">
                Step 1: Organization Profile & Branding
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormInput
                  label="Organization Display Name *"
                  placeholder="e.g. Acme Health Technologies"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <FormInput
                label="Custom URL Slug (Optional)"
                placeholder="acme-health"
                helperText="Auto-generated if left blank."
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />

              <FormInput
                label="Logo URL (Optional)"
                placeholder="https://example.com/logo.png"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
              />

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Industry Sector
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                >
                  <option value="Technology">Technology & Software</option>
                  <option value="Healthcare">Healthcare & BioTech</option>
                  <option value="Finance">Fintech & Banking</option>
                  <option value="Retail">Retail & E-commerce</option>
                  <option value="Manufacturing">Manufacturing & Supply Chain</option>
                  <option value="Government">Government & Public Sector</option>
                  <option value="Other">Other Enterprise</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Primary Workspace Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">EST - New York (UTC-5)</option>
                  <option value="America/Los_Angeles">PST - San Francisco (UTC-8)</option>
                  <option value="Europe/London">GMT - London (UTC+0)</option>
                  <option value="Asia/Tokyo">JST - Tokyo (UTC+9)</option>
                  <option value="Asia/Kolkata">IST - India (UTC+5:30)</option>
                </select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Organization Description (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief description of the organization, purpose, or regional scope..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Administrator Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Administrator Provisioning */}
        {currentStep === 2 && (
          <form
            onSubmit={handleStep2Submit}
            className="p-6 rounded-2xl border border-border bg-surface shadow-xs space-y-5"
          >
            <div className="border-b border-border pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                <h3 className="font-extrabold text-sm text-text-primary">
                  Step 2: Create First Organization Administrator
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                Role: Organization Admin
              </span>
            </div>

            {/* Auth Mode Tabs */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Authentication & Credentials Flow
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-secondary border border-border">
                <button
                  type="button"
                  onClick={() => setAuthMode('DIRECT')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    authMode === 'DIRECT'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Direct Temporary Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('INVITATION')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    authMode === 'INVITATION'
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email Invitation Token</span>
                </button>
              </div>
            </div>

            {/* Admin Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="First Name *"
                placeholder="Aarav"
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                required
              />

              <FormInput
                label="Last Name *"
                placeholder="Mehta"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                required
              />

              <div className="sm:col-span-2">
                <FormInput
                  label="Administrator Email Address *"
                  placeholder="admin@acmehealth.demo"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                />
              </div>

              <FormInput
                label="Phone Number (Optional)"
                placeholder="+1 (555) 234-5678"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
              />

              <div className="space-y-1">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Assigned RBAC Role
                </label>
                <input
                  type="text"
                  disabled
                  value="Organization Admin (ADMIN)"
                  className="w-full rounded-lg border border-border bg-surface-secondary p-2.5 text-xs text-primary font-mono font-bold cursor-not-allowed"
                />
              </div>

              {authMode === 'DIRECT' && (
                <div className="sm:col-span-2 space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                      Initial Password (Optional / Auto-Generated if blank)
                    </label>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="text-[11px] font-mono text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <RefreshCw className="w-3 h-3" /> Generate Strong Password
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Leave blank for auto-generated temporary password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full rounded-lg border border-border bg-surface p-2.5 text-xs text-text-primary font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-xs font-semibold text-text-primary transition-all cursor-pointer shadow-xs"
              >
                Back to Step 1
              </button>

              <LoadingButton
                type="submit"
                isLoading={isLoading}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs transition-all shadow-xs"
              >
                Provision Enterprise Workspace & Admin
              </LoadingButton>
            </div>
          </form>
        )}

        {/* STEP 3: Handover & Success Screen */}
        {currentStep === 3 && resultData && (
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-6 animate-in fade-in duration-300">
            {/* Success Banner */}
            <div className="p-5 rounded-md bg-surface-secondary border border-border flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-success/10 text-success border border-success/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-text-primary">
                  Enterprise Organization Provisioned Successfully!
                </h2>
                <p className="text-xs text-text-secondary">
                  Workspace{' '}
                  <strong className="text-text-primary">{resultData.organization.name}</strong> and
                  primary Administrator{' '}
                  <strong className="text-text-primary">
                    {resultData.administrator.firstName} {resultData.administrator.lastName}
                  </strong>{' '}
                  are ready for immediate authentication.
                </p>
              </div>
            </div>

            {/* Details Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Org Card */}
              <div className="p-4 rounded-md border border-border bg-surface-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-secondary flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-primary" /> Organization Profile
                  </span>
                  <span className="px-2 py-0.5 rounded bg-success/10 border border-success/20 text-success text-[10px] font-mono font-bold">
                    HEALTHY
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-base font-bold text-text-primary">
                    {resultData.organization.name}
                  </p>
                  <p className="text-xs font-mono text-text-secondary">
                    Slug: {resultData.organization.slug}
                  </p>
                  <p className="text-[11px] font-mono text-muted-text truncate">
                    ID: {resultData.organization.id}
                  </p>
                </div>
              </div>

              {/* Admin Card */}
              <div className="p-4 rounded-md border border-border bg-surface-secondary/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase font-bold text-text-secondary flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-primary" /> Primary Administrator
                  </span>
                  <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-primary text-[10px] font-mono font-bold">
                    ORG ADMIN
                  </span>
                </div>
                <div className="space-y-1 pt-1">
                  <p className="text-base font-bold text-text-primary">
                    {resultData.administrator.firstName} {resultData.administrator.lastName}
                  </p>
                  <p className="text-xs font-mono text-text-secondary">
                    {resultData.administrator.email}
                  </p>
                  <p className="text-[11px] font-mono text-muted-text">
                    Status: Active Credentials Generated
                  </p>
                </div>
              </div>
            </div>

            {/* Credentials Handover Panel */}
            <div className="p-5 rounded-xl border border-border bg-surface-secondary space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-warning" />
                  <h3 className="font-extrabold text-sm text-text-primary">
                    Authentication & Handover Credentials
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold text-warning bg-warning/10 px-2 py-0.5 rounded border border-warning/20">
                  SECURE
                </span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                  <div>
                    <span className="text-text-secondary text-[10px] block">Login Endpoint URL</span>
                    <span className="text-text-primary font-bold">{window.location.origin}/login</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`${window.location.origin}/login`, 'url')}
                    className="px-2.5 py-1 rounded bg-surface-secondary hover:bg-surface border border-border text-text-primary text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'url' ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedField === 'url' ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-surface border border-border">
                  <div>
                    <span className="text-text-secondary text-[10px] block">
                      Administrator Account Email
                    </span>
                    <span className="text-text-primary font-bold">{resultData.administrator.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(resultData.administrator.email, 'email')}
                    className="px-2.5 py-1 rounded bg-surface-secondary hover:bg-surface border border-border text-text-primary text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-success" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedField === 'email' ? 'Copied!' : 'Copy Email'}</span>
                  </button>
                </div>

                {resultData.temporaryPassword && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div>
                      <span className="text-primary text-[10px] block font-bold">
                        Temporary Account Password
                      </span>
                      <span className="text-text-primary font-extrabold text-sm">
                        {resultData.temporaryPassword}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(resultData.temporaryPassword!, 'pass')}
                      className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors hover:bg-primary-hover"
                    >
                      {copiedField === 'pass' ? (
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'pass' ? 'Copied Password!' : 'Copy Password'}</span>
                    </button>
                  </div>
                )}

                {resultData.invitationToken && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div>
                      <span className="text-primary text-[10px] block font-bold">
                        Invitation Token Link
                      </span>
                      <span className="text-text-primary font-bold text-xs truncate max-w-sm block">
                        {window.location.origin}/accept?token={resultData.invitationToken}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          `${window.location.origin}/accept?token=${resultData.invitationToken}`,
                          'invite'
                        )
                      }
                      className="px-2.5 py-1 rounded bg-primary text-primary-foreground font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors hover:bg-primary-hover"
                    >
                      {copiedField === 'invite' ? (
                        <Check className="w-3.5 h-3.5 text-primary-foreground" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedField === 'invite' ? 'Copied Link!' : 'Copy Invite Link'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
              <button
                type="button"
                onClick={downloadCredentials}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-primary font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xs"
              >
                <Download className="w-4 h-4 text-primary" /> Download (.txt) Credentials
              </button>

              <div className="w-full sm:w-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setName('');
                    setSlug('');
                    setAdminFirstName('');
                    setAdminLastName('');
                    setAdminEmail('');
                    setAdminPassword('');
                    setResultData(null);
                    setCurrentStep(1);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-secondary text-text-primary font-bold text-xs cursor-pointer transition-all shadow-xs"
                >
                  Provision Another Tenant
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/organizations')}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  Go to Organizations Directory
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayoutPlaceholder>
  );
}
