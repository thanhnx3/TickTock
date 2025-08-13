"use client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "₫";
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [cartItems, setCartItems] = useState({});
  const [isSeller, setIsSeller] = useState(false);
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    token: null,
    user: null,
  });
  
  // Check token + lấy profile user
  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        logout();
        return;
      }
  
      const res = await fetch(`${url}/api/user/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
  
      if (data && data._id) {
        // Cập nhật thông tin xác thực
        setAuth({
          isAuthenticated: true,
          token,
          user: data,
        });
        
        setUserData(data);
  
        const userIsSeller = data.role === true || data.role === "seller" || data.role === "admin";
        setIsSeller(userIsSeller);
      
      } else {
        logout();
      }
    } catch (error) {
      console.error("Lỗi xác thực token:", error);
      logout();
    }
  };
  
  // Hàm logout
  const logout = () => {
    localStorage.removeItem("token");
    setAuth({
      isAuthenticated: false,
      token: null,
      user: null,
    });
    setUserData(null);
    setIsSeller(false);
    router.push("/");
  };

  const resetCart = () => {
    // Xóa giỏ hàng khỏi localStorage hoặc state
    setCartItems([]);
    // Xóa khỏi localStorage nếu bạn đang lưu giỏ hàng ở đó
    localStorage.removeItem('cartItems');
    // Hoặc xóa theo ID người dùng
  };
  
  // Fetch product
  const fetchProductData = async () => {
    try {
      const res = await fetch(`${url}/api/product/list`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error("Không lấy được sản phẩm:", data);
      }
    } catch (err) {
      console.error("Lỗi khi fetch sản phẩm:", err);
    }
  };

  // Cart logic
  const addToCart = (itemId) => {
    const updated = { ...cartItems };
    updated[itemId] = (updated[itemId] || 0) + 1;
    setCartItems(updated);
  };

  const updateCartQuantity = (itemId, quantity) => {
    const updated = { ...cartItems };
    if (quantity === 0) {
      delete updated[itemId];
    } else {
      updated[itemId] = quantity;
    }
    setCartItems(updated);
  };

  const getCartCount = () =>
    Object.values(cartItems).reduce((acc, val) => acc + val, 0);

  const getCartAmount = () => {
    let total = 0;
    for (const id in cartItems) {
      const item = products.find((p) => p._id === id);
      if (item) total += item.offerPrice * cartItems[id];
    }
    return Math.floor(total * 100) / 100;
  };

  // Load dữ liệu khi khởi động ứng dụng
  useEffect(() => {
    checkAuth();
    fetchProductData();
  }, []);

  // Hàm gọi từ LoginPopup để thiết lập token
  const setToken = async (token) => {
    try {
      localStorage.setItem("token", token);
      await checkAuth(); 
    } catch (error) {
      console.error("Lỗi khi thiết lập token:", error);
    }
  };

  const value = {
    currency,
    url,
    router,
    userData,
    setUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    auth,
    setAuth,
    logout,
    checkAuth,
    isSeller,
    setToken,
    resetCart,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};