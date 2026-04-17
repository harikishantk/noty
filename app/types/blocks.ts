export type BlockType =
  | 'paragraph'
  | 'code'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'bullet_list'
  | 'numbered_list';

export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface CommentThread {
  id: string;
  blockId: string;
  startOffset: number;
  endOffset: number;
  selectedText: string;
  comments: Comment[];
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  metadata: {
    language?: string;
    headingLevel?: 1 | 2 | 3;
    emoji?: string;
    calloutType?: 'info' | 'warning' | 'success' | 'error';
  };
  comments: CommentThread[];
}

export interface NoteWithBlocks {
  id: string;
  title: string;
  type: 'note' | 'folder';
  parentId: string | null;
  children: string[];
  blocks: Block[];
  starred?: boolean;
  createdAt?: number;
  updatedAt?: number;
}
