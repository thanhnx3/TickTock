'use client';
import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { formatCurrency } from "@/lib/formatCurrency";
import Loading from "@/components/Loading";
import Footer from "@/components/seller/Footer";

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("month");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Lấy dữ liệu đơn hàng và sản phẩm
  const fetchData = async () => {
    try {
      // Lấy dữ liệu đơn hàng
      const ordersResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/order/list`);
      
      // Lấy dữ liệu sản phẩm
      const productsResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/product/list`);
      
      if (ordersResponse.data.success && productsResponse.data.success) {
        setOrders(ordersResponse.data.data || []);
        setProducts(productsResponse.data.data || []);
      } else {
        toast.error("Không thể tải dữ liệu thống kê");
      }
    } catch (err) {
      toast.error("Lỗi kết nối tới máy chủ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm xử lý dữ liệu thống kê theo tháng
  const getMonthlyData = () => {
    // Lọc đơn hàng theo năm đã chọn
    const filteredOrders = orders.filter(order => 
      new Date(order.date).getFullYear() === selectedYear
    );

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: `Tháng ${i + 1}`,
      revenue: 0,
      orders: 0,
      averageOrder: 0
    }));

    filteredOrders.forEach(order => {
      const orderDate = new Date(order.date);
      const monthIndex = orderDate.getMonth();
      
      monthlyData[monthIndex].revenue += order.amount;
      monthlyData[monthIndex].orders += 1;
    });

    // Tính giá trị đơn hàng trung bình
    monthlyData.forEach(data => {
      data.averageOrder = data.orders > 0 ? data.revenue / data.orders : 0;
    });

    return monthlyData;
  };
  
  // Dữ liệu theo danh mục sản phẩm
  const getCategoryData = () => {
    const categoryData = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = item.product;
        if (product && product.category) {
          if (!categoryData[product.category]) {
            categoryData[product.category] = {
              category: product.category,
              revenue: 0,
              quantity: 0
            };
          }
          
          const itemPrice = item.price || (product.offerPrice || product.price);
          categoryData[product.category].revenue += (itemPrice * item.quantity);
          categoryData[product.category].quantity += item.quantity;
        }
      });
    });
    
    return Object.values(categoryData);
  };

  // Tính tổng doanh thu
  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  
  // Tính tổng số đơn hàng
  const totalOrders = orders.length;
  
  // Tính giá trị đơn hàng trung bình
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Tính tổng số sản phẩm đã bán
  const totalSoldItems = orders.reduce((sum, order) => 
    sum + order.items.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0), 0);
  
  // Tính tồn kho
  const totalStock = products.reduce((sum, product) => sum + (product.stock || 0), 0);
  
  // Dữ liệu thống kê theo thời gian được chọn
  const chartData = getMonthlyData();
  
  // Dữ liệu theo danh mục
  const categoryData = getCategoryData();

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {loading ? (
        <Loading />
      ) : (
        <div className="w-full md:p-6 p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-medium">Thống kê bán hàng</h2>
            <div className="flex items-center gap-3">
              <select 
                className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-orange-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              
              <select 
                className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-orange-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="month">Theo tháng</option>
                {/* <option value="category">Theo danh mục</option> */}
              </select>
            </div>
          </div>
          
          {/* Thẻ thống kê tổng quan */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xs font-medium text-gray-500">Tổng doanh thu</h3>
              <p className="text-xl font-semibold text-gray-800">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xs font-medium text-gray-500">Tổng đơn hàng</h3>
              <p className="text-xl font-semibold text-gray-800">{totalOrders}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xs font-medium text-gray-500">Giá trị TB/đơn</h3>
              <p className="text-xl font-semibold text-gray-800">{formatCurrency(averageOrderValue)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xs font-medium text-gray-500">Sản phẩm đã bán</h3>
              <p className="text-xl font-semibold text-gray-800">{totalSoldItems}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-xs font-medium text-gray-500">Tồn kho</h3>
              <p className="text-xl font-semibold text-gray-800">{totalStock}</p>
            </div>
          </div>
          
          {/* Biểu đồ */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h2 className="text-md font-medium text-gray-700 mb-4">
              {timeRange === "month" ? `Biểu đồ doanh thu theo tháng (${selectedYear})` : "Biểu đồ doanh thu theo danh mục"}
            </h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {timeRange === "month" ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 15, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#f97316" />
                  </BarChart>
                ) : (
                  <BarChart
                    data={categoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value, name) => name === "revenue" ? formatCurrency(value) : value} />
                    <Legend />
                    <Bar dataKey="revenue" name="Doanh thu" fill="#f97316" />
                    <Bar dataKey="quantity" name="Số lượng" fill="#3b82f6" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Bảng thống kê chi tiết */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <h2 className="text-md font-medium text-gray-700 p-4 border-b">Bảng thống kê chi tiết</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {timeRange === "month" ? (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tháng</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số đơn hàng</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị TB/đơn</th>
                      </>
                    ) : (
                      <>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doanh thu</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lượng bán</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá trị TB/SP</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {timeRange === "month" ? (
                    chartData.map((data, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{data.month}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.revenue)}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{data.orders}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          {data.orders > 0 ? formatCurrency(data.averageOrder) : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    categoryData.map((data, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{data.category}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(data.revenue)}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">{data.quantity}</td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                          {data.quantity > 0 ? formatCurrency(data.revenue / data.quantity) : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">Tổng cộng</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(totalRevenue)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {timeRange === "month" ? totalOrders : totalSoldItems}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {timeRange === "month" 
                        ? (totalOrders > 0 ? formatCurrency(totalRevenue / totalOrders) : "-")
                        : (totalSoldItems > 0 ? formatCurrency(totalRevenue / totalSoldItems) : "-")}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Dashboard;