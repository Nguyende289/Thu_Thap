
import React, { useState } from 'react';
import { UserProfile, User } from '../types';
import ImagePicker from '../components/ImagePicker';
import { Save, AlertTriangle, X } from 'lucide-react';

interface CreateViewProps {
  onCreate: (profile: UserProfile) => void;
  currentUser: User;
  existingProfiles: UserProfile[];
}

const CreateView: React.FC<CreateViewProps> = ({ onCreate, currentUser, existingProfiles }) => {
  const [phone, setPhone] = useState('');
  const [cccdFront, setCccdFront] = useState('');
  const [cccdBack, setCccdBack] = useState('');
  const [error, setError] = useState('');
  
  // Modal Duplicate State
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const handlePreSubmit = () => {
    setError('');
    
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!cccdFront || !cccdBack) {
      setError('Vui lòng cung cấp đủ 2 mặt CCCD');
      return;
    }

    // Check for duplicate phone numbers
    const isDuplicate = existingProfiles.some(p => p.phoneNumber.trim() === phone.trim());

    if (isDuplicate) {
        setShowDuplicateModal(true);
    } else {
        // No duplicate, proceed immediately
        proceedWithCreation();
    }
  };

  const proceedWithCreation = () => {
    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      phoneNumber: phone.trim(),
      cccdFront,
      cccdBack,
      documents: [],
      status: 'collecting',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      collectorId: currentUser.id,
      collectorName: currentUser.fullName
    };

    onCreate(newProfile);
    setShowDuplicateModal(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4 space-y-6 pb-24 relative">
      
      {/* DUPLICATE WARNING MODAL */}
      {showDuplicateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Số điện thoại đã tồn tại!</h3>
                    <p className="text-gray-500 mt-2 text-sm">
                        Số điện thoại <span className="font-bold text-gray-800">{phone}</span> đã có hồ sơ trong hệ thống.
                    </p>
                    <p className="text-gray-500 mt-1 text-sm">
                        Bạn có chắc chắn muốn tạo thêm hồ sơ mới cho số này không?
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowDuplicateModal(false)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={proceedWithCreation}
                        className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-200 transition-colors"
                    >
                        Tiếp tục tạo
                    </button>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tạo Hồ Sơ Mới</h2>
        <p className="text-sm text-gray-500 mb-6">Người thu thập: <span className="font-semibold text-blue-600">{currentUser.fullName}</span></p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số điện thoại chủ xe <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              placeholder="0912 345 678"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 pt-2">
            <ImagePicker 
              label="Mặt trước CCCD" 
              value={cccdFront} 
              onChange={setCccdFront} 
              required
            />
            <ImagePicker 
              label="Mặt sau CCCD" 
              value={cccdBack} 
              onChange={setCccdBack} 
              required
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handlePreSubmit}
          className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Tạo & Bắt đầu thu thập
        </button>
      </div>
    </div>
  );
};

export default CreateView;
