import { useEffect, useMemo, useState } from 'react';
import api, { apiError } from '../api';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/Layout';
import { Modal } from '../components/Modal';
import { Badge, Loading, EmptyState } from '../components/ui';
import { IconOrders, IconEye, IconImage } from '../components/Icons';
import { STATUS_META, STATUS_OPTIONS, SAR } from '../theme';

export default function OrdersPage() {
  const toast = useToast();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null); // order in detail modal

  const load = () =>
    api.get('/orders/admin/all')
      .then((res) => setOrders(res.data))
      .catch((err) => setError(apiError(err)));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return filter === 'all' ? orders : orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const updateStatus = async (order, status) => {
    try {
      await api.put(`/orders/${order._id}/status`, { status });
      setOrders((list) => list.map((o) => (o._id === order._id ? { ...o, status } : o)));
      setActive((a) => (a && a._id === order._id ? { ...a, status } : a));
      toast.success(`Marked ${STATUS_META[status].label.toLowerCase()}`);
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  return (
    <>
      <PageHeader title="Orders" subtitle="Track and update customer orders." />

      <div className="toolbar">
        <div className="select-wrap" style={{ minWidth: 180 }}>
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All statuses</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          <span className="select-caret" />
        </div>
        {orders && <span className="muted nowrap">{filtered.length} order{filtered.length === 1 ? '' : 's'}</span>}
      </div>

      <div className="card">
        {error ? (
          <div className="card__pad muted">{error}</div>
        ) : !orders ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconOrders size={34} />}
            title={filter === 'all' ? 'No orders yet' : 'No orders with this status'}
            message={filter === 'all' ? 'Orders placed on the app or web will appear here.' : 'Try a different status filter.'}
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th style={{ textAlign: 'right' }}>View</th></tr>
              </thead>
              <tbody>
                {filtered.map((o) => {
                  const count = o.items?.reduce((n, it) => n + (it.quantity ?? it.qty ?? 1), 0) || 0;
                  return (
                    <tr key={o._id}>
                      <td className="nowrap" style={{ fontWeight: 500 }}>{o.orderNumber}</td>
                      <td>{o.user?.name || '—'}<div className="cell-product__meta">{o.user?.email}</div></td>
                      <td className="muted nowrap">{count} item{count === 1 ? '' : 's'}</td>
                      <td className="nowrap" style={{ fontWeight: 500 }}>{SAR(o.total)}</td>
                      <td>
                        <div className="select-wrap" style={{ minWidth: 140 }} onClick={(e) => e.stopPropagation()}>
                          <select className="input" value={o.status} onChange={(e) => updateStatus(o, e.target.value)} style={{ padding: '7px 30px 7px 10px', fontSize: 12.5 }}>
                            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
                          </select>
                          <span className="select-caret" />
                        </div>
                      </td>
                      <td className="nowrap muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-btn" title="View order" onClick={() => setActive(o)}><IconEye size={18} /></button>
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

      {active && (
        <OrderDetail order={active} onClose={() => setActive(null)} onStatus={(s) => updateStatus(active, s)} />
      )}
    </>
  );
}

function OrderDetail({ order, onClose, onStatus }) {
  const st = STATUS_META[order.status] || STATUS_META.placed;
  const subtotal = order.subtotal ?? order.items?.reduce((sum, it) => sum + (it.price ?? it.product?.price ?? 0) * (it.quantity ?? it.qty ?? 1), 0);
  const delivery = order.deliveryFee ?? order.shippingFee ?? order.shipping ?? 0;
  const addr = order.shippingAddress || order.address;

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title={`Order ${order.orderNumber}`}
      subtitle={new Date(order.createdAt).toLocaleString()}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Badge fg={st.fg} bg={st.bg}>{st.label}</Badge>
        <div className="select-wrap" style={{ minWidth: 180 }}>
          <select className="input" value={order.status} onChange={(e) => onStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
          </select>
          <span className="select-caret" />
        </div>
      </div>

      {/* Customer + address */}
      <div className="subhead">Customer</div>
      <div style={{ marginBottom: 6 }}>{order.user?.name || '—'}</div>
      <div className="muted" style={{ fontSize: 13 }}>{order.user?.email}</div>
      {addr && (
        <div style={{ marginTop: 12, fontSize: 13.5, color: '#44403b', lineHeight: 1.6 }}>
          {typeof addr === 'string'
            ? addr
            : [addr.name, addr.phone, addr.line1 || addr.address || addr.street, addr.city, addr.region || addr.state, addr.country, addr.postalCode || addr.zip]
                .filter(Boolean)
                .map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}

      <hr className="divider" style={{ margin: '20px 0' }} />

      {/* Items */}
      <div className="subhead">Items</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {order.items?.map((it, i) => {
          const name = it.name || it.product?.name || 'Item';
          const img = it.imageUrl || it.product?.imageUrl;
          const qty = it.quantity ?? it.qty ?? 1;
          const price = it.price ?? it.product?.price ?? 0;
          const variant = [it.size, it.color?.name || it.color].filter(Boolean).join(' · ');
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              {img ? <img className="thumb" src={img} alt="" /> : <span className="thumb thumb--placeholder"><IconImage size={18} /></span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500 }}>{name}</div>
                <div className="cell-product__meta">{variant ? `${variant} · ` : ''}Qty {qty}</div>
              </div>
              <div className="nowrap" style={{ fontWeight: 500 }}>{SAR(price * qty)}</div>
            </div>
          );
        })}
      </div>

      <hr className="divider" style={{ margin: '20px 0' }} />

      {/* Totals */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, maxWidth: 280, marginLeft: 'auto' }}>
        <Row label="Subtotal" value={SAR(subtotal)} />
        <Row label="Delivery" value={delivery ? SAR(delivery) : 'Free'} />
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
          <span>Total</span><span>{SAR(order.total)}</span>
        </div>
      </div>
    </Modal>
  );
}

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
    <span className="muted">{label}</span><span>{value}</span>
  </div>
);
