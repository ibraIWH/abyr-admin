import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconClose,
  IconCollections,
  IconDashboard,
  IconHome,
  IconLogout, IconMenu,
  IconOffers,
  IconOrders,
  IconProducts,
} from './Icons';

const NAV = [
  { to: '/', label: 'Dashboard', Icon: IconDashboard, end: true },
  { to: '/products', label: 'Products', Icon: IconProducts },
  { to: '/categories', label: 'Categories', Icon: IconCollections },
  { to: '/offers', label: 'Offers', Icon: IconOffers },
  { to: '/home', label: 'Home & Banner', Icon: IconHome },
  { to: '/orders', label: 'Orders', Icon: IconOrders },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="app">
      {/* Mobile top bar */}
      <header className="mobilebar">
        <button className="icon-btn icon-btn--light" onClick={() => setOpen(true)} aria-label="Open menu">
          <IconMenu size={22} />
        </button>
        <span className="mobilebar__brand">abyr</span>
        <span style={{ width: 38 }} />
      </header>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <div className="brand">
            <span className="brand__mark">abyr</span>
            <span className="brand__sub">LINE · ADMIN</span>
          </div>
          <button className="icon-btn icon-btn--light sidebar__close" onClick={() => setOpen(false)} aria-label="Close menu">
            <IconClose size={20} />
          </button>
        </div>

        <nav className="nav">
          {NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `nav__item ${isActive ? 'nav__item--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="who">
            <div className="who__avatar">{(user?.name || 'A').charAt(0).toUpperCase()}</div>
            <div className="who__meta">
              <span className="who__name">{user?.name || 'Admin'}</span>
              <span className="who__email">{user?.email}</span>
            </div>
          </div>
          <button className="logout" onClick={logout}>
            <IconLogout size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// Page-level header used at the top of each screen.
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="pagehead">
      <div>
        <h1 className="pagehead__title">{title}</h1>
        {subtitle && <p className="pagehead__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="pagehead__actions">{actions}</div>}
    </div>
  );
}
