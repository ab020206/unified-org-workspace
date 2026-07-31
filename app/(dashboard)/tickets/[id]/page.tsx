'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { ticketApi } from '@/lib/ticketApi';
import { TicketDto, TicketStatus, Permission } from '@workspace/shared-types';
import { AlertTriangle, ArrowLeft, Trash2, Check, Lock, Unlock } from 'lucide-react';
import { StatusBadge } from '@/components/tickets/StatusBadge';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { CategoryBadge } from '@/components/tickets/CategoryBadge';
import { CommentBox } from '@/components/tickets/CommentBox';
import { AttachmentUpload } from '@/components/tickets/AttachmentUpload';
import { TicketTimeline } from '@/components/tickets/TicketTimeline';

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const { activeOrganization, user, members, hasPermission } = useAuth();
  const [ticket, setTicket] = useState<TicketDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingAssignee, setIsUpdatingAssignee] = useState(false);

  const canUpdateTicket = hasPermission(Permission.TICKET_UPDATE);
  const canAssignTicket = hasPermission(Permission.TICKET_ASSIGN);
  const canDeleteTicket = hasPermission(Permission.TICKET_DELETE);

  const loadTicket = useCallback(async () => {
    if (!activeOrganization?.id || !ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await ticketApi.getTicketById(ticketId, activeOrganization.id);
      setTicket(data);
    } catch (err: any) {
      setError(err.message || 'Ticket not found or access denied');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, ticketId]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!ticket || isUpdatingStatus) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await ticketApi.updateStatus(ticket.id, newStatus, activeOrganization?.id);
      setTicket(updated);
      await loadTicket(); // reload full relations & activity timeline
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAssigneeChange = async (assignedTo: string | null) => {
    if (!ticket || isUpdatingAssignee) return;
    setIsUpdatingAssignee(true);
    try {
      const updated = await ticketApi.assignTicket(ticket.id, assignedTo, activeOrganization?.id);
      setTicket(updated);
      await loadTicket();
    } catch (err: any) {
      alert(err.message || 'Failed to change assignee');
    } finally {
      setIsUpdatingAssignee(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!ticket) return;
    if (
      !confirm(
        `Are you sure you want to delete ticket #${ticket.ticketNumber}? This action cannot be undone.`
      )
    )
      return;
    try {
      await ticketApi.deleteTicket(ticket.id, activeOrganization?.id);
      router.push('/tickets');
    } catch (err: any) {
      alert(err.message || 'Failed to delete ticket');
    }
  };

  const handleAddComment = async (message: string) => {
    if (!ticket) return;
    await ticketApi.addComment(ticket.id, message, activeOrganization?.id);
    await loadTicket();
  };

  const handleUpdateComment = async (commentId: string, message: string) => {
    await ticketApi.updateComment(commentId, message, activeOrganization?.id);
    await loadTicket();
  };

  const handleDeleteComment = async (commentId: string) => {
    await ticketApi.deleteComment(commentId, activeOrganization?.id);
    await loadTicket();
  };

  const handleUploadAttachment = async (file: File) => {
    if (!ticket) return;
    await ticketApi.uploadAttachment(ticket.id, file, activeOrganization?.id);
    await loadTicket();
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    await ticketApi.deleteAttachment(attachmentId, activeOrganization?.id);
    await loadTicket();
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-3xl" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="forge-panel p-8 max-w-md mx-auto text-center space-y-4 mt-12 forge-accent-security">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Ticket Not Found</h2>
        <p className="text-xs text-muted-foreground">
          {error || 'The requested ticket does not exist or you lack permissions.'}
        </p>
        <Link
          href="/tickets"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Support Hub</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/tickets"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Support Hub</span>
        </Link>

        {canDeleteTicket && (
          <button
            onClick={handleDeleteTicket}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Ticket</span>
          </button>
        )}
      </div>

      {/* Main Ticket Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Details, Comments, Attachments */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                #{ticket.ticketNumber}
              </span>
              <StatusBadge status={ticket.status} size="lg" />
              <PriorityBadge priority={ticket.priority} size="md" />
              <CategoryBadge category={ticket.category} />
            </div>

            <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
              {ticket.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
              <div>
                Created by{' '}
                <span className="font-bold text-gray-800 dark:text-gray-200">
                  {ticket.creator
                    ? `${ticket.creator.firstName} ${ticket.creator.lastName}`
                    : 'User'}
                </span>
              </div>
              <div>•</div>
              <div>{new Date(ticket.createdAt).toLocaleString()}</div>
            </div>
          </div>

          {/* Description Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Description
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </p>
          </div>

          {/* Comments Section */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
            <CommentBox
              comments={ticket.comments || []}
              currentUser={user}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>

          {/* Attachments Section */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
            <AttachmentUpload
              attachments={ticket.attachments || []}
              currentUser={user}
              onUpload={handleUploadAttachment}
              onDelete={handleDeleteAttachment}
            />
          </div>
        </div>

        {/* Right 1 Column: Metadata, Controls & Activity Timeline */}
        <div className="space-y-6">
          {/* Controls Panel */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Ticket Actions
            </h3>

            {/* Status Transition Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Change Status
              </label>
              <select
                disabled={!canUpdateTicket || isUpdatingStatus}
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none disabled:opacity-50"
              >
                <option value={TicketStatus.OPEN}>OPEN</option>
                <option value={TicketStatus.IN_PROGRESS}>IN PROGRESS</option>
                <option value={TicketStatus.WAITING_FOR_RESPONSE}>WAITING FOR RESPONSE</option>
                <option value={TicketStatus.RESOLVED}>RESOLVED</option>
                <option value={TicketStatus.CLOSED}>CLOSED</option>
                <option value={TicketStatus.REOPENED}>REOPENED</option>
              </select>
            </div>

            {/* Assignee Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Assigned To
              </label>
              <select
                disabled={!canAssignTicket || isUpdatingAssignee}
                value={ticket.assignedTo || ''}
                onChange={(e) => handleAssigneeChange(e.target.value || null)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none disabled:opacity-50"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.user.firstName} {m.user.lastName} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Status Action Shortcuts */}
            {canUpdateTicket && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                {ticket.status !== TicketStatus.RESOLVED && (
                  <button
                    onClick={() => handleStatusChange(TicketStatus.RESOLVED)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Resolve Ticket</span>
                  </button>
                )}
                {ticket.status !== TicketStatus.CLOSED && (
                  <button
                    onClick={() => handleStatusChange(TicketStatus.CLOSED)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground bg-secondary hover:bg-secondary/80 border border-border transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Close Ticket</span>
                  </button>
                )}
                {ticket.status === TicketStatus.CLOSED && (
                  <button
                    onClick={() => handleStatusChange(TicketStatus.REOPENED)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Reopen Ticket</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
            <TicketTimeline activities={ticket.activities || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
