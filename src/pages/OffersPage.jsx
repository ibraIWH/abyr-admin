import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/Layout';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Button, Field, Toggle, Badge, Loading, EmptyState } from '../components/ui';
import ImageField from '../components/ImageField';
import { IconPlus, IconEdit, IconTrash, IconOffers, IconExternal } from '../components/Icons';

const blank = () => ({ title: '', badgeText: '', subtitle: '', imageUrl: '', link: '', order: 0, isActive: true });

export default function OffersPage() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () =>
    api.get('/offers?all=true')
      .then((res) => setItems(res.data))
      .catch((err) => setError(apiError(err)));

  useEffect(() => { load(); }, []);

  const onDelete = async () => {
    try {
      await api.delete(`/offers/${confirm._id}`);
      toast.success('Offer deleted');
      setConfirm(null);
      load();
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <>
      <PageHeader
        title="Offers"
        subtitle="Promo banners shown across the storefront."
        actions={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add offer</Button>}
      />

      {error ? (
        <div className="card card__pad muted">{error}</div>
      ) : !items ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconOffers size={34} />}
            title="No offers yet"
            message="Create a promo banner — a seasonal sale or a new-arrival highlight — to feature on the home screen."
            action={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add offer</Button>}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((o) => (
            <div key={o._id} className="card" style={{ overflow: 'hidden' }}>
              <div style={{ position: 'relative', aspectRatio: '16 / 5', background: o.imageUrl ? 'var(--cream)' : 'var(--red)', display: 'grid', placeItems: 'center' }}>
                {o.imageUrl && <img src={o.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(20,5,8,.55), rgba(20,5,8,.05))' }} />
                <div style={{ position: 'absolute', left: 22, top: '50%', transform: 'translateY(-50%)', color: '#fff' }}>
                  {o.badgeText && (
                    <span style={{ display: 'inline-block', marginBottom: 8 }}>
                      <Badge fg="#1A1A1A" bg="var(--gold)">{o.badgeText}</Badge>
                    </span>
                  )}
                  <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 26, lineHeight: 1.1 }}>{o.title}</div>
                  {o.subtitle && <div style={{ fontSize: 13, opacity: .85, marginTop: 4, maxWidth: 420 }}>{o.subtitle}</div>}
                </div>
                {!o.isActive && (
                  <span style={{ position: 'absolute', top: 12, right: 12 }}><Badge fg="#5B5048" bg="#EFEAE2">Hidden</Badge></span>
                )}
              </div>
              <div className="card__pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {o.link ? (<><IconExternal size={15} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.link}</span></>) : (<span>No link · order {o.order}</span>)}
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(o)}><IconEdit size={17} /></button>
                  <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setConfirm(o)}><IconTrash size={17} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <OfferForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        title="Delete offer"
        message={confirm ? `Remove the “${confirm.title}” banner?` : ''}
      />
    </>
  );
}

function OfferForm({ item, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!item;
  const [form, setForm] = useState(() => (item ? { ...blank(), ...item } : blank()));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    if (!form.title.trim()) { setErr('Title is required'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      badgeText: form.badgeText,
      subtitle: form.subtitle,
      imageUrl: form.imageUrl,
      link: form.link,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    try {
      if (isEdit) await api.put(`/offers/${item._id}`, payload);
      else await api.post('/offers', payload);
      toast.success(isEdit ? 'Offer updated' : 'Offer added');
      onSaved();
    } catch (e) { toast.error(apiError(e)); setSaving(false); }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit offer' : 'New offer'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>{isEdit ? 'Save changes' : 'Add offer'}</Button>
        </>
      }
    >
      <div className="form-stack">
        <Field label="Title" placeholder="Mid-Season Sale" value={form.title} error={err} onChange={(e) => { set('title', e.target.value); setErr(''); }} />
        <div className="field-row">
          <Field label="Badge text" placeholder="30% OFF" value={form.badgeText} onChange={(e) => set('badgeText', e.target.value)} />
          <Field label="Sort order" type="number" value={form.order} onChange={(e) => set('order', e.target.value)} hint="Lower shows first." />
        </div>
        <Field label="Subtitle (optional)" placeholder="On selected abayas" value={form.subtitle} onChange={(e) => set('subtitle', e.target.value)} />
        <ImageField label="Banner image" aspect="16 / 6" value={form.imageUrl} onChange={(v) => set('imageUrl', v)} />
        <Field label="Link (optional)" placeholder="/category/sale" value={form.link} onChange={(e) => set('link', e.target.value)} hint="Where the banner takes shoppers when tapped." />
        <div className="field">
          <span className="field__label">Visibility</span>
          <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label={form.isActive ? 'Visible to customers' : 'Hidden'} />
        </div>
      </div>
    </Modal>
  );
}
