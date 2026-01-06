import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingBtn(true);

    try {
      const me = await login(email, password);

      if (me?.role === "admin") navigate("/admin/orders");
      else navigate("/");
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.message ||
        "Erreur de connexion";
      setError(msg);
    } finally {
      setLoadingBtn(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">Connexion</h1>
          <p className="mt-1 text-sm text-slate-600">
            Accède à ton compte pour commander et suivre tes achats.
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Email</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="admin@admin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Mot de passe</label>
            <input
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loadingBtn}
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingBtn ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          Pas de compte ?{" "}
          <Link className="font-semibold text-slate-900 hover:underline" to="/register">
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
