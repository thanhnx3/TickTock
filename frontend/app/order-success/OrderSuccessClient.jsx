"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function OrderSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const method = searchParams.get("method");
  const [countdown, setCountdown] = useState(100);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown === 0) {
      router.push("/my-orders");
    }
  }, [countdown, router]);

  const isCOD = method === "cod";

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-20">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icon thành công */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Tiêu đề */}
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            {isCOD ? "Đặt hàng thành công!" : "Thanh toán thành công!"}
          </h1>
          
          <p className="text-gray-600 mb-6 text-lg">
            {isCOD 
              ? "Cảm ơn bạn đã đặt hàng. Bạn sẽ thanh toán khi nhận hàng." 
              : "Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận."
            }
          </p>

          {/* Thông tin đơn hàng */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">Thông tin đơn hàng</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã đơn hàng:</span>
                  <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                    #{orderId.slice(-8).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className={`font-semibold ${isCOD ? 'text-orange-600' : 'text-blue-600'}`}>
                    {isCOD ? 'COD (Tiền mặt)' : 'Thẻ tín dụng'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <span className="text-blue-600 font-semibold">Đặt thành công</span>
                </div>
              </div>
            </div>
          )}

          {/* Thông báo đặc biệt cho COD */}
          {isCOD && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📞</span>
                <div className="text-left">
                  <p className="text-orange-800 font-semibold text-sm">Lưu ý quan trọng:</p>
                  <p className="text-orange-700 text-sm mt-1">
                    Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 2 giờ tới. 
                    Vui lòng giữ máy để nhận cuộc gọi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={() => router.push("/my-orders")}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Xem đơn hàng của tôi
            </button>
            
            <button
              onClick={() => router.push("/all-products")}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>

          {/* Auto redirect countdown */}
          <div className="text-sm text-gray-500 border-t pt-4">
            <p>Tự động chuyển đến trang đơn hàng sau <span className="font-semibold text-orange-600">{countdown}</span> giây</p>
            <button 
              onClick={() => router.push("/my-orders")}
              className="text-orange-600 hover:underline mt-1"
            >
              Chuyển ngay
            </button>
          </div>

          {/* Contact info */}
          <div className="mt-6 pt-4 border-t text-sm text-gray-500">
            <p>Cần hỗ trợ? Liên hệ: <span className="text-orange-600 font-semibold">1900-xxxx</span></p>
          </div>
        </div>
      </div>
    </>
  );
}
