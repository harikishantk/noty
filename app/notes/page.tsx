'use client';

import { useState, useCallback, useEffect } from 'react';
import { Moon, Sun, Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import BlockEditor from '../components/BlockEditor';
import DeleteModal from '../components/DeleteModal';
import SearchModal from '../components/SearchModal';
import { NoteWithBlocks, Block } from '../types/blocks';
import '../styles/notes.css';

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function noteToMarkdown(note: NoteWithBlocks): string {
  const lines = [`# ${note.title}`, ''];
  for (const block of note.blocks) {
    switch (block.type) {
      case 'heading_1': lines.push(`# ${block.content}`); break;
      case 'heading_2': lines.push(`## ${block.content}`); break;
      case 'heading_3': lines.push(`### ${block.content}`); break;
      case 'paragraph': lines.push(block.content); break;
      case 'code': lines.push(`\`\`\`${block.metadata.language || ''}\n${block.content}\n\`\`\``); break;
      case 'quote': lines.push(`> ${block.content}`); break;
      case 'callout': lines.push(`> ${block.metadata.emoji || 'ℹ️'} ${block.content}`); break;
      case 'divider': lines.push('---'); break;
      case 'bullet_list': lines.push(`- ${block.content}`); break;
      case 'numbered_list': lines.push(`1. ${block.content}`); break;
    }
    lines.push('');
  }
  return lines.join('\n');
}

function wordCount(blocks: Block[]): number {
  return blocks.reduce((acc, b) => {
    if (!b.content) return acc;
    return acc + b.content.trim().split(/\s+/).filter(Boolean).length;
  }, 0);
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Record<string, NoteWithBlocks>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dark, setDark] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('notes-app');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const migrated: Record<string, NoteWithBlocks> = {};
        Object.entries(parsed).forEach(([id, note]: [string, any]) => {
          if (!note.blocks) {
            migrated[id] = { ...note, blocks: note.content ? [{ id: '1', type: 'paragraph', content: note.content, metadata: {}, comments: [] }] : [] };
          } else {
            migrated[id] = note;
          }
        });
        setNotes(migrated);
      } catch { initDefaults(); }
    } else { initDefaults(); }

    const savedDark = localStorage.getItem('noty-dark') === 'true';
    setDark(savedDark);
    if (savedDark) document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const initDefaults = () => {
    const root: NoteWithBlocks = { id: 'root', title: 'My Notes', type: 'folder', parentId: null, children: [], blocks: [] };
    setNotes({ root });
  };

  const save = useCallback((n: Record<string, NoteWithBlocks>) => {
    setIsSaving(true);
    const t = setTimeout(() => {
      localStorage.setItem('notes-app', JSON.stringify(n));
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const updateBlocks = (id: string, blocks: Block[]) => {
    const updated = { ...notes, [id]: { ...notes[id], blocks, updatedAt: Date.now() } };
    setNotes(updated); save(updated);
  };

  const updateTitle = (id: string, title: string) => {
    const updated = { ...notes, [id]: { ...notes[id], title } };
    setNotes(updated); save(updated);
  };

  const createNote = (parentId = 'root') => {
    const id = makeId();
    const note: NoteWithBlocks = {
      id, title: 'Untitled', type: 'note', parentId, children: [],
      blocks: [{ id: makeId(), type: 'paragraph', content: '', metadata: {}, comments: [] }],
      createdAt: Date.now(), updatedAt: Date.now(),
    };
    const updated = {
      ...notes, [id]: note,
      [parentId]: { ...notes[parentId], children: [...(notes[parentId]?.children || []), id] },
    };
    setNotes(updated); setSelectedId(id); save(updated);
  };

  const createFolder = (parentId = 'root') => {
    const id = makeId();
    const folder: NoteWithBlocks = { id, title: 'New Folder', type: 'folder', parentId, children: [], blocks: [] };
    const updated = {
      ...notes, [id]: folder,
      [parentId]: { ...notes[parentId], children: [...(notes[parentId]?.children || []), id] },
    };
    setNotes(updated); save(updated);
  };

  const confirmDelete = (id: string) => {
    const note = notes[id];
    if (!note || !note.parentId) return;
    setDeleteTarget({ id, name: note.title });
  };

  const executeDelete = () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    const note = notes[id];
    if (!note || !note.parentId) return;
    const updated = { ...notes };
    delete updated[id];
    updated[note.parentId] = { ...updated[note.parentId], children: updated[note.parentId].children.filter((c) => c !== id) };
    setNotes(updated);
    if (selectedId === id) setSelectedId(null);
    save(updated);
    setDeleteTarget(null);
  };

  const starNote = (id: string) => {
    const updated = { ...notes, [id]: { ...notes[id], starred: !notes[id].starred } };
    setNotes(updated); save(updated);
  };

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('noty-dark', String(next));
    if (next) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  };

  const exportMarkdown = () => {
    if (!selectedNote || selectedNote.type !== 'note') return;
    const md = noteToMarkdown(selectedNote);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${selectedNote.title}.md`; a.click();
    URL.revokeObjectURL(url);
  };

  const selectedNote = selectedId ? notes[selectedId] : null;
  const words = selectedNote?.type === 'note' ? wordCount(selectedNote.blocks) : 0;

  return (
    <div className="notes-app">
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelectNote={setSelectedId}
        onCreateNote={createNote}
        onCreateFolder={createFolder}
        onDeleteNote={confirmDelete}
        onRenameNote={updateTitle}
        onStarNote={starNote}
        onSearchOpen={() => setSearchOpen(true)}
      />

      <main className="main-pane">
        {selectedNote ? (
          <div className="editor">
            <div className="editor-header">
              <input
                className="editor-title"
                value={selectedNote.title}
                onChange={(e) => updateTitle(selectedNote.id, e.target.value)}
                placeholder="Untitled"
              />
              <div className="editor-meta">
                {words > 0 && <span className="word-count">{words} {words === 1 ? 'word' : 'words'}</span>}
                {isSaving && <span className="saving-indicator">Saving...</span>}
                {selectedNote.type === 'note' && (
                  <button className="toolbar-btn" onClick={exportMarkdown} title="Export as Markdown">
                    <Download size={15} />
                  </button>
                )}
                <button className="toolbar-btn" onClick={toggleDark} title="Toggle dark mode">
                  {dark ? <Sun size={15} /> : <Moon size={15} />}
                </button>
              </div>
            </div>

            {selectedNote.type === 'note' ? (
              <BlockEditor
                key={selectedNote.id}
                note={selectedNote}
                onUpdateBlocks={(blocks) => updateBlocks(selectedNote.id, blocks)}
                isSaving={isSaving}
              />
            ) : (
              <div className="folder-view">
                <Folder size={48} className="folder-view-icon" />
                <p className="folder-view-label">Folder — select a note inside or create one.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📝</div>
            <h2>No note selected</h2>
            <p>Pick a note from the sidebar or create a new one.</p>
            <div className="empty-hint"><kbd>⌘K</kbd> to search</div>
            <button className="toolbar-btn theme-toggle-float" onClick={toggleDark} title="Toggle dark mode">
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        )}
      </main>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={executeDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {searchOpen && (
        <SearchModal
          notes={notes}
          onSelect={(id) => { setSelectedId(id); setSearchOpen(false); }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

function Folder({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}
