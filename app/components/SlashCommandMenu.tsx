'use client';

import { useEffect, useRef, useState } from 'react';
import { Block } from '@/app/types/blocks';

interface SlashCommandMenuProps {
  position: { top: number; left: number };
  query: string;
  onSelect: (type: Block['type']) => void;
  onClose: () => void;
}

const COMMANDS = [
  { type: 'paragraph'     as Block['type'], label: 'Text',          description: 'Plain paragraph',           icon: '¶' },
  { type: 'heading_1'     as Block['type'], label: 'Heading 1',     description: 'Large section heading',     icon: 'H1' },
  { type: 'heading_2'     as Block['type'], label: 'Heading 2',     description: 'Medium section heading',    icon: 'H2' },
  { type: 'heading_3'     as Block['type'], label: 'Heading 3',     description: 'Small section heading',     icon: 'H3' },
  { type: 'bullet_list'   as Block['type'], label: 'Bullet List',   description: 'Unordered list',            icon: '•' },
  { type: 'numbered_list' as Block['type'], label: 'Numbered List', description: 'Ordered list',              icon: '1.' },
  { type: 'quote'         as Block['type'], label: 'Quote',         description: 'Blockquote',                icon: '"' },
  { type: 'callout'       as Block['type'], label: 'Callout',       description: 'Highlighted callout box',   icon: 'ℹ' },
  { type: 'code'          as Block['type'], label: 'Code',          description: 'Syntax-highlighted code',   icon: '<>' },
  { type: 'divider'       as Block['type'], label: 'Divider',       description: 'Horizontal rule',           icon: '—' },
];

export function SlashCommandMenu({ position, query, onSelect, onClose }: SlashCommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = query
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : COMMANDS;

  useEffect(() => { setActiveIndex(0); }, [query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
      if (e.key === 'Enter')     { e.preventDefault(); if (filtered[activeIndex]) onSelect(filtered[activeIndex].type); }
      if (e.key === 'Escape')    { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filtered, activeIndex, onSelect, onClose]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Keep menu within viewport
  const style: React.CSSProperties = { position: 'fixed', top: position.top, left: position.left, zIndex: 1000 };
  if (typeof window !== 'undefined') {
    if (position.left + 280 > window.innerWidth) style.left = window.innerWidth - 290;
    if (position.top + 400 > window.innerHeight) style.top = position.top - 420;
  }

  if (filtered.length === 0) return null;

  return (
    <div ref={menuRef} className="slash-menu" style={style}>
      <div className="slash-menu-header">Blocks</div>
      {filtered.map((cmd, i) => (
        <button
          key={cmd.type}
          className={`slash-menu-item ${i === activeIndex ? 'active' : ''}`}
          onClick={() => onSelect(cmd.type)}
          onMouseEnter={() => setActiveIndex(i)}
        >
          <span className="slash-menu-icon">{cmd.icon}</span>
          <div>
            <div className="slash-menu-label">{cmd.label}</div>
            <div className="slash-menu-desc">{cmd.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
