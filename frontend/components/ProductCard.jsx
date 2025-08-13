"use client";
import React from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import { assets } from "@/assets/assets";
import { formatCurrency } from "@/lib/formatCurrency";

const ProductCard = ({ product }) => {
  const { currency, router } = useAppContext();
  
  // Lấy ảnh đầu tiên trong mảng image
  const imageUrl = product.image?.length
    ? product.image[0]
    : "/fallback.jpg";

  // Tính phần trăm giảm giá
  const calculateDiscountPercentage = () => {
    if (product.price && product.offerPrice && product.price > product.offerPrice) {
      const discount = ((product.price - product.offerPrice) / product.price) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  // Tạo rating giả lập nhất quán dựa trên product ID
  const getRating = () => {
    if (product.rating) return product.rating;
    
    // Tạo rating giả từ 3.5 - 5.0 dựa trên ID để nhất quán
    const seed = product._id ? product._id.slice(-2) : '00';
    const hash = parseInt(seed, 16) || 50;
    const rating = 3.5 + (hash % 16) / 10; // Từ 3.5 đến 5.0
    return Math.round(rating * 10) / 10; // Làm tròn 1 chữ số thập phân
  };

  // Tạo số lượng reviews giả lập
  const getReviewCount = () => {
    if (product.reviewCount) return product.reviewCount;
    
    // Tạo số review giả từ 5 - 200 dựa trên ID
    const seed = product._id ? product._id.slice(-3) : '000';
    const hash = parseInt(seed, 16) || 100;
    return Math.max(5, hash % 200); // Từ 5 đến 200 reviews
  };

  const discountPercentage = calculateDiscountPercentage();
  const rating = getRating();
  const reviewCount = getReviewCount();

  return (
    <div
      onClick={() => {
        router.push("/product/" + product._id);
        scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-2 w-full cursor-pointer"
    >
      <div className="cursor-pointer group relative bg-gray-100 rounded-lg w-full h-80 overflow-hidden">
        <Image
          src={imageUrl}
          alt={product?.name || "Product Image"}
          className="group-hover:scale-105 transition-transform duration-300 object-cover w-full h-full"
          width={800}
          height={800}
        />
        
        {/* Badge giảm giá */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
            -{discountPercentage}%
          </div>
        )}
        
        <button className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md">
          <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" />
        </button>
      </div>

      <p className="md:text-base font-medium pt-2 w-full truncate">
        {product.name}
      </p>
      
      <p className="w-full text-xs text-gray-500/70 max-sm:hidden truncate">
        {product.description}
      </p>
      
      {/* Rating động */}
      <div className="flex items-center gap-2">
        <p className="text-xs font-medium">{rating}</p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => {
            const starPosition = index + 1;
            return (
              <Image
                key={index}
                className="h-3 w-3"
                src={
                  rating >= starPosition
                    ? assets.star_icon        // Sao đầy: rating >= vị trí sao
                    : rating >= starPosition - 0.5
                    ? assets.star_half_icon        // Sao nửa 
                    : assets.star_dull_icon   // Sao trống
                }
                alt="star_icon"
              />
            );
          })}
        </div>
        {/* Hiển thị số lượng đánh giá (luôn hiển thị với dữ liệu giả) */}
        <p className="text-xs text-gray-500">({reviewCount})</p>
      </div>
      
      {/* Giá cả với giá gốc bị gạch ngang nếu có giảm giá */}
      <div className="flex items-end justify-between w-full mt-1">
        <div className="flex flex-col gap-1">
          <p className="text-base font-medium text-red-600">
            {formatCurrency(product.offerPrice)}
          </p>
          {/* Hiển thị giá gốc nếu có giảm giá */}
          {discountPercentage > 0 && product.price && (
            <p className="text-sm text-gray-500 line-through">
              {formatCurrency(product.price)}
            </p>
          )}
        </div>
        
        <button className="max-sm:hidden px-4 py-1.5 text-gray-500 border border-gray-500/20 rounded-full text-xs hover:bg-slate-50 transition">
          Mua ngay
        </button>
      </div>
    </div>
  );
};

export default ProductCard;