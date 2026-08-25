import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { apiError } from '../api';
import { IconOrders } from '../components/Icons';
import { PageHeader } from '../components/Layout';
import { Badge, EmptyState, Loading } from '../components/ui';
import { SAR, STATUS_META } from '../theme';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/products'),
      api.get('/collections?all=true'),
      api.get('/offers?all=true'),
      api.get('/orders/admin/all'),
    ])
      .then(([p, c, o, ord]) => {
        setData({
          products: p.data.length,
          collections: c.data.length,
          offers: o.data.length,
          orders: ord.data,
        });
      })
      .catch((err) => setError(apiError(err)));
  }, []);

  if (error) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <div className="card card__pad"><p className="muted">{error}</p></div>
      </>
    );
  }
  if (!data) return (<><PageHeader title="Dashboard" /><Loading /></>);

  const open = data.orders.filter((o) => o.status === 'placed').length;
  const recent = data.orders.slice(0, 6);

  const stats = [
    { label: 'Products', value: data.products, to: '/products' },
    { label: 'Categories', value: data.collections, to: '/categories' },
    { label: 'Offers', value: data.offers, to: '/offers' },
    { label: 'Orders', value: data.orders.length, foot: open ? `${open} awaiting confirmation` : 'All caught up', to: '/orders' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="A quick look at your store today." />

      <div className="grid-cards" style={{ marginBottom: 24 }}>
        {stats.map((s) => (
          <Link to={s.to} key={s.label} className="card stat">
            <div className="stat__label">{s.label}</div>
            <div className="stat__value">{s.value}</div>
            {s.foot && <div className="stat__foot">{s.foot}</div>}
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="card__head">
          <div>
            <div className="card__title">Recent orders</div>
          </div>
          <Link to="/orders" className="btn btn--subtle btn--sm">View all</Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={<IconOrders size={34} />}
            title="No orders yet"
            message="When customers check out on the app or web, their orders show up here."
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((o) => {
                  const st = STATUS_META[o.status] || STATUS_META.placed;
                  return (
                    <tr key={o._id}>
                      <td className="nowrap" style={{ fontWeight: 500 }}>{o.orderNumber}</td>
                      <td>{o.user?.name || '—'}<div className="cell-product__meta">{o.user?.email}</div></td>
                      <td className="nowrap">{SAR(o.total)}</td>
                      <td><Badge fg={st.fg} bg={st.bg}>{st.label}</Badge></td>
                      <td className="nowrap muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
