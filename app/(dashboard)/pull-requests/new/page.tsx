'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { pullRequestApi } from '@/lib/pullRequestApi';
import { ArrowLeft, AlertTriangle, GitPullRequest, GitBranch } from 'lucide-react';
import { ProtectedLayoutPlaceholder } from '@/components/ProtectedLayoutPlaceholder';
import { Permission } from '@workspace/shared-types';

export default function CreatePRPage() {
  const router = useRouter();
  const { activeOrganization, members } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredApprovals, setRequiredApprovals] = useState(1);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [isDraft, setIsDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleReviewer = (userId: string) => {
    setSelectedReviewers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('Title and Description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const pr = await pullRequestApi.createPullRequest(
        {
          title: title.trim(),
          description: description.trim(),
          requiredApprovals,
          reviewerIds: selectedReviewers,
          isDraft,
        },
        activeOrganization?.id
      );

      router.push(`/pull-requests/${pr.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create Pull Request');
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedLayoutPlaceholder permission={Permission.REVIEW_CREATE}>
      <div className="max-w-3xl mx-auto space-y-6 pt-2 pb-12">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/pull-requests"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Review Console</span>
          </Link>
          <span className="text-xs font-mono font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5" />
            Review Provisioner
          </span>
        </div>

        {/* Main Card */}
        <div className="p-6 md:p-8 rounded-[10px] border border-border bg-surface shadow-xs space-y-6">
          <div className="border-b border-border pb-4 space-y-1">
            <h1 className="text-xl font-bold text-text-primary tracking-tight flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-primary" />
              <span>Create New Pull Request</span>
            </h1>
            <p className="text-xs text-text-secondary">
              Submit changes for review in{' '}
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
                Pull Request Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Add OAuth2 single sign-on authentication provider"
                className="w-full rounded-md border border-border bg-surface px-3.5 py-2.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Description / Spec Summary *
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Outline the scope of changes, architecture updates, and verification steps..."
                className="w-full rounded-md border border-border bg-surface p-3.5 text-xs text-text-primary placeholder:text-muted-text focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all resize-y"
              />
            </div>

            {/* Required Approvals */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Required Approvals Count
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={requiredApprovals}
                onChange={(e) => setRequiredApprovals(parseInt(e.target.value, 10) || 1)}
                className="w-32 rounded-md border border-border bg-surface p-2.5 text-xs font-bold font-mono text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-xs"
              />
              <p className="text-[11px] text-text-secondary">
                Number of distinct reviewer approvals required before PR can be merged.
              </p>
            </div>

            {/* Assign Reviewers Checklist */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold text-text-secondary uppercase">
                Assign Reviewers
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2.5 border border-border rounded-md bg-surface-secondary">
                {members.map((m) => {
                  const isSelected = selectedReviewers.includes(m.userId);
                  return (
                    <div
                      key={m.userId}
                      onClick={() => toggleReviewer(m.userId)}
                      className={`flex items-center gap-2.5 p-2.5 rounded-md cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-primary/10 border-primary/30 text-primary font-semibold'
                          : 'bg-surface border-border text-text-primary hover:border-primary/20'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-border text-primary focus:ring-primary accent-primary"
                      />
                      <span className="text-xs font-medium">
                        {m.user?.firstName} {m.user?.lastName} ({m.role})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Draft Toggle */}
            <div className="flex items-center gap-2.5 pt-2">
              <input
                type="checkbox"
                id="draft-checkbox"
                checked={isDraft}
                onChange={(e) => setIsDraft(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
              />
              <label
                htmlFor="draft-checkbox"
                className="text-xs font-semibold text-text-primary cursor-pointer"
              >
                Save as Draft (will not trigger review status immediately)
              </label>
            </div>

            {/* Footer Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Link
                href="/pull-requests"
                className="px-4 py-2 rounded-md border border-border bg-surface-secondary hover:bg-surface text-xs font-medium text-text-primary transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-md bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <GitPullRequest className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Creating PR...' : isDraft ? 'Save Draft PR' : 'Submit Pull Request'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayoutPlaceholder>
  );
}
