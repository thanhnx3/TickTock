"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const ContactPage = () => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const svgBg =
    "url(\"data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><defs><pattern id='grid' width='10' height='10' patternUnits='userSpaceOnUse'><path d='M 10 0 L 0 0 0 10' fill='none' stroke='white' stroke-width='0.5'/></pattern></defs><rect width='100' height='100' fill='url(%23grid)'/></svg>\")";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Xử lý khi người dùng thay đổi form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setContactForm({
      ...contactForm,
      [name]: value,
    });
  };

  // Xử lý khi người dùng gửi form liên hệ
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Giả lập API call với xác suất thành công/thất bại
    setTimeout(() => {
      const isSuccess = Math.random() > 0.1; 

      if (isSuccess) {
        setSubmitStatus("success");
        // Lưu vào localStorage để giả lập database
        const submissions = JSON.parse(
          localStorage.getItem("contactSubmissions") || "[]"
        );
        const newSubmission = {
          ...contactForm,
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: "pending",
        };
        submissions.push(newSubmission);
        localStorage.setItem("contactSubmissions", JSON.stringify(submissions));

        // Reset form
        setContactForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }

      setIsSubmitting(false);

      // Tự động ẩn thông báo sau 5 giây
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000); 
  };

  const contactInfo = [
    {
      title: "Địa chỉ cửa hàng",
      content: "123 Đường ABC, Quận Long Biên, TP.HN",
      icon: "📍",
    },
    {
      title: "Số điện thoại",
      content: "+84 986 259 442",
      icon: "📞",
    },
    {
      title: "Email",
      content: "ticktock@gmail.com",
      icon: "✉️",
    },
    {
      title: "Giờ làm việc",
      content: "8:00 - 22:00 (Thứ 2 - Chủ nhật)",
      icon: "🕐",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero section */}
      <section className="relative h-64 md:h-80 bg-gradient-to-r from-orange-600 to-orange-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center text-center relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Liên Hệ Với Chúng Tôi
            </h1>
            <p className="text-lg text-orange-100 max-w-2xl mx-auto">
              Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy liên hệ để được tư vấn tốt
              nhất về các sản phẩm đồng hồ.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((info, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl shadow-sm p-6 text-center hover:shadow-md transition"
              >
                <div className="text-3xl mb-3">{info.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{info.title}</h3>
                <p className="text-gray-600 text-sm">{info.content}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-gray-50 rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Gửi Tin Nhắn
              </h2>

              {/* Success/Error Messages */}
              {submitStatus === "success" && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-green-600 text-xl mr-2">✅</span>
                    <div>
                      <p className="font-medium text-green-800">
                        Gửi thành công!
                      </p>
                      <p className="text-green-700 text-sm">
                        Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi trong vòng
                        24 giờ.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-600 text-xl mr-2">❌</span>
                    <div>
                      <p className="font-medium text-red-800">Có lỗi xảy ra!</p>
                      <p className="text-red-700 text-sm">
                        Vui lòng thử lại sau hoặc liên hệ trực tiếp qua điện
                        thoại.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                      placeholder="Nhập họ và tên"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={contactForm.phone}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Chủ đề *
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={contactForm.subject}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="product_inquiry">Hỏi về sản phẩm</option>
                      <option value="warranty">Bảo hành</option>
                      <option value="repair">Sửa chữa</option>
                      <option value="complaint">Khiếu nại</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nội dung tin nhắn *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={contactForm.message}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500 transition"
                    placeholder="Nhập nội dung tin nhắn..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
                </button>
              </form>
            </div>

            {/* Map and Additional Info */}
            <div className="space-y-8">
              {/* Map placeholder */}
              <div className="bg-gray-50 rounded-xl shadow-sm p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Vị Trí Cửa Hàng
                </h3>

                {/* Giả lập Google Maps với interactive elements */}
                <div className="aspect-video bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative overflow-hidden">
                  {/* Fake map background */}
                  <div className="absolute inset-0 opacity-20">
                    <div
                      style={{ backgroundImage: svgBg }}
                      className="w-full h-full bg-cover"
                    ></div>

                    {/* Map controls */}
                    <div className="absolute top-4 right-4 space-y-2">
                      <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
                        +
                      </button>
                      <button className="w-8 h-8 bg-white rounded shadow-md flex items-center justify-center text-gray-600 hover:bg-gray-50">
                        -
                      </button>
                    </div>

                    {/* Location marker */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          📍
                        </div>
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs whitespace-nowrap">
                          TickTock Store
                        </div>
                      </div>
                    </div>

                    {/* Roads simulation */}
                    <div className="absolute inset-0">
                      <div className="absolute top-1/3 left-0 right-0 h-1 bg-white opacity-30"></div>
                      <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-white opacity-30"></div>
                      <div className="absolute top-2/3 left-0 right-0 h-1 bg-white opacity-30"></div>
                      <div className="absolute top-0 bottom-0 right-1/3 w-1 bg-white opacity-30"></div>
                    </div>

                    {/* Map info overlay */}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800">
                        📍 123 Đường ABC
                      </p>
                      <p className="text-xs text-gray-600">
                        Quận Long Biên, TP.HN
                      </p>
                      <button className="text-xs text-blue-600 hover:text-blue-800 mt-1">
                        Xem chỉ đường →
                      </button>
                    </div>
                  </div>

                  {/* Address details */}
                  <div className="mt-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Chi tiết địa chỉ:
                    </h4>
                    <p className="text-sm text-gray-600 mb-1">
                      📍 123 Đường ABC, Quận Long Biên, TP.HN
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      🚗 Có chỗ đậu xe miễn phí
                    </p>
                    <p className="text-sm text-gray-600">
                      🚌 Gần bến xe buýt số 7, 11, 42
                    </p>
                  </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-gray-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Câu Hỏi Thường Gặp
                  </h3>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Thời gian bảo hành sản phẩm?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Tất cả sản phẩm đồng hồ đều được bảo hành chính hãng từ
                        1-2 năm tùy theo thương hiệu.
                      </p>
                    </div>
                    <div className="border-b pb-4">
                      <h4 className="font-medium text-gray-800 mb-2">
                        Có dịch vụ giao hàng tận nơi không?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Có, chúng tôi giao hàng miễn phí trong nội thành và thu
                        phí giao hàng cho các tỉnh khác.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">
                        Có thể đổi trả sản phẩm không?
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Bạn có thể đổi trả trong vòng 7 ngày nếu sản phẩm còn
                        nguyên seal và chưa sử dụng.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-gray-50 rounded-xl shadow-sm p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">
                    Kết Nối Với Chúng Tôi
                  </h3>
                  <div className="flex space-x-4">
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                    >
                      <FaFacebookF className="text-xl" />
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition"
                    >
                      <FaInstagram className="text-xl" />
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-sky-400 text-white rounded-full flex items-center justify-center hover:bg-sky-500 transition"
                    >
                      <FaTwitter className="text-xl" />
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition"
                    >
                      <FaYoutube className="text-xl" />
                    </a>
                  </div>
                  <p className="text-gray-600 text-sm mt-4">
                    Theo dõi chúng tôi để cập nhật những sản phẩm mới nhất và
                    khuyến mãi hấp dẫn!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ContactPage;
