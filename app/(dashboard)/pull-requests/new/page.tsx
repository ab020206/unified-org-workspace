'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { pullRequestApi } from '@/lib/pullRequestApi';

import { ArrowLeft, AlertTriangle } from 'lucide-react';

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
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/pull-requests"
          className="inline-flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Review Console</span>
        </Link>
      </div>

      <div className="forge-panel forge-accent-reviews p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Create New Pull Request</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Submit changes for review in{' '}
            <span className="font-semibold text-primary">{activeOrganization?.name}</span>
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Pull Request Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Add OAuth2 single sign-on authentication provider"
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Description / Spec Summary *
            </label>
            <textarea
              required
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the scope of changes, architecture updates, and verification steps..."
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
            />
          </div>

          {/* Required Approvals */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Required Approvals Count
            </label>
            <input
              type="number"
              min={1}
              max={10}
              value={requiredApprovals}
              onChange={(e) => setRequiredApprovals(parseInt(e.target.value, 10) || 1)}
              className="w-32 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
            />
            <p className="text-[11px] text-gray-400">
              Number of distinct reviewer approvals required before PR can be merged.
            </p>
          </div>

          {/* Assign Reviewers Checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Assign Reviewers
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-800 rounded-2xl bg-gray-50/50 dark:bg-gray-800/40">
              {members.map((m) => {
                const isSelected = selectedReviewers.includes(m.userId);
                return (
                  <div
                    key={m.userId}
                    onClick={() => toggleReviewer(m.userId)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs">
                      {m.user.firstName} {m.user.lastName} ({m.role})
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Draft Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="draft-checkbox"
              checked={isDraft}
              onChange={(e) => setIsDraft(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label
              htmlFor="draft-checkbox"
              className="text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Save as Draft (will not trigger review status immediately)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <Link
              href="/pull-requests"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {isSubmitting ? 'Creating PR...' : isDraft ? 'Save Draft PR' : 'Submit Pull Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
