import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/services';
import cafeBg from '../assets/pretty-cafes-cover.webp';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.login(form);
      if (res.data.success) {
        localStorage.setItem('cm_user', JSON.stringify({ username: res.data.username, role: res.data.role }));
        navigate('/');
      } else {
        setError(res.data.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: `url(${cafeBg})` }}>
      {/* Dark overlay */}
      <div className="login-overlay" />

      <div className="login-container">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">☕</div>
          <h1 className="login-title">CaisseMaya</h1>
          <p className="login-subtitle">Café & Snacks Management</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <h2 className="login-card-title">Welcome back</h2>
          <p className="login-card-sub">Sign in to your account to continue</p>

          {error && (
            <div className="login-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="username">Username</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">👤</span>
                <input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon">🔒</span>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-spinner" /> Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="login-footer-hint">Default credentials: <strong>admin / admin</strong></p>
        </div>
      </div>
    </div>
  );
}
