import React from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer>
      <div className="flex flex-col md:flex-row items-start justify-center px-6 md:px-16 lg:px-32 gap-10 py-14 border-b border-gray-500/30 text-gray-500">
        {/* Logo & mô tả */}
        <div className="w-4/5">
          <Image className="w-28 md:w-32" src={assets.logo} alt="logo" />
          <p className="mt-6 text-sm">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s, when an unknown printer took a galley of type
            and scrambled it to make a type specimen book.
          </p>
        </div>

        {/* Menu */}
        <div className="w-1/2 flex items-center justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Về công ty</h2>
            <ul className="text-sm space-y-2">
              <li><a className="hover:underline transition" href="#">Trang chủ</a></li>
              <li><a className="hover:underline transition" href="#">Về chúng tôi</a></li>
              <li><a className="hover:underline transition" href="#">Liên hệ với chúng tôi</a></li>
              <li><a className="hover:underline transition" href="#">Chính sách bảo mật</a></li>
            </ul>
          </div>
        </div>

        {/* Liên hệ + mạng xã hội */}
        <div className="w-1/2 flex items-start justify-start md:justify-center">
          <div>
            <h2 className="font-medium text-gray-900 mb-5">Liên hệ</h2>
            <div className="text-sm space-y-2 mb-4">
              <p>0986259442</p>
              <p>ticktock@gmail.com</p>
            </div>
            <div className="flex space-x-4 text-gray-500 text-xl">
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition">
                <FaFacebookF />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 transition">
                <FaInstagram />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-sky-500 transition">
                <FaTwitter />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-red-600 transition">
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>
      </div>

      <p className="py-4 text-center text-xs md:text-sm">
        Copyright 2025 © TickTock All Right Reserved.
      </p>
    </footer>
  );
};

export default Footer;
