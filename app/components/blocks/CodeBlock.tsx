'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Block } from '@/app/types/blocks';
import hljs from 'highlight.js';

interface CodeBlockProps {
  block: Block;
  onUpdate: (content: string) => void;
  onDelete: () => void;
  onUpdateLanguage: (language: string) => void;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'html', 'css', 'jsx', 'tsx',
  'json', 'sql', 'bash', 'yaml', 'xml', 'markdown', 'go', 'rust',
  'java', 'cpp', 'csharp', 'php', 'ruby',
];

export default function CodeBlock({ block, onUpdate, onDelete, onUpdateLanguage }: CodeBlockProps) {
  const [isEditing, setIsEditing] = useState(!block.content);
  const [copied, setCopied] = useState(false);
  const language = block.metadata.language || 'javascript';

  useEffect(() => {
    if (!block.content) setIsEditing(true);
  }, [block.id]);

  const highlighted = useMemo(() => {
    if (!block.content) return '';
    try {
      if (hljs.getLanguage(language)) {
        return hljs.highlight(block.content, { language }).value;
      }
      return hljs.highlightAuto(block.content).value;
    } catch {
      return block.content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [block.content, language]);

  const copy = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <select
          className="language-select"
          value={language}
          onChange={(e) => onUpdateLanguage(e.target.value)}
        >
          {LANGUAGES.map((lang) => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
        <div className="code-actions">
          <button className="code-action-btn" onClick={copy} title="Copy code">
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button className="code-action-btn danger" onClick={onDelete} title="Delete block">
            <X size={14} />
          </button>
        </div>
      </div>

      {isEditing ? (
        <textarea
          className="code-textarea"
          value={block.content}
          onChange={(e) => onUpdate(e.target.value)}
          onBlur={() => block.content && setIsEditing(false)}
          placeholder={`Write ${language} code here...`}
          spellCheck={false}
          autoFocus
        />
      ) : (
        <pre
          className="code-preview hljs"
          onClick={() => setIsEditing(true)}
          dangerouslySetInnerHTML={{ __html: highlighted || '<span class="code-empty">Click to edit...</span>' }}
        />
      )}
    </div>
  );
}
