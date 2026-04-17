'use client';

import { useRef, useEffect } from 'react';
import { Block } from '@/app/types/blocks';

interface ListBlockProps {
  block: Block;
  listIndex: number;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onAddAfter: () => void;
}

export default function ListBlock({ block, listIndex, onUpdate, onDelete, onAddAfter }: ListBlockProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const isBullet = block.type === 'bullet_list';

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [block.content]);

  return (
    <div className="list-block">
      <span className="list-marker">{isBullet ? '•' : `${listIndex}.`}</span>
      <textarea
        ref={ref}
        className="list-input"
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="List item..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onAddAfter();
          }
          if (e.key === 'Backspace' && !block.content) {
            e.preventDefault();
            onDelete();
          }
        }}
      />
    </div>
  );
}
