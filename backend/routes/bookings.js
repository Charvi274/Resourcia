const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/mine', auth, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, a.name as asset_name, a.category, u.name as user_name
    FROM bookings b
    JOIN assets a ON b.asset_id = a.id
    JOIN users u ON b.user_id = u.id
    WHERE b.user_id = ?
    ORDER BY b.created_at DESC
  `).all(req.user.id);
  res.json(bookings);
});

router.get('/', auth, adminOnly, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, a.name as asset_name, a.category, u.name as user_name, u.email as user_email
    FROM bookings b
    JOIN assets a ON b.asset_id = a.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `).all();
  res.json(bookings);
});

router.post('/', auth, (req, res) => {
  const { asset_id, quantity, purpose, start_date, end_date } = req.body;
  if (!asset_id || !quantity || !start_date || !end_date) return res.status(400).json({ error: 'All fields required' });
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(asset_id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  if (asset.quantity_available < quantity) return res.status(400).json({ error: 'Not enough quantity available' });
  const result = db.prepare(
    'INSERT INTO bookings (user_id, asset_id, quantity, purpose, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(req.user.id, asset_id, quantity, purpose || '', start_date, end_date);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'CREATE_BOOKING', 'booking', result.lastInsertRowid, `Booking request for asset: ${asset.name}`
  );
  res.json({ id: result.lastInsertRowid, message: 'Booking request submitted' });
});

router.put('/:id/approve', auth, adminOnly, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ error: 'Booking is not pending' });
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(booking.asset_id);
  if (asset.quantity_available < booking.quantity) return res.status(400).json({ error: 'Not enough quantity' });
  db.prepare('UPDATE bookings SET status=?, issued_at=CURRENT_TIMESTAMP, admin_note=? WHERE id=?').run('approved', req.body.note || '', req.params.id);
  db.prepare('UPDATE assets SET quantity_available = quantity_available - ? WHERE id = ?').run(booking.quantity, booking.asset_id);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'APPROVE_BOOKING', 'booking', booking.id, `Approved booking #${booking.id}`
  );
  res.json({ message: 'Booking approved' });
});

router.put('/:id/reject', auth, adminOnly, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'pending') return res.status(400).json({ error: 'Booking is not pending' });
  db.prepare('UPDATE bookings SET status=?, admin_note=? WHERE id=?').run('rejected', req.body.note || '', req.params.id);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'REJECT_BOOKING', 'booking', booking.id, `Rejected booking #${booking.id}`
  );
  res.json({ message: 'Booking rejected' });
});

router.put('/:id/return', auth, adminOnly, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  if (booking.status !== 'approved') return res.status(400).json({ error: 'Booking is not approved' });
  db.prepare('UPDATE bookings SET status=?, returned_at=CURRENT_TIMESTAMP WHERE id=?').run('returned', req.params.id);
  db.prepare('UPDATE assets SET quantity_available = quantity_available + ? WHERE id = ?').run(booking.quantity, booking.asset_id);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'RETURN_ASSET', 'booking', booking.id, `Asset returned for booking #${booking.id}`
  );
  res.json({ message: 'Asset returned' });
});

module.exports = router;