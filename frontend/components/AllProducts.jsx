'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ProductCard from './ProductCard'

const AllProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/list`)
        setProducts(res.data.data)
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) return <p className="text-center py-6">Đang tải sản phẩm...</p>

  return (
    <div className="my-8">
      <h2 className="text-xl font-semibold mb-4">Tất cả sản phẩm</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}

export default AllProducts