const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors({
  origin: 'https://resourcia-indol.vercel.app',
  credentials: true
}));
app.use(express.json());

const authRoutes = require('./routes/auth');
const assetRoutes = require('./routes/assets');
const bookingRoutes = require('./routes/bookings');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});