"use client";
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import OrderSummary from "@/components/OrderSummary";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { useAppContext } from "@/context/AppContext";
import { formatCurrency } from "@/lib/formatCurrency";


const Cart = () => {
  const { products, router, cartItems, addToCart, getCartCount, setCartItems } =
    useAppContext();

  // Giữ lại quantityInputs để handle việc nhập số tự nhiên
  const [quantityInputs, setQuantityInputs] = useState({});
  
  // Tạo một hàm validation tập trung
  const validateQuantity = (productId, quantity, product) => {
    const numericQuantity = Math.max(0, Math.floor(Math.abs(quantity)));
    
    if (numericQuantity === 0) {
      return { isValid: true, validQuantity: 0, message: '' };
    }
    
    // if (numericQuantity > 50) {
    //   return { 
    //     isValid: false, 
    //     validQuantity: Math.min(cartItems[productId] || 1, 50), 
    //     message: "Bạn chỉ có thể mua tối đa 50 sản phẩm này." 
    //   };
    // }
    
    if (numericQuantity > product.stock) {
      return { 
        isValid: false, 
        validQuantity: Math.min(cartItems[productId] || 1, product.stock), 
        message: `Bạn chỉ có thể mua tối đa ${product.stock} sản phẩm này do giới hạn số lượng kho.` 
      };
    }
    
    return { isValid: true, validQuantity: numericQuantity, message: '' };
  };

  // Hàm update quantity 
  const updateCartQuantity = (productId, quantity) => {
    const product = products.find((product) => product._id === productId);
    if (!product) return;
    
    const validation = validateQuantity(productId, quantity, product);
    
    if (!validation.isValid) {
      alert(validation.message);
      return;
    }
    
    if (validation.validQuantity === 0) {
      const updatedCartItems = { ...cartItems };
      delete updatedCartItems[productId];
      setCartItems(updatedCartItems);
    } else {
      const updatedCartItems = { ...cartItems, [productId]: validation.validQuantity };
      setCartItems(updatedCartItems);
    }
  };

  // Thêm state để track lỗi đã hiển thị
  const [alertShown, setAlertShown] = useState({});

  // Hàm xử lý input change - cho phép nhập tự nhiên
  const handleQuantityInputChange = (productId, value) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;
    
    // Cập nhật giá trị tạm trong quantityInputs
    setQuantityInputs(prev => ({
      ...prev,
      [productId]: value
    }));
    
    // Reset alert flag khi user bắt đầu nhập lại
    if (alertShown[productId]) {
      setAlertShown(prev => ({
        ...prev,
        [productId]: false
      }));
    }
    
    // Nếu input rỗng, không làm gì (chờ user nhập hoặc blur)
    if (value === '') {
      return;
    }
    
    // Chỉ cho phép nhập số
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numericValue = parseInt(value, 10);
    
    // Kiểm tra validation và hiển thị thông báo lỗi nếu cần
    const validation = validateQuantity(productId, numericValue, product);
    if (validation.isValid) {
      updateCartQuantity(productId, numericValue);
    } else {
      // Chỉ hiển thị alert nếu chưa hiển thị cho giá trị này
      if (!alertShown[productId]) {
        alert(validation.message);
        setAlertShown(prev => ({
          ...prev,
          [productId]: true
        }));
      }
    }
  };

  // Hàm xử lý khi input mất focus
  const handleQuantityInputBlur = (productId, value) => {
    if (value === '' || parseInt(value, 10) <= 0) {
      updateCartQuantity(productId, 0);
    } else {
      // Đồng bộ lại giá trị cuối cùng
      const numericValue = parseInt(value, 10);
      const product = products.find((p) => p._id === productId);
      const validation = validateQuantity(productId, numericValue, product);
      
      if (validation.isValid) {
        updateCartQuantity(productId, validation.validQuantity);
      }
    }
    
    // Xóa giá trị tạm để hiển thị giá trị từ cartItems
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    
    // Reset alert flag
    setAlertShown(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  // Hàm xử lý khi nhấn Enter
  const handleQuantityInputKeyPress = (productId, e) => {
    if (e.key === 'Enter') {
      e.target.blur(); 
    }
  };

  // Hàm tăng/giảm quantity
  const increaseQuantity = (productId) => {
    const currentQuantity = cartItems[productId] || 0;
    updateCartQuantity(productId, currentQuantity + 1);
    // Xóa giá trị tạm và reset alert flag khi dùng button
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    setAlertShown(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  const decreaseQuantity = (productId) => {
    const currentQuantity = cartItems[productId] || 0;
    if (currentQuantity > 1) {
      updateCartQuantity(productId, currentQuantity - 1);
    } else {
      updateCartQuantity(productId, 0);
    }
    // Xóa giá trị tạm và reset alert flag khi dùng button
    setQuantityInputs(prev => {
      const newState = { ...prev };
      delete newState[productId];
      return newState;
    });
    setAlertShown(prev => ({
      ...prev,
      [productId]: false
    }));
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col md:flex-row gap-10 px-6 md:px-16 lg:px-32 pt-14 mb-20">
        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 border-b border-gray-500/30 pb-6">
            <p className="text-2xl md:text-3xl text-gray-500">
              Giỏ <span className="font-medium text-orange-600">Hàng</span>
            </p>
            <p className="text-lg md:text-xl text-gray-500/80">
              {getCartCount()} sản phẩm
            </p>
          </div>

          {/* Empty cart message */}
          {Object.keys(cartItems).length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg mb-4">Giỏ hàng của bạn đang trống</p>
              <button
                onClick={() => router.push("/all-products")}
                className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            <>
              {/* Cart table */}
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="text-left">
                    <tr>
                      <th className="text-nowrap pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Chi tiết sản phẩm
                      </th>
                      <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Giá
                      </th>
                      <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Số lượng
                      </th>
                      <th className="pb-6 md:px-4 px-1 text-gray-600 font-medium">
                        Thành tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(cartItems).map((itemId) => {
                      const product = products.find((product) => product._id === itemId);
                      if (!product || cartItems[itemId] <= 0) return null;

                      return (
                        <tr key={itemId}>
                          {/* Product details */}
                          <td className="flex items-center gap-4 py-4 md:px-4 px-1">
                            <div>
                              <div className="rounded-lg overflow-hidden bg-gray-500/10 p-2">
                                <Image
                                  src={product.image?.[0] || "/fallback.jpg"}
                                  alt={product.name}
                                  className="w-16 h-auto object-cover mix-blend-multiply"
                                  width={1280}
                                  height={720}
                                />
                              </div>
                              <button
                                className="md:hidden text-xs text-orange-600 mt-1 hover:text-orange-700"
                                onClick={() => updateCartQuantity(product._id, 0)}
                              >
                                Xoá
                              </button>
                            </div>
                            <div className="text-sm hidden md:block">
                              <p className="text-gray-800 font-medium">{product.name}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Còn lại: {product.stock} sản phẩm
                              </p>
                              <button
                                className="text-xs text-orange-600 mt-1 hover:text-orange-700"
                                onClick={() => updateCartQuantity(product._id, 0)}
                              >
                                Xoá
                              </button>
                            </div>
                          </td>

                          {/* Price */}
                          <td className="py-4 md:px-4 px-1 text-gray-600 font-medium">
                            {formatCurrency(product.offerPrice)}
                          </td>

                          {/* Quantity controls */}
                          <td className="py-4 md:px-4 px-1">
                            <div className="flex items-center md:gap-2 gap-1">
                              <button
                                onClick={() => decreaseQuantity(product._id)}
                                className="hover:bg-gray-100 p-1 rounded transition"
                                disabled={cartItems[itemId] <= 1}
                              >
                                <Image
                                  src={assets.decrease_arrow}
                                  alt="decrease"
                                  className="w-4 h-4"
                                />
                              </button>
                              
                              <input
                                type="text"
                                value={
                                  quantityInputs[product._id] !== undefined
                                    ? quantityInputs[product._id]
                                    : cartItems[itemId]
                                }
                                onChange={(e) => handleQuantityInputChange(product._id, e.target.value)}
                                onBlur={(e) => handleQuantityInputBlur(product._id, e.target.value)}
                                onKeyPress={(e) => handleQuantityInputKeyPress(product._id, e)}
                                onFocus={(e) => e.target.select()}
                                className="w-12 border border-gray-300 text-center py-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                min="1"
                              />
                              
                              <button
                                onClick={() => increaseQuantity(product._id)}
                                className="hover:bg-gray-100 p-1 rounded transition"
                              >
                                <Image
                                  src={assets.increase_arrow}
                                  alt="increase"
                                  className="w-4 h-4"
                                />
                              </button>
                            </div>
                          </td>

                          {/* Total price */}
                          <td className="py-4 md:px-4 px-1 text-gray-600 font-medium">
                            {formatCurrency(product.offerPrice * cartItems[itemId])}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Continue shopping button */}
              <button
                onClick={() => router.push("/all-products")}
                className="group flex items-center mt-6 gap-2 text-orange-600 hover:text-orange-700 transition"
              >
                <Image
                  className="group-hover:-translate-x-1 transition-transform"
                  src={assets.arrow_right_icon_colored}
                  alt="continue shopping"
                />
                Tiếp tục mua sắm
              </button>
            </>
          )}
        </div>
        <OrderSummary />
      </div>
    </>
  );
};

export default Cart;