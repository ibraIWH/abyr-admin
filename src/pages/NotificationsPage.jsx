import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { IconCheck, IconEdit, IconTrash } from '../components/Icons';
import { PageHeader } from '../components/Layout';
import { Button, Field } from '../components/ui';
import { useToast } from '../context/ToastContext';

// Send a promo to all customers, and manage past campaigns (edit / resend / delete).
// Order-status notifications are created automatically by the backend.
export default function NotificationsPage() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = compose new, else editing

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const canSave = title.trim() && message.trim() && !saving;
  const isEditing = editingId !== null;

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notifications/broadcasts');
      setHistory(res.data || []);
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const resetForm = () => {
    setTitle(''); setMessage(''); setLink(''); setEditingId(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      if (isEditing) {
        const res = await api.put(`/notifications/broadcasts/${editingId}`, { title, message, link });
        toast.success(res.data?.message || 'Campaign updated');
      } else {
        const res = await api.post('/notifications/broadcast', { title, message, link });
        toast.success(res.data?.message || 'Notification sent');
      }
      resetForm();
      loadHistory();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setTitle(b.title);
    setMessage(b.message);
    setLink(b.link || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resend = async (id) => {
    try {
      const res = await api.post(`/notifications/broadcasts/${id}/resend`);
      toast.success(res.data?.message || 'Resent');
      loadHistory();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this campaign? It will also be removed from customers\u2019 inboxes.')) return;
    try {
      await api.delete(`/notifications/broadcasts/${id}`);
      toast.success('Campaign deleted');
      if (editingId === id) resetForm();
      setHistory((h) => h.filter((b) => b._id !== id));
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const fmtDate = (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch { return ''; }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Send an announcement to all customers. Order updates are sent automatically."
      />

      <div className="card" style={{ maxWidth: 560, padding: 24, marginBottom: 28 }}>
        {isEditing && (
          <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--brand, #5C0A14)', fontWeight: 600 }}>
            Editing campaign — changes update customers&rsquo; inboxes too.
          </div>
        )}

        <Field label="Title">
          <input className="input" placeholder="e.g. Summer Sale is live"
            value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Message">
          <textarea className="input" rows={4}
            placeholder="e.g. Enjoy 30% off all summer abayas this week only."
            value={message} maxLength={300} onChange={(e) => setMessage(e.target.value)} />
        </Field>
        <Field label="Link (optional)" hint="Where the notification points, e.g. a category name.">
          <input className="input" placeholder="Summer"
            value={link} onChange={(e) => setLink(e.target.value)} />
        </Field>

        <div style={{ marginTop: 8, display: 'flex', gap: 10 }}>
          <Button icon={<IconCheck size={16} />} onClick={save} disabled={!canSave}>
            {saving ? 'Saving\u2026' : isEditing ? 'Update campaign' : 'Send to all customers'}
          </Button>
          {isEditing && (
            <button className="btn" onClick={resetForm} disabled={saving}>Cancel</button>
          )}
        </div>
      </div>

      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>Sent campaigns</h3>

      {loading ? (
        <p className="field__hint">Loading\u2026</p>
      ) : history.length === 0 ? (
        <p className="field__hint">No campaigns sent yet.</p>
      ) : (
        <div className="card" style={{ padding: 0, maxWidth: 720 }}>
          {history.map((b, i) => (
            <div key={b._id}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10,
                padding: 16,
                borderTop: i === 0 ? 'none' : '1px solid var(--border, #e8e8e4)',
                background: editingId === b._id ? 'var(--sand, #faf8f4)' : 'transparent',
              }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{b.message}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                  {fmtDate(b.createdAt)} · sent to {b.sentCount} · {b.sendCount}\u00d7
                </div>
              </div>
              <button className="btn btn--sm" onClick={() => startEdit(b)} title="Edit">
                <IconEdit size={15} />
              </button>
              <button className="btn btn--sm" onClick={() => resend(b._id)}>Resend</button>
              <button className="btn btn--sm btn--danger" onClick={() => remove(b._id)} title="Delete">
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}