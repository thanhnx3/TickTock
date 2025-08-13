"use client";
import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";

const HomeProducts = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/list`
        );
        const data = await res.json();

        if (data.success) {
          setProducts(data.data);
        } else {
          console.error("Lỗi từ server:", data.message);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 8);
  };

  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Danh sách sản phẩm mới
      </h2>
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, visibleCount).map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {visibleCount < products.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleShowMore}
            className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};

export default HomeProducts;
