"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { assets } from "@/assets/assets";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/formatCurrency";

const ProductClient = () => {
  const { addToCart, products } = useAppContext();
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tạo rating giả lập nhất quán dựa trên product ID
  const getRating = (productData) => {
    if (productData?.rating) return productData.rating;

    // Tạo rating giả từ 3.5 - 5.0 dựa trên ID để nhất quán
    const seed = productData?._id ? productData._id.slice(-2) : "00";
    const hash = parseInt(seed, 16) || 50;
    const rating = 3.5 + (hash % 16) / 10; // Từ 3.5 đến 5.0
    return Math.round(rating * 10) / 10; // Làm tròn 1 chữ số thập phân
  };

  // Tạo số lượng reviews giả lập
  const getReviewCount = (productData) => {
    if (productData?.reviewCount) return productData.reviewCount;

    // Tạo số review giả từ 15 - 500 dựa trên ID
    const seed = productData?._id ? productData._id.slice(-3) : "000";
    const hash = parseInt(seed, 16) || 100;
    return Math.max(15, hash % 500); // Từ 15 đến 500 reviews
  };

  // Tính phần trăm giảm giá
  const calculateDiscountPercentage = (productData) => {
    if (
      productData?.price &&
      productData?.offerPrice &&
      productData.price > productData.offerPrice
    ) {
      const discount =
        ((productData.price - productData.offerPrice) / productData.price) *
        100;
      return Math.round(discount);
    }
    return 0;
  };

  useEffect(() => {
    if (!id) return;

    const getProduct = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/product/get/${id}`
        );
        if (res.data.success) {
          setProduct(res.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    getProduct();
  }, [id]);

  useEffect(() => {
    if (product?.image?.length > 0) {
      setMainImage(product.image[0]);
    }
  }, [product]);

  if (loading) return <Loading />;
  if (!product)
    return <div className="p-10 text-center">Không tìm thấy sản phẩm.</div>;

  const productImages = product.image || [];
  const rating = getRating(product);
  const reviewCount = getReviewCount(product);
  const discountPercentage = calculateDiscountPercentage(product);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* ===== HÌNH ẢNH SẢN PHẨM ===== */}
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4">
              {mainImage && (
                <Image
                  src={mainImage}
                  alt="Product"
                  width={1280}
                  height={720}
                  className="w-full h-auto object-cover mix-blend-multiply"
                />
              )}
            </div>
            <div className="grid grid-cols-4 gap-4">
              {productImages.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setMainImage(img)}
                  className={`cursor-pointer bg-gray-500/10 rounded-lg overflow-hidden border-2 transition-colors ${
                    mainImage === img
                      ? "border-orange-500"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx}`}
                    width={1280}
                    height={720}
                    className="w-full h-auto object-cover mix-blend-multiply"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ===== THÔNG TIN SẢN PHẨM ===== */}
          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800/90 mb-4">
              {product.name}
            </h1>

            {/* Rating động với số sao thực tế */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const starPosition = index + 1;
                  return (
                    <Image
                      key={index}
                      className="h-4 w-4"
                      src={
                        rating >= starPosition
                          ? assets.star_icon // Sao đầy: rating >= vị trí sao
                          : rating >= starPosition - 0.5
                          ? assets.star_half_icon // Sao nửa
                          : assets.star_dull_icon // Sao trống
                      }
                      alt="star_icon"
                    />
                  );
                })}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {rating}
              </span>
              <span className="text-sm text-gray-500">
                ({reviewCount} đánh giá)
              </span>
            </div>

            {/* Giá với badge giảm giá - ĐẶT TRƯỚC DESCRIPTION */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-medium text-red-600">
                    {formatCurrency(product.offerPrice)}
                  </p>
                  {discountPercentage > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-600 text-sm font-medium rounded-md">
                      Tiết kiệm {discountPercentage}%
                    </span>
                  )}
                </div>
                {/* Hiển thị giá gốc nếu có giảm giá */}
                {discountPercentage > 0 && product.price && (
                  <p className="text-lg text-gray-500 line-through">
                    Giá gốc: {formatCurrency(product.price)}
                  </p>
                )}
              </div>
            </div>

            <p className="text-gray-600 mb-6">{product.description}</p>

            <hr className="bg-gray-600 my-6" />

            {/* ===== THÔNG TIN CHI TIẾT ===== */}
            <table className="table-auto border-collapse w-full max-w-80">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="text-gray-600 font-medium py-2">
                    Thương hiệu
                  </td>
                  <td className="text-gray-800/70 py-2">Mortar</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="text-gray-600 font-medium py-2">Màu sắc</td>
                  <td className="text-gray-800/70 py-2">Nhiều màu</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="text-gray-600 font-medium py-2">Loại</td>
                  <td className="text-gray-800/70 py-2">{product.category}</td>
                </tr>
                {/* <tr className="border-b border-gray-200">
                  <td className="text-gray-600 font-medium py-2">Đánh giá</td>
                  <td className="text-gray-800/70 py-2">
                    {rating} ⭐ ({reviewCount} reviews)
                  </td>
                </tr>
                {discountPercentage > 0 && (
                  <tr>
                    <td className="text-gray-600 font-medium py-2">Giảm giá</td>
                    <td className="text-red-600 font-medium py-2">-{discountPercentage}%</td>
                  </tr>
                )} */}
              </tbody>
            </table>

            {/* ===== BUTTONS ===== */}
            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={() => addToCart(product._id)}
                className="w-full py-3.5 bg-gray-100 text-gray-800/80 hover:bg-gray-200 transition rounded-lg font-medium"
              >
                Thêm vào giỏ
              </button>
              <button
                onClick={() => {
                  addToCart(product._id);
                  router.push("/cart");
                }}
                className="w-full py-3.5 bg-orange-500 text-white hover:bg-orange-600 transition rounded-lg font-medium"
              >
                Mua ngay
              </button>
            </div>
          </div>
        </div>

        {/* ===== SẢN PHẨM NỔI BẬT ===== */}
        <div className="flex flex-col items-center">
          <p className="text-3xl font-medium mt-16">
            <span className="text-orange-600">Sản phẩm</span> nổi bật
          </p>
          <div className="w-28 h-0.5 bg-orange-600 mt-2" />

          <div className="relative w-full mt-6 pb-14 group">
            {/* Nút trái */}
            <button
              onClick={() =>
                document
                  .getElementById("scroll-container")
                  .scrollBy({ left: -300, behavior: "smooth" })
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 flex items-center justify-center text-gray-600 hover:text-orange-500"
            >
              <svg
                className="w-5 h-5 font-bold"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {/* Danh sách sản phẩm trượt ngang */}
            <div
              id="scroll-container"
              className="flex overflow-x-auto space-x-4 scrollbar-hide px-16"
              style={{ scrollbarWidth: "none" }}
            >
              {products.slice(0, 10).map((p, i) => (
                <div key={i} className="flex-shrink-0 w-[200px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>

            {/* Nút phải */}
            <button
              onClick={() =>
                document
                  .getElementById("scroll-container")
                  .scrollBy({ left: 300, behavior: "smooth" })
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 rounded-full hover:bg-white hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 flex items-center justify-center text-gray-600 hover:text-orange-500"
            >
              <svg
                className="w-5 h-5 font-bold"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductClient;
