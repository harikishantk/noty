'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  isOverlay?: boolean;
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
  isOverlay = false,
}: BlockRendererProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    disabled: isOverlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform) ?? undefined,
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`block-container ${isDragging ? 'dragging' : ''}`}
      {...attributes}
    >
      <div
        className="block-drag-handle"
        title="Drag to reorder"
        {...listeners}
      >
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
          <DividerBlock onDelete={onDelete} isOverlay={isOverlay} />
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
