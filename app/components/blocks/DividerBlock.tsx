'use client';

interface DividerBlockProps {
  onDelete: () => void;
  isOverlay?: boolean;
}

export default function DividerBlock({ onDelete, isOverlay }: DividerBlockProps) {
  return (
    <div
      className="divider-block"
      tabIndex={isOverlay ? -1 : 0}
      onKeyDown={isOverlay ? undefined : (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') onDelete();
      }}
    >
      <hr className="divider-line" />
    </div>
  );
}
