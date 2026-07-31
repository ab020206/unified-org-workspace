'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ticketApi } from '@/lib/ticketApi';
import { TicketCategory, TicketPriority, Permission } from '@workspace/shared-types';
import { ArrowLeft, AlertTriangle, LifeBuoy, PlusCircle } from 'lucide-react';
import { ProtectedLayoutPlaceholder } from '@/components/ProtectedLayoutPlaceholder';

export default function CreateTicketPage() {
  const router = useRouter();
  const { activeOrganization, members } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TicketCategory>(TicketCategory.GENERAL);
  const [priority, setPriority] = useState<TicketPriority>(TicketPriority.MEDIUM);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and Description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await ticketApi.createTicket(
        {
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          assignedTo: assignedTo || null,
        },
        activeOrganization?.id
      );

      router.push(`/tickets/${ticket.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket');
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedLayoutPlaceholder permission={Permission.TICKET_CREATE}>
      <div className="max-w-3xl mx-auto space-y-6 pt-2 pb-12">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/tickets"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Support Hub</span>
          </Link>
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <LifeBuoy className="w-3.5 h-3.5" />
            Ticket Provisioner
          </span>
        </div>

        {/* Main Form Card */}
        <div className="p-6 md:p-8 rounded-[10px] border border-border bg-surface shadow-xs space-y-6">
          <div className="border-b border-border pb-4 space-y-1">
            <h1 className="text-xl font-bold text-text-primary tracking-tight">
              Create New Support Ticket
            </h1>
            <p className="text-xs text-text-secondary">
              Submit a support request or bug report for{' '}
              <strong className="text-text-primary">
                {activeOrganization?.name || 'Current Workspace'}
              </strong>
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-md bg-error/10 border border-error/20 text-error text-xs font-semibold font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-error" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Ticket Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Cannot process invoice payment for client"
                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Description *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or feature request in detail..."
                className="w-full rounded-md border border-border bg-surface p-3.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all resize-y"
              />
            </div>

            {/* Grid of Category, Priority, Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer font-mono"
                >
                  <option value={TicketCategory.GENERAL}>General</option>
                  <option value={TicketCategory.BUG}>Bug</option>
                  <option value={TicketCategory.FEATURE_REQUEST}>Feature Request</option>
                  <option value={TicketCategory.BILLING}>Billing</option>
                  <option value={TicketCategory.TECHNICAL}>Technical</option>
                  <option value={TicketCategory.ACCOUNT}>Account</option>
                  <option value={TicketCategory.OTHER}>Other</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer font-mono"
                >
                  <option value={TicketPriority.LOW}>Low</option>
                  <option value={TicketPriority.MEDIUM}>Medium</option>
                  <option value={TicketPriority.HIGH}>High</option>
                  <option value={TicketPriority.URGENT}>Urgent</option>
                </select>
              </div>

              {/* Assignee */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                  Assignee (Optional)
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-md border border-border bg-surface p-2.5 text-xs font-medium text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs cursor-pointer font-mono"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user?.firstName} {m.user?.lastName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/tickets"
                className="px-4 py-2 rounded-md border border-border bg-surface-secondary hover:bg-surface text-xs font-medium text-text-primary transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? 'Creating Ticket...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayoutPlaceholder>
  );
}
