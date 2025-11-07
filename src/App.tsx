import { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './components/HomePage';
import ChatAndBuild from './components/ChatAndBuild';
import CustomBuild from './components/CustomBuild';
import TrainLibraries from './components/TrainLibraries';
import Settings from './components/Settings';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthModal from './components/AuthModal';

export type AppSection = 'home' | 'chat-build' | 'custom-build' | 'train-libraries' | 'settings';

function AppContent() {
  const [activeSection, setActiveSection] = useState<AppSection>('home');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const { user, loading } = useAuth();

  const handleSectionChange = (section: AppSection) => {
    setActiveSection(section);
      
    // Auto-collapse sidebar for specific sections
    if (['chat-build', 'custom-build', 'train-libraries'].includes(section)) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage isDarkMode={isDarkMode} />;
      case 'chat-build':
        return <ChatAndBuild isDarkMode={isDarkMode} />;
      case 'custom-build':
        return <CustomBuild isDarkMode={isDarkMode} />;
      case 'train-libraries':
        return <TrainLibraries isDarkMode={isDarkMode} />;
      case 'settings':
        return <Settings isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />;
      default:
        return <HomePage isDarkMode={isDarkMode} />;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-slate-900' : 'bg-gray-50'
    }`}>
      <div className="flex">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isDarkMode={isDarkMode}
          user={user}
          onShowAuthModal={() => setShowAuthModal(true)}
        />
        
        <main className={`flex-1 transition-all duration-300 h-screen overflow-hidden ${
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}>
          {renderActiveSection()}
        </main>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;