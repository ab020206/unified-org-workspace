import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { TicketCommentDto, UserPayload } from '@workspace/shared-types';

interface Props {
  comments: TicketCommentDto[];
  currentUser: UserPayload | null;
  onAddComment: (message: string) => Promise<void>;
  onUpdateComment: (commentId: string, message: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function CommentBox({
  comments,
  currentUser,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: Props) {
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMessage, setEditMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newMessage.trim());
      setNewMessage('');
    } catch (err: any) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: TicketCommentDto) => {
    setEditingId(comment.id);
    setEditMessage(comment.message);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editMessage.trim()) return;
    try {
      await onUpdateComment(commentId, editMessage.trim());
      setEditingId(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update comment');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-bold text-foreground">
        <MessageSquare className="w-4 h-4 text-purple-500" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Add a comment... (Supports markdown/text formatting)"
          className="w-full rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none shadow-xs"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newMessage.trim() || isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const isAuthor = currentUser?.id === comment.userId;
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                      {comment.user
                        ? `${comment.user.firstName[0]}${comment.user.lastName[0]}`
                        : 'U'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {comment.user
                          ? `${comment.user.firstName} ${comment.user.lastName}`
                          : 'User'}
                      </span>
                      <span className="text-[11px] text-gray-400 ml-2">
                        {new Date(comment.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {isAuthor && !isEditing && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(comment)}
                        className="text-xs text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this comment?')) onDeleteComment(comment.id);
                        }}
                        className="text-xs text-gray-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2.5 text-xs text-gray-900 dark:text-white focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="px-3 py-1 text-xs text-white bg-indigo-600 rounded-lg font-medium"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap pl-9.5">
                    {comment.message}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
