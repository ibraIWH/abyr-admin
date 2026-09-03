import { useState } from 'react';
import api, { apiError } from '../api';
import { IconCheck } from '../components/Icons';
import { PageHeader } from '../components/Layout';
import { Button, Field } from '../components/ui';
import { useToast } from '../context/ToastContext';

// Sends a promotional notification to every customer. Order-status
// notifications are created automatically by the backend when an order's
// status changes, so this page is only for announcements / promos.
export default function NotificationsPage() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [sending, setSending] = useState(false);

  const canSend = title.trim() && message.trim() && !sending;

  const send = async () => {
    setSending(true);
    try {
      const res = await api.post('/notifications/broadcast', { title, message, link });
      toast.success(res.data?.message || 'Notification sent');
      setTitle(''); setMessage(''); setLink('');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Send an announcement to all customers. Order updates are sent automatically."
      />

      <div className="card" style={{ maxWidth: 560, padding: 24 }}>
        <Field label="Title">
          <input
            className="input"
            placeholder="e.g. Summer Sale is live"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>

        <Field label="Message">
          <textarea
            className="input"
            rows={4}
            placeholder="e.g. Enjoy 30% off all summer abayas this week only."
            value={message}
            maxLength={300}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>

        <Field label="Link (optional)" hint="Where the notification points, e.g. a category name.">
          <input
            className="input"
            placeholder="Summer"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </Field>

        <div style={{ marginTop: 8 }}>
          <Button icon={<IconCheck size={16} />} onClick={send} disabled={!canSend}>
            {sending ? 'Sending…' : 'Send to all customers'}
          </Button>
        </div>

        <p className="field__hint" style={{ marginTop: 14 }}>
          This is delivered to every registered customer's in-app inbox. It cannot be undone.
        </p>
      </div>
    </>
  );
}