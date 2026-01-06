import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";

function money(dt) {
  const n = Number(dt || 0);
  return `${n.toFixed(2)} DT`;
}

// ✅ Fix images /uploads/...
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
function imgUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  if (u.startsWith("/")) return API_ORIGIN + u;
  return API_ORIGIN + "/" + u;
}

function statusLabel(s) {
  const map = {
    CREATED: "Créée",
    CONFIRMED: "Confirmée",
    SHIPPED: "Expédiée",
    DELIVERED: "Livrée",
    CANCELED: "Annulée",
  };
  return map[s] || s || "—";
}

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(""); // ✅

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setErr("");
      setOrder(null);

      try {
        const res = await http.get(`/orders/${id}`);
        if (!mounted) return;
        setOrder(res.data);
      } catch (e) {
        if (!mounted) return;
        const status = e?.response?.status;
        const msg =
          e?.response?.data?.message ||
          (status === 403
            ? "Accès non autorisé (ce n’est pas ta commande)."
            : status === 404
            ? "Commande introuvable."
            : e.message || "Erreur");

        setErr(msg);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  const totals = useMemo(() => {
    const items = order?.items || [];
    const subtotal = items.reduce((s, it) => {
      const price = Number(it?.shoe?.price || 0);
      const qty = Number(it?.quantity || 0);
      return s + price * qty;
    }, 0);
    return { subtotal };
  }, [order]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        Chargement...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="text-lg font-black">Commande introuvable.</div>
        {err ? <div className="mt-2 text-sm text-slate-600">{err}</div> : null}

        <Link
          to="/orders"
          className="mt-4 inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          ← Retour
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-slate-600">
        <Link className="hover:underline" to="/orders">
          Mes commandes
        </Link>{" "}
        <span className="text-slate-400">/</span>{" "}
        <span className="text-slate-900">{order._id}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-sm font-extrabold">Articles</div>

            <div className="mt-4 space-y-4">
              {(order.items || []).map((it, idx) => {
                const shoe = it.shoe;
                const img =
                  imgUrl(shoe?.images?.[0]) ||
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";

                return (
                  <div
                    key={shoe?._id || idx}
                    className="flex flex-col gap-4 md:flex-row md:items-center"
                  >
                    <div className="h-24 w-full overflow-hidden rounded-2xl bg-slate-100 md:w-32">
                      <img
                        src={img}
                        alt={shoe?.name || "Shoe"}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80";
                        }}
                      />
                    </div>

                    <div className="flex-1">
                      <div className="text-base font-extrabold">
                        {shoe?.name || "Produit"}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        Quantité:{" "}
                        <span className="font-semibold text-slate-900">
                          {it.quantity}
                        </span>
                        {it.size ? (
                          <>
                            {" "}
                            • Taille:{" "}
                            <span className="font-semibold text-slate-900">
                              {it.size}
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-600">Prix</div>
                      <div className="text-lg font-black">
                        {money(shoe?.price)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
            <div className="text-sm font-extrabold">Résumé</div>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sous-total</span>
                <span className="font-extrabold">{money(totals.subtotal)}</span>
              </div>

              <div className="h-px bg-slate-200" />

              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900">Total</span>
                <span className="text-slate-900 font-black">
                  {money(order.total)}
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                Statut:{" "}
                <span className="font-semibold text-slate-900">
                  {statusLabel(order.status)}
                </span>
              </div>
            </div>

            <Link
              to="/shoes"
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90"
            >
              Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
