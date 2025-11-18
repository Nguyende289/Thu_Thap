
import React, { useState, useEffect } from 'react';
import { UserProfile, ViewState, User } from './types';
import Navbar from './components/Navbar';
import CreateView from './views/CreateView';
import ListView from './views/ListView';
import DashboardView from './views/DashboardView';
import CollectorView from './views/CollectorView';
import LoginView from './views/LoginView';
import AdminUserView from './views/AdminUserView';
import { initAuth } from './utils/auth';
import { ShieldAlert } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('list');
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize Auth System (Seed Admin)
  useEffect(() => {
    initAuth();
    const storedUser = localStorage.getItem('hoso_current_user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hoso_data');
      if (stored) {
        setProfiles(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, []);

  // Save to localStorage whenever profiles change
  useEffect(() => {
    try {
      localStorage.setItem('hoso_data', JSON.stringify(profiles));
    } catch (e) {
      console.error("Failed to save data (likely quota exceeded)", e);
      alert("Cảnh báo: Bộ nhớ trình duyệt sắp đầy. Vui lòng xóa bớt hồ sơ cũ.");
    }
  }, [profiles]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('hoso_current_user', JSON.stringify(user));
    setView('list');
  };

  const handleLogout = () => {
    // Unlock profile if user logs out while viewing
    if (activeProfileId && currentUser) {
       unlockProfile(activeProfileId, currentUser.id);
    }

    setCurrentUser(null);
    localStorage.removeItem('hoso_current_user');
    setActiveProfileId(null);
    setView('list'); 
  };

  const unlockProfile = (profileId: string, userId: string) => {
      setProfiles(prev => prev.map(p => {
          if (p.id === profileId && p.viewedBy === userId) {
              const { viewedBy, viewedByName, ...rest } = p;
              return rest as UserProfile;
          }
          return p;
      }));
  };

  const handleCreateProfile = (newProfile: UserProfile) => {
    setProfiles(prev => [newProfile, ...prev]);
    setActiveProfileId(newProfile.id);
    setIsReadOnly(false); 
    setView('collecting');
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setProfiles(prev => prev.map(p => p.id === updatedProfile.id ? updatedProfile : p));
  };

  const handleSelectProfile = (profile: UserProfile, mode: 'view' | 'edit') => {
    if (!currentUser) return;

    // 1. CHECK LOCK STATUS
    if (profile.viewedBy && profile.viewedBy !== currentUser.id) {
        alert(`Hồ sơ này đang được xem bởi ${profile.viewedByName}. Vui lòng thử lại sau.`);
        return;
    }

    // 2. APPLY LOCK
    const lockedProfile = {
        ...profile,
        viewedBy: currentUser.id,
        viewedByName: currentUser.fullName
    };
    
    // Optimistically update state to show lock immediately (simulating realtime DB)
    handleUpdateProfile(lockedProfile);
    setActiveProfileId(profile.id);
    
    // 3. PERMISSION CHECK
    const isCreator = profile.collectorId === currentUser.id;
    const isAdmin = currentUser.role === 'admin';
    const hasEditRights = isAdmin || isCreator;

    if (mode === 'edit' && !hasEditRights) {
      alert("Bạn không có quyền chỉnh sửa hồ sơ này.");
      setIsReadOnly(true);
    } else {
      setIsReadOnly(mode === 'view');
    }

    setView('collecting');
  };

  const handleFinishOrBack = () => {
    // UNLOCK PROFILE when leaving the view
    if (activeProfileId && currentUser) {
        unlockProfile(activeProfileId, currentUser.id);
    }

    setActiveProfileId(null);
    setView('list');
  };

  // Auth Guard
  if (!currentUser) {
    return <LoginView onLoginSuccess={handleLogin} />;
  }

  const renderContent = () => {
    switch (view) {
      case 'create':
        return (
          <CreateView 
            onCreate={handleCreateProfile} 
            currentUser={currentUser} 
            existingProfiles={profiles}
          />
        );
      case 'list':
        return <ListView profiles={profiles} onSelectProfile={handleSelectProfile} currentUser={currentUser} />;
      case 'dashboard':
        return (
          <DashboardView 
            profiles={profiles} 
            currentUser={currentUser} 
            onNavigateToAdmin={() => setView('admin_users')}
          />
        );
      case 'admin_users':
        return currentUser.role === 'admin' ? <AdminUserView /> : <DashboardView profiles={profiles} currentUser={currentUser} />;
      case 'collecting':
        const activeProfile = profiles.find(p => p.id === activeProfileId);
        if (!activeProfile) {
            setView('list');
            return null;
        }
        return (
          <CollectorView 
            profile={activeProfile} 
            onUpdate={handleUpdateProfile}
            onFinish={handleFinishOrBack} // Finish = Unlock + Back
            onBack={handleFinishOrBack}   // Back = Unlock + Back
            readOnly={isReadOnly}
            currentUser={currentUser}
          />
        );
      default:
        return <ListView profiles={profiles} onSelectProfile={handleSelectProfile} currentUser={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-900">
        {/* Top Header for Main Views */}
        {view !== 'collecting' && (
            <div className="bg-white px-4 py-3 shadow-sm border-b border-red-700 sticky top-0 z-30 flex justify-between items-center">
                <h1 className="text-lg font-bold text-red-700 flex items-center gap-2 uppercase">
                    <ShieldAlert className="text-red-600 fill-yellow-400" size={28} />
                    Công An Xã Kiều Phú
                </h1>
                <div className="text-xs text-right">
                  <div className="font-bold text-gray-700">{currentUser.fullName}</div>
                  <div className="text-gray-500 capitalize">{currentUser.role === 'admin' ? 'Chỉ huy' : 'Cán bộ'}</div>
                </div>
            </div>
        )}

      <main>
        {renderContent()}
      </main>

      {/* Navigation */}
      {view !== 'collecting' && (
        <Navbar 
          currentView={view} 
          onChangeView={setView} 
          onLogout={handleLogout} 
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default App;
