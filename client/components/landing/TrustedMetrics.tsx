'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
    <div className="w-full border-y border-[#D9D9D9] bg-white py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((metric, idx) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className="text-center p-4 rounded-[10px] border border-[#D9D9D9] bg-[#F2F2F2]/40 shadow-xs"
            >
              <div className="text-2xl md:text-3xl font-semibold font-mono text-[#1F1F1F] tracking-tight">
                {metric.value}
              </div>
              <div className="text-xs font-medium text-[#6B7280] mt-1">{metric.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
