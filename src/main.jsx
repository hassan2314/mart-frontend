import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Lazy load public routes for smaller initial bundle
const ProductPage = React.lazy(() => import("./pages/ProductPage.jsx"));
const SmartCooking = React.lazy(() => import("./pages/SmartCooking"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const Stores = React.lazy(() => import("./pages/Stores"));
const Media = React.lazy(() => import("./pages/Media"));
const UpdateProfile = React.lazy(() => import("./pages/UpdateProfile"));
const OrderHistory = React.lazy(() => import("./pages/OrderHistory"));
const CreateProduct = React.lazy(() => import("./pages/CreateProduct"));
const CreateBlog = React.lazy(() => import("./pages/CreateBlog"));

// Admin Components (lazy loaded)
const AdminLayout = React.lazy(() => import("./components/Admin/AdminLayout.jsx"));
const AdminDashboard = React.lazy(() => import("./components/Admin/AdminDashboard.jsx"));
const AdminProducts = React.lazy(() => import("./components/Admin/AdminProducts.jsx"));
const AdminBlogs = React.lazy(() => import("./components/Admin/AdminBlogs.jsx"));
const AdminUsers = React.lazy(() => import("./components/Admin/AdminUsers.jsx"));
const InviteManager = React.lazy(() => import("./components/Admin/InviteManager.jsx"));

import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={
        <AuthProvider>
          <App />
        </AuthProvider>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="products" element={<ProductPage />} />
      <Route path="smart-cooking" element={<SmartCooking />} />
      <Route path="blogs/:id" element={<BlogPage />} />
      <Route path="stores" element={<Stores />} />
      <Route path="media" element={<Media />} />
      <Route
        path="update-profile"
        element={
          <ProtectedRoute>
            <UpdateProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="orders"
        element={
          <ProtectedRoute>
            <OrderHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="products/create"
        element={
          <ProtectedRoute adminOnly>
            <CreateProduct />
          </ProtectedRoute>
        }
      />
      <Route
        path="blogs/create"
        element={
          <ProtectedRoute adminOnly>
            <CreateBlog />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-50">Loading...</div>}>
            <AdminLayout />
          </Suspense>
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="invite-manager" element={<InviteManager />} />
      </Route>

    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
