const router = require('express').Router();
const db = require('../db');
const { auth, adminOnly } = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const assets = db.prepare('SELECT * FROM assets ORDER BY created_at DESC').all();
  res.json(assets);
});

router.get('/:id', auth, (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json(asset);
});

router.post('/', auth, adminOnly, (req, res) => {
  const { name, category, description, quantity_total } = req.body;
  if (!name || !category || !quantity_total) return res.status(400).json({ error: 'Name, category and quantity required' });
  const result = db.prepare(
    'INSERT INTO assets (name, category, description, quantity_total, quantity_available) VALUES (?, ?, ?, ?, ?)'
  ).run(name, category, description || '', quantity_total, quantity_total);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'CREATE_ASSET', 'asset', result.lastInsertRowid, `Created asset: ${name}`
  );
  res.json({ id: result.lastInsertRowid, message: 'Asset created' });
});

router.put('/:id', auth, adminOnly, (req, res) => {
  const { name, category, description, quantity_total, status } = req.body;
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  const diff = quantity_total - asset.quantity_total;
  const new_available = Math.max(0, asset.quantity_available + diff);
  db.prepare(
    'UPDATE assets SET name=?, category=?, description=?, quantity_total=?, quantity_available=?, status=? WHERE id=?'
  ).run(name, category, description, quantity_total, new_available, status, req.params.id);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'UPDATE_ASSET', 'asset', req.params.id, `Updated asset: ${name}`
  );
  res.json({ message: 'Asset updated' });
});

router.delete('/:id', auth, adminOnly, (req, res) => {
  const asset = db.prepare('SELECT * FROM assets WHERE id = ?').get(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  db.prepare('DELETE FROM assets WHERE id = ?').run(req.params.id);
  db.prepare('INSERT INTO audit_logs (user_id, action, entity, entity_id, detail) VALUES (?, ?, ?, ?, ?)').run(
    req.user.id, 'DELETE_ASSET', 'asset', req.params.id, `Deleted asset: ${asset.name}`
  );
  res.json({ message: 'Asset deleted' });
});

module.exports = router;