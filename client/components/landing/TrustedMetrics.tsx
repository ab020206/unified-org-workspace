'use client';

import React from 'react';

export const TrustedMetrics: React.FC = () => {
  const metrics = [
    { label: 'Active Enterprise Orgs', value: '500+' },
    { label: 'Support Tickets Processed', value: '1.2M+' },
    { label: 'Audit Logs Retained', value: '450M+' },
    { label: 'Code Reviews Completed', value: '85,000+' },
    { label: 'AI Summaries Generated', value: '3.4M+' },
    { label: 'API Uptime SLA', value: '99.99%' },
  ];

  return (
    <section className="relative z-10 w-full border-y border-border bg-surface py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="text-center p-4 rounded-[10px] border border-border bg-surface-secondary/40 shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="text-2xl md:text-3xl font-extrabold font-sans text-text-primary tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs font-medium text-text-secondary mt-1">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
