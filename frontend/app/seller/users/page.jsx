"use client"
import React, { useState, useEffect } from 'react';
import { useAppContext } from "@/context/AppContext";
import { Search, Users, Shield, Edit, Trash2, Plus, Eye, EyeOff } from 'lucide-react';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const { url, auth } = useAppContext();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: false
  });

  // Fetch users with proper error handling
  useEffect(() => {
    const fetchUsers = async () => {
      // Check if auth and token exist
      if (!auth || !auth.token) {
        setError("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        const res = await fetch(`${url}/api/user/all`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${auth.token}`,
            'Content-Type': 'application/json',
          },
        });

        // Check if response is ok
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        
        if (data.success) {
          setUsers(data.users || []);
          setFilteredUsers(data.users || []);
        } else {
          throw new Error(data.message || "Không thể tải danh sách người dùng");
        }
      } catch (err) {
        console.error("Lỗi khi lấy danh sách user:", err);
        setError(err.message);
        
        // If token is invalid, you might want to redirect to login
        if (err.message.includes("Token không hợp lệ")) {
          // You can add a redirect to login page here
          // window.location.href = '/login';
          // Or use router if available
          // router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [url, auth]); // Add auth as dependency

  const formatDate = (dateString) => {
  if (!dateString) return 'Chưa có thông tin';
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => 
        selectedRole === 'admin' ? user.role === true : user.role === false
      );
    }

    setFilteredUsers(filtered);
  }, [searchTerm, selectedRole, users]);

  const handleAddUser = async () => {
    if (!auth || !auth.token) {
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const res = await fetch(`${url}/api/user/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Refresh the user list
          const updatedUsers = [...users, data.user];
          setUsers(updatedUsers);
          setNewUser({ name: '', email: '', password: '', role: false });
          setShowAddModal(false);
        }
      } else {
        alert("Không thể thêm người dùng");
      }
    } catch (err) {
      console.error("Lỗi khi thêm user:", err);
      alert("Có lỗi xảy ra khi thêm người dùng");
    }
  };

  const handleEditUser = async () => {
    if (!auth || !auth.token) {
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const res = await fetch(`${url}/api/user/update/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setUsers(prev => prev.map(user => 
            user._id === selectedUser._id ? selectedUser : user
          ));
          setShowEditModal(false);
          setSelectedUser(null);
        }
      } else {
        alert("Không thể cập nhật người dùng");
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật user:", err);
      alert("Có lỗi xảy ra khi cập nhật người dùng");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      return;
    }

    if (!auth || !auth.token) {
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    try {
      const res = await fetch(`${url}/api/user/delete/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        setUsers(prev => prev.filter(user => user._id !== userId));
      } else {
        alert("Không thể xóa người dùng");
      }
    } catch (err) {
      console.error("Lỗi khi xóa user:", err);
      alert("Có lỗi xảy ra khi xóa người dùng");
    }
  };

  const toggleUserRole = async (userId) => {
    if (!auth || !auth.token) {
      alert("Token không hợp lệ. Vui lòng đăng nhập lại.");
      return;
    }

    const user = users.find(u => u._id === userId);
    if (!user) return;

    try {
      const res = await fetch(`${url}/api/user/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          role: !user.role
        })
      });

      if (res.ok) {
        setUsers(prev => prev.map(user => 
          user._id === userId ? { ...user, role: !user.role } : user
        ));
      } else {
        alert("Không thể thay đổi vai trò người dùng");
      }
    } catch (err) {
      console.error("Lỗi khi thay đổi role:", err);
      alert("Có lỗi xảy ra khi thay đổi vai trò");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Lỗi:</p>
            <p>{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Users className="text-blue-600" />
                Quản Lý Tài Khoản
              </h1>
              <p className="text-gray-600 mt-1">Quản lý người dùng và phân quyền hệ thống</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={20} />
              Thêm Người Dùng
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="text-blue-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tổng Người Dùng</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Shield className="text-green-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === true).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="text-purple-600" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Người Dùng Thường</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(user => user.role === false).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="admin">Admin</option>
              <option value="user">Người dùng thường</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người Dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai Trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày Tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lần Cuối Đăng Nhập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role ? (
                          <>
                            <Shield size={12} className="mr-1" />
                            Admin
                          </>
                        ) : (
                          <>
                            <Users size={12} className="mr-1" />
                            Người dùng
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(user.lastLogin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => toggleUserRole(user._id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Thay đổi vai trò"
                        >
                          {user.role ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Không tìm thấy người dùng</h3>
              <p className="mt-1 text-sm text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Thêm Người Dùng Mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Quyền Admin</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Chỉnh Sửa Người Dùng</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({...selectedUser, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUser.role}
                    onChange={(e) => setSelectedUser({...selectedUser, role: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Quyền Admin</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleEditUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;