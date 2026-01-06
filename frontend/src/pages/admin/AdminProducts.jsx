import { useEffect, useMemo, useState } from "react";
import http from "../../api/http";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

function imgUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return API_ORIGIN + u;
}

function money(v) {
  return `${Number(v || 0).toFixed(2)} DT`;
}

const emptyForm = {
  _id: null,
  name: "",
  price: "",
  brand: "",
  gender: "Homme",
  sizes: "",
  categoryIds: [],
  stock: 0,
  description: "",
  images: [],
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [cats, setCats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const loadCats = async () => {
    try {
      const res = await http.get("/categories");
      setCats(res.data || []);
    } catch {
      setCats([]);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get("/admin/products");
      setItems(res.data || []);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur chargement produits: " + msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCats();
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const brand = (p.brand || "").toLowerCase();
      const catNames = (p.categories || []).map((c) => (c?.name || "").toLowerCase()).join(" ");
      const id = (p._id || "").toLowerCase();
      return name.includes(s) || brand.includes(s) || catNames.includes(s) || id.includes(s);
    });
  }, [items, q]);

  const startCreate = () => setForm({ ...emptyForm });

  const startEdit = (p) => {
    setForm({
      _id: p._id,
      name: p.name || "",
      price: p.price ?? "",
      brand: p.brand || "",
      gender: p.gender || "Homme",
      sizes: Array.isArray(p.sizes) ? p.sizes.join(",") : "",
      categoryIds: (p.categories || []).map((c) => c?._id).filter(Boolean),
      stock: p.stock ?? 0,
      description: p.description || "",
      images: Array.isArray(p.images) ? p.images : [],
    });
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const uploadImages = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("images", f));

      const res = await http.post("/admin/products/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const urls = res.data?.urls || [];
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur upload: " + msg);
    } finally {
      setUploading(false);
    }
  };

  const onSelectCategories = (e) => {
    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
    setForm((f) => ({ ...f, categoryIds: selected }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        price: Number(form.price || 0),
        brand: form.brand.trim(),
        gender: form.gender,
        sizes: form.sizes
          ? form.sizes.split(",").map((x) => Number(x.trim())).filter((n) => !Number.isNaN(n))
          : [],
        categoryIds: form.categoryIds,
        stock: Number(form.stock || 0),
        description: form.description,
        images: form.images,
      };

      let res;
      if (form._id) {
        res = await http.put(`/admin/products/${form._id}`, payload);
        setItems((prev) => prev.map((p) => (p._id === form._id ? res.data : p)));
      } else {
        res = await http.post("/admin/products", payload);
        setItems((prev) => [res.data, ...prev]);
      }

      setForm(emptyForm);
      alert("Produit enregistré ✅");
    } catch (e2) {
      const msg = e2?.response?.data?.message || e2.message || "Erreur";
      alert("Erreur enregistrement: " + msg);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id) => {
    if (!confirm("Supprimer ce produit ?")) return;
    try {
      await http.delete(`/admin/products/${id}`);
      setItems((prev) => prev.filter((p) => p._id !== id));
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Erreur";
      alert("Erreur suppression: " + msg);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Admin — Produits</h1>
          <p className="mt-1 text-sm text-slate-600">CRUD + upload images + catégories.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={load}
            className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
            type="button"
          >
            Rafraîchir
          </button>

          <button
            onClick={startCreate}
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
            type="button"
          >
            + Nouveau produit
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LISTE */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 md:max-w-lg"
              placeholder="Rechercher (nom, marque, catégorie, id...)"
            />
            <div className="text-sm text-slate-600">{filtered.length} produit(s)</div>
          </div>

          <div className="mt-4 overflow-auto">
            <table className="min-w-[950px] w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="pb-3">Produit</th>
                  <th className="pb-3">Prix</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3">Catégories</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-6 text-slate-600" colSpan={5}>
                      Chargement...
                    </td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((p) => (
                    <tr key={p._id} className="border-t border-slate-100">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                            {p.images?.[0] ? (
                              <img src={imgUrl(p.images[0])} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{p.name}</div>
                            <div className="text-xs text-slate-500">{p.brand || "—"} — {p.gender || "—"}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 font-black">{money(p.price)}</td>
                      <td className="py-4">{p.stock ?? 0}</td>
                      <td className="py-4">
                        {(p.categories || []).length
                          ? p.categories.map((c) => c?.name).filter(Boolean).join(", ")
                          : "—"}
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(p)}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-slate-50"
                            type="button"
                          >
                            Modifier
                          </button>

                          <button
                            onClick={() => del(p._id)}
                            className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            type="button"
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-6 text-slate-600" colSpan={5}>
                      Aucun produit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-base font-extrabold text-slate-900">
            {form._id ? "Modifier produit" : "Nouveau produit"}
          </h2>

          <form onSubmit={save} className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="Prix (DT)"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                required
              />
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                placeholder="Stock"
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
            </div>

            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Marque"
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
            />

            <select
              value={form.gender}
              onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="Homme">Homme</option>
              <option value="Femme">Femme</option>
            </select>

            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Tailles (ex: 40,41,42)"
              value={form.sizes}
              onChange={(e) => setForm((f) => ({ ...f, sizes: e.target.value }))}
            />

            {/* ✅ MULTI SELECT catégories */}
            <div className="space-y-1">
              <div className="text-xs font-semibold text-slate-700">Catégories (multi)</div>
              <select
                multiple
                value={form.categoryIds}
                onChange={onSelectCategories}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400 min-h-[130px]"
              >
                {cats.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-500">
                Ctrl (Windows) / Cmd (Mac) pour sélectionner plusieurs.
              </div>
            </div>

            <textarea
              className="w-full min-h-[120px] rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-slate-900">Images</div>
                <label className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold hover:bg-slate-50">
                  {uploading ? "Upload..." : "+ Ajouter"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => uploadImages(e.target.files)}
                  />
                </label>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {(form.images || []).map((u, idx) => (
                  <div key={u + idx} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    <img src={imgUrl(u)} alt="" className="h-24 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-bold hover:bg-white"
                      title="Supprimer image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {!form.images?.length && <div className="mt-3 text-xs text-slate-500">Aucune image.</div>}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                disabled={saving || uploading}
                className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                type="submit"
              >
                {saving ? "Enregistrement..." : "Enregistrer"}
              </button>

              <button
                type="button"
                onClick={() => setForm(emptyForm)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
