import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";

const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";

function imgUrl(u) {
  if (!u) return "";
  if (u.startsWith("http")) return u;
  return API_ORIGIN + u; // /uploads/xx.jpg => http://localhost:5000/uploads/xx.jpg
}

function money(v) {
  return `${Number(v || 0).toFixed(2)} DT`;
}

const Card = ({ shoe }) => {
  const cover = shoe?.images?.[0] ? imgUrl(shoe.images[0]) : "";

  return (
    <div className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-[4/3] bg-slate-100">
        {cover ? (
          <img
            src={cover}
            alt={shoe.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
            Pas d’image
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-extrabold tracking-tight">{shoe.name}</div>
            <div className="mt-1 text-sm text-slate-600 line-clamp-2">
              {shoe.description || "—"}
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
            {shoe.gender}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-lg font-black">{money(shoe.price)}</div>
          <Link
            to={`/shoes/${shoe._id}`}
            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Détails
          </Link>
        </div>

        {shoe.categories?.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {shoe.categories.slice(0, 3).map((c) => (
              <span
                key={c._id}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700"
              >
                {c.name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default function Shoes() {
  // ✅ data
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);

  // ✅ filters
  const [q, setQ] = useState("");
  const [gender, setGender] = useState("ALL");
  const [selectedCats, setSelectedCats] = useState([]); // array of ids
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("new");

  // ✅ pagination
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  const [loading, setLoading] = useState(true);

  // ✅ load categories once
  useEffect(() => {
    http
      .get("/categories")
      .then((res) => setCategories(res.data || []))
      .catch(() => setCategories([]));
  }, []);

  // ✅ build query params for backend
  const params = useMemo(() => {
    const p = {};
    if (q.trim()) p.q = q.trim();
    if (gender !== "ALL") p.gender = gender;
    if (selectedCats.length) p.categories = selectedCats.join(",");
    if (minPrice !== "") p.minPrice = minPrice;
    if (maxPrice !== "") p.maxPrice = maxPrice;
    if (sort) p.sort = sort;
    p.page = page;
    p.limit = limit;
    return p;
  }, [q, gender, selectedCats, minPrice, maxPrice, sort, page]);

  // ✅ load shoes whenever filters change
  useEffect(() => {
    setLoading(true);
    http
      .get("/shoes", { params })
      .then((res) => {
        const data = res.data || {};
        setItems(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      })
      .catch(() => {
        setItems([]);
        setPages(1);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [params]);

  const toggleCat = (id) => {
    setPage(1);
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setQ("");
    setGender("ALL");
    setSelectedCats([]);
    setMinPrice("");
    setMaxPrice("");
    setSort("new");
    setPage(1);
  };

  const canPrev = page > 1;
  const canNext = page < pages;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Catalogue</h2>
          <p className="mt-1 text-sm text-slate-600">
            {total} produit(s) • page {page}/{pages}
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-50"
          type="button"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* FILTERS */}
        <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-soft">
          <div className="space-y-4">
            {/* Search */}
            <div>
              <div className="text-sm font-extrabold text-slate-900">Recherche</div>
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                placeholder="Nom, description..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            {/* Gender */}
            <div>
              <div className="text-sm font-extrabold text-slate-900">Genre</div>
              <select
                value={gender}
                onChange={(e) => {
                  setPage(1);
                  setGender(e.target.value);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="ALL">Tous</option>
                <option value="Homme">Homme</option>
                <option value="Femme">Femme</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <div className="text-sm font-extrabold text-slate-900">Prix</div>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <input
                  value={minPrice}
                  onChange={(e) => {
                    setPage(1);
                    setMinPrice(e.target.value);
                  }}
                  type="number"
                  placeholder="Min"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
                <input
                  value={maxPrice}
                  onChange={(e) => {
                    setPage(1);
                    setMaxPrice(e.target.value);
                  }}
                  type="number"
                  placeholder="Max"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <div className="text-sm font-extrabold text-slate-900">Tri</div>
              <select
                value={sort}
                onChange={(e) => {
                  setPage(1);
                  setSort(e.target.value);
                }}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="new">Nouveautés</option>
                <option value="price_asc">Prix croissant</option>
                <option value="price_desc">Prix décroissant</option>
              </select>
            </div>

            {/* Categories */}
            <div>
              <div className="text-sm font-extrabold text-slate-900">Catégories</div>

              <div className="mt-2 space-y-2 max-h-[240px] overflow-auto pr-1">
                {categories.length === 0 ? (
                  <div className="text-sm text-slate-500">Aucune catégorie.</div>
                ) : (
                  categories.map((c) => (
                    <label
                      key={c._id}
                      className="flex cursor-pointer items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCats.includes(c._id)}
                        onChange={() => toggleCat(c._id)}
                      />
                      <span className="font-semibold text-slate-800">{c.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* LIST */}
        <section className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              Chargement...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              Aucun produit trouvé.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((shoe) => (
                <Card key={shoe._id} shoe={shoe} />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
            <div className="text-sm text-slate-600">
              Page <span className="font-bold">{page}</span> / {pages}
            </div>

            <div className="flex gap-2">
              <button
                disabled={!canPrev}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50 disabled:opacity-50"
              >
                ← Précédent
              </button>

              <button
                disabled={!canNext}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                Suivant →
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
