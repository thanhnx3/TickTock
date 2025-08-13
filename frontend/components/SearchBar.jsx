'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SearchBar = () => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/products?search=${encodeURIComponent(keyword)}&category=${encodeURIComponent(category)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
      <input
        type="text"
        placeholder="Tìm kiếm sản phẩm..."
        className="px-4 py-2 border rounded-md flex-1 min-w-[200px]"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />
      
      <select
        className="px-4 py-2 border rounded-md"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="Tất cả">Tất cả danh mục</option>
        <option value="Đồng hồ nam">Đồng hồ nam</option>
        <option value="Đồng hồ nữ">Đồng hồ nữ</option>
        <option value="Phụ kiện">Phụ kiện</option>
      </select>
      
      <button 
        type="submit" 
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Tìm kiếm
      </button>
    </form>
  );
};

export default SearchBar;