import React, { useEffect, useState, useMemo } from 'react';
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
import { Users, Package, FileText, ShoppingCart } from 'lucide-react';

const statConfig = [
  {
    key: 'totalUsers',
    label: 'Total Users',
    icon: Users,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-600',
  },
  {
    key: 'totalProducts',
    label: 'Total Products',
    icon: Package,
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    textColor: 'text-emerald-600',
  },
  {
    key: 'totalBlogs',
    label: 'Total Blogs',
    icon: FileText,
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-500/10',
    textColor: 'text-violet-600',
  },
  {
    key: 'totalOrders',
    label: 'Total Orders',
    icon: ShoppingCart,
    color: 'from-amber-500 to-amber-600',
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-600',
  },
];

const CHART_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];

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

  const recentCards = useMemo(() => {
    if (!dashboardStats) return [];
    return [
      {
        title: 'Recent Users',
        icon: Users,
        items: dashboardStats.recentUsers || [],
        render: (user) => (
          <span>
            {user.fullname} ({user.email}) — {new Date(user.createdAt).toLocaleDateString()}
          </span>
        ),
        emptyMsg: 'No recent users',
      },
      {
        title: 'Recent Products',
        icon: Package,
        items: dashboardStats.recentProducts || [],
        render: (p) => (
          <span>
            {p.name} — ${p.price} ({p.quantity} in stock)
          </span>
        ),
        emptyMsg: 'No recent products',
      },
      {
        title: 'Recent Blogs',
        icon: FileText,
        items: dashboardStats.recentBlogs || [],
        render: (b) => (
          <span>
            {b.title} by {b.authorName} — {new Date(b.createdAt).toLocaleDateString()}
          </span>
        ),
        emptyMsg: 'No recent blogs',
      },
      {
        title: 'Recent Orders',
        icon: ShoppingCart,
        items: dashboardStats.recentOrders || [],
        render: (o) => (
          <span>
            Order {o._id.substring(0, 8)}... — ${o.totalAmount} — {o.status}
          </span>
        ),
        emptyMsg: 'No recent orders',
      },
    ];
  }, [dashboardStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-pulse flex flex-col gap-4 w-full max-w-md">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        Error: {error}
      </div>
    );
  }

  if (!dashboardStats) {
    return (
      <div className="p-4 text-slate-600">No dashboard data available.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-600 mt-1">
          Welcome! Here is an overview of your store.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statConfig.map(({ key, label, icon: Icon, color, bgColor, textColor }) => (
          <div
            key={key}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
          >
            <div className={`inline-flex p-2.5 rounded-lg ${bgColor} mb-3`}>
              <Icon className={`w-6 h-6 ${textColor}`} />
            </div>
            <h3 className="text-sm font-medium text-slate-500">{label}</h3>
            <p className={`text-2xl font-bold mt-1 ${textColor}`}>
              {dashboardStats[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentCards.map(({ title, icon: Icon, items, render, emptyMsg }) => (
          <div
            key={title}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-slate-100">
                <Icon className="w-4 h-4 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            </div>
            <ul className="space-y-2">
              {items.length > 0 ? (
                items.map((item) => (
                  <li
                    key={item._id}
                    className="py-2.5 px-3 rounded-lg bg-slate-50 text-sm text-slate-700 border-l-2 border-slate-200"
                  >
                    {render(item)}
                  </li>
                ))
              ) : (
                <li className="py-4 text-center text-slate-500 text-sm">{emptyMsg}</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
