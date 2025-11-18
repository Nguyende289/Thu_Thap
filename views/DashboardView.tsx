
import React, { useState, useMemo } from 'react';
import { UserProfile, User } from '../types';
import { Users, CreditCard, Car, Calendar, UserPlus, Map, MapPin, Filter, BarChart3, ArrowUpRight, ChevronDown, ShieldCheck } from 'lucide-react';
import { getUsers } from '../utils/auth';

interface DashboardViewProps {
  profiles: UserProfile[];
  currentUser: User;
  onNavigateToAdmin?: () => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'all';

const DashboardView: React.FC<DashboardViewProps> = ({ profiles, currentUser, onNavigateToAdmin }) => {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  // --- Helper Functions ---
  const checkTime = (timestamp: number, filter: TimeFilter) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (filter === 'all') return true;
    
    // Reset hours for accurate day comparison
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const n = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (filter === 'today') {
      return d.getTime() === n.getTime();
    }
    
    if (filter === 'week') {
      const day = n.getDay() || 7; // Get current day number, make Sunday 7
      if (day !== 1) n.setHours(-24 * (day - 1)); // Set to previous Monday
      return d >= n;
    }

    if (filter === 'month') {
      return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
    }

    return true;
  };

  // --- Data Processing ---
  const processedData = useMemo(() => {
    const allUsers = getUsers();
    const staffUsers = allUsers.filter(u => u.role !== 'admin');
    
    // Get distinct areas
    const areas = Array.from(new Set(staffUsers.map(u => u.area || 'Chưa phân vùng').filter(Boolean)));

    // 1. Filter Profiles by Time
    const timeFilteredProfiles = profiles.filter(p => checkTime(p.createdAt, timeFilter));

    // 2. Calculate Stats per Area (based on Time Filtered Data)
    const areaStats = areas.map(area => {
      const usersInArea = staffUsers.filter(u => (u.area || 'Chưa phân vùng') === area);
      const userIds = usersInArea.map(u => u.id);
      
      // Profiles belonging to this area in the selected time
      const areaProfiles = timeFilteredProfiles.filter(p => p.collectorId && userIds.includes(p.collectorId));
      
      return {
        areaName: area,
        staffCount: usersInArea.length,
        totalProfiles: areaProfiles.length,
        approvedCount: areaProfiles.filter(p => p.isApproved).length,
        licenses: areaProfiles.reduce((sum, p) => sum + p.documents.filter(d => d.type === 'license').length, 0),
        registrations: areaProfiles.reduce((sum, p) => sum + p.documents.filter(d => d.type === 'registration').length, 0),
        users: usersInArea.map(u => {
           const userProfiles = areaProfiles.filter(p => p.collectorId === u.id);
           return {
             ...u,
             collectedCount: userProfiles.length,
             approvedCount: userProfiles.filter(p => p.isApproved).length
           };
        })
      };
    });

    // Sort areas by performance (Total Profiles)
    areaStats.sort((a, b) => b.totalProfiles - a.totalProfiles);

    return {
      areas,
      areaStats,
      timeFilteredProfiles
    };
  }, [profiles, timeFilter]);


  // --- Logic for Display ---
  
  // If Admin: Show filtered data. If Staff: Show only their own data filtered by time.
  const displayProfiles = currentUser.role === 'admin' 
    ? (areaFilter === 'all' 
        ? processedData.timeFilteredProfiles 
        : processedData.timeFilteredProfiles.filter(p => {
            const collector = getUsers().find(u => u.id === p.collectorId);
            return (collector?.area || 'Chưa phân vùng') === areaFilter;
          })
      )
    : processedData.timeFilteredProfiles.filter(p => p.collectorId === currentUser.id);

  const totalProfiles = displayProfiles.length;
  const totalApproved = displayProfiles.filter(p => p.isApproved).length;
  const totalLicenses = displayProfiles.reduce((acc, p) => acc + p.documents.filter(d => d.type === 'license').length, 0);
  const totalRegistrations = displayProfiles.reduce((acc, p) => acc + p.documents.filter(d => d.type === 'registration').length, 0);

