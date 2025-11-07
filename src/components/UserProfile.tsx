import React from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileProps {
  isDarkMode: boolean;
}

const UserProfile: React.FC<UserProfileProps> = ({ isDarkMode }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-full ${
          isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
        }`}>
          <User size={20} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'} />
        </div>
        <div>
          <h3 className={`font-medium ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            {user.displayName || 'User'}
          </h3>
          <p className={`text-sm ${
            isDarkMode ? 'text-slate-400' : 'text-slate-600'
          }`}>
            {user.email}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDarkMode
              ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>

        <button
          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDarkMode
              ? 'text-slate-300 hover:bg-slate-700 hover:text-white'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};

export default UserProfile;

