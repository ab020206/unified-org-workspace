'use client';

import React, { useState } from 'react';
import { KeyRound, Copy, Check, X, ShieldAlert } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: {
    member?: any;
    temporaryPassword?: string;
    invitationToken?: string;
    roleTitle?: string;
    email?: string;
  } | null;
}

export function CredentialHandoverModal({ isOpen, onClose, data }: Props) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !data) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const email = data.email || data.member?.user?.email || 'user@demo.com';
  const roleName = data.roleTitle || data.member?.role || 'MEMBER';
  const name = data.member?.user
    ? `${data.member.user.firstName} ${data.member.user.lastName}`
    : email;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-[10px] shadow-lg w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base text-text-primary">Credential Handover</h3>
              <p className="text-xs text-text-secondary">
                Generated user access & temporary credentials
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3.5 rounded-md border border-border bg-surface-secondary space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-text-primary">{name}</span>
            <span className="px-2 py-0.5 rounded bg-surface border border-border text-text-primary font-mono text-[10px] font-bold">
              {roleName}
            </span>
          </div>
          <p className="font-mono text-text-secondary text-[11px]">{email}</p>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between p-3 rounded-md bg-surface-secondary border border-border">
            <div>
              <span className="text-text-secondary text-[10px] block">Login Endpoint URL</span>
              <span className="text-text-primary font-semibold">
                {window.location.origin}/login
              </span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(`${window.location.origin}/login`, 'url')}
              className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-secondary text-text-primary text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-border font-sans"
            >
              {copiedField === 'url' ? (
                <Check className="w-3.5 h-3.5 text-success" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copiedField === 'url' ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          {data.temporaryPassword && (
            <div className="flex items-center justify-between p-3 rounded-md bg-warning/10 border border-warning/20">
              <div>
                <span className="text-warning text-[10px] block font-semibold">
                  Temporary Password
                </span>
                <span className="text-text-primary font-bold text-sm">
                  {data.temporaryPassword}
                </span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(data.temporaryPassword!, 'pass')}
                className="px-2.5 py-1 rounded-md bg-warning/20 hover:bg-warning/30 text-warning font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors font-sans"
              >
                {copiedField === 'pass' ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === 'pass' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}

          {data.invitationToken && (
            <div className="flex items-center justify-between p-3 rounded-md bg-surface-secondary border border-border">
              <div>
                <span className="text-text-secondary text-[10px] block font-semibold">
                  Invitation Link
                </span>
                <span className="text-text-primary font-medium text-xs truncate max-w-[200px] block">
                  {window.location.origin}/accept?token={data.invitationToken}
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${window.location.origin}/accept?token=${data.invitationToken}`,
                    'invite'
                  )
                }
                className="px-2.5 py-1 rounded-md bg-surface hover:bg-surface-secondary text-text-primary font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors border border-border font-sans"
              >
                {copiedField === 'invite' ? (
                  <Check className="w-3.5 h-3.5 text-success" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedField === 'invite' ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="p-3 rounded-md bg-surface-secondary border border-border text-[11px] text-text-secondary flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <p>
            Please copy these credentials and store them securely. Temporary passwords should be
            changed immediately upon first login.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all shadow-xs cursor-pointer"
          >
            Done & Close
          </button>
        </div>
      </div>
    </div>
  );
}
