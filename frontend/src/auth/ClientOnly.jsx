import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ClientOnly({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] grid place-items-center text-slate-600">
        Chargement...
      </div>
    );
  }

  // ✅ Si admin => interdit sur le site client
  if (user?.role === "admin") {
    return <Navigate to="/admin/orders" replace />;
  }

  return children;
}
