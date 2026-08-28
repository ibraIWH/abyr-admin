import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { IconEdit, IconExternal, IconOffers, IconPlus, IconTrash } from '../components/Icons';
import ImageField from '../components/ImageField';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Modal } from '../components/Modal';
import { Badge, Button, EmptyState, Field, Loading, Toggle } from '../components/ui';
import { useToast } from '../context/ToastContext';

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {items.map((o) => (
            <div key={o._id} className="card" style={{ overflow: 'hidden' }}>
              {/* Preview mirrors the storefront: photo on the left fading into
                  a dark panel on the right. Keeps the admin honest about what
                  customers actually see. */}
              <div style={{ display: 'flex', minHeight: 200, background: 'var(--ink, #1A1A1A)' }}>
                <div style={{ flex: '0 0 170px', position: 'relative', background: 'var(--cream)', overflow: 'hidden' }}>
                  {o.imageUrl ? (
                    <img src={o.imageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: '#c9c0b4', fontSize: 11 }}>
                      No image
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to right, rgba(26,26,26,0) 0%, rgba(26,26,26,0.10) 40%, rgba(26,26,26,0.40) 64%, rgba(26,26,26,0.78) 84%, rgba(26,26,26,1) 100%)',
                    }}
                  />
                </div>

                <div style={{ flex: 1, padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff', minWidth: 0 }}>
                  {o.badgeText ? (
                    <span style={{ alignSelf: 'flex-start' }}>
                      <Badge fg="#1A1A1A" bg="var(--gold)">{o.badgeText}</Badge>
                    </span>
                  ) : <span />}

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: 24, lineHeight: 1.15 }}>{o.title}</div>
                    {o.subtitle && <div style={{ fontSize: 12, opacity: .75, marginTop: 6, lineHeight: 1.5 }}>{o.subtitle}</div>}
                  </div>

                  <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', color: 'var(--gold)', borderTop: '1px solid rgba(196,168,130,0.28)', paddingTop: 10 }}>
                    Shop now →
                  </div>
                </div>

              </div>

              <div className="card__pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div className="muted" style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {o.link ? (<><IconExternal size={15} /><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.link}</span></>) : (<span>No link · order {o.order}</span>)}
                  {!o.isActive && <Badge fg="#5B5048" bg="#EFEAE2">Hidden</Badge>}
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
        <ImageField label="Offer photo" aspect="3 / 4" value={form.imageUrl} onChange={(v) => set('imageUrl', v)} />
        <Field label="Link (optional)" placeholder="/category/sale" value={form.link} onChange={(e) => set('link', e.target.value)} hint="Where the banner takes shoppers when tapped." />
        <div className="field">
          <span className="field__label">Visibility</span>
          <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label={form.isActive ? 'Visible to customers' : 'Hidden'} />
        </div>
      </div>
    </Modal>
  );
}