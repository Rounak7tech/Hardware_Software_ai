import React from 'react';
import { 
  Home, 
  MessageSquareCode, 
  Wrench, 
  BookOpen, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  User,
  LogIn
} from 'lucide-react';
import { AppSection } from '../App';
import { User as FirebaseUser } from 'firebase/auth';

interface SidebarProps {
  activeSection: AppSection;
  onSectionChange: (section: AppSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  user: FirebaseUser | null;
  onShowAuthModal: () => void;
}

interface NavItem {
  id: AppSection;
  label: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  isDarkMode,
  user,
  onShowAuthModal
}) => {
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: <Home size={20} /> },
    { id: 'chat-build', label: 'Chat & Build', icon: <MessageSquareCode size={20} /> },
    { id: 'custom-build', label: 'Custom Build', icon: <Wrench size={20} /> },
    { id: 'train-libraries', label: 'Train Libraries / RAG Training', icon: <BookOpen size={20} /> },
  ];

  const settingsItem: NavItem = {
    id: 'settings',
    label: 'Settings',
    icon: <Settings size={20} />
  };

  return (
    <div
      className={`fixed left-0 top-0 h-full transition-all duration-300 z-50 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Sidebar container with glassmorphism effect */}
      <div className={`h-full p-3 ${
        isDarkMode 
          ? 'bg-slate-800/90 backdrop-blur-xl border-r border-slate-700/50' 
          : 'bg-white/90 backdrop-blur-xl border-r border-gray-200/50'
      } rounded-r-2xl shadow-2xl`}>
        
        {/* Toggle button */}
        <button
          onClick={onToggleCollapse}
          className={`w-full mb-6 p-2 rounded-xl transition-all duration-200 flex items-center justify-center ${
            isDarkMode 
              ? 'hover:bg-slate-700/50 text-slate-300 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* Main navigation */}
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center ${
                collapsed ? 'justify-center' : 'justify-start space-x-3'
              } ${
                activeSection === item.id
                  ? `${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'} shadow-lg shadow-emerald-500/20`
                  : `${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
              }`}
            >
              {item.icon}
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="mt-auto pt-6">
          {user ? (
            <div className={`p-3 rounded-xl border ${
              isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  isDarkMode ? 'bg-slate-700' : 'bg-slate-100'
                }`}>
                  <User size={16} className={isDarkMode ? 'text-slate-300' : 'text-slate-600'} />
                </div>
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}>
                      {user.displayName || 'User'}
                    </p>
                    <p className={`text-xs truncate ${
                      isDarkMode ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onShowAuthModal}
              className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center ${
                collapsed ? 'justify-center' : 'justify-start space-x-3'
              } ${isDarkMode ? 'text-blue-400 hover:bg-slate-700/50 hover:text-blue-300' : 'text-blue-600 hover:bg-blue-50 hover:text-blue-700'}`}
            >
              <LogIn size={20} />
              {!collapsed && (
                <span className="font-medium text-sm">Sign In</span>
              )}
            </button>
          )}
        </div>

        {/* Settings */}
        <div className="pt-2">
          <button
            onClick={() => onSectionChange('settings')}
            className={`w-full p-3 rounded-xl transition-all duration-200 flex items-center ${
              collapsed ? 'justify-center' : 'justify-start space-x-3'
            } ${
              activeSection === 'settings'
                ? `${isDarkMode ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'} shadow-lg shadow-emerald-500/20`
                : `${isDarkMode ? 'text-slate-300 hover:bg-slate-700/50 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
            }`}
          >
            {settingsItem.icon}
            {!collapsed && (
              <span className="font-medium text-sm">{settingsItem.label}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;