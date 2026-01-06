import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useCart } from "../cart/CartContext";

const NavItem = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      "rounded-xl px-3 py-2 text-sm font-semibold transition " +
      (isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100")
    }
  >
    {children}
  </NavLink>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const count = cart?.reduce((s, x) => s + (Number(x.quantity) || 0), 0) || 0;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white shadow-soft">
            👟
          </div>
          <div className="leading-tight">
            <div className="text-sm font-extrabold tracking-tight">ShoeStore</div>
            <div className="text-xs text-slate-500">Homme • Femme • Sport</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <NavItem to="/">Home</NavItem>
          <NavItem to="/shoes">Shoes</NavItem>
          <NavItem to="/orders">Orders</NavItem>
          <NavItem to="/cart">
            Cart
            <span className="ml-2 rounded-full bg-slate-900 px-2 py-0.5 text-xs font-bold text-white">
              {count}
            </span>
          </NavItem>
        </nav>

        <div className="hidden w-[360px] items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2 md:flex">
          <span className="text-slate-500">🔎</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search shoes, brand, category..."
          />
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 md:block">
                {user.email}
              </span>
              <button
                onClick={logout}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-3 md:hidden">
        <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2">
          <span className="text-slate-500">🔎</span>
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            placeholder="Search..."
          />
        </div>
      </div>
    </header>
  );
}
