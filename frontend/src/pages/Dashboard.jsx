import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import api from '../api';

const COLORS = ['#e8449a', '#f06292', '#c2185b', '#f48fb1', '#ad1457'];

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '20px 24px',
      borderTop: `2px solid ${color || 'var(--border)'}`
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontSize: '30px', fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{value}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/analytics').then(res => setData(res.data));
  }, []);

  if (!data) return (
    <div style={{ padding: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>Loading...</div>
  );

  const { summary, topAssets, categoryBreakdown, recentBookings, bookingsByStatus } = data;

  const statusColor = (s) => {
    if (s === 'approved') return 'var(--green)';
    if (s === 'pending') return 'var(--yellow)';
    if (s === 'rejected') return 'var(--red)';
    if (s === 'returned') return 'var(--blue)';
    return 'var(--text-muted)';
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>System overview and analytics</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '14px', marginBottom: '28px' }}>
        <StatCard label="Total assets" value={summary.totalAssets} color="var(--pink-primary)" />
        <StatCard label="Total users" value={summary.totalUsers} color="var(--blue)" />
        <StatCard label="Active" value={summary.activeBookings} color="var(--green)" sub="bookings out" />
        <StatCard label="Pending" value={summary.pendingBookings} color="var(--yellow)" sub="need review" />
        <StatCard label="Overdue" value={summary.overdueBookings} color="var(--red)" sub="past due date" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Top assets by bookings</h3>
          {topAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topAssets} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(232,68,154,0.06)' }}
                />
                <Bar dataKey="booking_count" fill="var(--pink-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bookings by status</h3>
          {bookingsByStatus.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={bookingsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                  {bookingsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
            {bookingsByStatus.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                {item.status}: {item.count}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <h3 style={{ fontSize: '14px', marginBottom: '20px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recent bookings</h3>
        {recentBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '13px' }}>No bookings yet</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Asset', 'User', 'Dates', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px', fontSize: '13px', fontWeight: 500 }}>{b.asset_name}</td>
                  <td style={{ padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>{b.user_name}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>{b.start_date} - {b.end_date}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      fontSize: '11px', color: statusColor(b.status),
                      background: `${statusColor(b.status)}15`,
                      padding: '3px 10px', borderRadius: '20px',
                      border: `1px solid ${statusColor(b.status)}35`,
                      textTransform: 'capitalize', fontWeight: 600
                    }}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}