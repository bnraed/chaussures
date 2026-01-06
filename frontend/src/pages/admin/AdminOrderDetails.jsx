import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../../api/http";

const STATUSES = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELED"];

// ✅ FIX IMAGES: "/uploads/x.jpg" => "http://localhost:5000/uploads/x.jpg"
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
function imgUrl(u) {
  if (!u) return "";
  if (typeof u !== "string") return "";
  if (u.startsWith("http")) return u;
  return API_ORIGIN + u;
}

function money(v) {
  const n = Number(v || 0);
  return `${n.toFixed(2)} DT`;
}

function badgeClass(s) {
  if (s === "DELIVERED") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s === "SHIPPED") return "bg-blue-50 text-blue-700 border-blue-200";
  if (s === "CONFIRMED") return "bg-violet-50 text-violet-700 border-violet-200";
  if (s === "CANCELED") return "bg-rose-50 text-rose-700 border-rose-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
}

function firstImage(shoe) {
  const raw = shoe?.images?.[0];
  const fixed = imgUrl(raw);
  return fixed && fixed.trim().length
    ? fixed
    : "https://via.placeholder.com/100?text=Shoe";
}

export default function AdminOrderDetails() {
  const { id } = useParams();
  const nav = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [changing, setChanging] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get(`/admin/orders/${id}`);
      setOrder(res.data);
    } catch (e) {
      alert("Erreur chargement commande");
      nav("/admin/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const totalItems = useMemo(() => {
    if (!order?.items?.length) return 0;
    return order.items.reduce((s, it) => s + Number(it.quantity || 0), 0);
  }, [order]);

  const updateStatus = async (status) => {
    setChanging(true);
    try {
      const res = await http.put(`/admin/orders/${id}/status`, { status });
      setOrder(res.data);
    } catch (e) {
      alert("Erreur changement statut");
    } finally {
      setChanging(false);
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Supprimer cette commande ?")) return;
    try {
      await http.delete(`/admin/orders/${id}`);
      alert("Commande supprimée");
      nav("/admin/orders");
    } catch {
      alert("Erreur suppression");
    }
  };

  if (loading) {
    return <div className="rounded-3xl border bg-white p-6">Chargement...</div>;
  }

  if (!order) return null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <button
            onClick={() => nav(-1)}
            className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:underline"
          >
            ← Retour
          </button>

          <div className="flex items-center gap-3">
            <span
              className={
                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold " +
                badgeClass(order.status)
              }
            >
              {order.status}
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-black">Détails commande</h1>
          <p className="mt-1 text-sm text-slate-600 font-mono">ID: {order._id}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            value={order.status}
            disabled={changing}
            onChange={(e) => updateStatus(e.target.value)}
            className="rounded-2xl border px-4 py-3 text-sm font-semibold"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <button
            onClick={deleteOrder}
            className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            Supprimer
          </button>

          <button
            onClick={load}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
          >
            Rafraîchir
          </button>
        </div>
      </div>

      {/* INFOS */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* CLIENT */}
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="font-extrabold">Client</h2>
          <div className="mt-3 space-y-2 text-sm">
            <div>Email : <b>{order.user?.email}</b></div>
            <div>Créée : {new Date(order.createdAt).toLocaleString()}</div>
            <div>MAJ : {new Date(order.updatedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* RESUME */}
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="font-extrabold">Résumé</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              Articles : <b>{order.items.length}</b>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              Quantité : <b>{totalItems}</b>
            </div>
            <div className="col-span-2 rounded-xl bg-slate-900 p-4 text-white">
              Total : <b>{money(order.total)}</b>
            </div>
          </div>
        </div>

        {/* HISTORIQUE */}
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="font-extrabold">Historique statuts</h2>
          <div className="mt-4 space-y-3">
            {order.statusHistory?.length ? (
              [...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="rounded-xl border p-3">
                  <span
                    className={
                      "inline-flex rounded-full border px-3 py-1 text-xs font-semibold " +
                      badgeClass(h.status)
                    }
                  >
                    {h.status}
                  </span>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(h.at).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">Aucun historique</div>
            )}
          </div>
        </div>
      </div>

      {/* PRODUITS */}
      <div className="rounded-3xl border bg-white p-6">
        <h2 className="font-extrabold">Produits</h2>

        <table className="mt-4 w-full text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th>Produit</th>
              <th>Prix</th>
              <th>Taille</th>
              <th>Qté</th>
              <th>Sous-total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((it, i) => {
              const shoe = it.shoe;
              return (
                <tr key={i} className="border-t">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={firstImage(shoe)}
                        alt={shoe?.name || "Produit"}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/100?text=Shoe";
                        }}
                        className="h-12 w-12 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold">{shoe?.name || "—"}</div>
                        <div className="text-xs text-slate-500">{shoe?._id || ""}</div>
                      </div>
                    </div>
                  </td>
                  <td>{money(shoe?.price)}</td>
                  <td>{it.size || "—"}</td>
                  <td>{it.quantity}</td>
                  <td className="font-bold">{money((shoe?.price || 0) * it.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
