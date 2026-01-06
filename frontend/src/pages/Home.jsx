import { Link } from "react-router-dom";

const Feature = ({ title, desc }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="text-sm font-extrabold">{title}</div>
    <div className="mt-2 text-sm text-slate-600">{desc}</div>
  </div>
);

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-slate-900 text-white shadow">
        <div className="absolute inset-0 opacity-40">
          <img
            alt="hero"
            src="https://picsum.photos/1600/900?random=111"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        <div className="relative px-6 py-16 md:px-12 md:py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold ring-1 ring-white/20">
              ✨ New drops every week
            </div>

            <h1 className="mt-5 text-4xl font-black tracking-tight md:text-6xl">
              Premium shoes,
              <span className="text-white/70"> made simple.</span>
            </h1>

            <p className="mt-4 text-sm text-white/80 md:text-base">
              Explore a clean catalog, pick a size, add to cart, and order in seconds.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/shoes"
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 shadow hover:bg-white/90"
              >
                Shop now
              </Link>
              <Link
                to="/shoes"
                className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 hover:bg-white/15"
              >
                View collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid gap-4 md:grid-cols-3">
        <Feature title="Fast checkout" desc="Cart → order in one click (JWT secured)." />
        <Feature title="Real reviews" desc="Users can rate and comment on products." />
        <Feature title="Clean design" desc="Responsive, modern, professional UI." />
      </section>

      {/* CTA */}
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:p-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-2xl font-black tracking-tight">Ready to find your next pair?</div>
            <div className="mt-2 text-sm text-slate-600">
              Browse the catalog and discover best sellers.
            </div>
          </div>
          <Link
            to="/shoes"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow hover:opacity-90"
          >
            Go to shoes
          </Link>
        </div>
      </section>
    </div>
  );
}
