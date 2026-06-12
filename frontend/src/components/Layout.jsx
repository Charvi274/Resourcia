import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Layout() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  }

  const navItems = user?.role === 'admin'
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: '▦' },
        { to: '/assets', label: 'Assets', icon: '◈' },
        { to: '/bookings', label: 'Bookings', icon: '◎' },
      ]
    : [
        { to: '/assets', label: 'Browse Assets', icon: '◈' },
        { to: '/my-bookings', label: 'My Bookings', icon: '◎' },
      ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{
        width: collapsed ? '56px' : '220px',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh'
      }}>
        <div style={{
          padding: '20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px'
        }}>
          {!collapsed && (
            <span style={{
              fontFamily: 'Space Grotesk',
              fontWeight: 700,
              fontSize: '17px',
              background: 'linear-gradient(135deg, var(--pink-primary), var(--pink-soft))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              whiteSpace: 'nowrap'
            }}>Resourcia</span>
          )}
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            padding: '5px 8px',
            lineHeight: 1,
            flexShrink: 0
          }}>
            {collapsed ? '>>' : '<<'}
          </button>
        </div>

        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 10px',
              marginBottom: '2px',
              color: isActive ? 'var(--pink-primary)' : 'var(--text-secondary)',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 400,
              borderRadius: '8px',
              background: isActive ? 'var(--pink-glow)' : 'transparent',
              border: isActive ? '1px solid rgba(232,68,154,0.2)' : '1px solid transparent',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              transition: 'all 0.15s'
            })}>
              <span style={{ fontSize: '14px', flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{
          padding: '12px 8px',
          borderTop: '1px solid var(--border)'
        }}>
          {!collapsed && (
            <div style={{
              padding: '10px',
              background: 'var(--bg-hover)',
              borderRadius: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{user?.name}</div>
              <div style={{ fontSize: '11px', color: 'var(--pink-soft)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{user?.role}</div>
            </div>
          )}
          <button onClick={logout} style={{
            width: '100%',
            padding: '9px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontSize: '12px',
            transition: 'all 0.15s'
          }}>
            {collapsed ? 'x' : 'Sign out'}
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg-primary)', minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
}