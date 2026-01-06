import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";

import Home from "./pages/Home";
import Shoes from "./pages/Shoes";
import ShoeDetails from "./pages/ShoeDetails";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderDetails from "./pages/OrderDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./auth/ProtectedRoute";
import AdminRoute from "./auth/AdminRoute";
import ClientOnly from "./auth/ClientOnly";

import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminReviews from "./pages/admin/AdminReviews";

export default function App() {
  return (
    <Routes>
      {/* ✅ SITE CLIENT (bloqué pour admin) */}
      <Route
        path="/"
        element={
          <ClientOnly>
            <Layout>
              <Home />
            </Layout>
          </ClientOnly>
        }
      />
      <Route
        path="/shoes"
        element={
          <ClientOnly>
            <Layout>
              <Shoes />
            </Layout>
          </ClientOnly>
        }
      />
      <Route
        path="/shoes/:id"
        element={
          <ClientOnly>
            <Layout>
              <ShoeDetails />
            </Layout>
          </ClientOnly>
        }
      />
      <Route
        path="/cart"
        element={
          <ClientOnly>
            <Layout>
              <Cart />
            </Layout>
          </ClientOnly>
        }
      />

      <Route
        path="/orders"
        element={
          <ClientOnly>
            <Layout>
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            </Layout>
          </ClientOnly>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ClientOnly>
            <Layout>
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            </Layout>
          </ClientOnly>
        }
      />

      {/* ✅ AUTH */}
      <Route
        path="/login"
        element={
          <Layout>
            <Login />
          </Layout>
        }
      />
      <Route
        path="/register"
        element={
          <ClientOnly>
            <Layout>
              <Register />
            </Layout>
          </ClientOnly>
        }
      />

      {/* ✅ DASHBOARD ADMIN (sans Layout du site) */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/orders" replace />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="orders/:id" element={<AdminOrderDetails />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="reviews" element={<AdminReviews />} />
      </Route>

      {/* ✅ fallback (évite que l'admin retourne vers le site client) */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
