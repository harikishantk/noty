'use client';

import React, { useState } from 'react';
import { Plus, Folder, FileText, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'folder';
  parentId: string | null;
  children: string[];
}

interface SidebarProps {
  notes: Record<string, Note>;
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  onCreateNote: (parentId: string) => void;
  onCreateFolder: (parentId: string) => void;
  onDeleteNote: (id: string) => void;
  onRenameNote: (id: string, title: string) => void;
}

export default function Sidebar({
  notes,
  selectedId,
  onSelectNote,
  onCreateNote,
  onCreateFolder,
  onDeleteNote,
  onRenameNote,
}: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const startRename = (id: string, currentTitle: string) => {
    setRenamingId(id);
    setRenameValue(currentTitle);
  };

  const finishRename = (id: string) => {
    if (renameValue.trim()) {
      onRenameNote(id, renameValue.trim());
    }
    setRenamingId(null);
  };

  const renderNoteItem = (id: string, depth: number = 0): React.ReactNode => {
    const note = notes[id];
    if (!note) return null;

    const isFolder = note.type === 'folder';
    const isExpanded = expandedFolders.has(id);
    const isSelected = selectedId === id;

    return (
      <div key={id}>
        <div
          className={`note-item ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${depth * 12}px` }}
        >
          {isFolder && (
            <button
              className="toggle-btn"
              onClick={() => toggleFolder(id)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          )}
          {!isFolder && <div className="toggle-btn" />}

          <button
            className="note-button"
            onClick={() => onSelectNote(id)}
          >
            {isFolder ? <Folder size={16} /> : <FileText size={16} />}
            {renamingId === id ? (
              <input
                type="text"
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
              <span>{note.title}</span>
            )}
          </button>

          <div className="note-actions">
            <button
              className="action-btn"
              onClick={() => startRename(id, note.title)}
              title="Rename"
            >
              ✎
            </button>
            {id !== 'root' && (
              <button
                className="action-btn delete-btn"
                onClick={() => onDeleteNote(id)}
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>

        {isFolder && isExpanded && (
          <div className="folder-children">
            {note.children.map((childId) => renderNoteItem(childId, depth + 1))}
            <div className="folder-actions" style={{ paddingLeft: `${(depth + 1) * 12}px` }}>
              <button
                className="add-btn"
                onClick={() => onCreateNote(id)}
                title="Add note"
              >
                <Plus size={14} /> Note
              </button>
              <button
                className="add-btn"
                onClick={() => onCreateFolder(id)}
                title="Add folder"
              >
                <Plus size={14} /> Folder
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>My Notes</h1>
      </div>
      <div className="sidebar-actions">
        <button
          className="add-btn"
          onClick={() => onCreateNote('root')}
          title="Add new note"
        >
          <Plus size={18} /> Note
        </button>
        <button
          className="add-btn"
          onClick={() => onCreateFolder('root')}
          title="Add new folder"
        >
          <Plus size={18} /> Folder
        </button>
      </div>
      <nav className="notes-tree">
        {notes.root && renderNoteItem('root')}
      </nav>
    </aside>
  );
}
