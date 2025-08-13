'use client'
import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/context/AppContext";

const AddAddress = () => {

    const { router } = useAppContext();
    const [address, setAddress] = useState({
        fullName: '',
        phoneNumber: '', 
        area: '',
        city: '',
        state: '',
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();
      
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("Bạn chưa đăng nhập");
            return;
          }

          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/api/user/save-address`,
            address,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (res.data.success) {
            alert("Đã lưu địa chỉ thành công!");
            router.push("/cart");
          } else {
            alert(res.data.message || "Lưu địa chỉ thất bại");
          }
        } catch (error) {
          console.error("❌ Lỗi lưu địa chỉ:", error);
          alert("Đã có lỗi xảy ra!");
        }
    };

    return (
        <>
            <Navbar />
            <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
                <form onSubmit={onSubmitHandler} className="w-full">
                    <p className="text-2xl md:text-3xl text-gray-500">
                        Thêm <span className="font-semibold text-orange-600">địa chỉ giao hàng</span>
                    </p>
                    <div className="space-y-3 max-w-sm mt-10">
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Họ và tên"
                            onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                            value={address.fullName}
                        />
                        <input
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                            type="text"
                            placeholder="Số điện thoại"
                            onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
                            value={address.phoneNumber}
                        />
                        <textarea
                            className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
                            rows={4}
                            placeholder="Địa chỉ (Khu vực, đường phố)"
                            onChange={(e) => setAddress({ ...address, area: e.target.value })}
                            value={address.area}
                        ></textarea>
                        <div className="flex space-x-3">
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Thành phố/Quận/Huyện"
                                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                value={address.city}
                            />
                            <input
                                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                                type="text"
                                placeholder="Tỉnh/Thành"
                                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                value={address.state}
                            />
                        </div>
                    </div>
                    <button type="submit" className="max-w-sm w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase">
                        Lưu địa chỉ
                    </button>
                </form>
                <Image
                    className="md:mr-16 mt-16 md:mt-0"
                    src={assets.my_location_image}
                    alt="Hình ảnh vị trí"
                />
            </div>
            <Footer />
        </>
    );
};

export default AddAddress;
