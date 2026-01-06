import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../../api/http";

const STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"];

// ✅ FIX IMAGES: convertit "/uploads/xx.jpg" => "http://localhost:5000/uploads/xx.jpg"
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
function imgUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return API_ORIGIN + u;
}

function money(v) {
  return `${Number(v || 0).toFixed(2)} DT`;
}

function firstImage(shoe) {
  const raw = shoe?.images?.[0];
  const fixed = imgUrl(raw);
  return fixed && fixed.trim().length
    ? fixed
    : "https://via.placeholder.com/100?text=Shoe";
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/admin/orders");
      setOrders(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || "Erreur chargement commandes";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return orders;

    return orders.filter((o) => {
      const id = (o._id || "").toLowerCase();
      const email = (o.user?.email || "").toLowerCase();
      const status = (o.status || "").toLowerCase();
      const firstShoeName = (o.items?.[0]?.shoe?.name || "").toLowerCase();

      return (
        id.includes(s) ||
        email.includes(s) ||
        status.includes(s) ||
        firstShoeName.includes(s)
      );
    });
  }, [orders, q]);

  const updateStatus = async (id, status) => {
    try {
      const res = await http.put(`/admin/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? res.data : o)));
    } catch (e) {
      const msg = e?.response?.data?.message || "Erreur update statut";
      alert(msg);
    }
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Supprimer cette commande ?")) return;

    try {
      await http.delete(`/admin/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (e) {
      const msg = e?.response?.data?.message || "Erreur suppression commande";
      alert(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin — Commandes</h1>
          <p className="mt-1 text-sm text-slate-600">
            Image + nom produit, détails, suppression, changement de statut.
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          type="button"
        >
          Rafraîchir
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 md:max-w-lg"
            placeholder="Rechercher (id, email, statut, produit...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="text-sm text-slate-600">{filtered.length} commande(s)</div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="min-w-[1100px] w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600 border-b">
                <th className="p-3">Produit</th>
                <th className="p-3">ID</th>
                <th className="p-3">Client</th>
                <th className="p-3">Articles</th>
                <th className="p-3">Total</th>
                <th className="p-3">Statut</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-slate-600">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((o) => {
                  const firstItem = o.items?.[0];
                  const shoe = firstItem?.shoe;

                  return (
                    <tr key={o._id} className="border-b">
                      {/* IMAGE + NOM */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={firstImage(shoe)}
                            alt={shoe?.name || "Produit"}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/100?text=Shoe";
                            }}
                            className="h-14 w-14 rounded-2xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">
                              {shoe?.name || "—"}
                            </div>
                            <div className="text-xs text-slate-500">
                              Qté: {firstItem?.quantity || 0}
                              {firstItem?.size ? ` • Taille: ${firstItem.size}` : ""}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-extrabold text-slate-900">{o._id}</td>

                      <td className="p-3">
                        <div className="font-semibold text-slate-900">
                          {o.user?.email || "—"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}
                        </div>
                      </td>

                      <td className="p-3 text-slate-700">{o.items?.length || 0}</td>
                      <td className="p-3 font-black">{money(o.total)}</td>

                      {/* STATUT */}
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o._id, e.target.value)}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/orders/${o._id}`)}
                            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-blue-600 text-white hover:opacity-90"
                          >
                            Détails
                          </button>

                          <button
                            onClick={() => deleteOrder(o._id)}
                            className="rounded-2xl px-4 py-2 text-sm font-semibold bg-rose-600 text-white hover:opacity-90"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-slate-600">
                    Aucune commande.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
