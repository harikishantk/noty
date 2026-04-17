'use client';

interface DividerBlockProps {
  onDelete: () => void;
}

export default function DividerBlock({ onDelete }: DividerBlockProps) {
  return (
    <div
      className="divider-block"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') onDelete();
      }}
    >
      <hr className="divider-line" />
    </div>
  );
}
