import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";

function money(dt) {
  const n = Number(dt || 0);
  return `${n.toFixed(2)} DT`;
}

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http
      .get("/orders/my")
      .then((res) => setOrders(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black tracking-tight">Mes commandes</h2>
        <p className="mt-1 text-sm text-slate-600">Historique de tes achats.</p>
      </div>

      {!orders.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="text-lg font-extrabold">Aucune commande.</div>
          <div className="mt-2 text-sm text-slate-600">Passe ta première commande depuis le panier.</div>
          <Link
            to="/shoes"
            className="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90"
          >
            Aller au catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.slice().reverse().map((o) => (
            <div key={o._id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-slate-600">Commande</div>
                  <div className="text-base font-extrabold">{o._id}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-2 text-sm">
                    <span className="text-slate-600">Total:</span>{" "}
                    <span className="font-black text-slate-900">{money(o.total)}</span>
                  </div>

                  <Link
                    to={`/orders/${o._id}`}
                    className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-90"
                  >
                    Détails
                  </Link>
                </div>
              </div>

              <div className="mt-4 text-sm text-slate-600">
                Articles: <span className="font-semibold text-slate-900">{o.items?.length || 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
