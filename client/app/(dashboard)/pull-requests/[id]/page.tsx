'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { pullRequestApi } from '@/lib/pullRequestApi';
import {
  PullRequestDto,
  PullRequestStatus,
  ReviewDecisionType,
  Permission,
} from '@workspace/shared-types';
import { AlertTriangle, ArrowLeft, Trash2, Edit3, Check, X, GitMerge, Lock, Send } from 'lucide-react';
import { PRStatusBadge } from '@/components/review/PRStatusBadge';
import { ApprovalCounter } from '@/components/review/ApprovalCounter';
import { ReviewerAvatar } from '@/components/review/ReviewerAvatar';
import { VersionHistoryList } from '@/components/review/VersionHistoryList';
import { PRTimeline } from '@/components/review/PRTimeline';
import { CommentBox } from '@/components/tickets/CommentBox';

export default function PRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prId = params.id as string;

  const { activeOrganization, user, members, hasPermission } = useAuth();
  const [pr, setPr] = useState<PullRequestDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingDecision, setIsSubmittingDecision] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [selectedReviewerToAdd, setSelectedReviewerToAdd] = useState('');
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const canApprove = hasPermission(Permission.REVIEW_APPROVE);
  const canReject = hasPermission(Permission.REVIEW_REJECT);
  const canMerge = hasPermission(Permission.REVIEW_MERGE);
  const canUpdate = hasPermission(Permission.REVIEW_UPDATE);

  const loadPR = useCallback(async () => {
    if (!activeOrganization?.id || !prId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await pullRequestApi.getPullRequestById(prId, activeOrganization.id);
      setPr(data);
      setEditTitle(data.title);
      setEditDescription(data.description);
    } catch (err: any) {
      setError(err.message || 'Pull Request not found or access denied');
    } finally {
      setIsLoading(false);
    }
  }, [activeOrganization?.id, prId]);

  useEffect(() => {
    loadPR();
  }, [loadPR]);

  const handleDecision = async (decision: ReviewDecisionType) => {
    if (!pr || isSubmittingDecision) return;
    setIsSubmittingDecision(true);
    try {
      if (decision === ReviewDecisionType.APPROVED) {
        await pullRequestApi.approvePR(
          pr.id,
          reviewComment.trim() || undefined,
          activeOrganization?.id
        );
      } else if (decision === ReviewDecisionType.CHANGES_REQUESTED) {
        await pullRequestApi.requestChanges(
          pr.id,
          reviewComment.trim() || undefined,
          activeOrganization?.id
        );
      } else if (decision === ReviewDecisionType.REJECTED) {
        await pullRequestApi.rejectPR(
          pr.id,
          reviewComment.trim() || undefined,
          activeOrganization?.id
        );
      }
      setReviewComment('');
      await loadPR();
    } catch (err: any) {
      alert(err.message || 'Failed to submit review decision');
    } finally {
      setIsSubmittingDecision(false);
    }
  };

  const handleMerge = async () => {
    if (!pr || isMerging) return;
    if (!confirm(`Confirm merging Pull Request #${pr.prNumber}?`)) return;
    setIsMerging(true);
    try {
      await pullRequestApi.mergePR(pr.id, activeOrganization?.id);
      await loadPR();
    } catch (err: any) {
      alert(err.message || 'Failed to merge Pull Request');
    } finally {
      setIsMerging(false);
    }
  };

  const handleAddReviewer = async () => {
    if (!pr || !selectedReviewerToAdd) return;
    try {
      await pullRequestApi.addReviewers(pr.id, [selectedReviewerToAdd], activeOrganization?.id);
      setSelectedReviewerToAdd('');
      await loadPR();
    } catch (err: any) {
      alert(err.message || 'Failed to add reviewer');
    }
  };

  const handleRemoveReviewer = async (reviewerId: string) => {
    if (!pr) return;
    try {
      await pullRequestApi.removeReviewer(pr.id, reviewerId, activeOrganization?.id);
      await loadPR();
    } catch (err: any) {
      alert(err.message || 'Failed to remove reviewer');
    }
  };

  const handleSaveContentEdit = async () => {
    if (!pr || !editTitle.trim() || !editDescription.trim()) return;
    try {
      await pullRequestApi.updatePullRequest(
        pr.id,
        { title: editTitle.trim(), description: editDescription.trim() },
        activeOrganization?.id
      );
      setIsEditingContent(false);
      await loadPR();
    } catch (err: any) {
      alert(err.message || 'Failed to update PR content');
    }
  };

  const handleSubmitForReview = async () => {
    if (!pr) return;
    try {
      await pullRequestApi.submitForReview(pr.id, activeOrganization?.id);
      await loadPR();
    } catch (err: any) {
      alert(err.message || 'Failed to submit for review');
    }
  };

  const handleDeletePR = async () => {
    if (!pr) return;
    if (!confirm(`Delete PR #${pr.prNumber}? This cannot be undone.`)) return;
    try {
      await pullRequestApi.deletePullRequest(pr.id, activeOrganization?.id);
      router.push('/pull-requests');
    } catch (err: any) {
      alert(err.message || 'Failed to delete PR');
    }
  };

  const handleAddComment = async (message: string) => {
    if (!pr) return;
    await pullRequestApi.addComment(pr.id, message, activeOrganization?.id);
    await loadPR();
  };

  const handleUpdateComment = async (commentId: string, message: string) => {
    await pullRequestApi.updateComment(commentId, message, activeOrganization?.id);
    await loadPR();
  };

  const handleDeleteComment = async (commentId: string) => {
    await pullRequestApi.deleteComment(commentId, activeOrganization?.id);
    await loadPR();
  };

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
        <div className="h-64 bg-gray-100 dark:bg-gray-800/50 rounded-3xl" />
      </div>
    );
  }

  if (error || !pr) {
    return (
      <div className="forge-panel p-8 max-w-md mx-auto text-center space-y-4 mt-12 forge-accent-security">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Pull Request Not Found</h2>
        <p className="text-xs text-muted-foreground">
          {error || 'The requested PR does not exist or access is restricted.'}
        </p>
        <Link
          href="/pull-requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Review Console</span>
        </Link>
      </div>
    );
  }

  const isApproved =
    pr.status === PullRequestStatus.APPROVED || (pr.approvalCount || 0) >= pr.requiredApprovals;
  const isMerged = pr.status === PullRequestStatus.MERGED;

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/pull-requests"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Review Console</span>
        </Link>

        {canUpdate && !isMerged && (
          <button
            onClick={handleDeletePR}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete PR</span>
          </button>
        )}
      </div>

      {/* Main PR Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Title, Description, Decisions, Comments, Versions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  #{pr.prNumber}
                </span>
                <PRStatusBadge status={pr.status} size="lg" />
              </div>
              <ApprovalCounter
                approvedCount={pr.approvalCount || 0}
                requiredApprovals={pr.requiredApprovals}
                size="md"
              />
            </div>

            {isEditingContent ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5"
                />
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full text-xs rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingContent(false)}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveContentEdit}
                    className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 rounded-xl"
                  >
                    Save & Create New Version
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">
                    {pr.title}
                  </h1>
                  {canUpdate && !isMerged && (
                    <button
                      onClick={() => setIsEditingContent(true)}
                      className="text-xs text-primary font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Spec</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                  <div>
                    Author:{' '}
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {pr.creator ? `${pr.creator.firstName} ${pr.creator.lastName}` : 'User'}
                    </span>
                  </div>
                  <div>•</div>
                  <div>Created {new Date(pr.createdAt).toLocaleString()}</div>
                  {pr.mergedAt && (
                    <>
                      <div>•</div>
                      <div className="text-purple-600 font-semibold">
                        Merged by {pr.merger ? `${pr.merger.firstName}` : 'User'} at{' '}
                        {new Date(pr.mergedAt).toLocaleTimeString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Spec / Description
            </h3>
            <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {pr.description}
            </p>
          </div>

          {/* Review Decision Submission Box */}
          {!isMerged && (canApprove || canReject) && (
            <div className="forge-panel p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Edit3 className="w-4 h-4 text-purple-500" />
                <span>Submit Review Decision</span>
              </div>

              <textarea
                rows={2}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Optional review feedback / summary comment..."
                className="w-full rounded-lg border border-border bg-card p-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
              />

              <div className="flex flex-wrap items-center gap-3">
                {canApprove && (
                  <button
                    onClick={() => handleDecision(ReviewDecisionType.APPROVED)}
                    disabled={isSubmittingDecision}
                    className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve PR</span>
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => handleDecision(ReviewDecisionType.CHANGES_REQUESTED)}
                    disabled={isSubmittingDecision}
                    className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold text-amber-500 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 disabled:opacity-50 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>
                )}
                {canReject && (
                  <button
                    onClick={() => handleDecision(ReviewDecisionType.REJECTED)}
                    disabled={isSubmittingDecision}
                    className="flex-1 px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject PR</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Merge Section */}
          {!isMerged && (
            <div className="forge-panel forge-accent-reviews p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground">
                    Merge Lifecycle
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isApproved
                      ? 'All required approvals reached. Ready to merge into target workspace branch.'
                      : `Approval threshold not reached (${pr.approvalCount || 0} of ${pr.requiredApprovals} approvals).`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleMerge}
                disabled={!isApproved || !canMerge || isMerging}
                className={`w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 ${
                  isApproved && canMerge
                    ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed border border-border'
                }`}
              >
                {isMerging ? (
                  <span>Merging Pull Request...</span>
                ) : isApproved ? (
                  <>
                    <GitMerge className="w-4 h-4" />
                    <span>Merge Pull Request</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Merge Locked (Pending Approvals)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Comments Stream */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
            <CommentBox
              comments={(pr.comments || []).map((c) => ({
                id: c.id,
                ticketId: pr.id,
                userId: c.reviewerId,
                message: c.message,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt,
                user: c.reviewer,
              }))}
              currentUser={user}
              onAddComment={handleAddComment}
              onUpdateComment={handleUpdateComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>

        {/* Right 1 Column: Reviewers, Versions, Timeline */}
        <div className="space-y-6">
          {/* Reviewers Management */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Assigned Reviewers
            </h3>

            <div className="space-y-2">
              {pr.reviewers && pr.reviewers.length > 0 ? (
                pr.reviewers.map((r) => {
                  // Find reviewer's latest decision
                  const decision = pr.decisions?.find(
                    (d) => d.reviewerId === r.reviewerId
                  )?.decision;
                  return (
                    <div key={r.id} className="block">
                      <ReviewerAvatar
                        reviewer={
                          r.reviewer || {
                            id: r.reviewerId,
                            firstName: 'User',
                            lastName: '',
                            email: '',
                          }
                        }
                        decision={decision}
                        onRemove={
                          canUpdate && !isMerged
                            ? () => handleRemoveReviewer(r.reviewerId)
                            : undefined
                        }
                      />
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 italic">No reviewers assigned.</p>
              )}
            </div>

            {/* Add Reviewer Selector */}
            {canUpdate && !isMerged && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <select
                  value={selectedReviewerToAdd}
                  onChange={(e) => setSelectedReviewerToAdd(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 text-xs font-medium text-gray-900 dark:text-white"
                >
                  <option value="">Select member to assign...</option>
                  {members.map((m) => (
                    <option key={m.userId} value={m.userId}>
                      {m.user.firstName} {m.user.lastName} ({m.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddReviewer}
                  disabled={!selectedReviewerToAdd}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 transition-all cursor-pointer"
                >
                  Add
                </button>
              </div>
            )}

            {/* Submit for Review Trigger for Draft PRs */}
            {pr.status === PullRequestStatus.DRAFT && canUpdate && (
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleSubmitForReview}
                  className="w-full py-2.5 rounded-lg text-xs font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Review</span>
                </button>
              </div>
            )}
          </div>

          {/* Version History Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
            <VersionHistoryList versions={pr.versions || []} />
          </div>

          {/* Activity Timeline Card */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 shadow-xs">
            <PRTimeline activities={pr.activities || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
