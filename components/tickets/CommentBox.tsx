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
      <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
        <MessageSquare className="w-4 h-4 text-primary" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          rows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Add a comment... (Supports markdown/text formatting)"
          className="w-full rounded-2xl border border-border bg-surface p-4 text-sm text-text-primary placeholder:text-muted-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all resize-none shadow-xs"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!newMessage.trim() || isSubmitting}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary-hover disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-xs text-text-secondary italic">No comments yet.</p>
        ) : (
          comments.map((comment) => {
            const isAuthor = currentUser?.id === comment.userId;
            const isEditing = editingId === comment.id;

            return (
              <div
                key={comment.id}
                className="p-4 rounded-2xl border border-border bg-surface shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
                      {comment.user
                        ? `${comment.user.firstName[0]}${comment.user.lastName[0]}`
                        : 'U'}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-text-primary">
                        {comment.user
                          ? `${comment.user.firstName} ${comment.user.lastName}`
                          : 'User'}
                      </span>
                      <span className="text-[11px] text-text-secondary ml-2">
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
                        className="text-xs text-text-secondary hover:text-primary transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this comment?')) onDeleteComment(comment.id);
                        }}
                        className="text-xs text-text-secondary hover:text-error transition-colors"
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
                      className="w-full rounded-xl border border-border bg-surface-secondary p-2.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 text-xs text-text-secondary hover:bg-surface-secondary rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="px-3 py-1 text-xs text-primary-foreground bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary whitespace-pre-wrap pl-9.5">
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
