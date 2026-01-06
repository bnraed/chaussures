import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Item({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "block rounded-2xl px-4 py-3 text-sm font-semibold transition " +
        (isActive
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100")
      }
    >
      {children}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* HEADER */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Dashboard Admin
            </h1>
            <p className="text-sm text-slate-600">
              {user?.email}
            </p>
          </div>

          <button
            onClick={onLogout}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Logout
          </button>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
          {/* SIDEBAR */}
          <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <nav className="space-y-2">
              <Item to="/admin/orders">📦 Commandes</Item>
              <Item to="/admin/products">👟 Produits</Item>
              <Item to="/admin/categories">🏷️ Catégories</Item>
              <Item to="/admin/reviews">⭐ Avis</Item>
            </nav>
          </aside>

          {/* PAGE */}
          <main className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
