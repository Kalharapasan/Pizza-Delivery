# Forno &mdash; Pizza Delivery Frontend

A React (Vite) frontend for the Pizza Delivery API, styled with a warm, light
color theme (ivory background, tomato-red and basil-green accents).

## Setup

```bash
cd frontend
npm install
cp .env.example .env     # points to the backend, defaults to http://127.0.0.1:8000
npm run dev
```

Open `http://localhost:5173`. Make sure the backend (`../backend`) is running
first — signup/login/orders all call it directly.

## Pages

- `/` — landing page
- `/signup`, `/login` — auth (check "Register as kitchen staff" on signup to
  create a staff account)
- `/menu` — place an order (pick size + quantity)
- `/my-orders` — your orders with live status, price, and timestamp; edit or
  cancel while still pending
- `/admin` — staff-only dashboard: paginated order list, status filter, and
  status controls
- `/profile` — update your email or change your password

## Notes

- Auth tokens are stored in `localStorage`; the API client automatically
  refreshes the access token using the refresh token on a 401.
- Colors and type scale live in `src/index.css` as CSS variables — change
  `--tomato`, `--basil`, `--crust`, `--bg` etc. to retheme.
- Order price and timestamps come from the backend (server-computed, never
  trusted from the client).
- Toast notifications (`src/context/ToastContext.jsx`) confirm actions like
  placing an order, updating status, or saving your profile.
- The navbar collapses into a hamburger menu below 720px.
