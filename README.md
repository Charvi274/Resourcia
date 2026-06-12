# Resourcia — Asset & Resource Allocation Platform

Resourcia is a full-stack, responsive asset management and resource allocation platform built for collaborative environments like media departments, hackathons, and labs. It replaces disorganized spreadsheets with a real-time inventory catalog, an automated request-and-approval flow, and dynamic analytics.

**Live Demo:** [resourcia-indol.vercel.app](https://resourcia-indol.vercel.app)  

---

### Key Features
* **Live Catalog & Stock Tracking:** Real-time checking of equipment stock levels and health statuses.
* **Role-Based Workflows:** Separates permissions between regular users (request reservations, view history) and admins (manage catalog, approve/reject bookings).
* **Analytics Telemetry:** Admin dashboard powered by Recharts showing resource usage, category breakdowns, and pending allocations.
* **Audit Compliance:** Back-end logging of administrative actions to trace history.

### Tech Stack
* **Frontend:** React 19, Vite, Recharts, Axios (configured with JWT token interceptors)
* **Backend:** Node.js, Express (v5)
* **Database:** SQLite (`better-sqlite3` for fast, zero-configuration file-based storage)
* **Security:** `jsonwebtoken` (stateless auth) and `bcryptjs` (password hashing)

### Project Structure
```
asset-manager/
├── backend/             # Express server, SQLite configuration, schema scripts
│   └── routes/          # API routes (auth, assets, bookings, analytics)
└── frontend/            # React + Vite client
    └── src/
        ├── components/  # Layout shell
        └── pages/       # Login, Assets, Bookings, Dashboard (Recharts) views
```

### Quick Setup

#### 1. Backend Config
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
JWT_SECRET=your_signing_key_here
```
Run the backend:
```bash
npm start
```
*Note: Booting creates the SQLite database and seeds a default admin account:*  
*   **Email:** `admin@admin.com` | **Password:** `admin123`

#### 2. Frontend Config
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173`. Make sure the base API URL in `frontend/src/api.js` targets your running backend port.

---

### Author
Charvi  
24113033  
IIT Roorkee
