'use client';

import { useState } from 'react';
import { Block } from '@/app/types/blocks';
import ParagraphBlock from './ParagraphBlock';
import CodeBlock from './CodeBlock';
import HeadingBlock from './HeadingBlock';
import QuoteBlock from './QuoteBlock';
import CalloutBlock from './CalloutBlock';
import DividerBlock from './DividerBlock';
import ListBlock from './ListBlock';
import { GripVertical } from 'lucide-react';

interface BlockRendererProps {
  block: Block;
  listIndex: number;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onAddAfter: () => void;
  onSelectText: (startOffset: number, endOffset: number, selectedText: string) => void;
  onBlockTypeChange: (newType: Block['type']) => void;
  onMetadataUpdate: (metadata: Block['metadata']) => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
}

export default function BlockRenderer({
  block,
  listIndex,
  onUpdate,
  onDelete,
  onAddAfter,
  onSelectText,
  onBlockTypeChange,
  onMetadataUpdate,
  isDragging,
  onDragStart,
  onDragEnd,
}: BlockRendererProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`block-container ${isDragging ? 'dragging' : ''} ${hovered ? 'hovered' : ''}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="block-drag-handle" title="Drag to reorder">
        <GripVertical size={16} />
      </div>

      <div className="block-content">
        {block.type === 'paragraph' && (
          <ParagraphBlock
            block={block}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onSelectText={onSelectText}
            onBlockTypeChange={onBlockTypeChange}
          />
        )}

        {block.type === 'code' && (
          <CodeBlock
            block={block}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onUpdateLanguage={(lang) => onMetadataUpdate({ ...block.metadata, language: lang })}
          />
        )}

        {(block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') && (
          <HeadingBlock
            block={block}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onLevelChange={(level) => onMetadataUpdate({ ...block.metadata, headingLevel: level })}
          />
        )}

        {block.type === 'quote' && (
          <QuoteBlock block={block} onUpdate={onUpdate} onDelete={onDelete} />
        )}

        {block.type === 'callout' && (
          <CalloutBlock
            block={block}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onMetadataUpdate={onMetadataUpdate}
          />
        )}

        {block.type === 'divider' && (
          <DividerBlock onDelete={onDelete} />
        )}

        {(block.type === 'bullet_list' || block.type === 'numbered_list') && (
          <ListBlock
            block={block}
            listIndex={listIndex}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
          />
        )}
      </div>
    </div>
  );
}
