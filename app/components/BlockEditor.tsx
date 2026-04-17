'use client';

import { useState, useCallback, useRef } from 'react';
import { Block, CommentThread as ICommentThread, NoteWithBlocks } from '@/app/types/blocks';
import BlockRenderer from './blocks/BlockRenderer';
import CommentPanel from './CommentPanel';

interface BlockEditorProps {
  note: NoteWithBlocks;
  onUpdateBlocks: (blocks: Block[]) => void;
  isSaving: boolean;
}

function makeBlock(type: Block['type'], content = ''): Block {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    content,
    metadata: {
      language: type === 'code' ? 'javascript' : undefined,
      headingLevel: type.startsWith('heading_') ? (parseInt(type.split('_')[1]) as 1 | 2 | 3) : undefined,
      calloutType: type === 'callout' ? 'info' : undefined,
    },
    comments: [],
  };
}

export default function BlockEditor({ note, onUpdateBlocks, isSaving }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(note.blocks?.length ? note.blocks : [makeBlock('paragraph')]);
  const dragSourceIndex = useRef<number | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const push = useCallback((newBlocks: Block[]) => {
    setBlocks(newBlocks);
    onUpdateBlocks(newBlocks);
  }, [onUpdateBlocks]);

  const addBlock = (index: number, type: Block['type'] = 'paragraph') => {
    const nb = [...blocks];
    nb.splice(index + 1, 0, makeBlock(type));
    push(nb);
  };

  const updateBlock = (id: string, content: string) =>
    push(blocks.map((b) => (b.id === id ? { ...b, content } : b)));

  const deleteBlock = (id: string) => {
    const nb = blocks.filter((b) => b.id !== id);
    push(nb.length ? nb : [makeBlock('paragraph')]);
  };

  const changeType = (id: string, newType: Block['type']) =>
    push(blocks.map((b) =>
      b.id === id ? { ...b, type: newType, metadata: { ...b.metadata, headingLevel: newType.startsWith('heading_') ? (parseInt(newType.split('_')[1]) as 1 | 2 | 3) : undefined, calloutType: newType === 'callout' ? 'info' : undefined } } : b
    ));

  const updateMeta = (id: string, metadata: Block['metadata']) =>
    push(blocks.map((b) => (b.id === id ? { ...b, metadata } : b)));

  const handleSelectText = (blockId: string, start: number, end: number, text: string) => {
    const threadId = `${Date.now()}`;
    push(blocks.map((b) =>
      b.id === blockId
        ? { ...b, comments: [...b.comments, { id: threadId, blockId, startOffset: start, endOffset: end, selectedText: text, comments: [] }] }
        : b
    ));
  };

  const handleAddComment = (threadId: string, content: string) =>
    push(blocks.map((b) => ({
      ...b,
      comments: b.comments.map((t) =>
        t.id === threadId
          ? { ...t, comments: [...t.comments, { id: `${Date.now()}`, author: 'You', content, timestamp: Date.now() }] }
          : t
      ),
    })));

  const handleDeleteThread = (threadId: string) =>
    push(blocks.map((b) => ({ ...b, comments: b.comments.filter((t) => t.id !== threadId) })));

  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragSourceIndex.current = index;
    setDraggedId(blocks[index].id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragSourceIndex.current === null || dragSourceIndex.current === targetIndex) return;
    const nb = [...blocks];
    const [moved] = nb.splice(dragSourceIndex.current, 1);
    nb.splice(targetIndex, 0, moved);
    push(nb);
    setDraggedId(null);
    dragSourceIndex.current = null;
  };

  const allThreads = blocks.reduce((acc: ICommentThread[], b) => [...acc, ...b.comments], []);

  // Track list indices per block
  const listCounters = new Map<string, number>();
  let bulletCount = 0;
  let numberedCount = 0;
  blocks.forEach((b) => {
    if (b.type === 'bullet_list') { bulletCount++; listCounters.set(b.id, bulletCount); }
    else if (b.type === 'numbered_list') { numberedCount++; listCounters.set(b.id, numberedCount); }
    else { bulletCount = 0; numberedCount = 0; }
  });

  return (
    <div className="block-editor-container">
      <div className="blocks-area">
        {blocks.length === 0 ? (
          <div className="editor-empty">
            <p>Start typing or press <kbd>/</kbd> to add blocks</p>
          </div>
        ) : (
          blocks.map((block, index) => (
            <div
              key={block.id}
              className="block-drop-zone"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
            >
              <BlockRenderer
                block={block}
                listIndex={listCounters.get(block.id) || index + 1}
                onUpdate={(content) => updateBlock(block.id, content)}
                onDelete={() => deleteBlock(block.id)}
                onAddAfter={() => addBlock(index, block.type)}
                onSelectText={(s, e, t) => handleSelectText(block.id, s, e, t)}
                onBlockTypeChange={(type) => changeType(block.id, type)}
                onMetadataUpdate={(meta) => updateMeta(block.id, meta)}
                isDragging={draggedId === block.id}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={() => { setDraggedId(null); dragSourceIndex.current = null; }}
              />
            </div>
          ))
        )}

        <button className="add-block-btn" onClick={() => addBlock(blocks.length - 1)}>
          + Add block
        </button>
      </div>

      <CommentPanel
        threads={allThreads}
        onAddComment={handleAddComment}
        onDeleteThread={handleDeleteThread}
        isOpen={allThreads.length > 0}
      />
    </div>
  );
}
