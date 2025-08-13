'use client'
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/formatCurrency";
import React, { useEffect, useState } from "react";
import axios from "axios";

const OrderSummary = () => {
  const { cartItems, router, getCartCount, getCartAmount, products, setCartItems } = useAppContext();
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  
  // State cho mã giảm giá 
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); 
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingFee] = useState(30000);

  // Fetch địa chỉ từ MongoDB
  const fetchUserAddress = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.address) {
        setUserAddress(res.data.address);
      }
      setLoading(false);
    } catch (error) {
      console.error("Lỗi fetch địa chỉ:", error);
      setLoading(false);
    }
  };

  // Hàm áp dụng mã giảm giá 
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      return alert("Vui lòng nhập mã giảm giá");
    }

    setCouponLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/coupon/apply`,
        {
          code: couponCode.trim().toUpperCase(),
          totalAmount: getCartAmount(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        
        setAppliedCoupon({
          _id: res.data.coupon?._id,
          code: res.data.coupon?.code || couponCode.trim().toUpperCase(),
          discountType: res.data.coupon?.discountType,
          discountValue: res.data.coupon?.discountValue,
          discountAmount: res.data.discount || 0,
          ...res.data.coupon
        });
        
        setDiscountAmount(res.data.discount || 0);
        alert("Áp dụng mã giảm giá thành công!");
      } else {
        alert(res.data.message || "Mã giảm giá không hợp lệ");
      }
    } catch (error) {
      console.error("Lỗi áp dụng coupon:", error);
      alert(error.response?.data?.message || "Mã giảm giá không hợp lệ");
    } finally {
      setCouponLoading(false);
    }
  };

  // Hàm bỏ mã giảm giá
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  // Tính toán giảm giá
  const getDiscountAmount = () => {
    if (!appliedCoupon || !discountAmount) {
      return 0;
    }
    
    return discountAmount;
  };

  // Tính tổng tiền cuối cùng
  const getFinalAmount = () => {
    const subtotal = getCartAmount();
    const discount = getDiscountAmount();
    const finalAmount = subtotal + shippingFee - discount;
    
    return Math.max(finalAmount, 0);
  };

  // Hàm đặt hàng cập nhật
  const handlePlaceOrder = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.");
      }

      if (!userAddress) {
        return alert("Bạn chưa có địa chỉ giao hàng. Vui lòng thêm địa chỉ.");
      }

      if (!products || products.length === 0) {
        return alert("Dữ liệu sản phẩm chưa được tải. Vui lòng thử lại.");
      }

      // Tạo danh sách item cho đơn hàng
      const cartItemsArray = Object.keys(cartItems).map((itemId) => {
        const product = products.find((p) => p._id === itemId);
        if (!product) {
          console.error(`Không tìm thấy sản phẩm với ID: ${itemId}`);
          return null;
        }
        return {
          productId: itemId,
          name: product.name,
          price: product.offerPrice,
          quantity: cartItems[itemId],
        };
      }).filter((item) => item !== null);

      // CHUẨN BỊ DỮ LIỆU COUPON ĐÚNG CẤU TRÚC
      const couponData = appliedCoupon ? {
        _id: appliedCoupon._id,
        code: appliedCoupon.code,
        discountType: appliedCoupon.discountType,
        discountValue: appliedCoupon.discountValue,
        discountAmount: appliedCoupon.discountAmount
      } : null;


      // Gọi API tạo đơn hàng với thông tin đầy đủ
      const orderRes = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/order/place`,
        {
          items: cartItemsArray,
          amount: getFinalAmount(),
          originalAmount: getCartAmount(),
          shippingFee: shippingFee,
          discountAmount: getDiscountAmount(),
          coupon: couponData, 
          address: userAddress,
          paymentMethod: paymentMethod,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (orderRes.data.success) {
        // Xoá giỏ hàng local sau khi tạo đơn thành công
        setCartItems({});
        
        if (paymentMethod === "cod") {
          // Thanh toán COD - chuyển đến trang xác nhận thành công
          router.push(`/order-success?orderId=${orderRes.data.orderId}&method=cod`);
        } else {
          // Thanh toán Stripe - chuyển đến Stripe
          window.location.href = orderRes.data.session_url;
        }
      } else {
        alert(orderRes.data.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi đặt hàng. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchUserAddress();
  }, []);

  if (loading) {
    return <p>Loading địa chỉ...</p>;
  }

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Tóm Tắt Đơn Hàng
      </h2>
      <hr className="border-gray-500/30 my-5" />
      
      <div className="space-y-6">
        {/* Địa chỉ giao hàng */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-3">
            📍 Địa Chỉ Giao Hàng
          </label>
          {userAddress ? (
            <div className="bg-white border-l-4 border-orange-500 p-4 rounded-lg shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-base mb-1">
                    {userAddress.fullName}
                  </h4>
                  <p className="text-gray-600 text-sm mb-2">
                    📞 {userAddress.phoneNumber}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    🏠 {userAddress.area}, {userAddress.city}, {userAddress.state}
                  </p>
                </div>
                <button
                  onClick={() => router.push("/add-address")}
                  className="text-orange-600 hover:text-orange-700 text-xs font-medium ml-3 underline"
                >
                  Thay đổi
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-4xl mb-2">📍</div>
              <p className="text-gray-600 mb-3">Chưa có địa chỉ giao hàng</p>
              <button
                onClick={() => router.push("/add-address")}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Thêm địa chỉ giao hàng
              </button>
            </div>
          )}
        </div>

        {/* Mã giảm giá */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-3">
            🎫 Mã Giảm Giá
          </label>
          
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã giảm giá"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                disabled={couponLoading}
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {couponLoading ? "..." : "Áp dụng"}
              </button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-800 font-medium text-sm">
                    🎉 {appliedCoupon.code}
                  </p>
                  <p className="text-green-600 text-xs">
                    Giảm {formatCurrency(appliedCoupon.discountAmount)}
                  </p>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-red-500 hover:text-red-700 text-xs font-medium"
                >
                  ✕ Bỏ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Phương thức thanh toán */}
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-3">
            💳 Phương Thức Thanh Toán
          </label>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="stripe"
                checked={paymentMethod === "stripe"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3 text-orange-600"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700 font-medium">Thanh toán online</span>
                <div className="flex gap-1">
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">VISA</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-medium">MC</span>
                </div>
              </div>
            </label>
            
            <label className="flex items-center cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3 text-orange-600"
              />
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-700 font-medium">Thanh toán khi nhận hàng</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">COD</span>
              </div>
            </label>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        {/* Chi tiết thanh toán */}
        <div className="space-y-3">
          <div className="flex justify-between text-base">
            <p className="text-gray-600">Tạm tính ({getCartCount()} sản phẩm)</p>
            <p className="text-gray-800 font-medium">{formatCurrency(getCartAmount())}</p>
          </div>
          
          <div className="flex justify-between text-base">
            <p className="text-gray-600">Phí vận chuyển</p>
            <p className="text-gray-800 font-medium">{formatCurrency(shippingFee)}</p>
          </div>
          
          {/* DÒNG GIẢM GIÁ */}
          {appliedCoupon && (
            <div className="flex justify-between text-base">
              <p className="text-green-600">
                🎫 Giảm giá ({appliedCoupon.code})
              </p>
              <p className="text-green-600 font-medium">
                -{formatCurrency(getDiscountAmount())}
              </p>
            </div>
          )}
          
          <hr className="border-gray-300" />
          
          <div className="flex justify-between text-lg font-semibold">
            <p className="text-gray-800">Tổng cộng</p>
            <p className="text-orange-600">{formatCurrency(getFinalAmount())}</p>
          </div>
          
          {/* HIỂN THỊ TIẾT KIỆM */}
          {appliedCoupon && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <p className="text-green-700 text-sm text-center font-medium">
                🎉 Bạn đã tiết kiệm được {formatCurrency(getDiscountAmount())}!
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handlePlaceOrder}
        disabled={!userAddress}
        className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-3 rounded-lg mt-6 transition-colors font-medium"
      >
        {paymentMethod === "cod" ? "Đặt hàng (COD)" : "Thanh toán ngay"}
      </button>
      
      {paymentMethod === "cod" && (
        <p className="text-xs text-gray-500 mt-2 text-center">
          💵 Bạn sẽ thanh toán khi nhận hàng
        </p>
      )}
    </div>
  );
};

export default OrderSummary;