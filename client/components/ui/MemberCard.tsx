'use client';

import React from 'react';
import { Shield } from 'lucide-react';
import { OrganizationMemberDto } from '@workspace/shared-types';

export function MemberCard({ member }: { member: OrganizationMemberDto }) {
  return (
    <div className="p-3.5 rounded-xl border border-border bg-surface shadow-xs flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-xs">
          {member.user.firstName[0]}
          {member.user.lastName[0]}
        </div>
        <div>
          <h4 className="font-semibold text-xs text-text-primary">
            {member.user.firstName} {member.user.lastName}
          </h4>
          <p className="text-[11px] text-text-secondary font-mono">{member.user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-secondary text-text-primary border border-border text-[11px] font-medium font-mono">
        <Shield className="w-3 h-3 text-primary" />
        <span>{member.role}</span>
      </div>
    </div>
  );
}
