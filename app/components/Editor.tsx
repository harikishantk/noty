'use client';

import React, { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  type: 'note' | 'folder';
  parentId: string | null;
  children: string[];
}

interface EditorProps {
  note: Note;
  onContentChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  isSaving: boolean;
}

export default function Editor({
  note,
  onContentChange,
  onTitleChange,
  isSaving,
}: EditorProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note.id, note.title, note.content]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    onTitleChange(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);
  };

  if (note.type === 'folder') {
    return (
      <div className="editor">
        <div className="editor-header">
          <h1>{note.title}</h1>
          <span className="folder-badge">Folder</span>
        </div>
        <div className="editor-empty">
          <p>This is a folder. Select a note to edit it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-header">
        <input
          type="text"
          className="editor-title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Note title"
        />
        <div className="editor-status">
          {isSaving && <span className="saving-indicator">Saving...</span>}
          <span className="save-status">Auto-saving enabled</span>
        </div>
      </div>
      <textarea
        className="editor-textarea"
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        placeholder="Start typing your note... Changes are automatically saved."
        spellCheck="true"
      />
    </div>
  );
}
