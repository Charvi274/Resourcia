import { useState, useEffect } from 'react';
import api from '../api';

const statusColor = (s) => {
  if (s === 'approved') return 'var(--green)';
  if (s === 'pending') return 'var(--yellow)';
  if (s === 'rejected') return 'var(--red)';
  if (s === 'returned') return 'var(--blue)';
  return 'var(--text-muted)';
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [noteModal, setNoteModal] = useState(null);
  const [note, setNote] = useState('');

  useEffect(() => { fetchBookings(); }, []);

  async function fetchBookings() {
    const res = await api.get('/bookings');
    setBookings(res.data);
  }

  async function handleApprove(id) {
    await api.put(`/bookings/${id}/approve`, { note });
    setNoteModal(null);
    setNote('');
    fetchBookings();
  }

  async function handleReject(id) {
    await api.put(`/bookings/${id}/reject`, { note });
    setNoteModal(null);
    setNote('');
    fetchBookings();
  }

  async function handleReturn(id) {
    await api.put(`/bookings/${id}/return`);
    fetchBookings();
  }

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);
  const today = new Date().toISOString().split('T')[0];
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div style={{ padding: '32px', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <h1 style={{ fontSize: '22px' }}>Bookings</h1>
          {pendingCount > 0 && (
            <span style={{
              fontSize: '11px', fontWeight: 700,
              background: 'var(--yellow)', color: '#000',
              padding: '2px 8px', borderRadius: '20px'
            }}>{pendingCount} pending</span>
          )}
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Review and manage all booking requests</p>
      </div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'approved', 'rejected', 'returned'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding: '7px 16px',
            background: filter === s ? 'var(--pink-primary)' : 'var(--bg-card)',
            border: '1px solid',
            borderColor: filter === s ? 'var(--pink-primary)' : 'var(--border)',
            borderRadius: '20px',
            color: filter === s ? '#fff' : 'var(--text-secondary)',
            fontSize: '12px',
            fontWeight: filter === s ? 600 : 400,
            textTransform: 'capitalize'
          }}>{s}{s === 'pending' && pendingCount > 0 ? ` (${pendingCount})` : ''}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(booking => {
          const isOverdue = booking.status === 'approved' && booking.end_date < today;
          return (
            <div key={booking.id} style={{
              background: 'var(--bg-card)',
              border: `1px solid ${isOverdue ? 'rgba(232,84,84,0.35)' : 'var(--border)'}`,
              borderRadius: '12px', padding: '20px',
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr 1fr auto',
              gap: '20px', alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{booking.asset_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--pink-soft)', background: 'var(--pink-glow)', display: 'inline-block', padding: '2px 8px', borderRadius: '20px', marginBottom: '4px' }}>{booking.category}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>qty: {booking.quantity}</div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>{booking.user_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '2px' }}>{booking.user_email}</div>
                {booking.purpose && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{booking.purpose}</div>}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  {booking.start_date} - {booking.end_date}
                </div>
                {isOverdue && (
                  <div style={{ fontSize: '11px', color: 'var(--red)', fontWeight: 700, marginBottom: '4px' }}>OVERDUE</div>
                )}
                {booking.admin_note && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>"{booking.admin_note}"</div>
                )}
                <span style={{
                  fontSize: '11px', color: statusColor(booking.status),
                  background: `${statusColor(booking.status)}15`,
                  padding: '3px 9px', borderRadius: '20px',
                  border: `1px solid ${statusColor(booking.status)}35`,
                  textTransform: 'capitalize', fontWeight: 600
                }}>{booking.status}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '120px' }}>
                {booking.status === 'pending' && (
                  <>
                    <button onClick={() => { setNoteModal({ id: booking.id, action: 'approve' }); setNote(''); }} style={{
                      padding: '8px 14px',
                      background: 'rgba(76,175,130,0.12)',
                      border: '1px solid rgba(76,175,130,0.35)',
                      borderRadius: '7px', color: 'var(--green)',
                      fontSize: '12px', fontWeight: 600
                    }}>Approve</button>
                    <button onClick={() => { setNoteModal({ id: booking.id, action: 'reject' }); setNote(''); }} style={{
                      padding: '8px 14px',
                      background: 'rgba(232,84,84,0.08)',
                      border: '1px solid rgba(232,84,84,0.25)',
                      borderRadius: '7px', color: 'var(--red)',
                      fontSize: '12px'
                    }}>Reject</button>
                  </>
                )}
                {booking.status === 'approved' && (
                  <button onClick={() => handleReturn(booking.id)} style={{
                    padding: '8px 14px',
                    background: 'rgba(91,141,238,0.1)',
                    border: '1px solid rgba(91,141,238,0.3)',
                    borderRadius: '7px', color: 'var(--blue)',
                    fontSize: '12px'
                  }}>Mark returned</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>◎</div>
          <div style={{ fontSize: '14px' }}>No bookings found</div>
        </div>
      )}

      {noteModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border-light)',
            borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px',
            boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '17px', marginBottom: '6px', textTransform: 'capitalize' }}>{noteModal.action} booking</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Optionally add a note for the user.</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note..."
              style={{
                width: '100%', padding: '10px 14px',
                background: 'transparent',
                border: '1px solid var(--border-light)',
                borderRadius: '8px', color: 'var(--text-primary)',
                fontSize: '14px', outline: 'none',
                resize: 'vertical', marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => noteModal.action === 'approve' ? handleApprove(noteModal.id) : handleReject(noteModal.id)} style={{
                flex: 1, padding: '10px',
                background: noteModal.action === 'approve' ? 'var(--green)' : 'var(--red)',
                border: 'none', borderRadius: '8px',
                color: '#fff', fontSize: '14px', fontWeight: 600
              }}>
                Confirm
              </button>
              <button onClick={() => { setNoteModal(null); setNote(''); }} style={{
                flex: 1, padding: '10px',
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '14px'
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}