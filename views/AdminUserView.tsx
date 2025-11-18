
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getUsers, createUser } from '../utils/auth';
import { UserPlus, Users, ShieldCheck, MapPin, Phone, KeyRound } from 'lucide-react';

const AdminUserView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newFullname, setNewFullname] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newPassword, setNewPassword] = useState('abc123@');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullname || !newUsername || !newArea) {
      setMessage({ text: 'Vui lòng điền tên, tài khoản và địa bàn', type: 'error' });
      return;
    }

    const result = createUser(newFullname, newUsername, newPhone, newArea, newPassword);
    if (result.success) {
      setMessage({ text: `Đã tạo tài khoản ${newUsername} thành công!`, type: 'success' });
      setNewFullname('');
      setNewUsername('');
      setNewPhone('');
      setNewArea('');
      setNewPassword('abc123@');
      loadUsers();
    } else {
      setMessage({ text: result.message || 'Lỗi tạo tài khoản', type: 'error' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-24">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <UserPlus className="text-blue-600" />
          Thêm Nhân Viên Mới
        </h2>
        
        <form onSubmit={handleAddUser} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newFullname}
                onChange={(e) => setNewFullname(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa bàn <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newArea}
                onChange={(e) => setNewArea(e.target.value)}
                placeholder="Ví dụ: Quận 1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="09xxx"
                  className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="username"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Mặc định: abc123@</p>
          </div>

          {message.text && (
            <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            Tạo Tài Khoản
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Users size={20} />
          Danh Sách Nhân Viên
        </h3>
        {users.map(user => (
          <div key={user.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                    {user.fullName.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-gray-800">{user.fullName}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                </div>
                </div>
                <div className="text-right">
                    {user.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-1 rounded-full font-medium text-xs">
                        <ShieldCheck size={14} /> Admin
                        </span>
                    ) : (
                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full text-xs">Nhân viên</span>
                    )}
                </div>
            </div>
            {user.role !== 'admin' && (
                <div className="mt-3 pt-3 border-t border-gray-50 grid grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400"/> {user.area || 'Chưa phân vùng'}
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400"/> {user.phoneNumber || 'N/A'}
                    </div>
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUserView;
