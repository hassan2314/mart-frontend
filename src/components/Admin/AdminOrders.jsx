import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { ShoppingCart } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-slate-100 text-slate-800';
};

const AdminOrders = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/orders`,
        { withCredentials: true }
      );
      setOrders(response.data.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}`,
        { status: newStatus },
        { withCredentials: true }
      );
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/3 animate-pulse" />
        <div className="bg-white rounded-xl border border-slate-100 p-6 animate-pulse">
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (error && !orders.length) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Order Management</h2>
        <p className="text-slate-600 mt-1">View and manage all orders.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">All Orders</h3>
        </div>
        {orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Customer</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Items</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Total</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Shipping</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-slate-800">
                          {order.user?.fullname || 'N/A'}
                        </div>
                        <div className="text-slate-500 text-xs">{order.user?.email}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm space-y-1 max-w-[200px]">
                        {order.orderItems?.map((item, idx) => (
                          <div key={idx} className="flex justify-between gap-2">
                            <span className="truncate">
                              {item.product?.name || 'Product'} x {item.quantity}
                            </span>
                            <span className="text-slate-500 shrink-0">
                              ${((item.price || 0) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ${order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600 max-w-[180px]">
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}
                      {order.shippingAddress?.postalCode && ` ${order.shippingAddress.postalCode}`}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`text-sm font-medium px-2 py-1 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${getStatusColor(order.status)}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
