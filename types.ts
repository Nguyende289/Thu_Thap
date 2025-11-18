
export interface DocumentItem {
  id: string;
  type: 'license' | 'registration' | 'insurance' | 'other';
  typeName: string;
  imageFront: string;
  imageBack: string;
  createdAt: number;
}

export interface User {
  id: string;
  username: string;
  password?: string; // Optional in UI, required in storage
  fullName: string;
  role: 'admin' | 'staff';
  phoneNumber?: string;
  area?: string; // Địa bàn (e.g., "Hà Nội", "Quận 1")
  canApprove?: boolean; // Quyền duyệt hồ sơ
  createdAt: number;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  cccdFront: string;
  cccdBack: string;
  documents: DocumentItem[];
  status: 'collecting' | 'completed';
  collectorId?: string; // ID of the staff who collected this
  collectorName?: string; // Name of the staff
  createdAt: number;
  updatedAt: number;
  isApproved?: boolean; // Trạng thái đã duyệt
  isPushedToiHanoi?: boolean; // Trạng thái đã đẩy lên iHanoi
  approvedAt?: number; // Thời gian duyệt
  
  // Concurrency Locking
  viewedBy?: string; // ID của người đang xem hồ sơ
  viewedByName?: string; // Tên của người đang xem
}

export type ViewState = 'dashboard' | 'create' | 'list' | 'collecting' | 'admin_users';

export const DOC_TYPES = [
  { id: 'license', name: 'Giấy phép lái xe' },
  { id: 'registration', name: 'Đăng ký xe (Cà vẹt)' },
  { id: 'insurance', name: 'Bảo hiểm xe' },
  { id: 'other', name: 'Giấy tờ khác' },
];
