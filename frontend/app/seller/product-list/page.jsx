"use client";
import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import { formatCurrency } from "@/lib/formatCurrency";

const ProductList = () => {
  const { router } = useAppContext();
  const [products, setProducts] = useState([]);
  const [discountPercent, setDiscountPercent] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    offerPrice: "",
    stock: "",
  });

  // Trạng thái Lọc và Tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);

  const fetchSellerProduct = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/list`
      );
      if (response.data.success) {
        const productsData = response.data.data || [];
        setProducts(productsData);
      } else {
        toast.error("Lấy danh sách sản phẩm thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối tới máy chủ");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    const percent = parseFloat(discountPercent);
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      toast.error("Vui lòng nhập phần trăm hợp lệ (1 - 100)");
      return;
    }

    try {
      // Lấy token từ localStorage hoặc context
      const token = localStorage.getItem("token"); // hoặc từ useAppContext()

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        router.push("/login");
        return;
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/discount-all`,
        {
          discountPercent: percent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.data.success) {
        toast.success(`Đã giảm ${percent}% tất cả sản phẩm`);
        fetchSellerProduct();
        setDiscountPercent("");
      } else {
        toast.error(res.data.message || "Áp dụng giảm giá thất bại");
      }
    } catch (err) {
      console.error("Discount error:", err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        toast.error("Lỗi khi gửi yêu cầu giảm giá");
      }
    }
  };

  // Lấy các danh mục không trùng lặp để hiển thị trong bộ lọc dropdown
  const categories = useMemo(() => {
    const cats = [
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ];
    return cats.sort();
  }, [products]);

  // Lọc và sắp xếp sản phẩm
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Tìm kiếm theo tên
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo danh mục
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Lọc theo giá
    if (priceRange.min || priceRange.max) {
      filtered = filtered.filter((product) => {
        const price = Number(product.offerPrice);
        const min = priceRange.min ? Number(priceRange.min) : 0;
        const max = priceRange.max ? Number(priceRange.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    // Sắp xếp sản phẩm
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-asc":
          return Number(a.offerPrice) - Number(b.offerPrice);
        case "price-desc":
          return Number(b.offerPrice) - Number(a.offerPrice);
        case "stock":
          return Number(b.stock || 0) - Number(a.stock || 0);
        case "newest":
          return -1;
        // return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("name");
  };

  const removeProduct = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn xoá sản phẩm này?")) return;

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        router.push("/login");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/delete`,
        {
          id: productId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        toast.error("Xoá sản phẩm thất bại");
      }
    } catch (err) {
      console.error("Delete error:", err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        toast.error("Đã xảy ra lỗi khi xoá sản phẩm");
      }
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      category: product.category,
      offerPrice: product.offerPrice,
      stock: product.stock || 0,
    });
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditForm({ name: "", category: "", offerPrice: "", stock: "" });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Vui lòng đăng nhập lại");
        router.push("/login");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/update`,
        {
          id: editingProduct._id,
          ...editForm,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật sản phẩm thành công");
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editingProduct._id ? { ...p, ...editForm } : p
          )
        );
        closeEditModal();
      } else {
        toast.error(response.data.message || "Cập nhật sản phẩm thất bại");
      }
    } catch (err) {
      console.error("Update error:", err);
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        toast.error("Đã xảy ra lỗi khi cập nhật sản phẩm");
      }
    }
  };

  useEffect(() => {
    fetchSellerProduct();
  }, []);

  return (
    <div className="flex-1 min-h-screen flex flex-col">
      {loading ? (
        <Loading />
      ) : (
        <div className="flex-1 w-full p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
                Danh sách sản phẩm
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Quản lý tất cả sản phẩm của bạn ({filteredProducts.length} sản
                phẩm)
              </p>
            </div>
            {/* Giảm giá hàng loạt */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Giảm giá hàng loạt
              </h3>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Nhập % giảm (VD: 20)"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
                />
                <button
                  onClick={handleApplyDiscount}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Áp dụng giảm giá
                </button>
              </div>
            </div>

            {/* Phần Tìm kiếm và Lọc */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6 p-4">
              {/* Thanh tìm kiếm */}
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-150 flex items-center gap-2 md:w-auto w-full justify-center"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
                </button>
              </div>

              {/* Tùy chọn bộ lọc */}
              {showFilters && (
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Bộ lọc danh mục */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Danh mục
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Tất cả danh mục</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Khoảng giá */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá từ
                      </label>
                      <input
                        type="number"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            min: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Giá đến
                      </label>
                      <input
                        type="number"
                        placeholder="∞"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange((prev) => ({
                            ...prev,
                            max: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Sắp xếp theo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sắp xếp theo
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="name">Tên A-Z</option>
                        <option value="price-asc">Giá thấp đến cao</option>
                        <option value="price-desc">Giá cao đến thấp</option>
                        <option value="stock">Tồn kho nhiều nhất</option>
                        <option value="newest">Mới nhất</option>
                      </select>
                    </div>
                  </div>

                  {/* Nút Xóa Bộ lọc */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-150"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                        STT
                      </th>
                      <th className="pl-3 pr-1 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-0">
                        Sản phẩm
                      </th>
                      <th className="pl-1 pr-3 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                        Danh mục
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                        Giá
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                        Kho
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(filteredProducts) &&
                    filteredProducts.length > 0 ? (
                      filteredProducts.map((product, index) => (
                        <tr
                          key={product._id || index}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="pl-3 pr-1 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex-shrink-0 w-16 h-16">
                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                  <Image
                                    src={product.image?.[0] || "/fallback.jpg"}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                    width={64}
                                    height={64}
                                  />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {product.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="pl-1 pr-3 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.category}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(product.offerPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center space-x-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/product/${product._id}`)
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition-colors duration-150"
                              >
                                Xem
                              </button>
                              <button
                                onClick={() => removeProduct(product._id)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <p className="text-lg font-medium">
                              {searchTerm ||
                              selectedCategory ||
                              priceRange.min ||
                              priceRange.max
                                ? "Không tìm thấy sản phẩm nào"
                                : "Chưa có sản phẩm nào"}
                            </p>
                            <p className="text-sm mt-1">
                              {searchTerm ||
                              selectedCategory ||
                              priceRange.min ||
                              priceRange.max
                                ? "Thử thay đổi điều kiện tìm kiếm"
                                : "Thêm sản phẩm đầu tiên của bạn"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {Array.isArray(filteredProducts) &&
                filteredProducts.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredProducts.map((product, index) => (
                      <div key={product._id || index} className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                              <Image
                                src={product.image?.[0] || "/fallback.jpg"}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                width={64}
                                height={64}
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h3>
                              <span className="text-xs text-gray-500 ml-2">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              <span className="inline-block">
                                {product.category}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm">
                                <span className="font-medium text-gray-900">
                                  {formatCurrency(product.offerPrice)}
                                </span>
                                <span className="text-gray-500">
                                  Kho: {product.stock || 0}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3 flex space-x-2">
                              <button
                                onClick={() => openEditModal(product)}
                                className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors duration-150"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() =>
                                  router.push(`/product/${product._id}`)
                                }
                                className="flex-1 px-3 py-2 bg-orange-600 text-white text-xs font-medium rounded-md hover:bg-orange-700 transition-colors duration-150"
                              >
                                Xem
                              </button>
                              <button
                                onClick={() => removeProduct(product._id)}
                                className="flex-1 px-3 py-2 bg-red-600 text-white text-xs font-medium rounded-md hover:bg-red-700 transition-colors duration-150"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium">
                        {searchTerm ||
                        selectedCategory ||
                        priceRange.min ||
                        priceRange.max
                          ? "Không tìm thấy sản phẩm nào"
                          : "Chưa có sản phẩm nào"}
                      </p>
                      <p className="text-sm mt-1">
                        {searchTerm ||
                        selectedCategory ||
                        priceRange.min ||
                        priceRange.max
                          ? "Thử thay đổi điều kiện tìm kiếm"
                          : "Thêm sản phẩm đầu tiên của bạn"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chỉnh sửa sản phẩm
                </h3>
                <button
                  onClick={closeEditModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá
                  </label>
                  <input
                    type="number"
                    value={editForm.offerPrice}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        offerPrice: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng kho
                  </label>
                  <input
                    type="number"
                    value={editForm.stock}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-150"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-150"
                  >
                    Cập nhật
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductList;
