'use client';

import { useRef, useEffect } from 'react';
import { Block } from '@/app/types/blocks';

interface QuoteBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export default function QuoteBlock({ block, onUpdate, onDelete }: QuoteBlockProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [block.content]);

  return (
    <div className="quote-block">
      <textarea
        ref={ref}
        className="quote-input"
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Type a quote..."
        rows={1}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !block.content) {
            e.preventDefault();
            onDelete();
          }
        }}
      />
    </div>
  );
}
