'use client';

import { useRef, useEffect } from 'react';
import { Block } from '@/app/types/blocks';

interface HeadingBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onLevelChange: (level: 1 | 2 | 3) => void;
}

const LEVEL_STYLES: Record<number, { fontSize: string; fontWeight: string; placeholder: string }> = {
  1: { fontSize: '2rem',    fontWeight: '700', placeholder: 'Heading 1' },
  2: { fontSize: '1.5rem',  fontWeight: '600', placeholder: 'Heading 2' },
  3: { fontSize: '1.25rem', fontWeight: '600', placeholder: 'Heading 3' },
};

export default function HeadingBlock({ block, onUpdate, onDelete, onLevelChange }: HeadingBlockProps) {
  const level = (block.metadata.headingLevel || 1) as 1 | 2 | 3;
  const s = LEVEL_STYLES[level];
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [block.content]);

  return (
    <div className="heading-block">
      <div className="heading-levels">
        {([1, 2, 3] as const).map((l) => (
          <button key={l} className={`level-btn ${level === l ? 'active' : ''}`} onClick={() => onLevelChange(l)}>
            H{l}
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        className="heading-input"
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder={s.placeholder}
        rows={1}
        style={{ fontSize: s.fontSize, fontWeight: s.fontWeight }}
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
