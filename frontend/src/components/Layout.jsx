import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>

      <footer className="mt-14 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-slate-600">
          © {new Date().getFullYear()} ShoeStore — Modern UI
        </div>
      </footer>
    </div>
  );
}
