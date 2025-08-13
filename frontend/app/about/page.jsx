"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
// Import dữ liệu giả lập từ file mockData
import { blogPosts, comments as initialComments, popularTags } from "@/assets/mockData"; // Giả lập dữ liệu bài viết và bình luận

const BlogDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params?.id) || 1;
  
  // Lấy dữ liệu bài viết từ mockData
  const blogPostDetail = blogPosts.find(post => post.id === postId) || blogPosts[0];
  
  // Lấy dữ liệu bài viết liên quan
  const relatedPosts = blogPosts
    .filter(post => blogPostDetail.relatedPosts?.includes(post.id))
    .slice(0, 3);

  // State cho comments
  const [comments, setComments] = useState(initialComments);
  const [commentForm, setCommentForm] = useState({
    name: "",
    email: "",
    content: ""
  });

  // Xử lý khi người dùng thay đổi form bình luận
  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm({
      ...commentForm,
      [name]: value
    });
  };

  // Xử lý khi người dùng gửi bình luận
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    const newComment = {
      id: comments.length + 1,
      name: commentForm.name,
      content: commentForm.content,
      date: new Date().toLocaleDateString("vi-VN"),
      avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`
    };
    setComments([...comments, newComment]);
    setCommentForm({
      name: "",
      email: "",
      content: ""
    });
    alert("Cảm ơn bạn đã gửi bình luận!");
  };

  // Custom component cho các bài viết liên quan
  const RelatedPostCard = ({ post }) => {
    return (
      <div className="flex space-x-4 mb-6">
        <div className="flex-shrink-0 w-24 h-24 relative rounded overflow-hidden">
          <Image 
            src={post.image} 
            alt={post.title} 
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-grow">
          <span className="text-xs font-semibold text-orange-600">{post.category}</span>
          <h3 className="text-base font-medium hover:text-orange-600 transition">
            <Link href={`/blog/${post.id}`}>{post.title}</Link>
          </h3>
          <p className="text-xs text-gray-500 mt-1">{post.date} • {post.author}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero section */}
      <section className="relative h-64 md:h-96 bg-gray-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50" 
          style={{ backgroundImage: `url(${blogPostDetail.image})` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40"></div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center text-center relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 mb-4 bg-orange-600 text-white text-sm font-semibold rounded-full">
              {blogPostDetail.category}
            </span>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-4">
              {blogPostDetail.title}
            </h1>
            <div className="flex items-center justify-center text-gray-300 text-sm">
              <div className="flex items-center mr-4">
                <div className="w-8 h-8 rounded-full overflow-hidden mr-2 relative">
                  <Image
                    src={blogPostDetail.authorAvatar}
                    alt={blogPostDetail.author}
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <span>{blogPostDetail.author}</span>
              </div>
              <span>•</span>
              <span className="ml-4">{blogPostDetail.date}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
                {/* Content */}
                <div 
                  className="prose prose-orange max-w-none"
                  dangerouslySetInnerHTML={{ __html: blogPostDetail.content }}
                />

                {/* Tags */}
                <div className="mt-8 pb-6 border-b">
                  <div className="flex flex-wrap gap-2">
                    {blogPostDetail.tags.map((tag, index) => (
                      <Link 
                        key={index}
                        href={`/blog/tag/${tag}`}
                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Author info */}
                <div className="flex items-center mt-8 p-6 bg-gray-50 rounded-lg">
                  <div className="w-16 h-16 relative rounded-full overflow-hidden flex-shrink-0">
                    <Image 
                      src={blogPostDetail.authorAvatar} 
                      alt={blogPostDetail.author}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">{blogPostDetail.author}</h3>
                    <p className="text-gray-600 text-sm">Biên tập viên tại TickTock - Chuyên gia về đồng hồ với hơn 10 năm kinh nghiệm trong ngành.</p>
                  </div>
                </div>

                {/* Comments section */}
                <div className="mt-12">
                  <h3 className="text-xl font-bold mb-6">Bình luận ({comments.length})</h3>
                  
                  {/* Comments list */}
                  <div className="space-y-6 mb-8">
                    {comments.map(comment => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 relative rounded-full overflow-hidden flex-shrink-0">
                          <Image 
                            src={comment.avatar} 
                            alt={comment.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{comment.name}</h4>
                              <span className="text-xs text-gray-500">{comment.date}</span>
                            </div>
                            <p className="text-gray-700">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Comment form */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-lg font-bold mb-4">Để lại bình luận</h4>
                    <form onSubmit={handleCommentSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Họ tên
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={commentForm.name}
                            onChange={handleCommentChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={commentForm.email}
                            onChange={handleCommentChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                          Nội dung
                        </label>
                        <textarea
                          id="content"
                          name="content"
                          rows="4"
                          value={commentForm.content}
                          onChange={handleCommentChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                        ></textarea>
                      </div>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition"
                      >
                        Gửi bình luận
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:w-1/3">
              {/* Related posts */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">Bài viết liên quan</h3>
                <div className="space-y-6">
                  {relatedPosts.map(post => (
                    <RelatedPostCard key={post.id} post={post} />
                  ))}
                </div>
              </div>
              
              {/* Popular tags */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">Tags phổ biến</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Link 
                      key={index}
                      href={`/blog/tag/${tag}`}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
              
              {/* Newsletter */}
              <div className="bg-orange-50 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-bold mb-2">Đăng ký nhận tin</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Nhận thông báo về bài viết mới và khuyến mãi đặc biệt
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition"
                  >
                    Đăng ký
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetailPage;