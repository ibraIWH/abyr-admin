import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { IconCheck, IconTrash } from '../components/Icons';
import { PageHeader } from '../components/Layout';
import { Button, Field } from '../components/ui';
import { useToast } from '../context/ToastContext';

// Send a promo to all customers, and manage past campaigns.
// Order-status notifications are created automatically by the backend.
export default function NotificationsPage() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const canSend = title.trim() && message.trim() && !sending;

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

  const send = async () => {
    setSending(true);
    try {
      const res = await api.post('/notifications/broadcast', { title, message, link });
      toast.success(res.data?.message || 'Notification sent');
      setTitle(''); setMessage(''); setLink('');
      loadHistory();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSending(false);
    }
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
    if (!window.confirm('Delete this campaign from history? Notifications already delivered stay in customers\u2019 inboxes.')) return;
    try {
      await api.delete(`/notifications/broadcasts/${id}`);
      toast.success('Campaign deleted');
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
        <div style={{ marginTop: 8 }}>
          <Button icon={<IconCheck size={16} />} onClick={send} disabled={!canSend}>
            {sending ? 'Sending\u2026' : 'Send to all customers'}
          </Button>
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
                display: 'flex', alignItems: 'flex-start', gap: 16,
                padding: 16,
                borderTop: i === 0 ? 'none' : '1px solid var(--border, #e8e8e4)',
              }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{b.message}</div>
                <div style={{ fontSize: 11, color: '#999', marginTop: 6 }}>
                  {fmtDate(b.createdAt)} · sent to {b.sentCount} · {b.sendCount}\u00d7
                </div>
              </div>
              <button className="btn btn--sm" onClick={() => resend(b._id)}>Resend</button>
              <button className="btn btn--sm btn--danger" onClick={() => remove(b._id)}
                title="Delete campaign">
                <IconTrash size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}