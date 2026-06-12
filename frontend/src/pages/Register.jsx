import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/register', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/assets');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'transparent',
    border: '1px solid var(--border-light)',
    borderRadius: '8px', color: 'var(--text-primary)',
    fontSize: '14px', outline: 'none', transition: 'border-color 0.2s'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '26px', color: 'var(--text-primary)', marginBottom: '6px' }}>Resourcia</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Asset management platform</p>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '36px'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '6px' }}>Create account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Join to start requesting assets</p>

          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'rgba(232,84,84,0.08)',
              border: '1px solid rgba(232,84,84,0.25)',
              borderRadius: '8px', color: 'var(--red)',
              fontSize: '13px', marginBottom: '20px'
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={inputStyle} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required style={inputStyle} placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required style={inputStyle} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '12px',
              background: 'var(--pink-primary)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              marginTop: '6px', opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 24px rgba(232,68,154,0.25)',
              transition: 'all 0.2s'
            }}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--pink-primary)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}