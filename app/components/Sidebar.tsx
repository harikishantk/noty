'use client';

import { useState } from 'react';
import { Plus, Folder, FileText, Trash2, ChevronRight, ChevronDown, Star, Search } from 'lucide-react';
import { NoteWithBlocks } from '@/app/types/blocks';

interface SidebarProps {
  notes: Record<string, NoteWithBlocks>;
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, title: string) => void;
  onStarNote: (id: string) => void;
  onSearchOpen: () => void;
}

export default function Sidebar({
  notes, selectedId, onSelectNote, onCreateNote, onCreateFolder,
  onDeleteNote, onRenameNote, onStarNote, onSearchOpen,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (id: string) => {
    const s = new Set(expandedFolders);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedFolders(s);
  };

  const startRename = (id: string, title: string) => {
    setRenamingId(id);
    setRenameValue(title);
  };

  const finishRename = (id: string) => {
    if (renameValue.trim()) onRenameNote(id, renameValue.trim());
    setRenamingId(null);
  };

  const renderItem = (id: string, depth = 0): React.ReactNode => {
    const note = notes[id];
    if (!note) return null;
    const isFolder = note.type === 'folder';
    const isExpanded = expandedFolders.has(id);
    const isSelected = selectedId === id;

    return (
      <div key={id}>
        <div
          className={`note-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
        >
          <button className="toggle-btn" onClick={() => isFolder && toggleFolder(id)}>
            {isFolder
              ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)
              : <span style={{ width: 14 }} />}
          </button>

          <button className="note-button" onClick={() => onSelectNote(id)}>
            {isFolder
              ? <Folder size={14} className="note-icon folder-icon" />
              : <FileText size={14} className="note-icon" />}
            {renamingId === id ? (
              <input
                className="rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => finishRename(id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') finishRename(id);
                  if (e.key === 'Escape') setRenamingId(null);
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="note-title">{note.title}</span>
            )}
            {note.starred && <Star size={11} className="star-badge" />}
          </button>

          <div className="note-actions">
            {!isFolder && (
              <button
                className={`action-btn star-btn ${note.starred ? 'starred' : ''}`}
                onClick={() => onStarNote(id)}
                title={note.starred ? 'Unstar' : 'Star'}
              >
                <Star size={13} />
              </button>
            )}
            <button className="action-btn" onClick={() => startRename(id, note.title)} title="Rename">
              ✎
            </button>
            {id !== 'root' && (
              <button className="action-btn delete-btn" onClick={() => onDeleteNote(id)} title="Delete">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {isFolder && isExpanded && (
          <div>
            {note.children.map((childId) => renderItem(childId, depth + 1))}
            <div className="folder-actions" style={{ paddingLeft: `${(depth + 1) * 14 + 8}px` }}>
              <button className="folder-add-btn" onClick={() => onCreateNote(id)}>
                <Plus size={12} /> Note
              </button>
              <button className="folder-add-btn" onClick={() => onCreateFolder(id)}>
                <Plus size={12} /> Folder
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const starredNotes = Object.values(notes).filter((n) => n.type === 'note' && n.starred);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">noty</span>
      </div>

      <button className="sidebar-search-btn" onClick={onSearchOpen}>
        <Search size={14} />
        <span>Search notes...</span>
        <kbd>⌘K</kbd>
      </button>

      <div className="sidebar-actions">
        <button className="add-btn" onClick={() => onCreateNote('root')}>
          <Plus size={15} /> Note
        </button>
        <button className="add-btn secondary" onClick={() => onCreateFolder('root')}>
          <Plus size={15} /> Folder
        </button>
      </div>

      {starredNotes.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-section-label">Starred</div>
          {starredNotes.map((n) => (
            <div
              key={n.id}
              className={`note-item ${selectedId === n.id ? 'selected' : ''}`}
              style={{ paddingLeft: '8px' }}
            >
              <button className="toggle-btn"><span style={{ width: 14 }} /></button>
              <button className="note-button" onClick={() => onSelectNote(n.id)}>
                <Star size={14} className="note-icon star-icon" />
                <span className="note-title">{n.title}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-section-label">Library</div>
        <nav className="notes-tree">
          {notes.root && renderItem('root')}
        </nav>
      </div>
    </aside>
  );
}
