'use client';

import { useEffect } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteModalProps {
  name: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ name, onConfirm, onCancel }: DeleteModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onConfirm, onCancel]);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <Trash2 size={24} />
        </div>
        <h2 className="modal-title">Delete "{name}"?</h2>
        <p className="modal-desc">This action cannot be undone.</p>
        <div className="modal-actions">
          <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="modal-btn modal-btn-danger" onClick={onConfirm} autoFocus>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
