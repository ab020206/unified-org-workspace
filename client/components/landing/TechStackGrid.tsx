'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const TechStackGrid: React.FC = () => {
  const stack = [
    { name: 'Next.js 15', category: 'Frontend App Framework' },
    { name: 'React 19', category: 'UI Component Architecture' },
    { name: 'TypeScript', category: 'Strict Type System' },
    { name: 'Tailwind CSS', category: 'Utility Design System' },
    { name: 'Node.js', category: 'Runtime Environment' },
    { name: 'Express', category: 'API Server Gateway' },
    { name: 'Prisma', category: 'Type-Safe ORM' },
    { name: 'PostgreSQL', category: 'Relational Database' },
    { name: 'Redis', category: 'In-Memory Cache & Queues' },
    { name: 'JWT & OAuth2', category: 'Auth & Session Tokens' },
    { name: 'Docker', category: 'Containerization' },
    { name: 'OpenAI / Gemini', category: 'LLM Intelligence' },
  ];

  return (
    <section className="py-20 border-b border-[#D9D9D9] bg-[#F2F2F2] relative text-[#1F1F1F]">
      <div className="max-w-7xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#D9D9D9] bg-white text-[#174D38] text-xs font-mono font-medium shadow-xs">
            Production Technology Stack
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#1F1F1F] tracking-tight">
            Built on Industry-Standard Technology
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {stack.map((item) => (
            <motion.div
              key={item.name}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.15 }}
              className="p-3.5 rounded-[10px] border border-[#D9D9D9] bg-white text-center space-y-1 hover:border-[#174D38]/40 shadow-xs transition-colors"
            >
              <div className="font-semibold text-xs text-[#1F1F1F]">{item.name}</div>
              <div className="text-[10px] font-mono text-[#6B7280]">{item.category}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
