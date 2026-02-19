import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminUsers = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/users/users`,
        { withCredentials: true }
      );
      setUsers(response.data.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/users/users/${userId}`,
        { role: newRole },
        { withCredentials: true }
      );
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error updating user role:', err);
      setError(err.response?.data?.message || 'Failed to update user role.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/users/${userId}`,
        { withCredentials: true }
      );
      fetchUsers(); // Refresh user list
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
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

  if (error && !users.length) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
        <p className="text-slate-600 mt-1">Manage your users here.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">All Users</h3>
        </div>
        {users.length === 0 ? (
          <p className="p-6 text-slate-500 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Avatar</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Full Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Username</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Email</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Role</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.fullname} className="w-10 h-10 object-cover rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-medium">
                          {user.fullname?.charAt(0) || '?'}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{user.fullname}</td>
                    <td className="py-3 px-4 text-slate-600">{user.username}</td>
                    <td className="py-3 px-4 text-slate-600">{user.email}</td>
                    <td className="py-3 px-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user._id, e.target.value)}
                        className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={user._id === currentUser._id}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      {user._id === currentUser._id && <span className="ml-2 text-sm text-slate-500">(You)</span>}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={user._id === currentUser._id}
                      >
                        Delete
                      </button>
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

export default AdminUsers;