'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, UserCheck, Layers, FileCode2, Flag, UserCog } from 'lucide-react';

export const SecurityDiagram: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState('jwt');

  const nodes = [
    {
      id: 'jwt',
      title: 'JWT Authentication',
      desc: 'RS256 signed bearer tokens with automatic rotation, strict expiration, and HTTP-only cookie support.',
      icon: Lock,
      status: 'Active (256-bit)',
    },
    {
      id: 'rbac',
      title: 'Role-Based Access (RBAC)',
      desc: 'Granular permissions (ADMIN, MEMBER, SUPPORT, REVIEWER) dynamically evaluated per API route.',
      icon: UserCheck,
      status: 'Strict Scoping',
    },
    {
      id: 'isolation',
      title: 'Tenant Isolation',
      desc: 'Database row-level security and explicit tenant context headers preventing cross-tenant leakage.',
      icon: Layers,
      status: '100% Isolated',
    },
    {
      id: 'audit',
      title: 'Immutable Audit Stream',
      desc: 'Cryptographic event signatures recording every action with before/after state payload diffs.',
      icon: FileCode2,
      status: 'SOC2 Compliant',
    },
    {
      id: 'flags',
      title: 'Feature Governance',
      desc: 'Organization-scoped feature flag evaluation permitting instant zero-downtime feature toggling.',
      icon: Flag,
      status: 'Real-time Sync',
    },
    {
      id: 'session',
      title: 'Session Management',
      desc: 'Global session revocation, active device tracking, and IP-restricted authentication limits.',
      icon: UserCog,
      status: 'Zero Trust',
    },
  ];

  const active = nodes.find((n) => n.id === selectedNode) || nodes[0];

  return (
    <section className="py-20 border-b border-border bg-background relative text-text-primary">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-border bg-surface text-primary text-xs font-mono font-medium shadow-xs">
            Zero-Trust Architecture
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-text-primary tracking-tight">
            Enterprise Security & Compliance
          </h2>
          <p className="text-xs md:text-sm text-text-secondary">
            Interactive breakdown of our enterprise-grade defense layers and data isolation
            controls.
          </p>
        </div>

        {/* Security Diagram Node Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;
            return (
              <motion.div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.15 }}
                className={`cursor-pointer p-5 rounded-[10px] border transition-all space-y-3 relative shadow-xs ${
                  isSelected
                    ? 'border-primary bg-surface ring-1 ring-primary'
                    : 'border-border bg-surface hover:bg-surface-secondary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-md bg-surface-secondary border border-border flex items-center justify-center text-primary">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-surface-secondary text-text-primary border border-border">
                    {node.status}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-text-primary">{node.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed">{node.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Detail Card */}
        <div className="p-5 rounded-[10px] border border-border bg-surface flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto shadow-xs">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-text-primary">
                {active.title} Deep Dive
              </span>
            </div>
            <p className="text-xs text-text-secondary">{active.desc}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3 py-1 rounded-md text-xs font-mono font-medium bg-success/10 text-success border border-success/20">
              Verified Compliant
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
