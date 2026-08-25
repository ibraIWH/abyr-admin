import { useEffect, useState } from 'react';
import api, { apiError } from '../api';
import { IconCollections, IconEdit, IconImage, IconPlus, IconTrash } from '../components/Icons';
import ImageField from '../components/ImageField';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Modal } from '../components/Modal';
import { Badge, Button, EmptyState, Field, Loading, Toggle } from '../components/ui';
import { useToast } from '../context/ToastContext';

const blank = () => ({ name: '', imageUrl: '', description: '', order: 0, isActive: true });

// Products store their category as plain text ("Black Abayas"), while a category
// slug is "black-abayas". This matches them the same way the backend does:
// case-insensitive, with hyphens/underscores/spaces treated as the same thing.
const norm = (s = '') => s.toLowerCase().replace(/[-_\s]+/g, ' ').trim();

export default function CategoriesPage() {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const load = () =>
    Promise.all([api.get('/collections?all=true'), api.get('/products')])
      .then(([cats, prods]) => {
        setItems(cats.data);
        setProducts(prods.data || []);
      })
      .catch((err) => setError(apiError(err)));

  useEffect(() => { load(); }, []);

  // How many products actually carry this category name?
  const countFor = (name) =>
    products.filter((p) => norm(p.category) === norm(name)).length;

  const onDelete = async () => {
    try {
      await api.delete(`/collections/${confirm._id}`);
      toast.success('Category deleted');
      setConfirm(null);
      load();
    } catch (err) { toast.error(apiError(err)); }
  };

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="The category menu and picture tiles on your storefront."
        actions={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add category</Button>}
      />

      {error ? (
        <div className="card card__pad muted">{error}</div>
      ) : !items ? (
        <Loading />
      ) : items.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconCollections size={34} />}
            title="No categories yet"
            message="Add a category — like “Abaya” or “Jalabiya” — to show it in your storefront menu."
            action={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add category</Button>}
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
          {items.map((c) => {
            const count = countFor(c.name);
            return (
              <div key={c._id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ aspectRatio: '4 / 3', background: 'var(--cream)', position: 'relative', display: 'grid', placeItems: 'center' }}>
                  {c.imageUrl ? (
                    <img src={c.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ color: '#c9c0b4', display: 'grid', justifyItems: 'center', gap: 6 }}>
                      <IconImage size={26} />
                      <span style={{ fontSize: 11 }}>No image</span>
                    </span>
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
                    <div className="cell-product__meta">
                      {count === 0 ? (
                        <span style={{ color: 'var(--amber)' }}>No products</span>
                      ) : (
                        <>{count} product{count === 1 ? '' : 's'}</>
                      )}
                      {' · '}order {c.order}
                    </div>
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => setEditing(c)}><IconEdit size={17} /></button>
                    <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setConfirm(c)}><IconTrash size={17} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <CategoryForm
          item={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        title="Delete category"
        message={confirm ? `Remove “${confirm.name}” from your storefront menu? Products keep their category and stay in the store.` : ''}
      />
    </>
  );
}

function CategoryForm({ item, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!item;
  const [form, setForm] = useState(() => (item ? { ...blank(), ...item } : blank()));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const renamed = isEdit && norm(form.name) !== norm(item.name);

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
      toast.success(isEdit ? 'Category updated' : 'Category added');
      onSaved();
    } catch (e) { toast.error(apiError(e)); setSaving(false); }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={isEdit ? 'Edit category' : 'New category'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>{isEdit ? 'Save changes' : 'Add category'}</Button>
        </>
      }
    >
      <div className="form-stack">
        <Field
          label="Name"
          placeholder="Abaya"
          value={form.name}
          error={err}
          onChange={(e) => { set('name', e.target.value); setErr(''); }}
          hint="The storefront link is generated from the name automatically."
        />

        {renamed && (
          <div style={{ background: '#FBE7D8', border: '1px solid #f0d3bd', borderRadius: 9, padding: '10px 13px', fontSize: 12.5, color: '#8A3A00', lineHeight: 1.55 }}>
            You're renaming this category. Products still have the old name in their
            Category field, so this one will show no products until you update them
            on the Products page.
          </div>
        )}

        <ImageField label="Tile image" aspect="4 / 3" value={form.imageUrl} onChange={(v) => set('imageUrl', v)} hint="Shown in the “Shop by Category” section on your storefront." />
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
