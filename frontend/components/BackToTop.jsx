'use client'
import { useEffect, useState } from 'react';
import { FaArrowUp } from 'react-icons/fa';

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xl shadow-md transition duration-300"
      aria-label="Lên đầu trang"
    >
      <FaArrowUp />
    </button>
  );
};

export default BackToTop;
