
import React, { useState, useEffect } from 'react';
import { UserProfile, DocumentItem, DOC_TYPES, User } from '../types';
import ImagePicker from '../components/ImagePicker';
import { Plus, CheckCircle, ChevronDown, ChevronUp, Trash2, ArrowLeft, CreditCard, Download, CloudUpload, Loader2, Send, ShieldCheck, CheckSquare, X } from 'lucide-react';
import { uploadProfileToDrive } from '../utils/googleDrive';

interface CollectorViewProps {
  profile: UserProfile;
  onUpdate: (updatedProfile: UserProfile) => void;
  onFinish: () => void;
  onBack: () => void;
  readOnly?: boolean;
  currentUser: User;
}

const CollectorView: React.FC<CollectorViewProps> = ({ profile, onUpdate, onFinish, onBack, readOnly = false, currentUser }) => {
  const [showCCCD, setShowCCCD] = useState(false);
  const [docType, setDocType] = useState(DOC_TYPES[0].id);
  const [docFront, setDocFront] = useState('');
  const [docBack, setDocBack] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  
  // Modal State
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [pushToiHanoi, setPushToiHanoi] = useState(false);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize checkbox state based on profile
  useEffect(() => {
    if (profile.isPushedToiHanoi) {
        setPushToiHanoi(true);
    }
  }, [profile.isPushedToiHanoi]);

  const handleAddDocument = () => {
    if (!docFront || !docBack) {
      alert("Vui lòng chụp đủ 2 mặt giấy tờ");
      return;
    }

    const typeName = DOC_TYPES.find(t => t.id === docType)?.name || 'Khác';
    
    const newDoc: DocumentItem = {
      id: crypto.randomUUID(),
      type: docType as any,
      typeName,
      imageFront: docFront,
      imageBack: docBack,
      createdAt: Date.now()
    };

    const updatedProfile = {
      ...profile,
      documents: [...profile.documents, newDoc],
      updatedAt: Date.now()
    };

    onUpdate(updatedProfile);
    
    // Reset form
    setDocFront('');
    setDocBack('');
  };

  const removeDocument = (docId: string) => {
    if (readOnly) return;
    
    // Security Check: Must be Admin OR Creator to delete
    if (currentUser.role !== 'admin' && profile.collectorId !== currentUser.id) {
        alert("Bạn không có quyền xóa giấy tờ của hồ sơ này.");
        return;
    }

    if (profile.isApproved) {
        alert("Hồ sơ đã duyệt, không thể xóa!");
        return;
    }
    if (!confirm("Bạn có chắc muốn xóa giấy tờ này?")) return;
    const updatedProfile = {
      ...profile,
      documents: profile.documents.filter(d => d.id !== docId),
      updatedAt: Date.now()
    };
    onUpdate(updatedProfile);
  };

  const handleComplete = () => {
    const updatedProfile = {
      ...profile,
      status: 'completed' as const,
      updatedAt: Date.now()
    };
    onUpdate(updatedProfile);
    onFinish();
  };

  const handleConfirmApprove = () => {
    const updatedProfile: UserProfile = {
        ...profile,
        isApproved: true,
        isPushedToiHanoi: pushToiHanoi,
        approvedAt: Date.now(),
        status: 'completed' // Auto complete if approved
    };
    onUpdate(updatedProfile);
    setShowApproveModal(false);
    alert("✅ Đã duyệt hồ sơ thành công!");
    onBack(); // Quay lại danh sách ngay lập tức
  };

  const downloadImage = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUploadToDrive = async () => {
    if (!confirm("Bạn có muốn tải toàn bộ ảnh và thông tin hồ sơ này lên Google Drive không?")) return;
    
    setIsUploading(true);
    const result = await uploadProfileToDrive(profile);
    setIsUploading(false);

    if (result.success) {
      alert("✅ Tải lên thành công!\nHồ sơ đã được lưu trong thư mục HoSoXe_Data trên Drive.");
    } else {
      alert(`❌ Tải lên thất bại: ${result.message}\nVui lòng kiểm tra kết nối hoặc cấu hình URL.`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-32 relative">
      {/* Loading Overlay */}
      {isUploading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center text-white">
          <Loader2 size={48} className="animate-spin mb-4" />
          <p className="text-lg font-medium">Đang đồng bộ lên Google Drive...</p>
          <p className="text-sm opacity-80">Vui lòng không tắt trình duyệt</p>
        </div>
      )}

      {/* APPROVE MODAL */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 relative transform transition-all scale-100">
                <button
                    onClick={() => setShowApproveModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded-full"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <ShieldCheck className="text-green-600" size={28} />
                    Xác nhận duyệt
                </h3>

                <p className="text-gray-500 mb-6 text-sm">
                    Vui lòng xác nhận trạng thái trước khi hoàn tất hồ sơ này.
                </p>

                <div 
                    className={`p-4 rounded-xl mb-8 border-2 transition-all cursor-pointer flex items-center gap-4 ${pushToiHanoi ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200 hover:border-blue-300'}`}
                    onClick={() => setPushToiHanoi(!pushToiHanoi)}
                >
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${pushToiHanoi ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}>
                        {pushToiHanoi && <CheckSquare size={20} className="text-white" />}
                    </div>
                    <div>
                        <span className={`block font-bold ${pushToiHanoi ? 'text-blue-800' : 'text-gray-700'}`}>Đã đẩy iHanoi</span>
                        <span className="text-xs text-gray-500">Đánh dấu hồ sơ đã gửi lên hệ thống</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowApproveModal(false)}
                        className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Quay lại
                    </button>
                    <button
                        onClick={handleConfirmApprove}
                        className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-colors flex items-center justify-center gap-2"
                    >
                        Hoàn thành
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`p-4 border-b border-gray-100 flex justify-between items-center ${profile.isApproved ? 'bg-green-50' : 'bg-gray-50'}`}>
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900 flex items-center gap-1">
                <ArrowLeft size={24} />
            </button>
            <div className="text-center">
                <h2 className="text-lg font-bold text-gray-800">{profile.phoneNumber}</h2>
                {profile.isApproved && (
                    <div className="flex items-center justify-center gap-1 text-xs font-bold text-green-600 mt-1">
                        {profile.isPushedToiHanoi ? (
                            <><Send size={12}/> Đã duyệt & iHanoi</>
                        ) : (
                            <><ShieldCheck size={12}/> Đã duyệt</>
                        )}
                    </div>
                )}
            </div>
             <div className="w-6"></div>
        </div>
        
        {/* Actions Bar */}
        <div className="px-4 py-3 bg-white border-b border-gray-50 flex flex-col sm:flex-row justify-end items-center gap-3">
           {/* APPROVE BUTTON - Opens Modal */}
           {!profile.isApproved && (
               <button 
                onClick={() => setShowApproveModal(true)}
                className="w-full sm:w-auto text-sm flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 px-4 py-2.5 rounded-lg font-bold shadow-md shadow-green-100 transition-all"
               >
                <ShieldCheck size={18} />
                Duyệt hồ sơ
               </button>
           )}
           
           <button 
              onClick={handleUploadToDrive}
              disabled={isUploading}
              className="w-full sm:w-auto text-sm flex items-center justify-center gap-1 bg-blue-50 text-blue-600 border border-blue-100 px-3 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
           >
              <CloudUpload size={18} />
              Đồng bộ Drive
           </button>
        </div>
        
        {/* CCCD Toggle Section */}
        <div className="p-4">
          <button 
            onClick={() => setShowCCCD(!showCCCD)}
            className="w-full flex items-center justify-between text-sm font-medium text-blue-600 bg-blue-50 p-3 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="flex items-center gap-2"><CreditCard size={18}/> Xem CCCD đã lưu</span>
            {showCCCD ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          {showCCCD && (
            <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="relative group">
                <p className="text-xs text-gray-500 mb-1 text-center">Mặt trước</p>
                <img src={profile.cccdFront} alt="CCCD Front" className="w-full rounded-lg border border-gray-200 shadow-sm" />
                {readOnly && (
                    <button 
                        onClick={() => downloadImage(profile.cccdFront, `cccd-truoc-${profile.phoneNumber}.jpg`)}
                        className="absolute bottom-2 right-2 bg-white/90 text-blue-600 p-1.5 rounded-full shadow hover:bg-white transition-all"
                        title="Tải ảnh"
                    >
                        <Download size={16} />
                    </button>
                )}
              </div>
              <div className="relative group">
                <p className="text-xs text-gray-500 mb-1 text-center">Mặt sau</p>
                <img src={profile.cccdBack} alt="CCCD Back" className="w-full rounded-lg border border-gray-200 shadow-sm" />
                 {readOnly && (
                    <button 
                        onClick={() => downloadImage(profile.cccdBack, `cccd-sau-${profile.phoneNumber}.jpg`)}
                        className="absolute bottom-2 right-2 bg-white/90 text-blue-600 p-1.5 rounded-full shadow hover:bg-white transition-all"
                        title="Tải ảnh"
                    >
                        <Download size={16} />
                    </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Document Form - Only in Edit Mode and NOT Approved */}
      {!readOnly && !profile.isApproved && (
        <div className="bg-white p-5 rounded-xl shadow-md border border-blue-100 ring-1 ring-blue-50">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1 h-5 bg-blue-600 rounded-full"></div>
                Thêm Giấy Tờ Mới
            </h3>
            
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại giấy tờ</label>
            <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            >
                {DOC_TYPES.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
            <ImagePicker 
                label="Mặt trước" 
                value={docFront} 
                onChange={setDocFront} 
            />
            <ImagePicker 
                label="Mặt sau" 
                value={docBack} 
                onChange={setDocBack} 
            />
            </div>

            <button
            onClick={handleAddDocument}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
            <Plus size={20} /> Thêm vào danh sách
            </button>
        </div>
      )}

      {/* Document List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 px-1">
          Danh sách giấy tờ ({profile.documents.length})
        </h3>
        
        {profile.documents.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
            <p className="text-gray-400">Chưa có giấy tờ nào được thêm.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profile.documents.map((doc) => (
              <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-medium text-gray-800 px-2 py-1 bg-gray-100 rounded text-sm">
                    {doc.typeName}
                  </span>
                  {!readOnly && !profile.isApproved && (
                    <button 
                        onClick={() => removeDocument(doc.id)}
                        className="text-red-400 hover:text-red-600 p-1"
                    >
                        <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <img src={doc.imageFront} alt="Front" className="w-full h-32 object-cover rounded-lg bg-gray-50 border" />
                    {readOnly && (
                        <button 
                            onClick={() => downloadImage(doc.imageFront, `${doc.typeName}-truoc.jpg`)}
                            className="absolute bottom-1 right-1 bg-white/90 text-gray-700 p-1.5 rounded-lg shadow-sm hover:text-blue-600 transition-colors border border-gray-200"
                        >
                            <Download size={16} />
                        </button>
                    )}
                  </div>
                  <div className="relative">
                    <img src={doc.imageBack} alt="Back" className="w-full h-32 object-cover rounded-lg bg-gray-50 border" />
                    {readOnly && (
                        <button 
                            onClick={() => downloadImage(doc.imageBack, `${doc.typeName}-sau.jpg`)}
                            className="absolute bottom-1 right-1 bg-white/90 text-gray-700 p-1.5 rounded-lg shadow-sm hover:text-blue-600 transition-colors border border-gray-200"
                        >
                            <Download size={16} />
                        </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-10">
          <div className="max-w-2xl mx-auto">
            {(readOnly || profile.isApproved) ? (
                 <button
                 onClick={onBack}
                 className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-lg rounded-xl transition-all flex items-center justify-center gap-2"
                 >
                 <ArrowLeft size={20} />
                 Quay lại danh sách
                 </button>
            ) : (
                <button
                onClick={handleComplete}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-xl shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                <CheckCircle size={24} />
                Hoàn Thành Hồ Sơ
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CollectorView;
