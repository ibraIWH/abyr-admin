import { useEffect, useMemo, useState } from 'react';
import api, { apiError } from '../api';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/Layout';
import { Modal, ConfirmDialog } from '../components/Modal';
import { Button, Field, Select, Chips, Badge, Loading, EmptyState } from '../components/ui';
import ImageField from '../components/ImageField';
import { IconPlus, IconEdit, IconTrash, IconPercent, IconProducts, IconImage } from '../components/Icons';
import { TAG_META, TAG_OPTIONS, DEFAULT_SIZES, SAR } from '../theme';

const blank = () => ({
  name: '', price: '', salePrice: '', category: 'Abaya', description: '',
  stock: 10, sizes: ['XS', 'S', 'M', 'L', 'XL'], tag: 'none',
  imageUrl: '', imageUrl2: '', images: [], colors: [],
});

const num = (v) => (v === '' || v == null ? null : Number(v));

export default function ProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [editing, setEditing] = useState(null); // product or 'new'
  const [confirm, setConfirm] = useState(null); // product to delete
  const [discount, setDiscount] = useState(null); // product for discount modal

  const load = () =>
    api.get('/products')
      .then((res) => setProducts(res.data))
      .catch((err) => setError(apiError(err)));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    );
  }, [products, query]);

  const onDelete = async () => {
    try {
      await api.delete(`/products/${confirm._id}`);
      toast.success('Product deleted');
      setConfirm(null);
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Products"
        subtitle="Everything for sale on the app and web."
        actions={<Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add product</Button>}
      />

      <div className="toolbar">
        <div className="search">
          <input className="input" placeholder="Search by name or category" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {products && <span className="muted nowrap">{filtered.length} of {products.length}</span>}
      </div>

      <div className="card">
        {error ? (
          <div className="card__pad muted">{error}</div>
        ) : !products ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconProducts size={34} />}
            title={query ? 'No matches' : 'No products yet'}
            message={query ? 'Try a different search.' : 'Add your first product to show it on the storefront.'}
            action={!query && <Button icon={<IconPlus size={17} />} onClick={() => setEditing('new')}>Add product</Button>}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Product</th><th>Price</th><th>Stock</th><th>Tag</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const tag = TAG_META[p.tag] || TAG_META.none;
                  return (
                    <tr key={p._id}>
                      <td>
                        <div className="cell-product">
                          {p.imageUrl ? (
                            <img className="thumb" src={p.imageUrl} alt="" />
                          ) : (
                            <span className="thumb thumb--placeholder"><IconImage size={18} /></span>
                          )}
                          <div>
                            <div className="cell-product__name">{p.name}</div>
                            <div className="cell-product__meta">{p.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="nowrap">
                        {p.salePrice != null ? (
                          <span className="price"><span className="price__sale">{SAR(p.salePrice)}</span><span className="price__old">{SAR(p.price)}</span></span>
                        ) : (
                          <span className="price">{SAR(p.price)}</span>
                        )}
                      </td>
                      <td className={p.stock === 0 ? '' : 'muted'} style={p.stock === 0 ? { color: 'var(--red-alert)', fontWeight: 600 } : undefined}>
                        {p.stock === 0 ? 'Out of stock' : p.stock}
                      </td>
                      <td>{p.tag && p.tag !== 'none' ? <Badge fg={tag.fg} bg={tag.bg}>{tag.label}</Badge> : <span className="muted">—</span>}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" title="Set discount" onClick={() => setDiscount(p)}><IconPercent size={17} /></button>
                          <button className="icon-btn" title="Edit" onClick={() => setEditing(p)}><IconEdit size={17} /></button>
                          <button className="icon-btn icon-btn--danger" title="Delete" onClick={() => setConfirm(p)}><IconTrash size={17} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}

      {discount && (
        <DiscountModal
          product={discount}
          onClose={() => setDiscount(null)}
          onSaved={() => { setDiscount(null); load(); }}
        />
      )}

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={onDelete}
        title="Delete product"
        message={confirm ? `Remove “${confirm.name}” from the store? This can't be undone.` : ''}
      />
    </>
  );
}

/* ----------------------------- Product form ----------------------------- */
function ProductForm({ product, onClose, onSaved }) {
  const toast = useToast();
  const isEdit = !!product;
  const [form, setForm] = useState(() => (product ? { ...blank(), ...product, salePrice: product.salePrice ?? '', images: product.images || [], colors: product.colors || [] } : blank()));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState({});

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggleSize = (s) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  // gallery
  const setImage = (i, v) => setForm((f) => ({ ...f, images: f.images.map((x, idx) => (idx === i ? v : x)) }));
  const addImage = () => setForm((f) => ({ ...f, images: [...f.images, ''] }));
  const removeImage = (i) => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }));

  // colors
  const setColor = (i, key, v) => setForm((f) => ({ ...f, colors: f.colors.map((c, idx) => (idx === i ? { ...c, [key]: v } : c)) }));
  const addColor = () => setForm((f) => ({ ...f, colors: [...f.colors, { name: '', hex: '#000000', imageUrl: '' }] }));
  const removeColor = (i) => setForm((f) => ({ ...f, colors: f.colors.filter((_, idx) => idx !== i) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (form.price === '' || Number(form.price) < 0) e.price = 'Enter a valid price';
    if (form.salePrice !== '' && Number(form.salePrice) >= Number(form.price)) e.salePrice = 'Sale must be lower than price';
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      price: num(form.price),
      salePrice: form.salePrice === '' ? null : num(form.salePrice),
      category: form.category.trim() || 'Abaya',
      description: form.description,
      stock: num(form.stock) ?? 0,
      sizes: form.sizes,
      tag: form.tag,
      imageUrl: form.imageUrl,
      imageUrl2: form.imageUrl2,
      images: form.images.filter((u) => u && u.trim()),
      colors: form.colors.filter((c) => c.name || c.imageUrl).map((c) => ({ name: c.name, hex: c.hex, imageUrl: c.imageUrl })),
    };
    try {
      if (isEdit) await api.put(`/products/${product._id}`, payload);
      else await api.post('/products', payload);
      toast.success(isEdit ? 'Product updated' : 'Product added');
      onSaved();
    } catch (e2) {
      toast.error(apiError(e2));
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={isEdit ? 'Edit product' : 'New product'}
      subtitle={isEdit ? product.name : 'Add an item to your store'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} loading={saving}>{isEdit ? 'Save changes' : 'Add product'}</Button>
        </>
      }
    >
      <div className="form-stack">
        <Field label="Name" placeholder="Classic Black Abaya" value={form.name} error={err.name} onChange={(e) => set('name', e.target.value)} />

        <div className="field-row">
          <Field label="Price (SAR)" type="number" min="0" value={form.price} error={err.price} onChange={(e) => set('price', e.target.value)} />
          <Field label="Sale price (optional)" type="number" min="0" placeholder="Leave empty for none" value={form.salePrice} error={err.salePrice} onChange={(e) => set('salePrice', e.target.value)} />
        </div>

        <div className="field-row">
          <Field label="Category" placeholder="Abaya" value={form.category} onChange={(e) => set('category', e.target.value)} />
          <Field label="Stock" type="number" min="0" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
        </div>

        <Select label="Tag" value={form.tag} options={TAG_OPTIONS} onChange={(e) => set('tag', e.target.value)} />

        <Field as="textarea" label="Description" placeholder="Fabric, fit, and styling notes…" value={form.description} onChange={(e) => set('description', e.target.value)} />

        <div className="field">
          <span className="field__label">Sizes</span>
          <Chips options={DEFAULT_SIZES} value={form.sizes} onToggle={toggleSize} />
        </div>

        <hr className="divider" />
        <div className="subhead">Images</div>
        <div className="field-row">
          <ImageField label="Main image" value={form.imageUrl} onChange={(v) => set('imageUrl', v)} />
          <ImageField label="Hover image (web)" value={form.imageUrl2} onChange={(v) => set('imageUrl2', v)} hint="Shown on hover in the web grid." />
        </div>

        <div className="field">
          <span className="field__label">Gallery</span>
          {form.images.length === 0 && <span className="field__hint">Extra photos shown on the product page.</span>}
          {form.images.map((url, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <input className="input" placeholder="https://…" value={url} onChange={(e) => setImage(i, e.target.value)} />
              <button className="icon-btn icon-btn--danger" onClick={() => removeImage(i)} title="Remove"><IconTrash size={16} /></button>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <Button variant="subtle" size="sm" icon={<IconPlus size={15} />} onClick={addImage}>Add gallery image</Button>
          </div>
        </div>

        <hr className="divider" />
        <div className="subhead">Colors</div>
        {form.colors.length === 0 && <span className="field__hint">Optional color variants with their own swatch and image.</span>}
        {form.colors.map((c, i) => (
          <div key={i} className="colorrow" style={{ marginTop: 6 }}>
            <input className="input" placeholder="Color name (e.g. Beige)" value={c.name} onChange={(e) => setColor(i, 'name', e.target.value)} />
            <div className="color-input">
              <input type="color" value={c.hex || '#000000'} onChange={(e) => setColor(i, 'hex', e.target.value)} />
              <span className="muted" style={{ fontSize: 12 }}>{c.hex}</span>
            </div>
            <input className="input" placeholder="Image URL" value={c.imageUrl} onChange={(e) => setColor(i, 'imageUrl', e.target.value)} />
            <button className="icon-btn icon-btn--danger" onClick={() => removeColor(i)} title="Remove"><IconTrash size={16} /></button>
          </div>
        ))}
        <div style={{ marginTop: 10 }}>
          <Button variant="subtle" size="sm" icon={<IconPlus size={15} />} onClick={addColor}>Add color</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ----------------------------- Discount modal ----------------------------- */
function DiscountModal({ product, onClose, onSaved }) {
  const toast = useToast();
  const [sale, setSale] = useState(product.salePrice ?? '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const save = async (clear = false) => {
    const value = clear ? null : (sale === '' ? null : Number(sale));
    if (!clear && value != null && value >= product.price) {
      setErr('Sale price must be lower than the original price.');
      return;
    }
    setSaving(true);
    try {
      await api.put(`/products/${product._id}`, { salePrice: value });
      toast.success(clear || value == null ? 'Discount removed' : 'Discount applied');
      onSaved();
    } catch (e) {
      toast.error(apiError(e));
      setSaving(false);
    }
  };

  const hasSale = product.salePrice != null;

  return (
    <Modal
      open
      onClose={onClose}
      title="Discount"
      subtitle={product.name}
      footer={
        <>
          {hasSale && <Button variant="ghost" onClick={() => save(true)} loading={saving}>Remove discount</Button>}
          <Button onClick={() => save(false)} loading={saving}>Apply</Button>
        </>
      }
    >
      <div className="form-stack">
        <p className="muted" style={{ fontSize: 13.5 }}>
          Original price: <strong style={{ color: 'var(--ink)' }}>{SAR(product.price)}</strong>
        </p>
        <Field
          label="Sale price (SAR)"
          type="number"
          min="0"
          placeholder="e.g. 199"
          value={sale}
          error={err}
          onChange={(e) => { setSale(e.target.value); setErr(''); }}
        />
        <span className="field__hint">This shows as a strikethrough on the original price across the app and web.</span>
      </div>
    </Modal>
  );
}
