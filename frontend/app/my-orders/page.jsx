"use client";
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { formatCurrency } from "@/lib/formatCurrency";
import { useRouter } from "next/navigation";

const MyOrders = () => {
  const { currency } = useAppContext();
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const isTokenValid = () => {
    const token = localStorage.getItem("token");
    return token && token !== "null" && token !== "undefined";
  };

  const handleInvalidToken = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const fetchOrders = async () => {
    if (!isTokenValid()) return handleInvalidToken();

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/my-orders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (
        res.status === 401 ||
        res.status === 403 ||
        (data.message && data.message.includes("token"))
      ) {
        return handleInvalidToken();
      }

      if (data.success) {
        setOrders(data.data);
      } else {
        console.error(data.message || "Không lấy được đơn hàng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      if (error.message && error.message.includes("jwt")) {
        handleInvalidToken();
      }
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusStyle = (status) => {
    switch (status) {
      case "Đặt thành công":
        return "text-green-600 font-medium";
      case "Đang xử lý":
        return "text-blue-600 font-medium";
      case "Đã hoàn thành":
        return "text-purple-600 font-medium";
      case "Đã hủy":
        return "text-red-600 font-medium";
      default:
        return "text-gray-600 font-medium";
    }
  };

  useEffect(() => {
    if (!isTokenValid()) return handleInvalidToken();

    fetchOrders();
    const intervalId = setInterval(
      () => isTokenValid() && fetchOrders(),
      30000
    );

    const handleStorageChange = (e) => {
      if (e.key === "token" && (!e.newValue || e.newValue === "null")) {
        handleInvalidToken();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
          <Loading />
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
        <div className="space-y-5">
          <h2 className="text-lg font-medium mt-6">Đơn hàng của tôi</h2>
          <div className="max-w-5xl border-t border-gray-300 text-sm">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <div
                  key={order._id || index}
                  className="flex flex-col md:flex-row md:items-center p-5 border-b border-gray-300"
                >
                  <div className="flex-1 min-w-0 flex gap-4 md:pr-6 border-b md:border-b-0 md:border-r border-gray-200 pb-4 md:pb-0">
                    <div className="flex-shrink-0">
                      <Image
                        className="w-16 h-16 object-cover"
                        src={assets.box_icon}
                        alt="box_icon"
                      />
                    </div>
                    <div className="flex flex-col gap-2 min-w-0">
                      <span className="font-medium line-clamp-2 text-base">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center text-sm"
                          >
                            <span className="font-medium truncate pr-2">
                              {item?.name || "Sản phẩm"} x {item.quantity}
                            </span>
                          </div>
                        ))}
                      </span>
                      <span className="text-gray-600">
                        Số mặt hàng: {order.items.length}
                      </span>
                      <span className="text-gray-600">
                        Mã đơn hàng:{" "}
                        <span className="font-mono bg-gray-200 px-1.5 py-0.5 rounded text-xs">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="md:w-64 flex-shrink-0 md:pl-6 py-4 md:py-0">
                    <div className="flex flex-col space-y-1">
                      <span className="font-medium">
                        {order.address.fullName}
                      </span>
                      <span className="text-gray-700">
                        {order.address.area}
                      </span>
                      <span className="text-gray-700">{`${order.address.city}, ${order.address.state}`}</span>
                      <span className="text-gray-700">
                        {order.address.phoneNumber}
                      </span>
                    </div>
                  </div>

                  <div className="md:w-36 flex-shrink-0 md:pl-4 font-medium py-2 md:py-0">
                    {formatCurrency(order.amount)}
                  </div>

                  <div className="md:w-48 flex-shrink-0 md:pl-4">
                    <div className="flex flex-col space-y-2">
                      <span>Phương thức: {order.paymentMethod || "COD"}</span>
                      <div className="flex flex-col">
                        <span className="text-gray-600 text-xs">
                          Ngày đặt hàng:
                        </span>
                        <span className="font-medium">
                          {formatDateTime(order.date)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="flex items-center gap-2">
                          Trạng thái:{" "}
                          <span className={getStatusStyle(order.status)}>
                            {order.status || "Đặt thành công"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500">
                Bạn chưa có đơn hàng nào.
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrders;
