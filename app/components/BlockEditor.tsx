'use client';

import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeListIndexRef = useRef<number>(0);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

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
      b.id === id ? { ...b, content: '', type: newType, metadata: { ...b.metadata, headingLevel: newType.startsWith('heading_') ? (parseInt(newType.split('_')[1]) as 1 | 2 | 3) : undefined, calloutType: newType === 'callout' ? 'info' : undefined } } : b
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
    const idx = blocks.findIndex((b) => b.id === event.active.id);
    activeListIndexRef.current = listCounters.get(blocks[idx]?.id) ?? idx + 1;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    push(arrayMove(blocks, oldIndex, newIndex));
  };

  const allThreads = blocks.reduce((acc: ICommentThread[], b) => [...acc, ...b.comments], []);

  const listCounters = new Map<string, number>();
  let bulletCount = 0;
  let numberedCount = 0;
  blocks.forEach((b) => {
    if (b.type === 'bullet_list') { bulletCount++; listCounters.set(b.id, bulletCount); }
    else if (b.type === 'numbered_list') { numberedCount++; listCounters.set(b.id, numberedCount); }
    else { bulletCount = 0; numberedCount = 0; }
  });

  const activeBlock = activeId ? blocks.find((b) => b.id === activeId) : null;

  return (
    <div className="block-editor-container">
      <div className="blocks-area">
        {blocks.length === 0 ? (
          <div className="editor-empty">
            <p>Start typing or press <kbd>/</kbd> to add blocks</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block, index) => (
                <BlockRenderer
                  key={block.id}
                  block={block}
                  listIndex={listCounters.get(block.id) ?? index + 1}
                  onUpdate={(content) => updateBlock(block.id, content)}
                  onDelete={() => deleteBlock(block.id)}
                  onAddAfter={() => addBlock(index, block.type)}
                  onSelectText={(s, e, t) => handleSelectText(block.id, s, e, t)}
                  onBlockTypeChange={(type) => changeType(block.id, type)}
                  onMetadataUpdate={(meta) => updateMeta(block.id, meta)}
                />
              ))}
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
              {activeBlock ? (
                <div style={{ transform: 'scale(1.02)', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', borderRadius: 6 }}>
                  <BlockRenderer
                    block={activeBlock}
                    listIndex={activeListIndexRef.current}
                    onUpdate={() => {}}
                    onDelete={() => {}}
                    onAddAfter={() => {}}
                    onSelectText={() => {}}
                    onBlockTypeChange={() => {}}
                    onMetadataUpdate={() => {}}
                    isOverlay
                  />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
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
