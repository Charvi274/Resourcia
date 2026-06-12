import { useState, useEffect } from 'react';
import api from '../api';

const statusColor = (s) => {
  if (s === 'approved') return 'var(--green)';
  if (s === 'pending') return 'var(--yellow)';
  if (s === 'rejected') return 'var(--red)';
  if (s === 'returned') return 'var(--blue)';
  return 'var(--text-muted)';
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const res = await api.get('/bookings/mine');
    setBookings(res.data);
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '4px' }}>My Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Track your asset requests and history</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {['all', 'pending', 'approved', 'rejected', 'returned'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px',
            background: filter === s ? 'var(--pink-primary)' : 'var(--bg-card)',
            border: '1px solid',
            borderColor: filter === s ? 'var(--pink-primary)' : 'var(--border)',
            borderRadius: '20px',
            color: filter === s ? '#fff' : 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: filter === s ? 600 : 400,
            textTransform: 'capitalize'
          }}>{s}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(booking => {
          const isOverdue = booking.status === 'approved' && booking.end_date < today;
          return (
            <div key={booking.id} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${isOverdue ? 'rgba(232,84,84,0.4)' : 'var(--border)'}`,
              borderRadius: '12px',
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr auto',
              gap: '16px',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>{booking.asset_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{booking.category}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>qty: {booking.quantity}</div>
                {booking.purpose && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{booking.purpose}</div>}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  {booking.start_date} - {booking.end_date}
                </div>
                {isOverdue && (
                  <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 600, marginBottom: '4px' }}>OVERDUE - please return</div>
                )}
                {booking.admin_note && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Admin note: {booking.admin_note}</div>
                )}
                {booking.returned_at && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Returned: {booking.returned_at.split('T')[0]}</div>
                )}
              </div>
              <div style={{
                fontSize: '12px',
                color: statusColor(booking.status),
                background: `${statusColor(booking.status)}18`,
                padding: '4px 12px',
                borderRadius: '20px',
                border: `1px solid ${statusColor(booking.status)}40`,
                textTransform: 'capitalize',
                fontWeight: 600,
                whiteSpace: 'nowrap'
              }}>
                {booking.status}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          {filter === 'all' ? 'No bookings yet. Browse assets to make a request.' : `No ${filter} bookings.`}
        </div>
      )}
    </div>
  );
}