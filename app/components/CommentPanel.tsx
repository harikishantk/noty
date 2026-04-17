'use client';

import { CommentThread as ICommentThread } from '@/app/types/blocks';
import CommentThread from './CommentThread';

interface CommentPanelProps {
  threads: ICommentThread[];
  onAddComment: (threadId: string, content: string) => void;
  onDeleteThread: (threadId: string) => void;
  isOpen: boolean;
}

export default function CommentPanel({ threads, onAddComment, onDeleteThread, isOpen }: CommentPanelProps) {
  if (!isOpen) return null;

  return (
    <aside className="comment-panel">
      <div className="comment-panel-header">Comments ({threads.length})</div>
      <div className="comment-panel-body">
        {threads.length === 0 ? (
          <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '12px 0' }}>Select text to add comments</p>
        ) : (
          threads.map((thread) => (
            <CommentThread key={thread.id} thread={thread} onAddComment={onAddComment} onDeleteThread={onDeleteThread} />
          ))
        )}
      </div>
    </aside>
  );
}
