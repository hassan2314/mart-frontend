import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const AdminProducts = () => {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null); // For editing
  const [newProductData, setNewProductData] = useState({
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null,
  });
  const [editProductData, setEditProductData] = useState({ // For editing
    name: '',
    description: '',
    price: '',
    quantity: '',
    image: null, // New image file
    currentImage: '' // Current image URL
  });


  const fetchProducts = async () => {
    if (!currentUser || currentUser.role !== 'admin') {
      setError('You are not authorized to view this page.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/products`,
        { withCredentials: true }
      );
      setProducts(response.data.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentUser]);

  const handleNewProductChange = (e) => {
    const { name, value, files } = e.target;
    setNewProductData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    for (const key in newProductData) {
      if (newProductData[key]) {
        formData.append(key, newProductData[key]);
      }
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/products`,
        formData,
        {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      setIsAddModalOpen(false);
      setNewProductData({ name: '', description: '', price: '', quantity: '', image: null });
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error('Error adding product:', err);
      setError(err.response?.data?.message || 'Failed to add product.');
    }
  };

  // Edit Product Handlers
  const openEditModal = (product) => {
    setCurrentProduct(product);
    setEditProductData({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      image: null, // No new image selected initially
      currentImage: product.image // Store current image URL
    });
    setIsEditModalOpen(true);
  };

  const handleEditProductChange = (e) => {
    const { name, value, files } = e.target;
    setEditProductData((prevData) => ({
      ...prevData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const productUpdates = {
        name: editProductData.name,
        description: editProductData.description,
        price: editProductData.price,
        quantity: editProductData.quantity,
      };

      // Update product details (excluding image)
      await axios.put(
        `${import.meta.env.VITE_API_URL}/products/${currentProduct._id}`,
        productUpdates,
        { withCredentials: true }
      );

      // If a new image is selected, upload it separately
      if (editProductData.image) {
        const formData = new FormData();
        formData.append('image', editProductData.image);
        await axios.patch(
          `${import.meta.env.VITE_API_URL}/products/${currentProduct._id}`,
          formData,
          {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
      }

      setIsEditModalOpen(false);
      setCurrentProduct(null);
      setEditProductData({ name: '', description: '', price: '', quantity: '', image: null, currentImage: '' });
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err.response?.data?.message || 'Failed to update product.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/products/${productId}`,
        { withCredentials: true }
      );
      fetchProducts(); // Refresh product list
    } catch (err) {
      console.error('Error deleting product:', err);
      setError(err.response?.data?.message || 'Failed to delete product.');
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

  if (error && !products.length) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Product Management</h2>
        <p className="text-slate-600 mt-1">Manage your products here.</p>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Add New Product
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800">All Products</h3>
        </div>
        {products.length === 0 ? (
          <p className="p-6 text-slate-500 text-center">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Image</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Name</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Price</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Quantity</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{product.name}</td>
                    <td className="py-3 px-4 text-slate-600">${product.price}</td>
                    <td className="py-3 px-4 text-slate-600">{product.quantity}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openEditModal(product)}
                        className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium mr-2 hover:bg-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
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

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full relative border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Add New Product</h3>
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              &times;
            </button>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newProductData.name}
                  onChange={handleNewProductChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  id="description"
                  value={newProductData.description}
                  onChange={handleNewProductChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-slate-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    id="price"
                    value={newProductData.price}
                    onChange={handleNewProductChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-700">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    value={newProductData.quantity}
                    onChange={handleNewProductChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="image" className="block text-sm font-medium text-slate-700">Image</label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  onChange={handleNewProductChange}
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept="image/*"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Add Product
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && currentProduct && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-lg w-full relative border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6">Edit Product: {currentProduct.name}</h3>
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              &times;
            </button>
            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-slate-700">Name</label>
                <input
                  type="text"
                  name="name"
                  id="edit-name"
                  value={editProductData.name}
                  onChange={handleEditProductChange}
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="edit-description" className="block text-sm font-medium text-slate-700">Description</label>
                <textarea
                  name="description"
                  id="edit-description"
                  value={editProductData.description}
                  onChange={handleEditProductChange}
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-price" className="block text-sm font-medium text-slate-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    id="edit-price"
                    value={editProductData.price}
                    onChange={handleEditProductChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label htmlFor="edit-quantity" className="block text-sm font-medium text-slate-700">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    id="edit-quantity"
                    value={editProductData.quantity}
                    onChange={handleEditProductChange}
                    className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Image</label>
                {editProductData.currentImage && (
                  <img src={editProductData.currentImage} alt="Current" className="w-24 h-24 object-cover rounded-lg mb-2" />
                )}
                <label htmlFor="edit-image-file" className="block text-sm font-medium text-slate-700 mt-2">New Image (optional)</label>
                <input
                  type="file"
                  name="image"
                  id="edit-image-file"
                  onChange={handleEditProductChange}
                  className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept="image/*"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Update Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;