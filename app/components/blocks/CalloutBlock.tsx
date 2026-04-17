'use client';

import { useRef, useEffect } from 'react';
import { Block } from '@/app/types/blocks';

const CALLOUT_TYPES = {
  info:    { emoji: 'ℹ️',  bg: 'var(--callout-info-bg)',    border: 'var(--callout-info-border)' },
  warning: { emoji: '⚠️',  bg: 'var(--callout-warn-bg)',    border: 'var(--callout-warn-border)' },
  success: { emoji: '✅',  bg: 'var(--callout-ok-bg)',      border: 'var(--callout-ok-border)' },
  error:   { emoji: '❌',  bg: 'var(--callout-err-bg)',     border: 'var(--callout-err-border)' },
} as const;

interface CalloutBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onMetadataUpdate: (metadata: Block['metadata']) => void;
}

export default function CalloutBlock({ block, onUpdate, onDelete, onMetadataUpdate }: CalloutBlockProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const calloutType = (block.metadata.calloutType || 'info') as keyof typeof CALLOUT_TYPES;
  const cfg = CALLOUT_TYPES[calloutType];

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const cycleType = () => {
    const types = Object.keys(CALLOUT_TYPES) as Array<keyof typeof CALLOUT_TYPES>;
    const next = types[(types.indexOf(calloutType) + 1) % types.length];
    onMetadataUpdate({ ...block.metadata, calloutType: next, emoji: CALLOUT_TYPES[next].emoji });
  };

  return (
    <div className="callout-block" style={{ background: cfg.bg, borderLeftColor: cfg.border }}>
      <button className="callout-emoji" onClick={cycleType} title="Click to change type">
        {block.metadata.emoji || cfg.emoji}
      </button>
      <textarea
        ref={ref}
        className="callout-input"
        value={block.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Add a note..."
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