  const StatCard = ({ title, count, icon: Icon, bgClass, shadowClass, iconClass }: any) => (
    <div className={`p-4 rounded-2xl text-white shadow-lg ${bgClass} ${shadowClass} flex flex-col justify-between relative overflow-hidden min-h-[100px]`}>
      <div className="relative z-10 flex items-start justify-between mb-1">
        <Icon className="opacity-90" size={24} />
        <div className="text-3xl font-bold">{count}</div>
      </div>
      <div className="relative z-10 opacity-90 text-xs font-medium border-t border-white/20 pt-2 mt-1 uppercase">{title}</div>
      <Icon className={`absolute -bottom-3 -right-3 text-white/20 w-20 h-20 ${iconClass}`} />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">
             {currentUser.role === 'admin' ? 'Tổng Quan' : 'Thống Kê Của Tôi'}
           </h2>
           <p className="text-sm text-gray-500">
              {timeFilter === 'today' && 'Dữ liệu ngày hôm nay'}
              {timeFilter === 'week' && 'Dữ liệu tuần này'}
              {timeFilter === 'month' && 'Dữ liệu tháng này'}
              {timeFilter === 'all' && 'Toàn bộ dữ liệu'}
           </p>
        </div>
        {currentUser.role === 'admin' && (
            <button 
              onClick={onNavigateToAdmin}
              className="text-sm bg-blue-50 text-blue-600 px-3 py-2 rounded-lg font-medium hover:bg-blue-100 flex items-center gap-1 transition-colors"
            >
              <UserPlus size={16} /> QL Nhân Sự
            </button>
        )}
      </div>

      {/* Filter Controls (Admin Only) */}
      {currentUser.role === 'admin' && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Time Filter */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Thời gian
                </label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    {(['today', 'week', 'month', 'all'] as TimeFilter[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeFilter(t)}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                                timeFilter === t ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {t === 'today' ? 'Hôm nay' : t === 'week' ? 'Tuần' : t === 'month' ? 'Tháng' : 'Tất cả'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Area Filter */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Map size={12} /> Lọc Địa bàn
                </label>
                <div className="relative">
                    <select 
                        value={areaFilter}
                        onChange={(e) => setAreaFilter(e.target.value)}
                        className="w-full p-2 pl-3 pr-10 bg-white border border-gray-200 rounded-lg appearance-none text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">Toàn bộ hệ thống</option>
                        {processedData.areas.map(area => (
                            <option key={area} value={area}>{area}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard 
            title="Tổng hồ sơ" 
            count={totalProfiles} 
            icon={BarChart3} 
            bgClass="bg-blue-600" 
            shadowClass="shadow-blue-200"
        />
        <StatCard 
            title="Đã duyệt" 
            count={totalApproved} 
            icon={ShieldCheck} 
            bgClass="bg-green-600" 
            shadowClass="shadow-green-200"
        />
        <StatCard 
            title="GPLX" 
            count={totalLicenses} 
            icon={CreditCard} 
            bgClass="bg-emerald-500" 
            shadowClass="shadow-emerald-200"
        />
        <StatCard 
            title="Đăng ký xe" 
            count={totalRegistrations} 
            icon={Car} 
            bgClass="bg-orange-500" 
            shadowClass="shadow-orange-200"
        />
      </div>

      {/* Area Comparison Table (Admin Only) */}
      {currentUser.role === 'admin' && areaFilter === 'all' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
               <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <ArrowUpRight size={18} className="text-blue-600" />
                  Bảng So Sánh Theo Địa Bàn
               </h3>
               <span className="text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded border">
                  {timeFilter === 'today' ? 'Hôm nay' : timeFilter === 'week' ? 'Tuần này' : 'Tổng thể'}
               </span>
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                       <tr>
                           <th className="px-4 py-3">Địa bàn</th>
                           <th className="px-4 py-3 text-center">Nhân sự</th>
                           <th className="px-4 py-3 text-right text-blue-600">Tổng</th>
                           <th className="px-4 py-3 text-right text-green-600">Đã duyệt</th>
                           <th className="px-4 py-3 text-right text-gray-600">GPLX</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                       {processedData.areaStats.length === 0 ? (
                           <tr><td colSpan={5} className="p-4 text-center text-gray-400">Chưa có dữ liệu</td></tr>
                       ) : (
                        processedData.areaStats.map((stat) => (
                           <tr key={stat.areaName} className="hover:bg-gray-50">
                               <td className="px-4 py-3 font-medium text-gray-800">{stat.areaName}</td>
                               <td className="px-4 py-3 text-center text-gray-500">{stat.staffCount}</td>
                               <td className="px-4 py-3 text-right font-bold text-blue-700">{stat.totalProfiles}</td>
                               <td className="px-4 py-3 text-right font-bold text-green-600">{stat.approvedCount}</td>
                               <td className="px-4 py-3 text-right text-gray-600">{stat.licenses}</td>
                           </tr>
                        ))
                       )}
                   </tbody>
               </table>
           </div>
        </div>
      )}

      {/* Detailed Staff Breakdown (Filtered by selected Area) */}
      {currentUser.role === 'admin' && (
         <div className="space-y-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2 mt-4">
                <Users size={18} className="text-gray-500" />
                Chi tiết nhân sự {areaFilter !== 'all' ? `- ${areaFilter}` : ''}
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
                {processedData.areaStats
                 .filter(area => areaFilter === 'all' || area.areaName === areaFilter)
                 .map(area => (
                     <div key={area.areaName} className="space-y-2">
                        {areaFilter === 'all' && (
                            <div className="text-xs font-bold text-gray-400 uppercase pl-1 mt-2 flex items-center gap-1">
                                <MapPin size={10} /> {area.areaName}
                            </div>
                        )}
                        {area.users.map(user => (
                            <div key={user.id} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                                        {user.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">{user.fullName}</p>
                                        <p className="text-[10px] text-gray-400">{user.phoneNumber}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-green-600">{user.approvedCount}</span>
                                        <span className="text-[10px] text-gray-400">Đã duyệt</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-bold text-gray-800">{user.collectedCount}</span>
                                        <span className="text-[10px] text-gray-400">Tổng HS</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                     </div>
                ))}
                
                {processedData.areaStats.length === 0 && (
                     <p className="text-center text-gray-400 py-4">Không có dữ liệu hiển thị.</p>
                )}
            </div>
         </div>
      )}
    </div>
  );
};

export default DashboardView;
