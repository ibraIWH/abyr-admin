import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/Layout';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Button, Field, Toggle, Badge, Loading, EmptyState } from '../components/ui';
import ImageField from '../components/ImageField';
import { IconPlus, IconEdit, IconTrash, IconCollections, IconImage } from '../components/Icons';

const blank = () => ({ name: '', imageUrl: '', description: '', order: 0, isActive: true });

export default function CollectionsPage() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () =>
    api.get('/collections?all=true')
      .then((res) => setItems(res.data))
      .catch((err) => setError(apiError(err)));

  useEffect(() => { load(); }, []);

  const onDelete = async () => {
    try {
      await api.delete(`/collections/${confirm._id}`);
      toast.success('Collection deleted');
      setConfirm(null);
      load();
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <>
      <PageHeader
        title="Collections"
        subtitle="The “Shop by Collection” tiles on your storefront."
        actions={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add collection</Button>}
      />

      {error ? (
        <div className="card card__pad muted">{error}</div>
      ) : !items ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconCollections size={34} />}
            title="No collections yet"
            message="Group products into a themed tile — like “Eid Edit” or “Everyday” — to feature on the home screen."
            action={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add collection</Button>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {items.map((c) => (
            <div key={c._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ aspectRatio: '4 / 3', background: 'var(--cream)', position: 'relative', display: 'grid', placeItems: 'center' }}>
                {c.imageUrl ? (
                  <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ color: '#c9c0b4' }}><IconImage size={26} /></span>
                )}
                {!c.isActive && (
                  <span style={{ position: 'absolute', top: 10, left: 10 }}>
                    <Badge fg="#5B5048" bg="#EFEAE2">Hidden</Badge>
                  </span>
                )}
              </div>
              <div className="card__pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{c.name}</div>
                  <div className="cell-product__meta">/{c.slug} · order {c.order}</div>
                </div>
                <div className="row-actions">
                  <button className="icon-btn" title="Edit" onClick={() => setEditing(c)}><IconEdit size={17} /></button>
                  <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setConfirm(c)}><IconTrash size={17} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CollectionForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        title="Delete collection"
        message={confirm ? `Remove “${confirm.name}”? Products stay in the store; only the tile is removed.` : ''}
      />
    </>
  );
}

function CollectionForm({ item, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!item;
  const [form, setForm] = useState(() => (item ? { ...blank(), ...item } : blank()));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    if (!form.name.trim()) { setErr('Name is required'); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      imageUrl: form.imageUrl,
      description: form.description,
      order: Number(form.order) || 0,
      isActive: form.isActive,
    };
    try {
      if (isEdit) await api.put(`/collections/${item._id}`, payload);
      else await api.post('/collections', payload);
      toast.success(isEdit ? 'Collection updated' : 'Collection added');
      onSaved();
    } catch (e) { toast.error(apiError(e)); setSaving(false); }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit collection' : 'New collection'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>{isEdit ? 'Save changes' : 'Add collection'}</Button>
        </>
      }
    >
      <div className="form-stack">
        <Field label="Name" placeholder="Eid Edit" value={form.name} error={err} onChange={(e) => { set('name', e.target.value); setErr(''); }} hint="The link is generated from the name automatically." />
        <ImageField label="Tile image" aspect="4 / 3" value={form.imageUrl} onChange={(v) => set('imageUrl', v)} />
        <Field as="textarea" label="Description (optional)" value={form.description} onChange={(e) => set('description', e.target.value)} />
        <div className="field-row">
          <Field label="Sort order" type="number" value={form.order} onChange={(e) => set('order', e.target.value)} hint="Lower shows first." />
          <div className="field">
            <span className="field__label">Visibility</span>
            <Toggle checked={form.isActive} onChange={(v) => set('isActive', v)} label={form.isActive ? 'Visible to customers' : 'Hidden'} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
