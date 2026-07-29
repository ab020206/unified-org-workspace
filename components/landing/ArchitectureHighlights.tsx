'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Server, KeyRound, Database, Layers, Cpu, Sparkles, ArrowRight } from 'lucide-react';

export const ArchitectureHighlights: React.FC = () => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = [
    { id: 'frontend', name: 'Next.js Frontend', type: 'Client App', icon: Globe },
    { id: 'api', name: 'Express API Gateway', type: 'REST Server', icon: Server },
    { id: 'auth', name: 'JWT Auth & RBAC', type: 'Security Engine', icon: KeyRound },
    { id: 'redis', name: 'Redis Cache', type: 'In-Memory State', icon: Layers },
    { id: 'postgres', name: 'PostgreSQL & Prisma', type: 'Primary Storage', icon: Database },
    { id: 'workers', name: 'Async Background Workers', type: 'Task Queue', icon: Cpu },
    { id: 'ai', name: 'AI Digest Service', type: 'LLM Worker', icon: Sparkles },
  ];

  return (
    <section
      id="architecture"
      className="py-20 border-b border-border bg-background relative text-text-primary"
    >
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-primary text-xs font-mono font-medium shadow-xs">
            Technical Stack Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight">
            High-Performance System Design
          </h2>
          <p className="text-xs md:text-sm text-text-secondary">
            Interactive visualization of our end-to-end request flow, data persistence, and
            background queue workers.
          </p>
        </div>

        {/* Architecture Node Flow */}
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative">
          {nodes.map((node, idx) => {
            const Icon = node.icon;
            const isHovered = hoveredNode === node.id;
            return (
              <div key={node.id} className="relative">
                <motion.div
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                  className={`p-4 rounded-[10px] border bg-surface space-y-3 text-center transition-all cursor-pointer h-full flex flex-col justify-between shadow-xs ${
                    isHovered ? 'border-primary ring-1 ring-primary' : 'border-border'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 mx-auto rounded-md bg-surface-secondary border border-border flex items-center justify-center text-primary">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-semibold text-text-primary line-clamp-1">
                      {node.name}
                    </div>
                    <div className="text-[10px] font-mono text-text-secondary">{node.type}</div>
                  </div>

                  <span className="text-[9px] font-mono font-medium px-2 py-0.5 rounded bg-surface-secondary text-text-primary border border-border">
                    Step 0{idx + 1}
                  </span>
                </motion.div>

                {idx < nodes.length - 1 && (
                  <div className="hidden md:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-text-secondary">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Details Note */}
        <div className="p-4 rounded-[10px] border border-border bg-surface text-center max-w-2xl mx-auto text-xs text-text-secondary font-mono shadow-xs">
          <span className="text-primary font-semibold">&gt; Architecture SLA:</span> 99.99% Uptime
          SLA • Automatic Failover • Zero-Downtime Migration Support
        </div>
      </div>
    </section>
  );
};
