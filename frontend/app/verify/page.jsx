"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("orderId");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/order/verify`,
          {
            success,
            orderId,
          }
        );

        if (response.data.success) {
          setMessage("Thanh toán thành công!");
          setTimeout(() => {
            router.push(`/order-success?orderId=${orderId}&method=stripe`);
          }, 2000);
        } else {
          setMessage("Thanh toán thất bại!");
          setTimeout(() => {
            router.push("/cart");
          }, 3000);
        }
      } catch (error) {
        console.error("Verification error:", error);
        setMessage("Có lỗi xảy ra khi xác minh thanh toán!");
        setTimeout(() => {
          router.push("/cart");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    if (success && orderId) {
      verifyPayment();
    } else {
      setLoading(false);
      setMessage("Thiếu thông tin xác minh!");
      setTimeout(() => {
        router.push("/cart");
      }, 3000);
    }
  }, [success, orderId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Đang xác minh thanh toán...
            </h2>
            <p className="text-gray-600">Vui lòng chờ trong giây lát</p>
          </>
        ) : (
          <>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                success === "true" ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {success === "true" ? (
                <svg
                  className="w-8 h-8 text-green-600"
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
              ) : (
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </div>
            <h2
              className={`text-xl font-semibold mb-2 ${
                success === "true" ? "text-green-800" : "text-red-800"
              }`}
            >
              {message}
            </h2>
            <p className="text-gray-600">
              {success === "true"
                ? "Đang chuyển hướng đến trang xác nhận..."
                : "Đang chuyển về trang giỏ hàng..."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={<div>Đang tải...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
