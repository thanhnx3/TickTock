'use client'
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";


const AllProducts = () => {
    const { products } = useAppContext();
    
    // State cho bộ lọc và phân trang
    const [activeCategory, setActiveCategory] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const productsPerPage = 10;
    
    // Danh sách các danh mục
    const categories = [
        { id: "all", name: "Tất cả" },
        { id: "dong-ho-nam", name: "Đồng hồ nam" },
        { id: "dong-ho-nu", name: "Đồng hồ nữ" },
        { id: "phu-kien", name: "Phụ kiện" }
    ];
    
    // Danh sách khoảng giá
    const priceRanges = [
        { id: "all", name: "Tất cả mức giá", min: 0, max: Infinity },
        { id: "under-1m", name: "Dưới 1 triệu", min: 0, max: 1000000 },
        { id: "1m-3m", name: "1 - 3 triệu", min: 1000000, max: 3000000 },
        { id: "3m-5m", name: "3 - 5 triệu", min: 3000000, max: 5000000 },
        { id: "5m-10m", name: "5 - 10 triệu", min: 5000000, max: 10000000 },
        { id: "above-10m", name: "Trên 10 triệu", min: 10000000, max: Infinity }
    ];
    
    // Hàm lọc sản phẩm theo danh mục và giá
    useEffect(() => {
        let filtered = products;
        
        // Lọc theo danh mục
        if (activeCategory !== "all") {
            const categoryNameMap = {
                "dong-ho-nam": "Đồng hồ nam",
                "dong-ho-nu": "Đồng hồ nữ",
                "phu-kien": "Phụ kiện"
            };
            
            filtered = filtered.filter(product => 
                product.category === categoryNameMap[activeCategory]
            );
        }
        
        // Lọc theo giá
        if (priceRange !== "all") {
            const selectedRange = priceRanges.find(range => range.id === priceRange);
            if (selectedRange) {
                filtered = filtered.filter(product => {
                    const price = product.price || 0;
                    return price >= selectedRange.min && price < selectedRange.max;
                });
            }
        }
        
        setFilteredProducts(filtered);
        
        // Reset lại trang khi thay đổi bộ lọc
        setCurrentPage(1);
    }, [activeCategory, priceRange, products]);
    
    // Tính toán sản phẩm cho trang hiện tại
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    
    // Tổng số trang
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    
    // Hàm chuyển trang
    const paginate = (pageNumber) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    };
    
    // Xử lý thay đổi category từ select
    const handleCategoryChange = (e) => {
        setActiveCategory(e.target.value);
    };
    
    // Xử lý thay đổi khoảng giá từ select
    const handlePriceRangeChange = (e) => {
        setPriceRange(e.target.value);
    };
    
    // Hàm reset tất cả bộ lọc
    const resetFilters = () => {
        setActiveCategory("all");
        setPriceRange("all");
    };
    
    // Tạo mảng số trang để hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5; // Số lượng nút trang tối đa hiển thị
        
        if (totalPages <= maxPagesToShow) {
            // Nếu tổng số trang ít hơn hoặc bằng số nút hiển thị, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Logic hiển thị khi có nhiều trang
            let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
            let endPage = startPage + maxPagesToShow - 1;
            
            if (endPage > totalPages) {
                endPage = totalPages;
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }
            
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
        }
        
        return pageNumbers;
    };

    return (
        <>
            <Navbar />
            <div className="flex flex-col items-start px-6 md:px-16 lg:px-32">
                {/* Tiêu đề trang */}
                <div className="w-full flex justify-between items-center pt-10">
                    <h1 className="text-2xl font-medium">Sản phẩm</h1>
                    <div className="flex flex-col items-end">
                        <p className="text-xl font-medium">Xem thêm</p>
                        <div className="w-16 h-0.5 bg-orange-600 rounded-full"></div>
                    </div>
                </div>
                
                {/* Bộ lọc */}
                <div className="w-full mt-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {/* Lọc theo danh mục */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Danh mục
                            </label>
                            <select
                                value={activeCategory}
                                onChange={handleCategoryChange}
                                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Lọc theo giá */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Khoảng giá
                            </label>
                            <select
                                value={priceRange}
                                onChange={handlePriceRangeChange}
                                className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                {priceRanges.map(range => (
                                    <option key={range.id} value={range.id}>
                                        {range.name}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-2 text-gray-700">
                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Nút reset bộ lọc */}
                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset
                            </button>
                        </div>
                    </div>
                    
                    {/* Hiển thị bộ lọc đang áp dụng */}
                    {(activeCategory !== "all" || priceRange !== "all") && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="text-sm text-gray-600">Đang lọc:</span>
                            {activeCategory !== "all" && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    {categories.find(cat => cat.id === activeCategory)?.name}
                                    <button
                                        onClick={() => setActiveCategory("all")}
                                        className="ml-2 hover:text-orange-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                            {priceRange !== "all" && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {priceRanges.find(range => range.id === priceRange)?.name}
                                    <button
                                        onClick={() => setPriceRange("all")}
                                        className="ml-2 hover:text-blue-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                    
                    {/* Hiển thị số lượng sản phẩm */}
                    <p className="text-gray-600 mb-4">
                        Hiển thị {filteredProducts.length > 0 ? indexOfFirstProduct + 1 : 0}-
                        {Math.min(indexOfLastProduct, filteredProducts.length)} 
                        của {filteredProducts.length} sản phẩm
                    </p>
                </div>
                
                {/* Hiển thị sản phẩm */}
                {currentProducts.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-4 w-full">
                        {currentProducts.map((product, index) => (
                            <ProductCard key={product._id || index} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="w-full py-16 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-10 w-10 text-gray-400" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={1.5} 
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" 
                                />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-center">
                            Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại
                            <br />
                            <button 
                                onClick={resetFilters}
                                className="text-orange-600 hover:text-orange-700 underline mt-2"
                            >
                                Xóa bộ lọc để xem tất cả sản phẩm
                            </button>
                        </p>
                    </div>
                )}
                
                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className="w-full flex justify-center my-8">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`px-3 py-2 rounded-md ${
                                    currentPage === 1 
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                            
                            {getPageNumbers().map(number => (
                                <button
                                    key={number}
                                    onClick={() => paginate(number)}
                                    className={`px-3 py-1 rounded-md ${
                                        currentPage === number
                                        ? "bg-orange-600 text-white" 
                                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                >
                                    {number}
                                </button>
                            ))}
                            
                            <button 
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-2 rounded-md ${
                                    currentPage === totalPages 
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed" 
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </>
    );
};

export default AllProducts;