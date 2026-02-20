import React from 'react';

const Product = ({ products = [] }) => {
  const slides = products;
  return (
  
    <div className="py-16 bg-gray-100">
      <h2 className="text-center text-3xl font-bold mb-10 text-gray-800">Consumer Products</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {/* {[
          { src: "./bakistry.png", title: "Whole Chicken, Designer Cuts" },
          { src: "./breadedselection.png", title: "Breaded Selection" },
          { src: "./deline.png", title: "Kabab Temptations" },
          { src: "./kababtemptations.png", title: "Deline" },
          { src: "./premiumchicken.png", title: "Topping & Fillingz" },
          { src: "./samosa.png", title: "Signature Samosas and Spring Roll" },
          { src: "./stok.png", title: "Bakistry" },
          { src: "./tnf.png", title: "Stok" },
        ] */}
        {slides.map((item, idx) => (
          <div key={item._id || idx} className="text-center cursor-pointer hover:scale-105 transition-transform">
            <img src={item.image} alt={item.name} className="mx-auto w-40 md:w-48" loading="lazy" />
            <p className="mt-2 text-lg font-semibold text-red-600">{item.name}</p>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
            <a href="/products" className="text-red-600 font-bold text-lg hover:underline">See more &gt;</a>
        </div>
    </div>
      
        
  );
};

export default Product;
