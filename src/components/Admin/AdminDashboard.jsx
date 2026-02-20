import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Users, Package, FileText, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react';

const statConfig = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    gradient: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
    link: '/admin/users',
  },
  {
    key: 'totalProducts',
    label: 'Total Products',
    icon: Package,
    gradient: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
    link: '/admin/products',
  },
  {
    key: 'totalBlogs',
    label: 'Total Blogs',
    icon: FileText,
    gradient: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-600',
    link: '/admin/blogs',
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: ShoppingCart,
    gradient: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600',
    link: '/admin/orders',
  },
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-100 text-slate-600',
};

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!currentUser || currentUser.role !== 'admin') {
        setError('You are not authorized to view this page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/dashboard-stats`,
          { withCredentials: true }
        );
        setDashboardStats(response.data.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to fetch dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [currentUser]);

  const barChartData = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      { name: 'Users', value: dashboardStats.totalUsers, fill: CHART_COLORS[0] },
      { name: 'Products', value: dashboardStats.totalProducts, fill: CHART_COLORS[1] },
      { name: 'Blogs', value: dashboardStats.totalBlogs, fill: CHART_COLORS[2] },
      { name: 'Orders', value: dashboardStats.totalOrders, fill: CHART_COLORS[3] },
    ];
  }, [dashboardStats]);

  const pieChartData = useMemo(() => barChartData.map((d) => ({ name: d.name, value: d.value })), [barChartData]);

  const orderStatusData = useMemo(() => {
    if (!dashboardStats?.ordersByStatus) return [];
    const os = dashboardStats.ordersByStatus;
    return [
      { name: 'Pending', value: os.pending || 0, fill: '#f59e0b' },
      { name: 'Paid', value: os.paid || 0, fill: '#3b82f6' },
      { name: 'Shipped', value: os.shipped || 0, fill: '#6366f1' },
      { name: 'Delivered', value: os.delivered || 0, fill: '#10b981' },
    ].filter((d) => d.value > 0);
  }, [dashboardStats]);

  const formatRevenue = (val) => `$${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-24 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-72 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-72 bg-slate-200 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 rounded-xl animate-pulse" />
          <div className="h-80 bg-slate-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="p-4 text-slate-600 rounded-xl bg-slate-50">No dashboard data available.</div>
    );
  }

  const greeting = currentUser?.fullname || currentUser?.username || 'Admin';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 to-transparent" />
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {greeting}
          </h1>
          <p className="mt-1 text-slate-300">{today}</p>
          <p className="mt-2 text-slate-400 text-sm sm:text-base">
            Your store at a glance — manage products, orders, and customers from one place.
          </p>
        </div>
      </div>

      {/* Revenue + Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
          <DollarSign className="relative w-10 h-10 opacity-90" />
          <p className="relative mt-3 text-sm font-medium text-emerald-100">Total Revenue</p>
          <p className="relative mt-1 text-2xl font-bold">{formatRevenue(dashboardStats.totalRevenue)}</p>
        </div>
        {statConfig.map(({ key, label, icon: Icon, gradient, bgColor, textColor, link }) => (
          <Link
            key={key}
            to={link}
            className="group block rounded-xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all duration-200"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${bgColor} group-hover:scale-105 transition-transform`}>
              <Icon className={`w-6 h-6 ${textColor}`} />
            </div>
            <h3 className="mt-3 text-sm font-medium text-slate-500">{label}</h3>
            <p className={`mt-1 text-2xl font-bold ${textColor}`}>{dashboardStats[key]}</p>
            <span className="mt-2 inline-flex items-center text-xs font-medium text-slate-400 group-hover:text-slate-600">
              View all <ArrowRight className="ml-1 w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => (percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : '')}
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {orderStatusData.length > 0 && (
          <div className="lg:col-span-3 rounded-xl bg-white p-5 shadow-sm border border-slate-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Order Status</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity - Table Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Recent Users</h3>
            </div>
            <Link
              to="/admin/users"
              className="text-sm font-medium text-slate-500 hover:text-blue-600 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {(dashboardStats.recentUsers || []).length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {dashboardStats.recentUsers.map((user) => (
                    <tr key={user._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-xs">
                            {(user.fullname || user.username || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 truncate max-w-[140px]">{user.fullname || user.username}</p>
                            <p className="text-slate-500 text-xs truncate max-w-[140px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-center text-slate-500 text-sm">No recent users</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10">
                <Package className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Recent Products</h3>
            </div>
            <Link
              to="/admin/products"
              className="text-sm font-medium text-slate-500 hover:text-emerald-600 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {(dashboardStats.recentProducts || []).length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {dashboardStats.recentProducts.map((p) => (
                    <tr key={p._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[180px]">{p.name}</p>
                        <p className="text-slate-500 text-xs">${p.price} · {p.quantity} in stock</p>
                      </td>
                      <td className="px-5 py-3 text-emerald-600 font-medium whitespace-nowrap">${p.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-center text-slate-500 text-sm">No recent products</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10">
                <FileText className="w-4 h-4 text-violet-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Recent Blogs</h3>
            </div>
            <Link
              to="/admin/blogs"
              className="text-sm font-medium text-slate-500 hover:text-violet-600 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {(dashboardStats.recentBlogs || []).length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {dashboardStats.recentBlogs.map((b) => (
                    <tr key={b._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800 truncate max-w-[200px]">{b.title}</p>
                        <p className="text-slate-500 text-xs">by {b.authorName || 'Unknown'}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-center text-slate-500 text-sm">No recent blogs</p>
            )}
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <ShoppingCart className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">Recent Orders</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-slate-500 hover:text-amber-600 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            {(dashboardStats.recentOrders || []).length > 0 ? (
              <table className="w-full text-sm">
                <tbody>
                  {dashboardStats.recentOrders.map((o) => (
                    <tr key={o._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800 font-mono text-xs">#{o._id?.slice(-8)}</p>
                        <p className="text-slate-500 text-xs">${o.totalAmount?.toFixed(2)}</p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[o.status] || STATUS_COLORS.pending
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-center text-slate-500 text-sm">No recent orders</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
