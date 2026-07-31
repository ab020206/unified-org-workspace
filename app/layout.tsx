import React from 'react';
import '@/styles/globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata = {
  title: 'Froncort.Ai | Unified Workspace',
  description: 'Production-ready unified organizational platform for Froncort.Ai',
  icons: {
    icon: '/logo.png',
    shortcut: '/favicon.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/20">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
