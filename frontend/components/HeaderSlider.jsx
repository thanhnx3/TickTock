import React, { useState, useEffect } from "react";

const HeaderSlider = () => {
  // Hình ảnh đồng hồ cao cấp - phù hợp với giao diện
  const mockAssets = {
    header_headphone_image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop&auto=format",
    header_playstation_image: "https://images.unsplash.com/photo-1594534475808-b18fc33b045e?w=500&h=400&fit=crop&auto=format",
    header_macbook_image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500&h=400&fit=crop&auto=format",
    arrow_icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'/%3E%3C/svg%3E"
  };

  const sliderData = [
    {
      id: 1,
      title: "Trải nghiệm sự tinh tế - Chiếc đồng hồ hoàn hảo đang chờ bạn!",
      offer: "Ưu đãi có thời hạn - Giảm giá 30%!",
      buttonText1: "Mua ngay",
      buttonText2: "Tìm hiểu thêm",
      imgSrc: mockAssets.header_headphone_image,
      gradient: "from-purple-600 via-pink-600 to-orange-500"
    },
    {
      id: 2,
      title: "Định nghĩa đẳng cấp - Khám phá bộ sưu tập đồng hồ sang trọng ngay hôm nay!",
      offer: "Nhanh lên! Số lượng có hạn!",
      buttonText1: "Mua ngay",
      buttonText2: "Khám phá ưu đãi",
      imgSrc: mockAssets.header_playstation_image,
      gradient: "from-blue-600 via-teal-500 to-cyan-400"
    },
    {
      id: 3,
      title: "Sức mạnh và sự tinh xảo - Đồng hồ cao cấp dành riêng cho bạn!",
      offer: "Ưu đãi độc quyền - Giảm giá 40%!",
      buttonText1: "Đặt hàng ngay",
      buttonText2: "Tìm hiểu thêm",
      imgSrc: mockAssets.header_macbook_image,
      gradient: "from-emerald-600 via-green-500 to-yellow-400"
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderData.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [sliderData.length, isHovered]);

  const handleSlideChange = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sliderData.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sliderData.length) % sliderData.length);
  };

  return (
    <div 
      className="overflow-hidden relative w-full group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
      >
        <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        className="flex transition-transform duration-1000 ease-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide, index) => (
          <div
            key={slide.id}
            className={`flex flex-col-reverse md:flex-row items-center justify-between relative overflow-hidden py-12 md:px-16 px-6 mt-6 rounded-2xl min-w-full bg-gradient-to-br ${slide.gradient}`}
          >
            {/* Glassmorphism overlay */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            
            {/* Animated background shapes */}
            <div className="absolute top-10 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-lg animate-bounce"></div>
            
            <div className="relative z-10 md:pl-8 mt-10 md:mt-0 text-white">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">{slide.offer}</p>
              </div>
              
              <h1 className="max-w-lg md:text-[42px] md:leading-[50px] text-3xl font-bold mb-2 drop-shadow-lg">
                {slide.title}
              </h1>
              
              <div className="w-20 h-1 bg-white/50 rounded-full mb-6"></div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6">
                <button className="group relative overflow-hidden md:px-8 px-6 md:py-3 py-2.5 bg-white text-gray-800 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <span className="relative z-10">{slide.buttonText1}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button className="group flex items-center gap-3 px-6 py-3 font-semibold text-white hover:bg-white/20 rounded-full transition-all duration-300 backdrop-blur-sm">
                  <span>{slide.buttonText2}</span>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300">
                    <img className="w-4 h-4" src={mockAssets.arrow_icon} alt="arrow" />
                  </div>
                </button>
              </div>
            </div>
            
            <div className="relative z-10 flex items-center flex-1 justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl scale-110"></div>
                <img
                  className="relative md:w-80 w-56 h-auto object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  src={slide.imgSrc}
                  alt={`Slide ${index + 1}`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enhanced Dots Navigation */}
      <div className="flex items-center justify-center gap-3 mt-10">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`relative cursor-pointer transition-all duration-300 ${
              currentSlide === index 
                ? "w-8 h-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full" 
                : "w-3 h-3 bg-gray-400/50 hover:bg-gray-400/70 rounded-full hover:scale-110"
            }`}
          >
            {currentSlide === index && (
              <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200/30 h-1 mt-4 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300 rounded-full"
          style={{ 
            width: `${((currentSlide + 1) / sliderData.length) * 100}%` 
          }}
        ></div>
      </div>
    </div>
  );
};

export default HeaderSlider;