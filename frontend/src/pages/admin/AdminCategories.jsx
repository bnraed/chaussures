import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

export default function AdminCategories() {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editing, setEditing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/categories");
      setCats(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur chargement catégories: " + msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return cats;
    return cats.filter((c) => (c.name || "").toLowerCase().includes(s) || (c._id || "").toLowerCase().includes(s));
  }, [cats, q]);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const res = await http.post("/categories", { name: name.trim() });
      setCats((prev) => [res.data, ...prev].sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      setName("");
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2.message || "Erreur";
      alert("Erreur création: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (c) => {
    setEditId(c._id);
    setEditName(c.name || "");
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditName("");
  };

  const update = async (id) => {
    if (!editName.trim()) return;

    setEditing(true);
    try {
      const res = await http.put(`/categories/${id}`, { name: editName.trim() });
      setCats((prev) =>
        prev
          .map((c) => (c._id === id ? res.data : c))
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""))
      );
      cancelEdit();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur mise à jour: " + msg);
    } finally {
      setEditing(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Supprimer cette catégorie ?")) return;

    try {
      await http.delete(`/categories/${id}`);
      setCats((prev) => prev.filter((c) => c._id !== id));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur suppression: " + msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin — Catégories</h1>
          <p className="mt-1 text-sm text-slate-600">Créer, renommer et supprimer des catégories.</p>
        </div>

        <button
          onClick={load}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
          type="button"
        >
          Rafraîchir
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LIST */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 md:max-w-lg"
              placeholder="Rechercher (nom, id...)"
            />
            <div className="text-sm text-slate-600">{filtered.length} catégorie(s)</div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="min-w-[750px] w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-3">Nom</th>
                  <th className="pb-3">ID</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-slate-600" colSpan={3}>
                      Chargement...
                    </td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((c) => (
                    <tr key={c._id} className="border-t border-slate-100">
                      <td className="py-4">
                        {editId === c._id ? (
                          <input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full max-w-sm rounded-2xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-slate-400"
                            placeholder="Nom catégorie"
                          />
                        ) : (
                          <div className="font-extrabold text-slate-900">{c.name}</div>
                        )}
                      </td>

                      <td className="py-4">
                        <span className="font-mono text-xs text-slate-600">{c._id}</span>
                      </td>

                      <td className="py-4">
                        {editId === c._id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => update(c._id)}
                              disabled={editing}
                              className="rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                              type="button"
                            >
                              {editing ? "..." : "Enregistrer"}
                            </button>

                            <button
                              onClick={cancelEdit}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                              type="button"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                              type="button"
                            >
                              Modifier
                            </button>

                            <button
                              onClick={() => del(c._id)}
                              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                              type="button"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-slate-600" colSpan={3}>
                      Aucune catégorie.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-base font-extrabold text-slate-900">Nouvelle catégorie</h2>

          <form onSubmit={create} className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Nom (ex: Sport, Casual...)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <button
              disabled={saving}
              className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
              type="submit"
            >
              {saving ? "Création..." : "Créer"}
            </button>

            <div className="text-xs text-slate-500">
              Astuce: utilise des noms courts (Sport, Running, Casual, Luxe…)
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
