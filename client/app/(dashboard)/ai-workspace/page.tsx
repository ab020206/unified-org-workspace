'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CommandBar } from '@/components/ui/CommandBar';
import {
  Sparkles,
  Send,
  Bot,
  User,
  AlertTriangle,
  ArrowRight,
  Brain,
  Activity,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  relatedResources?: {
    type: 'ticket' | 'pr' | 'audit' | 'org';
    label: string;
    href: string;
  }[];
}

export default function AIWorkspacePage() {
  const { user, activeOrganization } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${user?.firstName || 'Engineer'}, welcome to your AI Workspace. I've indexed ${activeOrganization?.name || 'your workspace'}'s active tickets, pull requests, audit events, and cross-tenant shares.`,
      timestamp: 'Just now',
    },
  ]);

  const quickPrompts = [
    { label: 'Why is Ticket #421 blocked?', query: 'Why is Ticket #421 blocked?' },
    { label: "Summarize today's work", query: "Summarize today's work." },
    { label: 'Which PR is highest risk?', query: 'Which PR is highest risk?' },
    { label: 'Explain latest audit log', query: 'Explain the latest audit log event.' },
    { label: 'Organization Health Check', query: 'Which organization needs attention?' },
    { label: 'Auth-related work', query: 'Find authentication related work.' },
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      let aiText = '';
      let resources: ChatMessage['relatedResources'] = [];

      if (query.toLowerCase().includes('blocked') || query.toLowerCase().includes('421')) {
        aiText =
          'Ticket #TICK-421 ("API Gateway Rate Limiting Defect") is currently blocked waiting on Third-Party OAuth vendor confirmation and SLA escalation. Recommended action: Ping Partner Org Security lead.';
        resources = [
          { type: 'ticket', label: 'Ticket #TICK-421', href: '/tickets' },
          { type: 'org', label: 'Partner Org Shares', href: '/collaboration' },
        ];
      } else if (query.toLowerCase().includes('risk') || query.toLowerCase().includes('pr')) {
        aiText =
          'PR #PR-402 ("Refactor RBAC Permission Check Middleware") has highest risk due to touching core security authentication files. However, 2/2 senior reviewers have approved and zero security regressions were detected.';
        resources = [
          { type: 'pr', label: 'PR #PR-402', href: '/pull-requests' },
          { type: 'audit', label: 'Audit Trail', href: '/audit' },
        ];
      } else if (query.toLowerCase().includes('today') || query.toLowerCase().includes('summary')) {
        aiText =
          "Today's Engineering Summary: 14 tickets resolved (SLA 99.4%), 3 pull requests merged into production, 0 security anomalies logged. Velocity is up 18% compared to last week.";
        resources = [
          { type: 'ticket', label: 'Support Hub', href: '/tickets' },
          { type: 'pr', label: 'Review Console', href: '/pull-requests' },
        ];
      } else if (query.toLowerCase().includes('audit') || query.toLowerCase().includes('log')) {
        aiText =
          'Latest Audit Event: SECURITY_POLICY_UPDATED by admin@workspace.io. Enforced mandatory Two-Factor Authentication (2FA) and set 365-day SOC2 retention policy.';
        resources = [{ type: 'audit', label: 'View Audit Entry', href: '/audit' }];
      } else {
        aiText = `Analysis complete for query: "${query}". All system indicators are nominal across active organization "${activeOrganization?.name}". Zero critical vulnerabilities detected.`;
        resources = [{ type: 'org', label: 'Workspace Settings', href: '/settings' }];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        relatedResources: resources,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Context Command Bar */}
      <CommandBar
        moduleName="AI Workspace"
        moduleAccent="ai"
        breadcrumbs={['Workspace', 'AI Intelligence Layer']}
        searchPlaceholder="Ask AI assistant about tickets, PRs, or audit events..."
        onAiQuickAction={() => handleSend("Summarize today's work.")}
      />

      {/* Greeting Banner & Risk Overview */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-cyan-500/5 space-y-4 module-accent-ai shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-extrabold text-foreground">
                Good afternoon, {user?.firstName || 'Engineer'}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              AI Assistant is monitoring {activeOrganization?.name || 'Workspace'}. All modules operate at 99.99% reliability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-center">
              <span className="block text-[10px] font-mono text-muted-foreground uppercase">Risk Index</span>
              <span className="text-sm font-extrabold text-emerald-500 font-mono">LOW (1.2%)</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-card border border-border text-center">
              <span className="block text-[10px] font-mono text-muted-foreground uppercase">Velocity</span>
              <span className="text-sm font-extrabold text-cyan-400 font-mono">+18% High</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat Left + Executive Brief Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cursor-style Conversational AI Chat Interface */}
        <div className="lg:col-span-2 panel-card p-6 flex flex-col justify-between h-[650px] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-sm text-foreground">AI Intelligence Chat</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Gemini Model
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Press ⌘K for Command Bar</span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[82%] p-3.5 rounded-2xl space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-xs'
                      : 'bg-muted/40 border border-border text-foreground rounded-tl-xs'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                  {msg.relatedResources && msg.relatedResources.length > 0 && (
                    <div className="pt-2 border-t border-border/60 flex flex-wrap gap-2">
                      {msg.relatedResources.map((res, i) => (
                        <Link
                          key={i}
                          href={res.href}
                          className="px-2.5 py-1 rounded bg-card hover:bg-secondary border border-border text-[11px] font-mono font-semibold text-primary flex items-center gap-1 transition-all"
                        >
                          <span>{res.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}

                  <span className="block text-[9px] text-muted-foreground font-mono text-right pt-0.5">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl bg-muted/40 border border-border text-muted-foreground text-xs font-mono animate-pulse">
                  Analyzing system state...
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts Chips */}
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
              Suggested Contextual Queries:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p.query)}
                  className="px-2.5 py-1 rounded-lg border border-border bg-card hover:bg-secondary hover:border-cyan-500/40 text-[11px] font-medium text-foreground transition-all cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 pt-2"
            >
              <input
                type="text"
                placeholder="Ask AI about tickets, PRs, audit events, or security rules..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 rounded-xl border border-border bg-card p-3 text-xs text-foreground focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="p-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-xs flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Executive Brief & Risk Feed */}
        <div className="space-y-4">
          <div className="panel-card p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Executive Briefing
              </h3>
              <span className="text-[10px] font-mono text-muted-foreground">Live Feed</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Today's Work</span>
                <p className="font-semibold text-foreground">14 Tickets Triage • 3 PRs Merged</p>
                <p className="text-muted-foreground text-[11px]">All customer SLAs met with zero escalations.</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Pending Code Reviews</span>
                <p className="font-semibold text-foreground">2 PRs awaiting secondary approval</p>
                <p className="text-muted-foreground text-[11px]">Average review time: 1.4 hours.</p>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Security Compliance</span>
                <p className="font-semibold text-foreground">SOC 2 Audit Trail Active</p>
                <p className="text-muted-foreground text-[11px]">Zero unauthorized access attempts.</p>
              </div>
            </div>
          </div>

          <div className="panel-card module-accent-security p-5 space-y-3">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Smart Recommendations
            </h3>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 space-y-0.5">
                <span className="font-bold">⚠️ Payment API Review Overdue</span>
                <p className="text-[11px] opacity-90">Reviewer SLA expires in 45 minutes.</p>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 space-y-0.5">
                <span className="font-bold">⚠️ Vendor Waiting 4 Days</span>
                <p className="text-[11px] opacity-90">Cross-org share request pending response.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
