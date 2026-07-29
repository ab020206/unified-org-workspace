'use client';

import React from 'react';
import { Building2, Check } from 'lucide-react';
import { OrganizationDto } from '@workspace/shared-types';
import { cn } from '@/lib/utils';

interface OrganizationCardProps {
  organization: OrganizationDto;
  isActive?: boolean;
  onSelect?: () => void;
}

export function OrganizationCard({ organization, isActive, onSelect }: OrganizationCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'p-4 rounded-xl border transition-all cursor-pointer select-none flex items-center justify-between',
        isActive
          ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
          : 'border-border bg-card hover:border-border/80 hover:bg-secondary/40'
      )}
    >
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
          {organization.logo ? (
            <img
              src={organization.logo}
              alt={organization.name}
              className="w-full h-full rounded-lg object-cover"
            />
          ) : (
            <Building2 className="w-5 h-5" />
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground leading-tight">
            {organization.name}
          </h4>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            slug: {organization.slug}
          </p>
        </div>
      </div>

      {isActive && (
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </div>
      )}
    </div>
  );
}
