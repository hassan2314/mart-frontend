import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const BlogPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/blogs/${id}`
        );
        setBlog(res.data.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError(err.response?.status === 404 ? "Blog not found" : "Failed to load blog");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBlog();
  }, [id]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen p-6 md:p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {error || "Blog not found"}
        </h1>
        <Link
          to="/smart-cooking"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          ← Back to SmartCooking Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-10 max-w-4xl mx-auto">
      <Link
        to="/smart-cooking"
        className="inline-flex items-center text-red-600 hover:text-red-700 mb-6 font-medium"
      >
        ← Back to SmartCooking Blog
      </Link>

      <article className="bg-white rounded-lg shadow-md overflow-hidden">
        {blog.image && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-6 md:p-8">
          <span className="text-sm text-gray-500 uppercase tracking-wide">
            {blog.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
            {blog.title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-gray-600">
            <span>
              {blog.author?.fullname || blog.authorName || "Anonymous"}
            </span>
            <span>•</span>
            <time>{formatDate(blog.createdAt)}</time>
          </div>
          <div className="mt-6 prose prose-lg max-w-none">
            <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {blog.content}
            </p>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPage;
