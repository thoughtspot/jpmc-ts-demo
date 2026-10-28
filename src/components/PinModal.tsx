// In-app "name this report" dialog used before pinning an answer to the
// dashboard. Replaces window.prompt() (browser-native prompts are invisible in
// screen shares / recordings) with an app-rendered, theme-aware modal.
import { useEffect, useRef, useState } from 'react';
import { Pin, X } from 'lucide-react';

interface Props {
  open: boolean;
  defaultName?: string;
  onCancel: () => void;
  onConfirm: (name: string) => void;
}

export default function PinModal({ open, defaultName = 'New report', onCancel, onConfirm }: Props) {
  const [name, setName] = useState(defaultName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(defaultName);
      // Focus + select so the user can type over the default immediately.
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 0);
    }
  }, [open, defaultName]);

  if (!open) return null;

  function confirm() {
    const trimmed = name.trim();
    if (trimmed) onConfirm(trimmed);
  }

  return (
    <div className="sl-pin-overlay" onClick={onCancel}>
      <div
        className="sl-pin-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="sl-pin-header">
          <div className="sl-pin-title">
            <Pin size={16} />
            <span>Pin to dashboard</span>
          </div>
          <button className="sl-pin-close" onClick={onCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="sl-pin-body">
          <label className="sl-pin-label" htmlFor="sl-pin-name">
            Name this report
          </label>
          <input
            id="sl-pin-name"
            ref={inputRef}
            className="sl-pin-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') confirm();
              if (e.key === 'Escape') onCancel();
            }}
            placeholder="New report"
          />
        </div>
        <div className="sl-pin-actions">
          <button className="sl-pin-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="sl-pin-confirm" onClick={confirm} disabled={!name.trim()}>
            <Pin size={15} /> Pin
          </button>
        </div>
      </div>
    </div>
  );
}
