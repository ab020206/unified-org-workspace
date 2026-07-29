'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CommandBar } from '@/components/ui/CommandBar';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Ticket,
  Clock,
  CheckCircle2,
  Search,
  PlusCircle,
  Paperclip,
  UserCheck,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_BASE_URL, getAuthHeaders } from '@/lib/api';

export function SupportAgentDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    fetch(`${API_BASE_URL}/tickets`, { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTickets(data.data.tickets || []);
        }
      })
      .catch((err) => console.error('Error fetching support tickets:', err));
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const urgentCount = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      {/* Command Bar */}
      <CommandBar
        moduleName="Support Hub — Agent Console"
        moduleAccent="support"
        breadcrumbs={['Support Hub', 'My Queue & SLA Scored Tickets']}
        searchPlaceholder="Search assigned tickets by title, category, priority, or customer payload..."
        primaryActionLabel="Create Ticket"
        onPrimaryAction={() => (window.location.href = '/tickets/new')}
      />

      {/* Personalized Welcome Banner */}
      <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-surface-secondary border border-border text-primary text-xs font-mono font-medium w-fit">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Role: Support Agent</span>
        </div>
        <h2 className="text-[24px] font-semibold text-text-primary tracking-tight">
          Welcome, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Support Agent'}
        </h2>
        <p className="text-sm text-text-secondary max-w-2xl leading-relaxed">
          You have <strong className="text-primary font-mono">{openCount} active tickets</strong> assigned to your queue (<strong className="text-warning font-mono">{urgentCount} high/urgent priority</strong>).
        </p>
      </div>

      {/* Support KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Assigned Tickets</span>
            <Ticket className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">{tickets.length}</p>
          <p className="text-[13px] text-text-secondary font-medium">Total Workspace Tickets</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>My Open Tickets</span>
            <Clock className="w-4 h-4 text-text-secondary" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">{openCount}</p>
          <p className="text-[13px] text-text-secondary font-medium">In Progress / Open</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>High Priority / Urgent</span>
            <Flame className="w-4 h-4 text-error" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">{urgentCount}</p>
          <p className="text-[13px] text-error font-medium">Requires Priority Action</p>
        </div>

        <div className="p-4 rounded-[10px] border border-border bg-surface shadow-xs space-y-1">
          <div className="flex items-center justify-between text-text-secondary text-[11px] font-mono uppercase font-medium">
            <span>Queue Health</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-[32px] font-semibold text-text-primary font-mono leading-tight">100%</p>
          <p className="text-[13px] text-success font-medium">Operational Target Met</p>
        </div>
      </div>

      {/* Main Support Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Tickets Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-text-primary">
                <Ticket className="w-4 h-4 text-primary" />
                <span>My Assigned Tickets Queue</span>
              </div>

              {/* Filter controls */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-text-secondary" />
                  <input
                    type="text"
                    placeholder="Search my tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md bg-surface border border-border text-xs text-text-primary focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <EmptyState
                title="No tickets assigned."
                description="Your support queue is currently clear! High-priority incoming tickets will appear here."
                icon={<Ticket className="w-6 h-6 text-text-secondary" />}
                action={
                  <Link
                    href="/tickets"
                    className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary-hover transition-all shadow-xs cursor-pointer"
                  >
                    Create Quick Ticket
                  </Link>
                }
              />
            ) : (
              <div className="divide-y divide-border">
                {filteredTickets.map((t) => (
                  <div key={t.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded border uppercase ${
                            t.priority === 'URGENT' || t.priority === 'HIGH'
                              ? 'bg-error/10 text-error border-error/20'
                              : 'bg-surface-secondary text-text-primary border-border'
                          }`}
                        >
                          {t.priority}
                        </span>
                        <span className="text-[11px] font-mono text-text-secondary uppercase">{t.category}</span>
                        <span className="text-[11px] font-mono text-text-secondary">#{t.id.substring(0, 8)}</span>
                      </div>
                      <h4 className="font-semibold text-xs text-text-primary hover:text-primary transition-colors">
                        <Link href={`/tickets?id=${t.id}`}>{t.title}</Link>
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-secondary border border-border text-text-primary">
                        {t.status}
                      </span>
                      <Link
                        href={`/tickets?id=${t.id}`}
                        className="px-2.5 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary-hover text-xs font-medium transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        Respond <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Support Actions & Recent Activity Feed */}
        <div className="space-y-6">
          {/* Quick Support Actions */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-mono text-xs text-text-secondary uppercase tracking-wider font-medium">Support Agent Quick Actions</h4>
            <div className="space-y-2">
              <Link
                href="/tickets"
                className="w-full py-2.5 px-3.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-medium transition-all flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Create Ticket</span>
                <PlusCircle className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/tickets?queue=mine"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Assign / Reassign Ticket</span>
                <UserCheck className="w-3.5 h-3.5 text-text-secondary" />
              </Link>

              <Link
                href="/tickets?search=true"
                className="w-full py-2.5 px-3.5 rounded-md bg-surface border border-border hover:bg-surface-secondary text-text-primary text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Search Customer KB</span>
                <Search className="w-3.5 h-3.5 text-primary" />
              </Link>
            </div>
          </div>

          {/* Today's Tasks & Recent Attachments */}
          <div className="p-6 rounded-[10px] border border-border bg-surface shadow-xs space-y-3">
            <h4 className="font-semibold text-xs text-text-primary flex items-center gap-2 border-b border-border pb-2">
              <Paperclip className="w-4 h-4 text-primary" />
              <span>Recent Diagnostic Attachments</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-md bg-surface-secondary/60 border border-border flex items-center justify-between">
                <span className="font-mono text-text-primary">system_dump_ticket_1.log</span>
                <span className="text-[11px] text-text-secondary font-mono">1.02 KB</span>
              </div>
              <div className="p-2.5 rounded-md bg-surface-secondary/60 border border-border flex items-center justify-between">
                <span className="font-mono text-text-primary">network_trace_ticket_2.log</span>
                <span className="text-[11px] text-text-secondary font-mono">2.04 KB</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
