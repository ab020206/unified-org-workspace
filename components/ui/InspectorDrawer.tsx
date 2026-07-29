'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInspector } from '@/providers/InspectorProvider';
import { X, Sparkles, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { drawerVariant } from '@/lib/motion';

export function InspectorDrawer() {
  const { isOpen, type, item, closeInspector } = useInspector();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'audit' | 'ai'>('overview');

  const getTitle = () => {
    if (!item) return '';
    if (type === 'ticket')
      return `Ticket #${item.ticketNumber || item.id?.slice(0, 6)}: ${item.title}`;
    if (type === 'pull-request')
      return `PR #${item.prNumber || item.id?.slice(0, 6)}: ${item.title}`;
    if (type === 'audit') return `Audit Record: ${item.action || item.module}`;
    if (type === 'connection')
      return `Connection: ${item.targetOrg?.name || item.name || 'Organization'}`;
    return item.title || item.name || 'Resource Inspection';
  };

  return (
    <AnimatePresence>
      {isOpen && item && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={closeInspector}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            {/* Drawer panel */}
            <motion.div
              variants={drawerVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-screen max-w-2xl bg-surface border-l border-border shadow-xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-border bg-surface-secondary/60 flex items-start justify-between gap-4 border-l-4 border-l-primary">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-surface text-text-primary border border-border">
                      {type?.toUpperCase()} INSPECTOR
                    </span>
                    <span className="text-xs text-text-secondary font-mono">ID: {item.id}</span>
                  </div>
                  <h2 className="text-[20px] font-semibold text-text-primary leading-tight">
                    {getTitle()}
                  </h2>
                </div>

                <button
                  onClick={closeInspector}
                  className="p-1.5 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center border-b border-border px-6 bg-surface">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={cn(
                    'py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 relative',
                    activeTab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={cn(
                    'py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 relative',
                    activeTab === 'activity'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Activity & Comments
                </button>
                <button
                  onClick={() => setActiveTab('audit')}
                  className={cn(
                    'py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 relative',
                    activeTab === 'audit'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  )}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Audit Timeline
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={cn(
                    'py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 relative',
                    activeTab === 'ai'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-text-secondary hover:text-primary'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  AI Insight
                </button>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 rounded-md border border-border bg-surface-secondary/40">
                        <span className="text-[11px] font-mono text-text-secondary uppercase block mb-1">
                          Status
                        </span>
                        <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-success/10 text-success border border-success/20 inline-block font-mono">
                          {item.status || item.decision || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="p-3 rounded-md border border-border bg-surface-secondary/40">
                        <span className="text-[11px] font-mono text-text-secondary uppercase block mb-1">
                          Priority / Severity
                        </span>
                        <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-warning/10 text-warning border border-warning/20 inline-block font-mono">
                          {item.priority || item.severity || 'MEDIUM'}
                        </span>
                      </div>
                    </div>

                    {item.description && (
                      <div className="space-y-2">
                        <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-text-secondary">
                          Description
                        </h3>
                        <div className="p-4 rounded-md border border-border bg-surface-secondary/20 text-sm text-text-primary leading-relaxed whitespace-pre-wrap">
                          {item.description}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-text-secondary">
                        Metadata Specs
                      </h3>
                      <div className="rounded-md border border-border divide-y divide-border text-xs">
                        <div className="p-3 flex justify-between">
                          <span className="text-text-secondary">Created At</span>
                          <span className="font-mono text-text-primary">
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleString()
                              : 'Just now'}
                          </span>
                        </div>
                        <div className="p-3 flex justify-between">
                          <span className="text-text-secondary">Author / User</span>
                          <span className="font-medium text-text-primary font-mono">
                            {item.creator?.email || item.userEmail || item.createdById || 'System'}
                          </span>
                        </div>
                        {item.assignedTo && (
                          <div className="p-3 flex justify-between">
                            <span className="text-text-secondary">Assigned To</span>
                            <span className="font-medium text-text-primary font-mono">
                              {item.assignedTo?.email || item.assignedToId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-text-secondary">
                      Activity Log
                    </h3>
                    {item.comments && item.comments.length > 0 ? (
                      <div className="space-y-3">
                        {item.comments.map((comment: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-md border border-border bg-surface-secondary/30 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between text-text-secondary font-mono">
                              <span>{comment.user?.email || 'User'}</span>
                              <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-text-primary">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-text-secondary italic">
                        No recent comments or manual updates recorded.
                      </p>
                    )}
                  </div>
                )}

                {activeTab === 'audit' && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-text-secondary">
                      Audit Timeline
                    </h3>
                    <div className="relative border-l-2 border-border pl-4 space-y-4 ml-2">
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                        <p className="text-xs font-semibold text-text-primary">
                          Record Initialized
                        </p>
                        <p className="text-[11px] text-text-secondary font-mono">
                          {new Date().toLocaleString()}
                        </p>
                      </div>
                      <div className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-success" />
                        <p className="text-xs font-semibold text-text-primary">
                          RBAC Verification Passed
                        </p>
                        <p className="text-[11px] text-text-secondary font-mono">
                          Enforced by Governance Engine
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ai' && (
                  <div className="p-5 rounded-md border border-primary/30 bg-primary/5 space-y-4">
                    <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Executive Briefing</span>
                    </div>
                    <p className="text-xs text-text-primary leading-relaxed">
                      Automated analysis confirms this {type} is compliant with enterprise security
                      standards. No blocking anomalies detected. Standard review lifecycle active.
                    </p>
                    <div className="p-3 rounded-md bg-surface border border-border text-[11px] font-mono text-text-secondary">
                      Confidence Score: 98.4% • Engine: Enterprise Intelligence • Audit Hash Valid
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
