
import React, { useState } from 'react';
import { login } from '../utils/auth';
import { User } from '../types';
import { KeyRound, UserCircle2, ArrowRight, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = login(username, password);
    if (user) {
      onLoginSuccess(user);
    } else {
      setError('Sai tên đăng nhập hoặc mật khẩu');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-red-700">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center mb-4">
            <ShieldAlert size={64} className="text-red-600 fill-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-red-700 uppercase">Công An Xã Kiều Phú</h1>
          <p className="text-gray-500 font-medium mt-1">Hệ thống thu thập hồ sơ xe</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản cán bộ</label>
            <div className="relative">
              <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                placeholder="Nhập mật khẩu"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2"
          >
            Đăng Nhập Hệ Thống <ArrowRight size={20} />
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 uppercase">Đơn vị hành chính công an xã Kiều Phú</p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
