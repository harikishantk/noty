'use client';

import { useState, useEffect, useRef } from 'react';
import { Block } from '@/app/types/blocks';
import { SlashCommandMenu } from '../SlashCommandMenu';

interface ParagraphBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onSelectText: (startOffset: number, endOffset: number, selectedText: string) => void;
  onBlockTypeChange: (newType: Block['type']) => void;
}

export default function ParagraphBlock({ block, onUpdate, onDelete, onSelectText, onBlockTypeChange }: ParagraphBlockProps) {
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = 'auto';
      textRef.current.style.height = textRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.currentTarget.value;
    onUpdate(val);

    if (val.startsWith('/')) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 4, left: rect.left });
      setSlashQuery(val.slice(1));
      setShowSlashMenu(true);
    } else {
      setShowSlashMenu(false);
    }
  };

  const handleMouseUp = () => {
    const sel = window.getSelection();
    if (sel && textRef.current && sel.toString().length > 0) {
      onSelectText(textRef.current.selectionStart, textRef.current.selectionEnd, sel.toString());
    }
  };

  const handleSlashSelect = (type: Block['type']) => {
    setShowSlashMenu(false);
    onBlockTypeChange(type);
  };

  return (
    <div className="paragraph-block">
      <textarea
        ref={textRef}
        className="paragraph-input"
        value={block.content}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        onKeyDown={(e) => {
          if (e.key === 'Backspace' && !block.content) {
            e.preventDefault();
            onDelete();
          }
          if (e.key === 'Escape') setShowSlashMenu(false);
        }}
        placeholder="Type '/' for commands..."
        rows={1}
        spellCheck
      />
      {showSlashMenu && (
        <SlashCommandMenu
          position={menuPos}
          query={slashQuery}
          onSelect={handleSlashSelect}
          onClose={() => setShowSlashMenu(false)}
        />
      )}
    </div>
  );
}
