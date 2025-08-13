"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import { toast } from "react-toastify";
import { formatCurrency } from "@/lib/formatCurrency";

// Constants
const PAYMENT_STATUS_OPTIONS = [
  "Đặt thành công",
  "Đang xử lý",
  "Đã hoàn thành",
  "Đã hủy",
];

const FILTER_OPTIONS = ["Tất cả", ...PAYMENT_STATUS_OPTIONS];

// Status styling utility
const getStatusStyle = (status) => {
  const statusStyles = {
    "Đặt thành công": "text-green-600 bg-green-50 border-green-200",
    "Đang xử lý": "text-blue-600 bg-blue-50 border-blue-200",
    "Đã hoàn thành": "text-purple-600 bg-purple-50 border-purple-200",
    "Đã hủy": "text-red-600 bg-red-50 border-red-200",
    default: "text-gray-600 bg-gray-50 border-gray-200"
  };
  return statusStyles[status] || statusStyles.default;
};


// Status icon component
const StatusIcon = ({ status }) => {
  const iconProps = {
    className: "w-4 h-4",
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24"
  };

  const icons = {
    "Tất cả": (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    "Đặt thành công": (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    "Đang xử lý": (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    "Đã hoàn thành": (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M5 13l4 4L19 7" />
      </svg>
    ),
    "Đã hủy": (
      <svg {...iconProps}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };

  return icons[status] || icons["Tất cả"];
};

// Filter button component
const FilterButton = ({ status, isActive, count, onClick }) => (
  <button
    onClick={onClick}
    className={`group relative overflow-hidden p-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
      isActive
        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md"
    }`}
  >
    <div className={`absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
      isActive ? "opacity-0" : ""
    }`} />
    
    <div className="relative flex flex-col items-center gap-2">
      <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${
        isActive ? "bg-white/20" : "bg-gray-100 group-hover:bg-blue-100"
      }`}>
        <div className={isActive ? "text-white" : "text-gray-600 group-hover:text-blue-600"}>
          <StatusIcon status={status} />
        </div>
      </div>
      
      <div className="text-center">
        <div className={`font-semibold ${isActive ? "text-white" : "text-gray-800"}`}>
          {status}
        </div>
        <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
          isActive 
            ? "bg-white/20 text-white" 
            : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
        }`}>
          {count} đơn
        </div>
      </div>
    </div>
    
    {isActive && (
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-1 bg-white rounded-t-full" />
    )}
  </button>
);

// Order item component
const OrderItem = ({ order, onStatusUpdate, isUpdating }) => {
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const currentStatus = order.status || "Đang xử lý";

  return (
    <div className="flex flex-col md:flex-row md:items-center p-5 border-t border-gray-300 hover:bg-gray-50 transition-colors duration-200">
      {/* Product Info */}
      <div className="flex-1 min-w-0 flex gap-4 md:pr-6 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0">
        <div className="flex-shrink-0">
          <Image
            className="w-16 h-16 object-cover rounded-lg"
            src={assets.box_icon}
            alt="box_icon"
          />
        </div>
        <div className="flex flex-col gap-2 min-w-0">
          <div className="space-y-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <span className="font-medium truncate pr-2">
                  {item?.name || "Sản phẩm"} x {item.quantity}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-sm text-gray-600">
            <span>Số mặt hàng: {order.items.length}</span>
            <span>
              Mã đơn hàng:{" "}
              <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                #{order._id.slice(-8).toUpperCase()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="md:w-64 flex-shrink-0 md:pl-6 py-4 md:py-0">
        <div className="flex flex-col space-y-1 text-sm">
          <span className="font-medium text-gray-900">{order.address.fullName}</span>
          <span className="text-gray-700">{order.address.area}</span>
          <span className="text-gray-700">{`${order.address.city}, ${order.address.state}`}</span>
          <span className="text-gray-700">{order.address.phoneNumber}</span>
        </div>
      </div>

      {/* Amount */}
      <div className="md:w-36 flex-shrink-0 md:pl-4 font-medium py-2 md:py-0 text-lg">
        {formatCurrency(order.amount)}
      </div>

      {/* Payment & Status Info */}
      <div className="md:w-60 flex-shrink-0 md:pl-4">
        <div className="flex flex-col space-y-3 text-sm">
          <div>
            <span className="text-gray-600">Phương thức: </span>
            <span className="font-medium">{order.paymentMethod || "COD"}</span>
          </div>
          
          <div>
            <span className="text-gray-600 text-xs">Ngày đặt hàng:</span>
            <div className="font-medium">{formatDateTime(order.date)}</div>
          </div>
          
          <div>
            <span className="text-gray-600 text-xs mb-1 block">Trạng thái thanh toán:</span>
            <div className="relative">
              <select
                className={`w-full p-2 border rounded-lg text-sm font-medium transition-colors duration-200 ${getStatusStyle(currentStatus)}`}
                value={currentStatus}
                onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                disabled={isUpdating}
              >
                {PAYMENT_STATUS_OPTIONS.map((status, idx) => (
                  <option key={idx} value={status}>{status}</option>
                ))}
              </select>
              {isUpdating && (
                <div className="absolute right-2 top-2.5">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
const Orders = () => {
  const { currency } = useAppContext();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Tất cả");
  const [error, setError] = useState(null);

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    if (filterStatus === "Tất cả") return orders;
    return orders.filter(order => (order.status || "Đang xử lý") === filterStatus);
  }, [orders, filterStatus]);

  // Memoized status counts
  const statusCounts = useMemo(() => {
    const counts = { "Tất cả": orders.length };
    PAYMENT_STATUS_OPTIONS.forEach(status => {
      counts[status] = orders.filter(order => 
        (order.status || "Đang xử lý") === status
      ).length;
    });
    return counts;
  }, [orders]);

  // Fetch orders with better error handling
  const fetchSellerOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/list`,
        { timeout: 10000 }
      );
      
      if (response.data.success) {
        setOrders(response.data.data || []);
      } else {
        throw new Error(response.data.message || "Không thể tải danh sách đơn hàng");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Lỗi kết nối tới máy chủ";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update payment status with optimistic updates
  const updatePaymentStatus = useCallback(async (orderId, newStatus) => {
    if (updatingOrderId) return; // Prevent multiple updates
    
    setUpdatingOrderId(orderId);
    
    // Optimistic update
    const previousOrders = [...orders];
    const updatedOrders = orders.map(order =>
      order._id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/status`,
        { orderId, status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          timeout: 5000
        }
      );

      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        
        // Sync with localStorage
        const orderStatuses = JSON.parse(localStorage.getItem("orderStatuses") || "{}");
        orderStatuses[orderId] = newStatus;
        localStorage.setItem("orderStatuses", JSON.stringify(orderStatuses));
      } else {
        throw new Error(response.data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      // Revert optimistic update on error
      setOrders(previousOrders);
      
      if (err.code === 'ECONNABORTED') {
        toast.error("Timeout: Vui lòng thử lại");
      } else {
        toast.error(err.response?.data?.message || "Cập nhật thất bại");
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }, [orders, updatingOrderId]);

  // Handle filter change
  const handleFilterChange = useCallback((status) => {
    setFilterStatus(status);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  // Retry handler
  const handleRetry = useCallback(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Đã có lỗi xảy ra</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen overflow-auto flex flex-col justify-between text-sm">
      <div className="md:p-10 p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Danh sách đơn hàng</h2>
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-blue-600 hover:text-blue-800 transition-colors"
            title="Làm mới"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Lọc đơn hàng</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {FILTER_OPTIONS.map((status) => (
              <FilterButton
                key={status}
                status={status}
                isActive={filterStatus === status}
                count={statusCounts[status] || 0}
                onClick={() => handleFilterChange(status)}
              />
            ))}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-gray-700 font-medium">
                Hiển thị{" "}
                <span className="text-blue-600 font-bold">{filteredOrders.length}</span>{" "}
                đơn hàng
              </span>
            </div>
            {filterStatus !== "Tất cả" && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                <span className="text-blue-700 text-sm">Lọc:</span>
                <span className="text-blue-800 font-semibold text-sm">{filterStatus}</span>
                <button
                  onClick={() => handleFilterChange("Tất cả")}
                  className="text-blue-600 hover:text-blue-800 ml-1 transition-colors"
                  title="Xóa bộ lọc"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-600">Đã thanh toán: {statusCounts["Đã thanh toán"] || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
              <span className="text-gray-600">Chưa thanh toán: {statusCounts["Chưa thanh toán"] || 0}</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderItem
                key={order._id}
                order={order}
                onStatusUpdate={updatePaymentStatus}
                isUpdating={updatingOrderId === order._id}
              />
            ))
          ) : (
            <div className="text-center text-gray-500 py-16">
              <div className="text-6xl mb-4">📦</div>
              <p className="text-lg font-medium mb-2">
                {filterStatus === "Tất cả" 
                  ? "Chưa có đơn hàng nào." 
                  : `Không có đơn hàng nào với trạng thái "${filterStatus}".`}
              </p>
              {filterStatus !== "Tất cả" && (
                <button
                  onClick={() => handleFilterChange("Tất cả")}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Xem tất cả đơn hàng
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Orders;