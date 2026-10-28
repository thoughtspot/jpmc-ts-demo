import { useEffect, useState } from 'react';
import { X, LayoutDashboard, Plus, AlertCircle } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Creates the liveboard; should throw on failure so the modal can show it. */
  onCreate: (name: string, description: string) => Promise<void>;
}

export default function CreateDashboardModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setError('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    if (!name.trim() || submitting) return;
    setSubmitting(true);
    setError('');
    try {
      await onCreate(name.trim(), description.trim());
      // On success the parent closes this modal.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create the dashboard.');
      setSubmitting(false);
    }
  }

  return (
    <div className="winback-overlay" onClick={submitting ? undefined : onClose}>
      <div className="winback-modal" onClick={(e) => e.stopPropagation()}>
        <div className="winback-header">
          <div className="winback-title">
            <LayoutDashboard size={18} />
            <span>Create New Dashboard</span>
          </div>
          <button
            className="winback-close"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="winback-body">
          {error && (
            <div className="ma-inline-error">
              <AlertCircle size={15} /> {error}
            </div>
          )}
          <div className="winback-field" style={{ marginBottom: 16 }}>
            <label className="winback-label">Dashboard name</label>
            <input
              className="login-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Pipeline Review"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
          <div className="winback-field">
            <label className="winback-label">Description (optional)</label>
            <input
              className="login-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this dashboard for?"
              onKeyDown={(e) => e.key === 'Enter' && submit()}
            />
          </div>
        </div>

        <div className="winback-footer">
          <button
            className="winback-btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            className="winback-btn-primary"
            onClick={submit}
            disabled={!name.trim() || submitting}
          >
            {submitting ? <span className="btn-spinner" /> : <Plus size={16} />}
            {submitting ? 'Creating…' : 'Create Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
