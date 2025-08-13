import React from "react";

const Banner = () => {
  // Hình ảnh đồng hồ phù hợp
  const mockAssets = {
    watch_left_image: "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=280&h=280&fit=crop&auto=format",
    watch_right_lg_image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=280&h=280&fit=crop&auto=format",
    watch_right_sm_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=200&fit=crop&auto=format", 
    arrow_icon_white: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='white' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'/%3E%3C/svg%3E"
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between md:px-6 lg:px-12 py-8 md:py-12 bg-[#E6E9F2] my-16 rounded-xl overflow-hidden">
      
      {/* Left watch image - kích thước nhỏ hơn */}
      <img
        className="w-48 h-48 md:w-56 md:h-56 object-cover hover:scale-105 transition-transform duration-300 mb-4 md:mb-0"
        src={mockAssets.watch_left_image}
        alt="Đồng hồ cao cấp bên trái"
      />
      
      {/* Center content */}
      <div className="flex flex-col items-center justify-center text-center space-y-3 px-4 md:px-6 max-w-sm">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight">
          Nâng tầm phong cách của bạn
        </h2>
        <p className="text-sm md:text-base font-medium text-gray-800/70 leading-relaxed">
          Từ thiết kế tinh xảo đến độ chính xác tuyệt đối - chiếc đồng hồ hoàn hảo dành cho bạn!
        </p>
        <button className="group flex items-center justify-center gap-2 px-6 py-2.5 bg-orange-600 hover:bg-orange-700 rounded-lg text-white font-medium transition-colors duration-300 mt-4">
          Mua ngay
          <img 
            className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
            src={mockAssets.arrow_icon_white} 
            alt="mua ngay icon" 
          />
        </button>
      </div>
      
      {/* Right watch images - kích thước nhỏ hơn */}
      <img
        className="hidden md:block w-48 h-48 md:w-56 md:h-56 object-cover hover:scale-105 transition-transform duration-300"
        src={mockAssets.watch_right_lg_image}
        alt="Đồng hồ thời trang bên phải"
      />
      
      {/* Mobile version - kích thước nhỏ hơn */}
      <img
        className="md:hidden w-60 h-40 object-cover hover:scale-105 transition-transform duration-300 mt-6"
        src={mockAssets.watch_right_sm_image}
        alt="Đồng hồ thời trang mobile"
      />
    </div>
  );
};

export default Banner;