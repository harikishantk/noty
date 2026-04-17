'use client';

import { useState } from 'react';
import { CommentThread as ICommentThread, Comment } from '@/app/types/blocks';

interface CommentThreadProps {
  thread: ICommentThread;
  onAddComment: (threadId: string, content: string) => void;
  onDeleteThread: (threadId: string) => void;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function CommentThread({ thread, onAddComment, onDeleteThread }: CommentThreadProps) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onAddComment(thread.id, value.trim());
    setValue('');
  };

  return (
    <div className="comment-thread">
      <div className="thread-header">
        <span className="thread-quote">"{thread.selectedText}"</span>
        <button className="delete-thread-btn" onClick={() => onDeleteThread(thread.id)} title="Delete thread">
          ×
        </button>
      </div>

      <div className="thread-comments">
        {thread.comments.map((c: Comment) => (
          <div key={c.id} className="comment">
            <div className="comment-header">
              <span className="comment-author">{c.author}</span>
              <span className="comment-time">{relativeTime(c.timestamp)}</span>
            </div>
            <div className="comment-content">{c.content}</div>
          </div>
        ))}
      </div>

      <div className="add-comment">
        <input
          className="comment-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Reply..."
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        />
        <button className="submit-btn" onClick={submit} disabled={!value.trim()}>
          Post
        </button>
      </div>
    </div>
  );
}
