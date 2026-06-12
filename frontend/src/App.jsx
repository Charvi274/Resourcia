import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Assets from './pages/Assets.jsx';
import Bookings from './pages/Bookings.jsx';
import MyBookings from './pages/MyBookings.jsx';
import Layout from './components/Layout.jsx';

function PrivateRoute({ children, adminOnly }) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/assets" />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<PrivateRoute adminOnly><Dashboard /></PrivateRoute>} />
          <Route path="assets" element={<Assets />} />
          <Route path="bookings" element={<PrivateRoute adminOnly><Bookings /></PrivateRoute>} />
          <Route path="my-bookings" element={<MyBookings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}