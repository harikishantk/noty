'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Editor from '../components/Editor';
import '../styles/notes.css';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'folder';
  parentId: string | null;
  children: string[];
}

export default function NotesApp() {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('notes-app');
    if (saved) {
      try {
        setNotes(JSON.parse(saved));
      } catch {
        initializeDefaultNotes();
      }
    } else {
      initializeDefaultNotes();
    }
  }, []);

  const initializeDefaultNotes = () => {
    const defaultFolder: Note = {
      id: 'root',
      title: 'My Notes',
      content: '',
      type: 'folder',
      parentId: null,
      children: [],
    };
    setNotes({ root: defaultFolder });
  };

  // Auto-save to localStorage
  const saveNotes = useCallback((notesToSave: Record<string, Note>) => {
    setIsSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem('notes-app', JSON.stringify(notesToSave));
      setIsSaving(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Update note content with auto-save
  const updateNoteContent = (id: string, content: string) => {
    const updated = {
      ...notes,
      [id]: { ...notes[id], content },
    };
    setNotes(updated);
    saveNotes(updated);
  };

  // Update note title
  const updateNoteTitle = (id: string, title: string) => {
    const updated = {
      ...notes,
      [id]: { ...notes[id], title },
    };
    setNotes(updated);
    saveNotes(updated);
  };

  // Create new note
  const createNote = (parentId: string = 'root') => {
    const id = Date.now().toString();
    const newNote: Note = {
      id,
      title: 'Untitled Note',
      content: '',
      type: 'note',
      parentId,
      children: [],
    };

    const updated = {
      ...notes,
      [id]: newNote,
      [parentId]: {
        ...notes[parentId],
        children: [...notes[parentId].children, id],
      },
    };

    setNotes(updated);
    setSelectedId(id);
    saveNotes(updated);
  };

  // Create new folder
  const createFolder = (parentId: string = 'root') => {
    const id = Date.now().toString();
    const newFolder: Note = {
      id,
      title: 'New Folder',
      content: '',
      type: 'folder',
      parentId,
      children: [],
    };

    const updated = {
      ...notes,
      [id]: newFolder,
      [parentId]: {
        ...notes[parentId],
        children: [...notes[parentId].children, id],
      },
    };

    setNotes(updated);
    saveNotes(updated);
  };

  // Delete note/folder
  const deleteNote = (id: string) => {
    const note = notes[id];
    if (!note || !note.parentId) return;

    const updated = { ...notes };
    delete updated[id];

    updated[note.parentId] = {
      ...updated[note.parentId],
      children: updated[note.parentId].children.filter(childId => childId !== id),
    };

    setNotes(updated);
    if (selectedId === id) setSelectedId(null);
    saveNotes(updated);
  };

  const selectedNote = selectedId ? notes[selectedId] : null;

  return (
    <div className="notes-app">
      <Sidebar
        notes={notes}
        selectedId={selectedId}
        onSelectNote={setSelectedId}
        onCreateNote={createNote}
        onCreateFolder={createFolder}
        onDeleteNote={deleteNote}
        onRenameNote={updateNoteTitle}
      />
      <main className="main-pane">
        {selectedNote ? (
          <Editor
            note={selectedNote}
            onContentChange={(content) => updateNoteContent(selectedNote.id, content)}
            onTitleChange={(title) => updateNoteTitle(selectedNote.id, title)}
            isSaving={isSaving}
          />
        ) : (
          <div className="empty-state">
            <h2>No note selected</h2>
            <p>Create a new note or select an existing one to get started</p>
          </div>
        )}
      </main>
    </div>
  );
}
