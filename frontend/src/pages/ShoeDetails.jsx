import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import http from "../api/http";
import { useCart } from "../cart/CartContext";
import { useAuth } from "../auth/AuthContext";

/** ✅ FIX IMAGES: convertit "/uploads/xx.jpg" => "http://localhost:5000/uploads/xx.jpg" */
const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
function imgUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return API_ORIGIN + u;
}

const Pill = ({ children }) => (
  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
    {children}
  </span>
);

const Stars = ({ value = 0, size = "text-base" }) => {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={(i < v ? "text-yellow-500" : "text-slate-300") + " " + size}
        >
          ★
        </span>
      ))}
    </div>
  );
};

const StarRow = ({ value = 0 }) => (
  <div className="flex items-center gap-2">
    <Stars value={value} />
    <span className="text-sm text-slate-600">
      {Number(value || 0).toFixed(1)}
    </span>
  </div>
);

const Box = ({ title, right, children }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
    <div className="flex items-end justify-between">
      <div className="text-sm font-extrabold">{title}</div>
      {right ? <div className="text-sm text-slate-600">{right}</div> : null}
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

// ✅ helpers avis (compatibles avec ton backend Review séparé)
async function tryGetReviews(shoeId) {
  try {
    const r = await http.get(`/reviews/shoe/${shoeId}`);
    return Array.isArray(r.data) ? r.data : [];
  } catch (e) {
    if (e?.response?.status === 404) {
      const r2 = await http.get(`/shoes/${shoeId}/reviews`);
      return Array.isArray(r2.data) ? r2.data : [];
    }
    throw e;
  }
}

async function tryCreateReview({ shoeId, rating, comment }) {
  try {
    const r = await http.post(`/reviews`, { shoe: shoeId, rating, comment });
    return r.data;
  } catch (e) {
    if (e?.response?.status === 404) {
      const r2 = await http.post(`/shoes/${shoeId}/reviews`, { rating, comment });
      return r2.data;
    }
    throw e;
  }
}

// ✅ génération tailles selon gender (fallback front si backend n’envoie rien)
function buildSizesFallback(gender) {
  if (gender === "Homme") return ["40", "41", "42", "43", "44", "45", "46"];
  if (gender === "Femme") return ["36", "37", "38", "39", "40", "41"];
  return ["38", "39", "40", "41", "42", "43", "44"];
}

export default function ShoeDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [shoe, setShoe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [size, setSize] = useState("");
  const [qty, setQty] = useState(1);

  // ✅ Reviews state (séparé du shoe)
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Reviews UI state
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState("");
  const [revLoading, setRevLoading] = useState(false);

  const fetchShoe = async () => {
    setLoading(true);
    try {
      const res = await http.get(`/shoes/${id}`);
      setShoe(res.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const list = await tryGetReviews(id);
      setReviews(list);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchShoe();
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ✅ tailles: backend si existe, sinon fallback selon gender
  const sizes = useMemo(() => {
    const arr = Array.isArray(shoe?.sizes) ? shoe.sizes : [];
    const base = arr.length ? arr : buildSizesFallback(shoe?.gender);
    return base.map((x) => String(x));
  }, [shoe]);

  // ✅ choisir automatiquement la première taille si aucune sélection
  useEffect(() => {
    if (sizes.length && !size) setSize(String(sizes[0]));
  }, [sizes, size]);

  const inStock = Number(shoe?.stock || 0) > 0;

  /** ✅ HERO IMAGE FIX */
  const heroImage = useMemo(() => {
    const raw = shoe?.images?.[0];     // ex "/uploads/xx.jpg"
    const fixed = imgUrl(raw);         // => "http://localhost:5000/uploads/xx.jpg"
    return (
      fixed ||
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80"
    );
  }, [shoe]);

  const onAdd = () => {
    if (!size) return alert("Choisis une taille");
    if (!inStock) return alert("Rupture de stock");

    addToCart({
      _id: shoe._id,
      name: shoe.name,
      price: shoe.price,
      image: heroImage, // ✅ URL correcte
      size,
      quantity: qty,
    });

    alert("Ajouté au panier ✅");
  };

  // ✅ avgRating basé sur reviews (backend Review séparé)
  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
    return sum / reviews.length;
  }, [reviews]);

  const ratingStats = useMemo(() => {
    const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews) {
      const k = Number(r.rating);
      if (k >= 1 && k <= 5) stats[k] = (stats[k] || 0) + 1;
    }
    return stats;
  }, [reviews]);

  const onSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) return alert("Connecte-toi pour laisser un avis.");
    if (!revComment.trim()) return alert("Écris un commentaire.");

    setRevLoading(true);
    try {
      await tryCreateReview({
        shoeId: id,
        rating: Number(revRating),
        comment: revComment.trim(),
      });

      setRevComment("");
      setRevRating(5);

      await fetchReviews();
      alert("Avis ajouté ✅");
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Erreur";
      alert("Erreur ajout avis: " + msg);
    } finally {
      setRevLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        Loading...
      </div>
    );
  }

  if (!shoe) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        Produit introuvable.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-600">
        <Link className="hover:underline" to="/shoes">
          Chaussures
        </Link>{" "}
        <span className="text-slate-400">/</span>{" "}
        <span className="text-slate-900 font-semibold">{shoe.name}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Image */}
        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
          <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
            <img
              src={heroImage}
              alt={shoe.name}
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80";
              }}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />

            <div className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-sm font-black shadow">
              {shoe.price} DT
            </div>

            {!inStock ? (
              <div className="absolute inset-0 grid place-items-center bg-black/40 text-xl font-black text-white">
                Rupture de stock
              </div>
            ) : null}
          </div>

          <div className="p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill>{shoe.gender}</Pill>
              {shoe.categories?.slice(0, 4)?.map((c) => (
                <Pill key={c._id}>{c.name}</Pill>
              ))}
              <Pill>{inStock ? `Stock: ${shoe.stock}` : "Rupture"}</Pill>
            </div>

            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight md:text-3xl">
                  {shoe.name}
                </h1>
                <div className="mt-2">
                  <StarRow value={avgRating} />
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-black">{shoe.price} DT</div>
                <div className="text-xs text-slate-500">TTC</div>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              {shoe.description || "—"}
            </p>
          </div>
        </div>

        {/* Right: Buy box + Reviews */}
        <div className="space-y-5">
          {/* Buy box */}
          <Box title="Achat" right={inStock ? "Livraison 24-48h" : "Indisponible"}>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-extrabold">Taille</div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={
                        "rounded-2xl px-4 py-2 text-sm font-bold transition " +
                        (size === s
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-900 hover:bg-slate-200")
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-xs text-slate-500">
                  Taille choisie:{" "}
                  <span className="font-bold text-slate-900">{size || "—"}</span>
                </div>
              </div>

              <div>
                <div className="text-sm font-extrabold">Quantité</div>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-lg font-black hover:bg-slate-200"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    type="button"
                  >
                    −
                  </button>
                  <div className="grid h-10 min-w-[64px] place-items-center rounded-2xl border border-slate-200 bg-white text-sm font-bold">
                    {qty}
                  </div>
                  <button
                    className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 text-lg font-black hover:bg-slate-200"
                    onClick={() => setQty((q) => Math.min(10, q + 1))}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <div className="mt-2 text-xs text-slate-500">Max 10</div>
              </div>
            </div>

            <button
              onClick={onAdd}
              disabled={!inStock}
              className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
            >
              Ajouter au panier
            </button>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
              <span>Retour 7 jours</span>
              <span>Paiement sécurisé</span>
            </div>
          </Box>

          {/* Reviews */}
          <Box title="Avis" right={`${reviews.length} avis • ${avgRating.toFixed(1)}/5`}>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="text-3xl font-black">{avgRating.toFixed(1)}</div>
                <div className="mt-1">
                  <Stars value={avgRating} size="text-lg" />
                </div>
                <div className="mt-2 text-sm text-slate-600">
                  Basé sur {reviews.length} avis
                </div>
                {reviewsLoading ? (
                  <div className="mt-2 text-xs text-slate-500">Chargement...</div>
                ) : null}
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                {[5, 4, 3, 2, 1].map((k) => {
                  const total = reviews.length || 1;
                  const pct = Math.round(((ratingStats[k] || 0) / total) * 100);
                  return (
                    <div key={k} className="mb-2 flex items-center gap-2">
                      <div className="w-10 text-sm font-bold">{k}★</div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full rounded-full bg-slate-900"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="w-10 text-right text-xs text-slate-600">
                        {ratingStats[k] || 0}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add review */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm font-extrabold">Laisser un avis</div>
                {!user ? (
                  <Link
                    to="/login"
                    className="text-sm font-semibold text-slate-900 hover:underline"
                  >
                    Se connecter
                  </Link>
                ) : (
                  <div className="text-xs text-slate-600">{user.email}</div>
                )}
              </div>

              <form onSubmit={onSubmitReview} className="mt-3 space-y-3">
                <div>
                  <div className="text-sm font-semibold text-slate-700">Note</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRevRating(n)}
                        className={
                          "rounded-2xl px-4 py-2 text-sm font-bold transition " +
                          (revRating === n
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-900 hover:bg-slate-200")
                        }
                      >
                        {n} ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-700">Commentaire</div>
                  <textarea
                    value={revComment}
                    onChange={(e) => setRevComment(e.target.value)}
                    rows={3}
                    placeholder="Écris ton avis..."
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!user || revLoading}
                  className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-soft hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {revLoading ? "Envoi..." : "Publier l'avis"}
                </button>
              </form>
            </div>

            {/* List reviews */}
            <div className="mt-5 grid gap-3">
              {reviews.length ? (
                reviews.map((r) => (
                  <div
                    key={r._id}
                    className="rounded-2xl border border-slate-200 bg-white p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-extrabold">
                          {r.userName || r.userEmail || r.user?.email || "Utilisateur"}
                        </div>
                        <div className="mt-1">
                          <Stars value={r.rating} />
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-700">{r.comment || "—"}</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                  {reviewsLoading ? "Chargement..." : "Aucun avis pour le moment."}
                </div>
              )}
            </div>
          </Box>
        </div>
      </div>
    </div>
  );
}
