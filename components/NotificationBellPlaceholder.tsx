'use client';

import React from 'react';
import { Bell } from 'lucide-react';

export function NotificationBellPlaceholder() {
  return (
    <button
      type="button"
      className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/80 border border-transparent hover:border-border/50 transition-all focus:outline-none"
      title="Notifications"
    >
      <Bell className="w-4 h-4" />
      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary animate-pulse" />
    </button>
  );
}
