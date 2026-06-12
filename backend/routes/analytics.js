const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, adminOnly, (req, res) => {
  const totalAssets = db.prepare('SELECT COUNT(*) as count FROM assets').get().count;
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('user').count;
  const activeBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('approved').count;
  const pendingBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('pending').count;

  const today = new Date().toISOString().split('T')[0];
  const overdueBookings = db.prepare(
    'SELECT COUNT(*) as count FROM bookings WHERE status = ? AND end_date < ?'
  ).get('approved', today).count;

  const topAssets = db.prepare(`
    SELECT a.name, a.category, COUNT(b.id) as booking_count
    FROM assets a
    LEFT JOIN bookings b ON a.id = b.asset_id
    GROUP BY a.id
    ORDER BY booking_count DESC
    LIMIT 5
  `).all();

  const categoryBreakdown = db.prepare(`
    SELECT category, COUNT(*) as count, SUM(quantity_total) as total_qty
    FROM assets
    GROUP BY category
  `).all();

  const recentBookings = db.prepare(`
    SELECT b.*, a.name as asset_name, u.name as user_name
    FROM bookings b
    JOIN assets a ON b.asset_id = a.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
    LIMIT 8
  `).all();

  const bookingsByStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM bookings GROUP BY status
  `).all();

  res.json({
    summary: { totalAssets, totalUsers, activeBookings, pendingBookings, overdueBookings },
    topAssets,
    categoryBreakdown,
    recentBookings,
    bookingsByStatus
  });
});

module.exports = router;