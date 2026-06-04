import { NavLink } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/categories', label: 'Categories', icon: '📁' },
  { to: '/products', label: 'Products', icon: '☕' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/purchases', label: 'Sales', icon: '🛒' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">☕</span>
        <div>
          <h1>CaisseMaya</h1>
          <p>Café Management</p>
        </div>
      </div>
      <Nav className="flex-column sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </Nav>
    </aside>
  );
}
