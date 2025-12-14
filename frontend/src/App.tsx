import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };
  return (
    <nav className="sticky top-4 z-20 rounded-3xl border border-white/10 bg-[#05060c]/90 px-6 py-4 shadow-2xl shadow-black/40 backdrop-blur-xl">
      <div className="flex flex-col gap-4 text-sm text-slate-300 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-2xl font-semibold text-amber-300">KA</span>
            <div>
              <p className="text-lg font-semibold text-white">KATA</p>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Since 1989</p>
            </div>
          </Link>
          <div className="hidden gap-3 text-xs uppercase tracking-[0.3em] text-slate-500 md:flex">
            <span>Small batch</span>
            <span>Family crafted</span>
            <span>Ships nationwide</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-base font-medium">
          <Link className="transition hover:text-amber-300" to="/">Collection</Link>
          {role === 'ADMIN' && <Link className="transition hover:text-amber-300" to="/admin">Chef's console</Link>}
          {token ? (
            <button onClick={logout} className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-300 hover:text-amber-200">Logout</button>
          ) : (
            <div className="flex gap-2">
              <Link className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-amber-300 hover:text-amber-200" to="/login">Login</Link>
              <Link className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300" to="/register">Reserve a tasting</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-screen px-4 pb-16 pt-6 text-slate-100 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <footer className="rounded-3xl border border-white/10 bg-black/40 px-6 py-8 text-sm text-slate-400 backdrop-blur-xl">
          <div className="flex flex-col gap-3 text-center sm:flex-row sm:items-center sm:justify-between">
            <p>(c) {new Date().getFullYear()} KATA - Slow sweets, fast delivery.</p>
            <div className="flex flex-wrap justify-center gap-4 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>Ethically sourced</span>
              <span>Zero additives</span>
              <span>24h dispatch</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
