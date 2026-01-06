import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";
import http from "../api/http";

function money(dt) {
  const n = Number(dt || 0);
  return `${n.toFixed(2)} DT`;
}

export default function Cart() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { cart, setCart, removeFromCart, clearCart, total } = useCart();

  const shipping = total >= 200 ? 0 : cart.length ? 7 : 0;
  const grandTotal = total + shipping;

  const setQty = (id, size, qty) => {
    setCart((prev) =>
      prev.map((x) =>
        x._id === id && x.size === size ? { ...x, quantity: Math.max(1, Math.min(10, qty)) } : x
      )
    );
  };

  const onCheckout = async () => {
    if (!cart.length) return;

    if (!user) {
      alert("Connecte-toi pour passer une commande.");
      return nav("/login");
    }

    try {
      // ✅ Format EXACT attendu par ton backend createOrder
      const payload = {
        items: cart.map((x) => ({
          shoe: x._id,
          quantity: Number(x.quantity) || 1,
          size: x.size, // optionnel si ton schema Order ne le garde pas
        })),
      };

      const res = await http.post("/orders", payload);

      clearCart();
      alert("Commande créée ✅");

      const orderId = res?.data?._id;
      if (orderId) nav(`/orders/${orderId}`);
      else nav("/orders");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Erreur";
      alert("Erreur commande: " + msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Panier</h2>
          <p className="mt-1 text-sm text-slate-600">
            Modifie les quantités, supprime, puis passe la commande.
          </p>
        </div>

        <Link
          to="/shoes"
          className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
        >
          Continuer les achats
        </Link>
      </div>

      {!cart.length ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="text-lg font-extrabold">Ton panier est vide.</div>
          <div className="mt-2 text-sm text-slate-600">Ajoute une chaussure pour commencer.</div>
          <Link
            to="/shoes"
            className="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90"
          >
            Voir le catalogue
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {cart.map((x) => (
              <div
                key={`${x._id}_${x.size}`}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft"
              >
                <div className="flex flex-col gap-4 p-5 md:flex-row">
                  <div className="h-32 w-full overflow-hidden rounded-2xl bg-slate-100 md:h-28 md:w-40">
                    <img
                      src={
                        x.image ||
                        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80"
                      }
                      alt={x.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-extrabold">{x.name}</div>
                        <div className="mt-1 text-sm text-slate-600">
                          Taille: <span className="font-semibold text-slate-900">{x.size}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(x._id, x.size)}
                        className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
                        type="button"
                      >
                        Supprimer
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="text-lg font-black">{money(x.price)}</div>

                      <div className="flex items-center gap-2">
                        <button
                          className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-lg font-black hover:bg-slate-200"
                          onClick={() => setQty(x._id, x.size, (x.quantity || 1) - 1)}
                          type="button"
                        >
                          −
                        </button>

                        <div className="grid h-10 min-w-[64px] place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-bold">
                          {x.quantity}
                        </div>

                        <button
                          className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-lg font-black hover:bg-slate-200"
                          onClick={() => setQty(x._id, x.size, (x.quantity || 1) + 1)}
                          type="button"
                        >
                          +
                        </button>

                        <div className="ml-3 text-sm text-slate-600">
                          Total:{" "}
                          <span className="font-extrabold text-slate-900">
                            {money(Number(x.price) * Number(x.quantity))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-500">
                      Quantité max 10 • Livraison 24-48h
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
              <div className="text-sm font-extrabold">Résumé</div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Sous-total</span>
                  <span className="font-extrabold">{money(total)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Livraison</span>
                  <span className="font-extrabold">{money(shipping)}</span>
                </div>

                <div className="h-px bg-slate-200" />

                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Total</span>
                  <span className="text-slate-900 font-black">{money(grandTotal)}</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                  ✅ Livraison gratuite à partir de <b>200 DT</b>.
                </div>
              </div>

              <button
                onClick={onCheckout}
                className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90"
                type="button"
              >
                Passer la commande
              </button>

              {!user ? (
                <div className="mt-3 text-xs text-slate-500">
                  Tu dois être connecté.{" "}
                  <Link className="font-semibold text-slate-900 hover:underline" to="/login">
                    Se connecter
                  </Link>
                </div>
              ) : (
                <div className="mt-3 text-xs text-slate-500">Connecté : {user.email}</div>
              )}
            </div>

            <button
              onClick={clearCart}
              className="w-full rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
              type="button"
            >
              Vider le panier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
