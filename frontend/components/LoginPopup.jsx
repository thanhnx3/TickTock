"use client";
import React, { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import Image from "next/image";
import { assets } from "@/assets/assets";

const LoginPopup = ({ setShowLogin }) => {
  const { url, setToken, setUserData } = useAppContext();
  const [currState, setCurrState] = useState("Đăng nhập");
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const endpoint = currState === "Đăng nhập" ? "login" : "register";
      const response = await axios.post(`${url}/api/user/${endpoint}`, data);

      if (response.data.success) {
        const token = response.data.token;

        // Lưu token và gọi hàm checkAuth từ context để cập nhật thông tin người dùng
        await setToken(token);

        setShowLogin(false);
        toast.success(
          currState === "Đăng nhập"
            ? "Đăng nhập thành công!"
            : "Đăng ký thành công!"
        );
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại sau!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md relative">
        {/* Nút đóng popup */}
        <button
          onClick={() => setShowLogin(false)}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          disabled={loading}
        >
          &times;
        </button>

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src={assets.logo}
            alt="Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>

        {/* Tiêu đề */}
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {currState === "Đăng nhập"
            ? "Đăng nhập tài khoản"
            : "Tạo tài khoản mới"}
        </h2>

        {/* Form */}
        <form onSubmit={onLogin} className="space-y-4">
          {currState === "Đăng ký" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                name="name"
                onChange={onChangeHandler}
                value={data.name}
                type="text"
                placeholder="Nhập họ tên"
                required
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              name="email"
              onChange={onChangeHandler}
              value={data.email}
              type="email"
              placeholder="Nhập email"
              required
              className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                name="password"
                onChange={onChangeHandler}
                value={data.password}
                type={showPassword ? "text" : "password"} // Chuyển đổi giữa "text" và "password"
                placeholder="Nhập mật khẩu"
                required
                minLength={8}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)} // Chuyển đổi trạng thái
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition flex justify-center items-center ${
              loading ? "opacity-70" : "hover:bg-blue-700"
            }`}
          >
            {loading ? <span className="animate-spin mr-2">↻</span> : null}
            {currState === "Đăng nhập" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        {/* Chuyển đổi giữa Đăng nhập & Đăng ký */}
        <div className="text-center mt-6 text-sm text-gray-600">
          {currState === "Đăng nhập" ? (
            <>
              Chưa có tài khoản?{" "}
              <button
                onClick={() => setCurrState("Đăng ký")}
                className="text-blue-600 hover:underline font-medium"
                disabled={loading}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <button
                onClick={() => setCurrState("Đăng nhập")}
                className="text-blue-600 hover:underline font-medium"
                disabled={loading}
              >
                Đăng nhập
              </button>
            </>
          )}
        </div>

        {/* Đăng nhập bằng mạng xã hội */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4">
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <Image
                src={assets.google_icon}
                alt="Google"
                width={24}
                height={24}
              />
            </button>
            <button className="p-2 border rounded-full hover:bg-gray-50">
              <Image
                src={assets.facebook_icon}
                alt="Facebook"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPopup;
