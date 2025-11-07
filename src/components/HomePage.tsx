import React from 'react';
import { ArrowRight, Zap, TrendingUp, Clock, Cpu } from 'lucide-react';
import Draggable from 'react-draggable';

interface HomePageProps {
  isDarkMode: boolean;
}

const components = [
  { name: 'Microcontroller', image: '/images/microcontroller.png', pins: ['VCC', 'GND', 'D2', 'D3'] },
  { name: 'Sensor', image: '/images/sensor.png', pins: ['VCC', 'GND', 'OUT'] },
  { name: 'Driver', image: '/images/driver.png', pins: ['IN1', 'IN2', 'OUT1', 'OUT2'] },
];

const HomePage: React.FC<HomePageProps> = ({ isDarkMode }) => {
  const recentProjects = [
    { name: 'IoT Temperature Monitor', type: 'Arduino + DHT22', lastModified: '2 hours ago', status: 'Active' },
    { name: 'Smart Door Lock', type: 'ESP32 + Servo', lastModified: '1 day ago', status: 'Complete' },
    { name: 'Plant Watering System', type: 'Raspberry Pi + Sensors', lastModified: '3 days ago', status: 'In Progress' },
  ];

  const stats = [
    { label: 'Total Projects', value: '12', icon: <Cpu size={20} />, trend: '+3' },
    { label: 'Active Builds', value: '5', icon: <Zap size={20} />, trend: '+2' },
    { label: 'Success Rate', value: '94%', icon: <TrendingUp size={20} />, trend: '+5%' },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className={`rounded-3xl p-8 mb-8 relative overflow-hidden ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 border border-slate-600/30' 
          : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-200/30'
      } backdrop-blur-xl shadow-2xl`}>
        <div className="relative z-10">
          <h1 className={`text-4xl font-bold mb-3 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Your Confidential AI Hardware Project Assistant
          </h1>
          <p className={`text-lg mb-6 ${
            isDarkMode ? 'text-slate-300' : 'text-gray-600'
          }`}>
            Build, prototype, and deploy hardware projects with AI-powered assistance and automated code generation.
          </p>
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
            <span>Quick Start</span>
            <ArrowRight size={20} />
          </button>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-emerald-500/20 to-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`rounded-2xl p-6 ${
              isDarkMode 
                ? 'bg-slate-800/90 border border-slate-700/50' 
                : 'bg-white/90 border border-gray-200/50'
            } backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-200`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                isDarkMode 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-emerald-50 text-emerald-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {stat.value}
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className={`rounded-2xl p-6 ${
        isDarkMode 
          ? 'bg-slate-800/90 border border-slate-700/50' 
          : 'bg-white/90 border border-gray-200/50'
      } backdrop-blur-xl shadow-xl mb-8`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Recent Projects
          </h2>
          <button className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'text-emerald-400 hover:bg-emerald-500/20' 
              : 'text-emerald-600 hover:bg-emerald-50'
          }`}>
            View All
          </button>
        </div>

        <div className="space-y-4">
          {recentProjects.map((project, index) => (
            <div
              key={index}
              className={`rounded-xl p-4 transition-all duration-200 hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-slate-700/50 border border-slate-600/30 hover:bg-slate-700/70' 
                  : 'bg-gray-50/50 border border-gray-200/30 hover:bg-gray-50/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-semibold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {project.name}
                  </h3>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    {project.type}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-medium mb-1 ${
                    project.status === 'Active' 
                      ? (isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600')
                      : project.status === 'Complete'
                      ? (isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                      : (isDarkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-50 text-yellow-600')
                  }`}>
                    {project.status}
                  </span>
                  <div className={`flex items-center text-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    <Clock size={12} className="mr-1" />
                    {project.lastModified}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Draggable Components Section */}
      <div className="mb-8">
        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Components</h2>
        <div className="relative h-96 border border-dashed border-gray-300 rounded-xl bg-gray-50 dark:bg-slate-800/50">
          {components.map((comp, index) => (
            <Draggable key={index}>
              <div className="absolute cursor-pointer group">
                <img src={comp.image} alt={comp.name} className="w-24 h-24 object-contain" />
                <div className="absolute left-0 top-full mt-1 w-32 p-2 bg-white dark:bg-slate-700 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <strong className="text-sm">{comp.name} Pins:</strong>
                  <ul className="text-xs mt-1">
                    {comp.pins.map((pin, i) => (
                      <li key={i}>{pin}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </Draggable>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
