import { useState, useEffect } from 'react';
import api from '../api';

const CATEGORIES = ['Camera', 'Lighting', 'Audio', 'Costume', 'Props', 'Recording', 'Infrastructure', 'Other'];

const inputStyle = {
  width: '100%', padding: '11px 14px',
  background: 'transparent',
  border: '1px solid var(--border-light)',
  borderRadius: '8px', color: 'var(--text-primary)',
  fontSize: '14px', outline: 'none'
};

const labelStyle = {
  display: 'block', fontSize: '12px', fontWeight: 500,
  color: 'var(--text-secondary)', marginBottom: '7px',
  textTransform: 'uppercase', letterSpacing: '0.06em'
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-light)',
        borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '480px',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '17px' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'var(--bg-hover)', border: '1px solid var(--border)',
            borderRadius: '6px', color: 'var(--text-secondary)',
            fontSize: '13px', padding: '4px 10px'
          }}>close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Assets() {
  const [assets, setAssets] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editAsset, setEditAsset] = useState(null);
  const [bookAsset, setBookAsset] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', quantity_total: 1, status: 'available' });
  const [bookForm, setBookForm] = useState({ quantity: 1, purpose: '', start_date: '', end_date: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => { fetchAssets(); }, []);

  useEffect(() => {
    let result = assets;
    if (search) result = result.filter(a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
    );
    if (categoryFilter) result = result.filter(a => a.category === categoryFilter);
    setFiltered(result);
  }, [search, categoryFilter, assets]);

  async function fetchAssets() {
    const res = await api.get('/assets');
    setAssets(res.data);
  }

  async function handleSave() {
    setError('');
    try {
      if (editAsset) {
        await api.put(`/assets/${editAsset.id}`, { ...form, quantity_total: Number(form.quantity_total) });
      } else {
        await api.post('/assets', { ...form, quantity_total: Number(form.quantity_total) });
      }
      setShowAdd(false);
      setEditAsset(null);
      setForm({ name: '', category: '', description: '', quantity_total: 1, status: 'available' });
      fetchAssets();
      setSuccess(editAsset ? 'Asset updated successfully' : 'Asset added successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this asset?')) return;
    await api.delete(`/assets/${id}`);
    fetchAssets();
  }

  async function handleBook() {
    setError('');
    try {
      await api.post('/bookings', { ...bookForm, asset_id: bookAsset.id, quantity: Number(bookForm.quantity) });
      setBookAsset(null);
      setBookForm({ quantity: 1, purpose: '', start_date: '', end_date: '' });
      setSuccess('Booking request submitted');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    }
  }

  function openEdit(asset) {
    setEditAsset(asset);
    setForm({ name: asset.name, category: asset.category, description: asset.description, quantity_total: asset.quantity_total, status: asset.status });
    setShowAdd(true);
    setError('');
  }

  const statusColor = (s) => s === 'available' ? 'var(--green)' : s === 'maintenance' ? 'var(--yellow)' : 'var(--red)';

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Assets</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''} in inventory
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => {
            setEditAsset(null);
            setForm({ name: '', category: '', description: '', quantity_total: 1, status: 'available' });
            setShowAdd(true);
            setError('');
          }} style={{
            padding: '10px 20px',
            background: 'var(--pink-primary)',
            border: 'none', borderRadius: '8px',
            color: '#fff', fontSize: '13px', fontWeight: 600,
            boxShadow: '0 4px 20px rgba(232,68,154,0.3)'
          }}>
            + Add asset
          </button>
        )}
      </div>

      {success && (
        <div style={{
          padding: '10px 16px',
          background: 'rgba(76,175,130,0.08)',
          border: '1px solid rgba(76,175,130,0.25)',
          borderRadius: '8px', color: 'var(--green)',
          fontSize: '13px', marginBottom: '20px'
        }}>{success}</div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '260px' }}
        />
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ ...inputStyle, maxWidth: '180px' }}>
          <option value="">All categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {(search || categoryFilter) && (
          <button onClick={() => { setSearch(''); setCategoryFilter(''); }} style={{
            padding: '10px 14px', background: 'transparent',
            border: '1px solid var(--border)', borderRadius: '8px',
            color: 'var(--text-secondary)', fontSize: '13px'
          }}>Clear</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '16px' }}>
        {filtered.map(asset => (
          <div key={asset.id} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px', padding: '20px',
            display: 'flex', flexDirection: 'column',
            transition: 'border-color 0.15s, transform 0.15s'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>{asset.name}</div>
                <span style={{
                  fontSize: '11px', color: 'var(--pink-soft)',
                  background: 'var(--pink-glow)',
                  padding: '3px 9px', borderRadius: '20px',
                  border: '1px solid rgba(232,68,154,0.2)'
                }}>{asset.category}</span>
              </div>
              <span style={{
                fontSize: '11px', color: statusColor(asset.status),
                background: `${statusColor(asset.status)}14`,
                padding: '3px 9px', borderRadius: '20px',
                border: `1px solid ${statusColor(asset.status)}30`,
                flexShrink: 0, marginLeft: '8px'
              }}>{asset.status}</span>
            </div>

            {asset.description && (
              <p style={{
                fontSize: '13px', color: 'var(--text-secondary)',
                marginBottom: '14px', lineHeight: 1.6,
                flex: 1
              }}>{asset.description}</p>
            )}

            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: '16px',
              padding: '10px 12px',
              background: 'var(--bg-primary)',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Available</span>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>
                <span style={{ color: asset.quantity_available > 0 ? 'var(--green)' : 'var(--red)' }}>
                  {asset.quantity_available}
                </span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> / {asset.quantity_total}</span>
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {user?.role === 'admin' ? (
                <>
                  <button onClick={() => openEdit(asset)} style={{
                    flex: 1, padding: '9px',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    borderRadius: '7px', color: 'var(--text-primary)', fontSize: '13px'
                  }}>Edit</button>
                  <button onClick={() => handleDelete(asset.id)} style={{
                    flex: 1, padding: '9px',
                    background: 'rgba(232,84,84,0.08)',
                    border: '1px solid rgba(232,84,84,0.25)',
                    borderRadius: '7px', color: 'var(--red)', fontSize: '13px'
                  }}>Delete</button>
                </>
              ) : (
                <button
                  onClick={() => { setBookAsset(asset); setError(''); }}
                  disabled={asset.quantity_available === 0}
                  style={{
                    flex: 1, padding: '9px',
                    background: asset.quantity_available > 0 ? 'var(--pink-primary)' : 'var(--bg-hover)',
                    border: 'none', borderRadius: '7px',
                    color: asset.quantity_available > 0 ? '#fff' : 'var(--text-muted)',
                    fontSize: '13px', fontWeight: 600,
                    boxShadow: asset.quantity_available > 0 ? '0 4px 16px rgba(232,68,154,0.25)' : 'none'
                  }}
                >
                  {asset.quantity_available > 0 ? 'Request booking' : 'Unavailable'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 40px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', opacity: 0.3 }}>◈</div>
          <div style={{ fontSize: '14px' }}>No assets found</div>
        </div>
      )}

      {showAdd && (
        <Modal title={editAsset ? 'Edit asset' : 'Add new asset'} onClose={() => { setShowAdd(false); setEditAsset(null); setError(''); }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(232,84,84,0.08)', border: '1px solid rgba(232,84,84,0.25)', borderRadius: '8px', color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Asset name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="e.g. Canon EOS 5D" />
            </div>
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief description..." />
            </div>
            <div>
              <label style={labelStyle}>Total quantity</label>
              <input type="number" min={1} value={form.quantity_total} onChange={e => setForm({ ...form, quantity_total: e.target.value })} style={inputStyle} />
            </div>
            {editAsset && (
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle}>
                  <option value="available">Available</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="retired">Retired</option>
                </select>
              </div>
            )}
            <button onClick={handleSave} style={{
              padding: '11px', background: 'var(--pink-primary)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              marginTop: '4px', boxShadow: '0 4px 20px rgba(232,68,154,0.3)'
            }}>
              {editAsset ? 'Save changes' : 'Add asset'}
            </button>
          </div>
        </Modal>
      )}

      {bookAsset && (
        <Modal title={`Request - ${bookAsset.name}`} onClose={() => { setBookAsset(null); setError(''); }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(232,84,84,0.08)', border: '1px solid rgba(232,84,84,0.25)', borderRadius: '8px', color: 'var(--red)', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Quantity (max {bookAsset.quantity_available})</label>
              <input type="number" min={1} max={bookAsset.quantity_available} value={bookForm.quantity} onChange={e => setBookForm({ ...bookForm, quantity: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Purpose</label>
              <input value={bookForm.purpose} onChange={e => setBookForm({ ...bookForm, purpose: e.target.value })} style={inputStyle} placeholder="What is this for?" />
            </div>
            <div>
              <label style={labelStyle}>Start date</label>
              <input type="date" value={bookForm.start_date} onChange={e => setBookForm({ ...bookForm, start_date: e.target.value })} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>End date</label>
              <input type="date" value={bookForm.end_date} onChange={e => setBookForm({ ...bookForm, end_date: e.target.value })} style={inputStyle} />
            </div>
            <button onClick={handleBook} style={{
              padding: '11px', background: 'var(--pink-primary)',
              border: 'none', borderRadius: '8px',
              color: '#fff', fontSize: '14px', fontWeight: 600,
              marginTop: '4px', boxShadow: '0 4px 20px rgba(232,68,154,0.3)'
            }}>
              Submit request
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}