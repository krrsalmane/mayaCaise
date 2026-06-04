import { NavLink, useNavigate } from 'react-router-dom';
import { Nav } from 'react-bootstrap';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/categories', label: 'Categories', icon: '📁' },
  { to: '/products', label: 'Products', icon: '☕' },
  { to: '/clients', label: 'Clients', icon: '👥' },
  { to: '/purchases', label: 'Sales', icon: '🛒' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('cm_user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('cm_user');
    navigate('/login');
  };

  return (
    <aside className="sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
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

      <div className="sidebar-footer">
        {user.username && (
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem', padding: '0 1rem', marginBottom: '0.5rem' }}>
            Logged in as <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{user.username}</strong>
          </p>
        )}
        <button className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}
