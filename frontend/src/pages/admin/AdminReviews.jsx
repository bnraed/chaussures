import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

const Stars = ({ value = 0 }) => {
  const v = Math.round(Number(value) || 0);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < v ? "text-yellow-500" : "text-slate-300"}>
          ★
        </span>
      ))}
    </div>
  );
};

export default function AdminReviews() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState("AUTO"); // "AUTO" | "EMBEDDED" | "REVIEW_MODEL"

  const normalizeEmbedded = (rows) =>
    (rows || []).map((r) => ({
      mode: "EMBEDDED",
      reviewId: r.reviewId,
      shoeId: r.shoeId,
      shoeName: r.shoeName,
      userName: r.userName || r.userEmail || "—",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

  const normalizeReviewModel = (rows) =>
    (rows || []).map((r) => ({
      mode: "REVIEW_MODEL",
      reviewId: r._id,
      shoeId: r.shoe?._id || r.shoe,
      shoeName: r.shoe?.name || r.shoeName || "—",
      userName: r.user?.email || r.userEmail || r.userName || "—",
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    }));

  const load = async () => {
    setLoading(true);
    try {
      // 1) Ton endpoint admin existant
      const res = await http.get("/admin/reviews");
      const data = res.data;

      // 🔎 Détecter automatiquement le format renvoyé:
      // - EMBEDDED: a reviewId + shoeId + shoeName
      // - REVIEW_MODEL: a _id + shoe + user
      const isEmbedded =
        Array.isArray(data) &&
        data.length &&
        data[0]?.reviewId &&
        data[0]?.shoeId;

      const isReviewModel =
        Array.isArray(data) &&
        data.length &&
        (data[0]?._id && (data[0]?.shoe || data[0]?.shoe?._id));

      let normalized = [];
      if (mode === "EMBEDDED" || (mode === "AUTO" && isEmbedded)) {
        normalized = normalizeEmbedded(data);
        setMode("EMBEDDED");
      } else if (mode === "REVIEW_MODEL" || (mode === "AUTO" && isReviewModel)) {
        normalized = normalizeReviewModel(data);
        setMode("REVIEW_MODEL");
      } else {
        // si API renvoie [] ou format inconnu, on essaye de deviner:
        // si [] => on garde et on laisse AUTO
        normalized = Array.isArray(data) ? data : [];
        // au cas où tu renvoies des reviews review-model mais sans populate
        if (normalized.length && normalized[0]?._id) setMode("REVIEW_MODEL");
      }

      setItems(normalized || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur chargement avis: " + msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((r) => {
      const shoe = (r.shoeName || "").toLowerCase();
      const user = (r.userName || "").toLowerCase();
      const comment = (r.comment || "").toLowerCase();
      return shoe.includes(s) || user.includes(s) || comment.includes(s);
    });
  }, [items, q]);

  const del = async (r) => {
    if (!confirm("Supprimer cet avis ?")) return;

    // ✅ Si tes avis viennent du Review model, ton endpoint delete actuel (shoeId/reviewId)
    // ne peut PAS supprimer (il attend embedded). On empêche l'action côté UI.
    if (r.mode === "REVIEW_MODEL") {
      alert(
        "Suppression non dispo avec ton endpoint actuel.\n" +
          "Ton avis est dans la collection Review, mais DELETE admin attend shoeId/reviewId (embedded)."
      );
      return;
    }

    try {
      await http.delete(`/admin/reviews/${r.shoeId}/${r.reviewId}`);
      setItems((prev) => prev.filter((x) => x.reviewId !== r.reviewId));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur suppression avis: " + msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin — Avis</h1>
          <p className="mt-1 text-sm text-slate-600">
            Liste des avis (auto compatible) + suppression si endpoint compatible.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Mode détecté: <span className="font-bold">{mode}</span>
          </p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
          type="button"
        >
          Rafraîchir
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 md:max-w-lg"
            placeholder="Rechercher (produit, user, commentaire...)"
          />
          <div className="text-sm text-slate-600">{filtered.length} avis</div>
        </div>

        <div className="mt-4 overflow-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead>
              <tr className="text-left text-slate-600">
                <th className="pb-3">Produit</th>
                <th className="pb-3">User</th>
                <th className="pb-3">Note</th>
                <th className="pb-3">Commentaire</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-6 text-slate-600">
                    Chargement...
                  </td>
                </tr>
              ) : filtered.length ? (
                filtered.map((r) => (
                  <tr key={r.reviewId} className="border-t border-slate-100">
                    <td className="py-4 font-extrabold text-slate-900">
                      {r.shoeName || "—"}
                      <div className="text-xs text-slate-500">{r.shoeId || "—"}</div>
                    </td>
                    <td className="py-4">{r.userName || "—"}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-2">
                        <Stars value={r.rating} />
                        <span className="text-slate-600">{r.rating}/5</span>
                      </div>
                    </td>
                    <td className="py-4 max-w-[420px]">
                      <div className="line-clamp-2 text-slate-700">{r.comment || "—"}</div>
                    </td>
                    <td className="py-4 text-slate-600">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="py-4">
                      <button
                        onClick={() => del(r)}
                        className={
                          "rounded-2xl px-4 py-2 text-xs font-semibold " +
                          (r.mode === "REVIEW_MODEL"
                            ? "border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                            : "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100")
                        }
                        type="button"
                        disabled={r.mode === "REVIEW_MODEL"}
                        title={
                          r.mode === "REVIEW_MODEL"
                            ? "Delete non compatible avec ton endpoint actuel"
                            : "Supprimer"
                        }
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-6 text-slate-600">
                    Aucun avis.
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
