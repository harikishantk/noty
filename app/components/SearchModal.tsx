'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, FileText, X } from 'lucide-react';
import { NoteWithBlocks } from '@/app/types/blocks';

interface SearchResult {
  id: string;
  title: string;
  preview: string;
}

interface SearchModalProps {
  notes: Record<string, NoteWithBlocks>;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function SearchModal({ notes, onSelect, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      const recent = Object.values(notes)
        .filter((n) => n.type === 'note')
        .slice(0, 8)
        .map((n) => ({ id: n.id, title: n.title, preview: getPreview(n) }));
      setResults(recent);
      setActiveIndex(0);
      return;
    }
    const matched = Object.values(notes)
      .filter((n) => n.type === 'note')
      .filter((n) => {
        const titleMatch = n.title.toLowerCase().includes(q);
        const contentMatch = n.blocks.some((b) => b.content.toLowerCase().includes(q));
        return titleMatch || contentMatch;
      })
      .map((n) => ({ id: n.id, title: n.title, preview: getPreview(n, q) }));
    setResults(matched);
    setActiveIndex(0);
  }, [query, notes]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && results[activeIndex]) {
        onSelect(results[activeIndex].id);
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [results, activeIndex, onSelect, onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-input-row">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">No notes found</div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                className={`search-result ${i === activeIndex ? 'active' : ''}`}
                onClick={() => { onSelect(r.id); onClose(); }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <FileText size={15} className="search-result-icon" />
                <div className="search-result-text">
                  <span className="search-result-title">{r.title}</span>
                  {r.preview && <span className="search-result-preview">{r.preview}</span>}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="search-footer">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}

function getPreview(note: NoteWithBlocks, query?: string): string {
  for (const block of note.blocks) {
    if (!block.content) continue;
    if (query) {
      const idx = block.content.toLowerCase().indexOf(query);
      if (idx !== -1) {
        const start = Math.max(0, idx - 30);
        const end = Math.min(block.content.length, idx + 60);
        return (start > 0 ? '...' : '') + block.content.slice(start, end) + (end < block.content.length ? '...' : '');
      }
    } else {
      return block.content.slice(0, 80) + (block.content.length > 80 ? '...' : '');
    }
  }
  return '';
}
