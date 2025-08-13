"use client";
import React, { useState, useEffect, useRef } from "react";
import { assets } from "@/assets/assets";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import Image from "next/image";
import LoginPopup from "@/components/LoginPopup";
import { usePathname, useRouter } from "next/navigation";

const Navbar = () => {
  const { 
    isSeller, 
    auth, 
    logout, 
    getCartCount, 
    userData,
    resetCart 
  } = useAppContext();

  const [showLogin, setShowLogin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  const [searchKeyword, setSearchKeyword] = useState("");

  // Lưu trữ ID người dùng hiện tại để theo dõi thay đổi
  const [currentUserId, setCurrentUserId] = useState(null);

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(searchKeyword)}`);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // click outside menu để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setShowMenu(false);
  }, [pathname]);

  // Theo dõi thay đổi người dùng và làm mới giỏ hàng khi cần
  useEffect(() => {
    // Lấy ID của người dùng hiện tại
    const userId = auth.user?.id || null;
    
    // Nếu ID người dùng thay đổi, cập nhật state và làm mới giỏ hàng
    if (userId !== currentUserId) {
      // Reset giỏ hàng hoàn toàn trước khi đặt ID mới
      resetCart();
      
      // Cập nhật ID người dùng hiện tại
      setCurrentUserId(userId);
      
      // Nếu có người dùng mới đăng nhập, tải giỏ hàng của họ
      if (userId) {
        // loadUserCart(userId); - Phần này sẽ được xử lý trong resetCart hoặc thông qua AppContext
      }
    }
  }, [auth.user, currentUserId, resetCart]);

  const getUserAvatar = () => {
    return auth.user?.avatar || assets.user_icon;
  };

  return (
    <>
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}

      <header
        className={`fixed w-full z-40 transition-all duration-300 ${
          scrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-sm"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-16 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Image
              src={assets.logo}
              alt="Logo"
              className="cursor-pointer w-28 md:w-32"
              onClick={() => router.push("/")}
            />

            {/* Menu desktop */}
            <nav className="hidden md:flex flex-1 justify-center items-center gap-6">
              {[
                { href: "/", label: "Trang chủ" },
                { href: "/all-products", label: "Sản phẩm" },
                { href: "/about", label: "Về chúng tôi" },
                { href: "/contact", label: "Liên hệ" },
                { href: "/cnpt", label: "cnpt" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-[15px] font-medium transition-colors ${
                    pathname === href
                      ? "text-orange-600"
                      : "text-gray-700 hover:text-orange-600"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Icons */}
            <div className="hidden md:flex items-center gap-4">
              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-orange-600"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                />

                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-orange-600"
                >
                  <Image
                    src={assets.search_icon}
                    alt="Tìm kiếm"
                    width={20}
                    height={20}
                  />
                </button>
              </div>

              <button
                onClick={() => router.push("/cart")}
                className="relative hover:text-orange-600 transition"
              >
                <Image
                  src={assets.cart_icon}
                  alt="Giỏ hàng"
                  width={22}
                  height={22}
                />
                {auth.isAuthenticated && getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>

              {/* Avatar dropdown */}
              {auth.isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu((prev) => !prev)}
                    className="flex items-center gap-2"
                  >
                    <Image
                      src={getUserAvatar()}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full border border-gray-300"
                    />
                    <span className="text-sm font-medium">
                      {userData?.name || "Tài khoản"}
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      {/* <button
                        onClick={() => {
                          setShowMenu(false);
                          router.push("/profile");
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Trang cá nhân
                      </button> */}
                      {/* Chỉ hiển thị "Đơn hàng" cho người dùng thông thường */}
                      {!isSeller && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            router.push("/my-orders");
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Đơn hàng
                        </button>
                      )}
                      
                      {/* Hiển thị tùy chọn Quản lý cửa hàng nếu là seller */}
                      {isSeller && (
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            router.push("/seller");
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Quản lý cửa hàng
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          // Xóa giỏ hàng trước khi đăng xuất
                          resetCart();
                          logout();
                        }}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Đăng nhập
                </button>
              )}
            </div>

            {/* Mobile menu icon */}
            <div className="md:hidden flex items-center space-x-4">
              <button
                onClick={() => router.push("/cart")}
                className="relative text-gray-700"
              >
                <Image
                  src={assets.cart_icon}
                  alt="Giỏ hàng"
                  width={22}
                  height={22}
                />
                {auth.isAuthenticated && getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 focus:outline-none"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-6 h-6"
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
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Trang chủ
              </Link>
              <Link
                href="/all-products"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Sản phẩm
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Về chúng tôi
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
              >
                Liên hệ
              </Link>

              <div className="pt-4 border-t border-gray-200">
                {auth.isAuthenticated ? (
                  <>
                    <button
                      onClick={() => router.push("/profile")}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                    >
                      Trang cá nhân
                    </button>
                    {/* Chỉ hiển thị "Đơn hàng" cho người dùng thông thường */}
                    {!isSeller && (
                      <button
                        onClick={() => router.push("/my-orders")}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Đơn hàng
                      </button>
                    )}
                    {isSeller && (
                      <button
                        onClick={() => router.push("/seller")}
                        className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Quản lý cửa hàng
                      </button>
                    )}
                    <button
                      onClick={() => {
                        // Xóa giỏ hàng trước khi đăng xuất
                        resetCart();
                        logout();
                      }}
                      className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full bg-orange-600 text-white px-3 py-2 rounded-md text-base font-medium"
                  >
                    Đăng nhập
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Đệm tránh navbar che nội dung */}
      <div className="h-14 md:h-16 border-b"></div>
    </>
  );
};

export default Navbar;