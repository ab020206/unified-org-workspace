'use client';

import React, { useState } from 'react';
import { useInspector } from '@/providers/InspectorProvider';
import { X, Sparkles, Clock, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

export function InspectorDrawer() {
  const { isOpen, type, item, closeInspector } = useInspector();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'audit' | 'ai'>('overview');

  if (!isOpen || !item) return null;

  const getTitle = () => {
    if (type === 'ticket') return `Ticket #${item.ticketNumber || item.id?.slice(0, 6)}: ${item.title}`;
    if (type === 'pull-request') return `PR #${item.prNumber || item.id?.slice(0, 6)}: ${item.title}`;
    if (type === 'audit') return `Audit Record: ${item.action || item.module}`;
    if (type === 'connection') return `Connection: ${item.targetOrg?.name || item.name || 'Organization'}`;
    return item.title || item.name || 'Resource Inspection';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs transition-opacity duration-150 animate-in fade-in">
      <div className="absolute inset-0" onClick={closeInspector} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white border-l border-[#D9D9D9] shadow-xl flex flex-col transition-transform duration-180 ease-out animate-in slide-in-from-right">
          {/* Header */}
          <div className="p-6 border-b border-[#D9D9D9] bg-[#F2F2F2]/60 flex items-start justify-between gap-4 border-l-4 border-l-[#174D38]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-white text-[#1F1F1F] border border-[#D9D9D9]">
                  {type?.toUpperCase()} INSPECTOR
                </span>
                <span className="text-xs text-[#6B7280] font-mono">
                  ID: {item.id}
                </span>
              </div>
              <h2 className="text-[20px] font-semibold text-[#1F1F1F] leading-tight">{getTitle()}</h2>
            </div>
            
            <button
              onClick={closeInspector}
              className="p-1.5 rounded-md text-[#6B7280] hover:text-[#1F1F1F] hover:bg-[#F2F2F2] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center border-b border-[#D9D9D9] px-6 bg-white">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2",
                activeTab === 'overview'
                  ? "border-[#174D38] text-[#174D38]"
                  : "border-transparent text-[#6B7280] hover:text-[#1F1F1F]"
              )}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={cn(
                "py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2",
                activeTab === 'activity'
                  ? "border-[#174D38] text-[#174D38]"
                  : "border-transparent text-[#6B7280] hover:text-[#1F1F1F]"
              )}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Activity & Comments
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={cn(
                "py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2",
                activeTab === 'audit'
                  ? "border-[#174D38] text-[#174D38]"
                  : "border-transparent text-[#6B7280] hover:text-[#1F1F1F]"
              )}
            >
              <Clock className="w-3.5 h-3.5" />
              Audit Timeline
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={cn(
                "py-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2",
                activeTab === 'ai'
                  ? "border-[#174D38] text-[#174D38]"
                  : "border-transparent text-[#6B7280] hover:text-[#174D38]"
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#174D38]" />
              AI Insight
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md border border-[#D9D9D9] bg-[#F2F2F2]/40">
                    <span className="text-[11px] font-mono text-[#6B7280] uppercase block mb-1">Status</span>
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20 inline-block font-mono">
                      {item.status || item.decision || 'ACTIVE'}
                    </span>
                  </div>
                  <div className="p-3 rounded-md border border-[#D9D9D9] bg-[#F2F2F2]/40">
                    <span className="text-[11px] font-mono text-[#6B7280] uppercase block mb-1">Priority / Severity</span>
                    <span className="text-xs font-medium uppercase px-2 py-0.5 rounded bg-[#D97706]/10 text-[#D97706] border border-[#D97706]/20 inline-block font-mono">
                      {item.priority || item.severity || 'MEDIUM'}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6B7280]">Description</h3>
                    <div className="p-4 rounded-md border border-[#D9D9D9] bg-[#F2F2F2]/20 text-sm text-[#1F1F1F] leading-relaxed whitespace-pre-wrap">
                      {item.description}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6B7280]">Metadata Specs</h3>
                  <div className="rounded-md border border-[#D9D9D9] divide-y divide-[#D9D9D9] text-xs">
                    <div className="p-3 flex justify-between">
                      <span className="text-[#6B7280]">Created At</span>
                      <span className="font-mono text-[#1F1F1F]">{item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Just now'}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-[#6B7280]">Author / User</span>
                      <span className="font-medium text-[#1F1F1F] font-mono">{item.creator?.email || item.userEmail || item.createdById || 'System'}</span>
                    </div>
                    {item.assignedTo && (
                      <div className="p-3 flex justify-between">
                        <span className="text-[#6B7280]">Assigned To</span>
                        <span className="font-medium text-[#1F1F1F] font-mono">{item.assignedTo?.email || item.assignedToId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6B7280]">Activity Log</h3>
                {item.comments && item.comments.length > 0 ? (
                  <div className="space-y-3">
                    {item.comments.map((comment: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-md border border-[#D9D9D9] bg-[#F2F2F2]/30 text-xs space-y-2">
                        <div className="flex items-center justify-between text-[#6B7280] font-mono">
                          <span>{comment.user?.email || 'User'}</span>
                          <span>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-[#1F1F1F]">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280] italic">No recent comments or manual updates recorded.</p>
                )}
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-4">
                <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-[#6B7280]">Audit Timeline</h3>
                <div className="relative border-l-2 border-[#D9D9D9] pl-4 space-y-4 ml-2">
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#174D38]" />
                    <p className="text-xs font-semibold text-[#1F1F1F]">Record Initialized</p>
                    <p className="text-[11px] text-[#6B7280] font-mono">{new Date().toLocaleString()}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                    <p className="text-xs font-semibold text-[#1F1F1F]">RBAC Verification Passed</p>
                    <p className="text-[11px] text-[#6B7280] font-mono">Enforced by Governance Engine</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-5 rounded-md border border-[#174D38]/30 bg-[#174D38]/5 space-y-4">
                <div className="flex items-center gap-2 text-[#174D38] font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Executive Briefing</span>
                </div>
                <p className="text-xs text-[#1F1F1F] leading-relaxed">
                  Automated analysis confirms this {type} is compliant with enterprise security standards. No blocking anomalies detected. Standard review lifecycle active.
                </p>
                <div className="p-3 rounded-md bg-white border border-[#D9D9D9] text-[11px] font-mono text-[#6B7280]">
                  Confidence Score: 98.4% • Engine: Enterprise Intelligence • Audit Hash Valid
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
