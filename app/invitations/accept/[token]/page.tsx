'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MailCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AcceptInvitationPage() {
  const { token } = useParams() as { token: string };
  const { acceptInvitation, user } = useAuth();
  const router = useRouter();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) return;

    if (!user) {
      // Redirect to login if user is not logged in
      router.push(`/login?redirect=/invitations/accept/${token}`);
      return;
    }

    acceptInvitation(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      })
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err.message || 'Failed to accept invitation token');
      });
  }, [token, user, acceptInvitation, router]);

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl border border-border bg-card shadow-sm text-center space-y-4">
        {status === 'loading' && (
          <div className="py-8 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <h2 className="font-bold text-base text-foreground">Processing Invitation...</h2>
            <p className="text-xs text-muted-foreground">
              Validating your membership invitation token.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <MailCheck className="w-6 h-6" />
            </div>
            <h2 className="font-bold text-base text-foreground">Invitation Accepted!</h2>
            <p className="text-xs text-muted-foreground">
              You have joined the workspace. Redirecting to dashboard...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 space-y-3">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium">
              {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
