import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";

const products = [
  {
    id: 1,
    image: assets.girl_with_headphone_image,
    title: "Thiết kế thanh lịch",
    description:
      "Mang đến phong cách hiện đại, phù hợp với mọi cá tính và không gian.",
  },
  {
    id: 2,
    image: assets.girl_with_earphone_image,
    title: "Từng chi tiết tinh xảo",
    description:
      "Chăm chút từng đường nét để tạo nên một phụ kiện hoàn hảo, không bao giờ lỗi thời.",
  },
  {
    id: 3,
    image: assets.boy_with_laptop_image,
    title: "Đồng hành cùng thời gian",
    description:
      "Bền bỉ, chính xác và đáng tin cậy trong mọi khoảnh khắc của cuộc sống.",
  },
];

const FeaturedProduct = () => {
  return (
    <div className="mt-14">
      <div className="flex flex-col items-center">
        <p className="text-3xl font-medium">Sản phẩm nổi bật</p>
        <div className="w-28 h-0.5 bg-orange-600 mt-2"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-14 mt-12 md:px-14 px-4">
        {products.map(({ id, image, title, description }) => (
          <div
            key={id}
            className="relative group rounded overflow-hidden shadow-md hover:scale-[1.02] transition-transform duration-300"
          >
            <Image
              src={image}
              alt={title}
              width={500}
              height={400}
              className="w-full h-[400px] object-cover"
            />

            {/* Overlay nội dung */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 space-y-2 text-white">
              <p className="font-semibold text-xl lg:text-2xl">{title}</p>
              <p className="text-sm lg:text-base leading-5 max-w-[90%]">
                {description}
              </p>
              <button className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 transition px-4 py-2 text-sm font-medium rounded">
                Mua ngay{" "}
                <Image
                  src={assets.redirect_icon}
                  alt="Redirect Icon"
                  className="w-3 h-3"
                />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedProduct;
