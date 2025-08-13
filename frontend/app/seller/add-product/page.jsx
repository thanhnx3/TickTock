"use client";
import React, { useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const AddProduct = () => {
  const [files, setFiles] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Đồng hồ");
  const [priceInput, setPriceInput] = useState(""); 
  const [offerPriceInput, setOfferPriceInput] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Hàm định dạng số thành chuỗi có dấu phân cách hàng nghìn
  const formatNumberInput = (value) => {
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = value.replace(/[^\d]/g, '');
    
    // Thêm dấu chấm phân cách hàng nghìn
    if (numericValue) {
      return Number(numericValue).toLocaleString('vi-VN');
    }
    return '';
  };
  
  // Hàm chuyển chuỗi có định dạng thành số
  const parseFormattedNumber = (formattedValue) => {
    // Loại bỏ tất cả ký tự không phải số
    return parseInt(formattedValue.replace(/[^\d]/g, ''), 10) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!files.some((file) => file)) {
      toast.error("Vui lòng chọn ít nhất một ảnh sản phẩm!");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("price", parseFormattedNumber(priceInput));
    formData.append("offerPrice", parseFormattedNumber(offerPriceInput));
    formData.append("stock", Number(stock));
    
    files.forEach((file) => {
      if (file) formData.append("image", file);
    });
    
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/product/create`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Thêm sản phẩm thành công!");
        setFiles([]);
        setName("");
        setDescription("");
        setCategory("Đồng hồ");
        setPriceInput("");
        setOfferPriceInput("");
        setStock("");
      } else {
        toast.error(res.data.message || "Đã xảy ra lỗi khi thêm sản phẩm.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-gray-50 py-6">
      <div className="ml-6 mr-auto max-w-md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <ToastContainer position="top-right" autoClose={3000} />
          
          {/* Upload ảnh sản phẩm */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Ảnh sản phẩm</p>
            <div className="grid grid-cols-4 gap-2">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="relative">
                  <label 
                    htmlFor={`image${index}`}
                    className="block h-20 border border-dashed border-gray-300 rounded overflow-hidden hover:border-orange-400 transition-colors duration-200"
                  >
                    <input
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                      type="file"
                      id={`image${index}`}
                      accept="image/*"
                      hidden
                    />
                    <div className="h-full w-full flex items-center justify-center">
                      {files[index] ? (
                        <Image
                          src={URL.createObjectURL(files[index])}
                          alt="Product preview"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </label>
                  {files[index] && (
                    <button
                      type="button"
                      onClick={() => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = null;
                        setFiles(updatedFiles);
                      }}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Thông tin sản phẩm */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="product-name">
              Tên sản phẩm
            </label>
            <input
              id="product-name"
              type="text"
              placeholder="Nhập tên sản phẩm"
              className="w-full outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200 text-sm"
              onChange={(e) => setName(e.target.value)}
              value={name}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="product-description">
              Mô tả sản phẩm
            </label>
            <textarea
              id="product-description"
              rows={3}
              className="w-full outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200 resize-none text-sm"
              placeholder="Nhập mô tả"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="category">
              Danh mục
            </label>
            <select
              id="category"
              className="w-full outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200 appearance-none bg-white text-sm"
              onChange={(e) => setCategory(e.target.value)}
              value={category}
            >
              <option value="Đồng hồ">Đồng hồ</option>
              <option value="Đồng hồ nam">Đồng hồ nam</option>
              <option value="Đồng hồ nữ">Đồng hồ nữ</option>
              <option value="Phụ kiện">Phụ kiện</option>
            </select>
          </div>
          
          {/* Giá và tồn kho */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="product-price">
                Giá gốc
              </label>
              <div className="relative">
                <input
                  id="product-price"
                  type="text"
                  placeholder="0"
                  className="w-full outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200 text-sm"
                  onChange={(e) => setPriceInput(formatNumberInput(e.target.value))}
                  value={priceInput}
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">VND</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="offer-price">
                Giá KM
              </label>
              <div className="relative">
                <input
                  id="offer-price"
                  type="text" 
                  placeholder="0"
                  className="w-full outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200 text-sm"
                  onChange={(e) => setOfferPriceInput(formatNumberInput(e.target.value))}
                  value={offerPriceInput}
                  required
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">VND</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="stock">
                Số lượng
              </label>
              <input
                id="stock"
                type="number"
                placeholder="0"
                min="0"
                className="w-full outline-none py-2 px-3 rounded border border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200 text-sm"
                onChange={(e) => setStock(e.target.value)}
                value={stock}
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 bg-orange-600 text-white font-medium rounded hover:bg-orange-700 transition duration-200 flex items-center text-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang xử lý
                </>
              ) : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;