"use client";
import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, PauseCircle, PlayCircle, Search, XCircle, Copy, Percent, DollarSign, Users, Calendar } from "lucide-react";

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showStats, setShowStats] = useState(false);
  const [selectedCouponStats, setSelectedCouponStats] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    maxDiscount: "",
    minOrderValue: "",
    maxUses: "",
    maxUsesPerUser: "1",
    startDate: "",
    expiryDate: "",
    applicableProducts: [],
    applicableCategories: [],
  });

  // API Base URL - sử dụng biến môi trường
  const API_BASE = `${process.env.NEXT_PUBLIC_API_URL}/api/coupon`;

  // Lấy token từ localStorage hoặc nơi bạn lưu trữ
  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  // Copy to clipboard function
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
  };

  // Fetch coupons from API
  const fetchCoupons = async (page = 1, search = "", status = "all") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        search,
        status,
      });

      const response = await fetch(`${API_BASE}/list?${params}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setCoupons(data.coupons);
        setTotalPages(data.pagination.pages);
      } else {
        alert(data.message || "Không thể tải danh sách mã giảm giá");
      }
    } catch (error) {
      console.error("Error fetching coupons:", error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // Create or update coupon
  const saveCoupon = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (
        !formData.code ||
        !formData.description ||
        !formData.discountValue ||
        !formData.expiryDate
      ) {
        alert("Vui lòng điền đầy đủ thông tin bắt buộc");
        return;
      }

      // Prepare data
      const couponData = {
        ...formData,
        discountValue: parseFloat(formData.discountValue),
        maxDiscount: formData.maxDiscount
          ? parseFloat(formData.maxDiscount)
          : null,
        minOrderValue: formData.minOrderValue
          ? parseFloat(formData.minOrderValue)
          : 0,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        maxUsesPerUser: parseInt(formData.maxUsesPerUser),
        startDate: formData.startDate || new Date().toISOString(),
        expiryDate: new Date(formData.expiryDate).toISOString(),
      };

      const url = editingCoupon
        ? `${API_BASE}/${editingCoupon._id}`
        : `${API_BASE}/create`;

      const method = editingCoupon ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setShowModal(false);
        resetForm();
        fetchCoupons(currentPage, searchTerm, statusFilter);
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error saving coupon:", error);
      alert("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // Delete coupon
  const deleteCoupon = async (id) => {
    if (!confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        fetchCoupons(currentPage, searchTerm, statusFilter);
      } else {
        alert(data.message || "Không thể xóa mã giảm giá");
      }
    } catch (error) {
      console.error("Error deleting coupon:", error);
      alert("Lỗi kết nối server");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "percentage",
      discountValue: "",
      maxDiscount: "",
      minOrderValue: "",
      maxUses: "",
      maxUsesPerUser: "1",
      startDate: "",
      expiryDate: "",
      applicableProducts: [],
      applicableCategories: [],
    });
    setEditingCoupon(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const viewCouponStats = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();
      if (data.success && data.coupon) {
        setSelectedCouponStats(data.coupon);
        setShowStats(true);
      } else {
        alert(data.message || "Không thể xem thống kê mã");
      }
    } catch (error) {
      console.error("Lỗi xem thống kê:", error);
      alert("Lỗi khi lấy thông tin mã");
    }
  };

  // Open edit modal
  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      minOrderValue: coupon.minOrderValue?.toString() || "",
      maxUses: coupon.maxUses?.toString() || "",
      maxUsesPerUser: coupon.maxUsesPerUser.toString(),
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().split("T")[0]
        : "",
      expiryDate: new Date(coupon.expiryDate).toISOString().split("T")[0],
      applicableProducts: coupon.applicableProducts || [],
      applicableCategories: coupon.applicableCategories || [],
    });
    setShowModal(true);
  };

  const toggleCouponStatus = async (id, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE}/${id}/toggle`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Cập nhật trạng thái thành công!");
        fetchCoupons(currentPage, searchTerm, statusFilter);
      } else {
        alert(data.message || "Không thể cập nhật trạng thái");
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      alert("Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  // Calculate usage percentage
  const getUsagePercentage = (used, max) => {
    if (!max) return 0;
    return Math.min((used / max) * 100, 100);
  };

  // Load coupons when component mounts
  useEffect(() => {
    fetchCoupons(currentPage, searchTerm, statusFilter);
  }, [currentPage, searchTerm, statusFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Quản lý mã giảm giá
        </h1>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm mã giảm giá..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="inactive">Tạm dừng</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả loại</option>
                <option value="percentage">Phần trăm</option>
                <option value="fixed">Số tiền</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo mã giảm giá
          </button>
        </div>

        {/* Coupons Grid */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Đang tải...</div>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500">Không có mã giảm giá nào</div>
            </div>
          ) : (
            <table className="min-w-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/4">
                    Mã giảm giá
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Loại & Giá trị
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/5">
                    Sử dụng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Hạn sử dụng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-medium text-gray-500 uppercase tracking-wider w-40">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons.map((coupon) => (
                  <tr
                    key={coupon._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Cột 1: Mã giảm giá */}
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-mono font-bold text-xl text-gray-900">
                            {coupon.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(coupon.code)}
                            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-100 rounded"
                            title="Sao chép mã"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {coupon.description}
                        </p>
                      </div>
                    </td>

                    {/* Cột 2: Loại & Giá trị */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        {coupon.discountType === "percentage" ? (
                          <Percent className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <DollarSign className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        )}
                        <div className="flex flex-col min-h-[3rem] justify-center">
                          <span className="font-bold text-lg text-gray-900 leading-tight">
                            {coupon.discountType === "percentage"
                              ? `${coupon.discountValue}%`
                              : formatCurrency(coupon.discountValue)}
                          </span>
                          {coupon.discountType === "percentage" &&
                            coupon.maxDiscount && (
                              <div className="text-sm text-gray-500 leading-tight">
                                Tối đa {formatCurrency(coupon.maxDiscount)}
                              </div>
                            )}
                          {coupon.minOrderValue > 0 && (
                            <div className="text-sm text-gray-500 leading-tight">
                              Đơn tối thiểu:{" "}
                              {formatCurrency(coupon.minOrderValue)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cột 3: Sử dụng */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span className="font-bold text-lg text-gray-900">
                          {coupon.totalUsed || 0}
                          {coupon.maxUses && `/${coupon.maxUses}`}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">
                        {coupon.maxUsesPerUser} lượt/người
                      </div>
                      {coupon.maxUses && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${getUsagePercentage(
                                coupon.totalUsed || 0,
                                coupon.maxUses
                              )}%`,
                            }}
                          ></div>
                        </div>
                      )}
                      <div className="text-sm text-gray-500">
                        {coupon.maxUses
                          ? `${getUsagePercentage(
                              coupon.totalUsed || 0,
                              coupon.maxUses
                            ).toFixed(0)}% đã sử dụng`
                          : "Không giới hạn"}
                      </div>
                    </td>

                    {/* Cột 4: Hạn sử dụng */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-base text-gray-900">
                          {formatDate(coupon.expiryDate)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(coupon.expiryDate) < new Date()
                          ? "Đã hết hạn"
                          : "Còn hiệu lực"}
                      </div>
                    </td>

                    {/* Cột 5: Trạng thái */}
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                          coupon.isExpired ||
                          new Date(coupon.expiryDate) < new Date()
                            ? "bg-red-100 text-red-800"
                            : coupon.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {coupon.isExpired ||
                        new Date(coupon.expiryDate) < new Date()
                          ? "Hết hạn"
                          : coupon.isActive
                          ? "Hoạt động"
                          : "Tạm dừng"}
                      </span>
                    </td>

                    {/* Cột 6: Thao tác */}
                    <td className="px-6 py-5 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => viewCouponStats(coupon._id)}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                          title="Xem thống kê"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Nút Kích hoạt/Tạm dừng */}
                        {!(
                          coupon.isExpired ||
                          new Date(coupon.expiryDate) < new Date()
                        ) && (
                          <button
                            onClick={() =>
                              toggleCouponStatus(coupon._id, coupon.isActive)
                            }
                            className={`p-2 rounded-lg transition-colors ${
                              coupon.isActive
                                ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                                : "text-green-600 hover:text-green-900 hover:bg-green-50"
                            }`}
                            title={coupon.isActive ? "Tạm dừng" : "Kích hoạt"}
                          >
                            {coupon.isActive ? (
                              <PauseCircle className="w-4 h-4" />
                            ) : (
                              <PlayCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => openEditModal(coupon)}
                          className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCoupon(coupon._id)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded ${
                  currentPage === page
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {/* ===== STATS MODAL - Improved Version ===== */}
      {showStats && selectedCouponStats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Thống kê mã: {selectedCouponStats.code}
              </h2>
              <button
                onClick={() => setShowStats(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Usage Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={20} className="text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Lượt sử dụng
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedCouponStats.currentUses || 0}
                    {selectedCouponStats.maxUses && (
                      <span className="text-sm text-gray-500">
                        /{selectedCouponStats.maxUses}
                      </span>
                    )}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={20} className="text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Tiết kiệm
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(
                      (selectedCouponStats.currentUses || 0) *
                        (selectedCouponStats.discountType === "fixed"
                          ? selectedCouponStats.discountValue
                          : selectedCouponStats.maxDiscount || 50000)
                    )}
                  </div>
                </div>
              </div>

              {/* Coupon Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mô tả:</span>
                  <span className="font-medium text-right max-w-xs">
                    {selectedCouponStats.description}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Loại giảm giá:</span>
                  <span className="font-medium">
                    {selectedCouponStats.discountType === "percentage"
                      ? "Phần trăm"
                      : "Số tiền cố định"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Giá trị:</span>
                  <span className="font-medium">
                    {selectedCouponStats.discountType === "percentage"
                      ? `${selectedCouponStats.discountValue}%`
                      : formatCurrency(selectedCouponStats.discountValue)}
                  </span>
                </div>

                {selectedCouponStats.minOrderValue > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đơn hàng tối thiểu:</span>
                    <span className="font-medium">
                      {formatCurrency(selectedCouponStats.minOrderValue)}
                    </span>
                  </div>
                )}

                {selectedCouponStats.maxDiscount &&
                  selectedCouponStats.discountType === "percentage" && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Giảm tối đa:</span>
                      <span className="font-medium">
                        {formatCurrency(selectedCouponStats.maxDiscount)}
                      </span>
                    </div>
                  )}

                {selectedCouponStats.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-medium">
                      {formatDate(selectedCouponStats.createdAt)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Ngày bắt đầu:</span>
                  <span className="font-medium">
                    {formatDate(selectedCouponStats.startDate)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Hạn sử dụng:</span>
                  <span className="font-medium">
                    {formatDate(selectedCouponStats.expiryDate)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span
                    className={`font-medium px-2 py-1 rounded-full text-xs ${
                      new Date(selectedCouponStats.expiryDate) < new Date()
                        ? "bg-red-100 text-red-700"
                        : selectedCouponStats.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {new Date(selectedCouponStats.expiryDate) < new Date()
                      ? "Hết hạn"
                      : selectedCouponStats.isActive
                      ? "Đang hoạt động"
                      : "Tạm dừng"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              {selectedCouponStats.maxUses && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Tiến độ sử dụng</span>
                    <span>
                      {Math.round(
                        ((selectedCouponStats.currentUses || 0) /
                          selectedCouponStats.maxUses) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          ((selectedCouponStats.currentUses || 0) /
                            selectedCouponStats.maxUses) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 pb-6">
              <button
                onClick={() => setShowStats(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== CREATE/EDIT COUPON MODAL ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold mb-4">
                  {editingCoupon ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors mb-4"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Coupon Code & Discount Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã giảm giá *
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                      disabled={editingCoupon}
                      placeholder="VD: SALE20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại giảm giá *
                    </label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="percentage">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (VNĐ)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    rows="2"
                    required
                    placeholder="Mô tả về mã giảm giá"
                  />
                </div>

                {/* Discount Value & Max Discount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá trị giảm giá *
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                      min="0"
                      step={
                        formData.discountType === "percentage" ? "1" : "1000"
                      }
                      placeholder={
                        formData.discountType === "percentage" ? "20" : "50000"
                      }
                    />
                  </div>

                  {formData.discountType === "percentage" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm tối đa (VNĐ)
                      </label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="1000"
                        placeholder="100000"
                      />
                    </div>
                  )}
                </div>

                {/* Min Order Value & Max Uses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn hàng tối thiểu (VNĐ)
                    </label>
                    <input
                      type="number"
                      name="minOrderValue"
                      value={formData.minOrderValue}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                      step="1000"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lần sử dụng tối đa
                    </label>
                    <input
                      type="number"
                      name="maxUses"
                      value={formData.maxUses}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="1"
                      placeholder="Không giới hạn"
                    />
                  </div>
                </div>

                {/* Max Uses Per User & Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lần sử dụng/người *
                    </label>
                    <input
                      type="number"
                      name="maxUsesPerUser"
                      value={formData.maxUsesPerUser}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày hết hạn *
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={saveCoupon}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading
                      ? "Đang lưu..."
                      : editingCoupon
                      ? "Cập nhật"
                      : "Tạo mới"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;
