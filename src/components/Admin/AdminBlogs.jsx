import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminBlogs = () => {
  const { currentUser } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState(null); // For editing
  const [newBlogData, setNewBlogData] = useState({
    title: '',
    content: '',
    category: '',
    image: null,
  });
  const [editBlogData, setEditBlogData] = useState({ // For editing
    title: '',
    content: '',
    category: '',
    image: null, // New image file
    currentImage: '' // Current image URL
  });


  const fetchBlogs = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/blogs`,
        { withCredentials: true }
      );
      setBlogs(response.data.data);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError(err.response?.data?.message || 'Failed to fetch blogs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [currentUser]);

  const handleNewBlogChange = (e) => {
    const { name, value, files } = e.target;
    setNewBlogData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddBlogSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    for (const key in newBlogData) {
      if (newBlogData[key]) {
        formData.append(key, newBlogData[key]);
      }
    }
    // Add authorName if available from current user
    if (currentUser && currentUser.fullname) {
      formData.append('authorName', currentUser.fullname);
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/blogs`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setIsAddModalOpen(false);
      setNewBlogData({ title: '', content: '', category: '', image: null });
      fetchBlogs(); // Refresh blog list
    } catch (err) {
      console.error('Error adding blog:', err);
      setError(err.response?.data?.message || 'Failed to add blog.');
    }
  };

  // Edit Blog Handlers
  const openEditModal = (blog) => {
    setCurrentBlog(blog);
    setEditBlogData({
      title: blog.title,
      content: blog.content,
      category: blog.category,
      image: null, // No new image selected initially
      currentImage: blog.image // Store current image URL
    });
    setIsEditModalOpen(true);
  };

  const handleEditBlogChange = (e) => {
    const { name, value, files } = e.target;
    setEditBlogData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/blogs/${blogId}`,
        { withCredentials: true }
      );
      fetchBlogs();
    } catch (err) {
      console.error('Error deleting blog:', err);
      setError(err.response?.data?.message || 'Failed to delete blog.');
    }
  };

  const handleEditBlogSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('title', editBlogData.title);
    formData.append('content', editBlogData.content);
    formData.append('category', editBlogData.category);
    if (editBlogData.image) {
      formData.append('image', editBlogData.image);
    }
    // Add authorName if available from current user
    if (currentUser && currentUser.fullname) {
      formData.append('authorName', currentUser.fullname);
    }


    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/blogs/${currentBlog._id}`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      setIsEditModalOpen(false);
      setCurrentBlog(null);
      setEditBlogData({ title: '', content: '', category: '', image: null, currentImage: '' });
      fetchBlogs(); // Refresh blog list
    } catch (err) {
      console.error('Error updating blog:', err);
      setError(err.response?.data?.message || 'Failed to update blog.');
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

  if (error && !blogs.length) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Blog Management</h2>
        <p className="text-slate-600 mt-1">Manage your blog posts here.</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Add New Blog
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">All Blogs</h3>
        </div>
        {blogs.length === 0 ? (
          <p className="p-6 text-slate-500 text-center">No blogs found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Image</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Title</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Category</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Author</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      {blog.image && (
                        <img src={blog.image} alt={blog.title} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{blog.title}</td>
                    <td className="py-3 px-4 text-slate-600">{blog.category}</td>
                    <td className="py-3 px-4 text-slate-600">{blog.authorName}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openEditModal(blog)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium mr-2 hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog._id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600"
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

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Blog</h3>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              &times;
            </button>
            <form onSubmit={handleAddBlogSubmit} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={newBlogData.title}
                  onChange={handleNewBlogChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-slate-700">Content</label>
                <textarea
                  name="content"
                  id="content"
                  value={newBlogData.content}
                  onChange={handleNewBlogChange}
                  rows="5"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700">Category</label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={newBlogData.category}
                  onChange={handleNewBlogChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-slate-700">Image</label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  onChange={handleNewBlogChange}
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept="image/*"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Add Blog
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Blog Modal */}
      {isEditModalOpen && currentBlog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Blog: {currentBlog.title}</h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              &times;
            </button>
            <form onSubmit={handleEditBlogSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-title" className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  type="text"
                  name="title"
                  id="edit-title"
                  value={editBlogData.title}
                  onChange={handleEditBlogChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-content" className="block text-sm font-medium text-slate-700">Content</label>
                <textarea
                  name="content"
                  id="edit-content"
                  value={editBlogData.content}
                  onChange={handleEditBlogChange}
                  rows="5"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-category" className="block text-sm font-medium text-slate-700">Category</label>
                <input
                  type="text"
                  name="category"
                  id="edit-category"
                  value={editBlogData.category}
                  onChange={handleEditBlogChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Image</label>
                {editBlogData.currentImage && (
                  <img src={editBlogData.currentImage} alt="Current" className="w-24 h-24 object-cover rounded-lg mb-2" />
                )}
                <label htmlFor="edit-image-file" className="block text-sm font-medium text-slate-700 mt-2">New Image (optional)</label>
                <input
                  type="file"
                  name="image"
                  id="edit-image-file"
                  onChange={handleEditBlogChange}
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept="image/*"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Update Blog
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;