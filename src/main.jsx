import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import SmartCooking from "./pages/SmartCooking";
import Stores from "./pages/Stores";
import Media from "./pages/Media";
import UpdateProfile from "./pages/UpdateProfile";
import CreateProduct from "./pages/CreateProduct";
import CreateBlog from "./pages/CreateBlog";
import BlogPage from "./pages/BlogPage";
import OrderHistory from "./pages/OrderHistory";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

// Admin Components
import AdminLayout from "./components/Admin/AdminLayout.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import AdminProducts from "./components/Admin/AdminProducts.jsx";
import AdminBlogs from "./components/Admin/AdminBlogs.jsx";
import AdminUsers from "./components/Admin/AdminUsers.jsx";
import AdminOrders from "./components/Admin/AdminOrders.jsx";
import InviteManager from "./components/Admin/InviteManager.jsx";

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
      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
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
