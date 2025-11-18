
import React, { useState } from 'react';
import { UserProfile, User } from '../types';
import { Search, FileText, CheckCircle2, Clock, Send, Eye, Edit, Lock } from 'lucide-react';

interface ListViewProps {
  profiles: UserProfile[];
  onSelectProfile: (profile: UserProfile, mode: 'view' | 'edit') => void;
  currentUser: User;
}

const ListView: React.FC<ListViewProps> = ({ profiles, onSelectProfile, currentUser }) => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  // 1. Filter by Search
  const searchedProfiles = profiles.filter(p => 
    p.phoneNumber.includes(search)
  );

  // 2. Filter by Tab (Approved vs Pending)
  const filteredProfiles = searchedProfiles.filter(p => {
    if (activeTab === 'approved') return p.isApproved;
    return !p.isApproved;
  }).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="max-w-2xl mx-auto p-4 pb-24">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh Sách Hồ Sơ</h2>
        
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-xl mb-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'pending' 
                ? 'bg-white text-orange-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={16} />
            Chưa duyệt ({searchedProfiles.filter(p => !p.isApproved).length})
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'approved' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle2 size={16} />
            Đã duyệt ({searchedProfiles.filter(p => p.isApproved).length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Tìm theo số điện thoại..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-200">
            <FileText size={48} className="mx-auto mb-3 text-gray-300" />
            <p>Không có hồ sơ nào trong mục này.</p>
          </div>
        ) : (
          filteredProfiles.map(profile => {
            const isOwner = profile.collectorId === currentUser.id;
            const isAdmin = currentUser.role === 'admin';
            const canEdit = !profile.isApproved && (isAdmin || isOwner);
            
            // Lock Logic
            const isLocked = profile.viewedBy && profile.viewedBy !== currentUser.id;

            return (
              <div 
                key={profile.id}
                className={`
                  bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative overflow-hidden
                  ${isLocked ? 'opacity-75 cursor-not-allowed bg-gray-50' : 'cursor-pointer'}
                `}
                onClick={() => {
                  if (isLocked) {
                    alert(`Hồ sơ này đang được xử lý bởi ${profile.viewedByName}`);
                    return;
                  }
                  onSelectProfile(profile, 'view');
                }}
              >
                {/* Status Stripe */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${profile.isApproved ? 'bg-green-500' : 'bg-orange-400'}`}></div>

                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          profile.isApproved ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                          {profile.phoneNumber.slice(-2)}
                      </div>
                      <div>
                          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            {profile.phoneNumber}
                            {isLocked && <Lock size={16} className="text-red-500" />}
                          </h3>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                              {profile.collectorName || 'N/A'} • {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                      </div>
                  </div>
                  {profile.isApproved ? (
                    <div className="flex flex-col items-end gap-1">
                      {profile.isPushedToiHanoi ? (
                        <span className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-blue-100">
                          <Send size={12} /> Đã đẩy iHanoi
                        </span>
                      ) : (
                         <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded-lg text-[10px] font-bold border border-green-100">
                          <CheckCircle2 size={12} /> Đã duyệt
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-end gap-1">
                       <span className="flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-lg text-[10px] font-medium border border-orange-100">
                        <Clock size={12} /> Chờ duyệt
                       </span>
                       {isLocked && (
                         <span className="text-[10px] text-red-500 font-medium">
                           Đang xem: {profile.viewedByName}
                         </span>
                       )}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-3 pl-14 border-t border-gray-50 pt-3">
                  <div className="text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{profile.documents.length}</span> giấy tờ
                  </div>
                  <div className="flex gap-2">
                      {/* Show buttons but they might be disabled by the parent div onClick logic, 
                          but explicit buttons need e.stopPropagation handling */}
                      <button 
                          disabled={!!isLocked}
                          onClick={(e) => {
                              e.stopPropagation();
                              if (isLocked) {
                                alert(`Hồ sơ này đang được xử lý bởi ${profile.viewedByName}`);
                                return;
                              }
                              onSelectProfile(profile, 'view');
                          }}
                          className={`
                            text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
                            ${isLocked ? 'text-gray-400 bg-gray-100' : 'text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50'}
                          `}
                      >
                          <Eye size={14} /> Xem
                      </button>
                      
                      {/* Only show Edit button if user has permission */}
                      {canEdit && (
                          <button 
                              disabled={!!isLocked}
                              onClick={(e) => {
                                  e.stopPropagation();
                                  if (isLocked) {
                                    alert(`Hồ sơ này đang được xử lý bởi ${profile.viewedByName}`);
                                    return;
                                  }
                                  onSelectProfile(profile, 'edit');
                              }}
                              className={`
                                text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors
                                ${isLocked ? 'text-gray-400 bg-gray-100' : 'text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100'}
                              `}
                          >
                              <Edit size={14} /> Sửa
                          </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ListView;
