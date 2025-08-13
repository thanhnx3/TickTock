"use client";
import React from 'react';
import { assets } from '../../assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const Navbar = () => {
  const { router, auth, logout, userData } = useAppContext();

  return (
    <div className='flex items-center px-4 md:px-8 py-3 justify-between border-b'>
      <Image
        onClick={() => router.push('/')}
        className='w-28 lg:w-32 cursor-pointer'
        src={assets.logo}
        alt="Logo"
      />
      {auth.isAuthenticated ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {userData?.name || "Người dùng"}
          </span>
          <button
            onClick={logout}
            className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
          >
            Đăng xuất
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push('/')} // Chuyển về trang chính để đăng nhập
          className='bg-orange-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
        >
          Đăng nhập
        </button>
      )}
    </div>
  );
};

export default Navbar;
