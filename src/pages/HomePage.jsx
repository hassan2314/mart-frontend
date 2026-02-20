import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "../components/Slider/Slider";
import Product from "../components/Products/Product";

const HomePage = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/products/`);
        setProducts(res.data.data || []);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <Slider products={products} />
      <Product products={products} />
    </>
  );
};

export default HomePage;
