import React from 'react';
import { Shield, Moon, Sun, MessageCircle, Bell, Download, Database, Wifi } from 'lucide-react';

interface SettingsProps {
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, onThemeToggle }) => {
  const settingsGroups = [
    {
      title: 'Privacy & Security',
      icon: <Shield size={20} />,
      items: [
        {
          id: 'confidentiality',
          label: 'Confidentiality Mode',
          description: 'Enable enhanced privacy protections for sensitive projects',
          type: 'toggle',
          value: true,
        },
        {
          id: 'data-local',
          label: 'Local Data Processing',
          description: 'Process sensitive data locally instead of cloud services',
          type: 'toggle',
          value: true,
        },
        {
          id: 'encryption',
          label: 'Project Encryption',
          description: 'Encrypt project files and configurations',
          type: 'toggle',
          value: false,
        },
      ],
    },
    {
      title: 'Appearance',
      icon: isDarkMode ? <Moon size={20} /> : <Sun size={20} />,
      items: [
        {
          id: 'theme',
          label: 'Dark Mode',
          description: 'Toggle between light and dark themes',
          type: 'toggle',
          value: isDarkMode,
          action: onThemeToggle,
        },
        {
          id: 'accent-color',
          label: 'Accent Color',
          description: 'Choose your preferred accent color',
          type: 'select',
          value: 'emerald',
          options: ['emerald', 'blue', 'purple', 'orange'],
        },
        {
          id: 'sidebar-auto-collapse',
          label: 'Auto-collapse Sidebar',
          description: 'Automatically collapse sidebar in build modes',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      title: 'AI Assistant',
      icon: <MessageCircle size={20} />,
      items: [
        {
          id: 'response-style',
          label: 'AI Response Style',
          description: 'Choose how the AI assistant communicates',
          type: 'select',
          value: 'professional',
          options: ['professional', 'casual', 'technical', 'beginner-friendly'],
        },
        {
          id: 'code-generation',
          label: 'Auto Code Generation',
          description: 'Automatically generate code suggestions',
          type: 'toggle',
          value: true,
        },
        {
          id: 'component-suggestions',
          label: 'Component Suggestions',
          description: 'Show hardware component recommendations',
          type: 'toggle',
          value: true,
        },
      ],
    },
    {
      title: 'Notifications',
      icon: <Bell size={20} />,
      items: [
        {
          id: 'build-complete',
          label: 'Build Completion',
          description: 'Notify when project builds are complete',
          type: 'toggle',
          value: true,
        },
        {
          id: 'error-alerts',
          label: 'Error Alerts',
          description: 'Show notifications for compilation errors',
          type: 'toggle',
          value: true,
        },
        {
          id: 'component-updates',
          label: 'Component Updates',
          description: 'Notify about new hardware components',
          type: 'toggle',
          value: false,
        },
      ],
    },
    {
      title: 'Advanced',
      icon: <Database size={20} />,
      items: [
        {
          id: 'debug-mode',
          label: 'Debug Mode',
          description: 'Enable detailed logging and debug information',
          type: 'toggle',
          value: false,
        },
        {
          id: 'api-endpoint',
          label: 'API Endpoint',
          description: 'Custom API endpoint for AI services',
          type: 'input',
          value: 'https://api.hardware-ai.dev',
        },
        {
          id: 'offline-mode',
          label: 'Offline Mode',
          description: 'Work without internet connection (limited features)',
          type: 'toggle',
          value: false,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => {
    switch (item.type) {
      case 'toggle':
        return (
          <div className="flex items-center space-x-3">
            <button
              onClick={item.action}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                item.value
                  ? 'bg-emerald-500'
                  : isDarkMode
                  ? 'bg-slate-600'
                  : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  item.value ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={item.value}
            className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            {item.options.map((option: string) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        );
      
      case 'input':
        return (
          <input
            type="text"
            value={item.value}
            className={`px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDarkMode
                ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          Settings
        </h2>
        <p className={`${
          isDarkMode ? 'text-slate-400' : 'text-gray-600'
        }`}>
          Configure your AI hardware assistant preferences and privacy settings
        </p>
      </div>

      {/* Settings Groups */}
      <div className="space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className={`rounded-2xl ${
              isDarkMode
                ? 'bg-slate-800/90 border border-slate-700/50'
                : 'bg-white/90 border border-gray-200/50'
            } backdrop-blur-xl shadow-xl`}
          >
            {/* Group Header */}
            <div className="p-6 border-b border-slate-700/50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                }`}>
                  {group.icon}
                </div>
                <h3 className={`text-lg font-bold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {group.title}
                </h3>
              </div>
            </div>

            {/* Group Items */}
            <div className="p-6 space-y-4">
              {group.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className={`p-4 rounded-xl transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700/30 hover:bg-slate-700/50'
                      : 'bg-gray-50/50 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-semibold ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {item.label}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        isDarkMode ? 'text-slate-400' : 'text-gray-600'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {renderSettingItem(item)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className={`mt-8 p-6 rounded-2xl ${
        isDarkMode
          ? 'bg-slate-800/90 border border-slate-700/50'
          : 'bg-white/90 border border-gray-200/50'
      } backdrop-blur-xl shadow-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Data Management
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Export or clear your project data
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
              isDarkMode
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
            }`}>
              <Download size={16} />
              <span>Export Settings</span>
            </button>
            
            <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Version Info */}
      <div className="mt-6 text-center">
        <p className={`text-sm ${
          isDarkMode ? 'text-slate-500' : 'text-gray-400'
        }`}>
          AI Hardware Assistant v2.1.0 • Built with confidentiality in mind
        </p>
      </div>
    </div>
  );
};

export default Settings;