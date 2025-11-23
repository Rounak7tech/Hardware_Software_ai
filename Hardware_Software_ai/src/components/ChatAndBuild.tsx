import React, { useState } from 'react';
import { Send, Mic, Plus, ChevronRight, ChevronDown, Info, Code, Zap } from 'lucide-react';

interface ChatAndBuildProps {
  isDarkMode: boolean;
}

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HardwareItem {
  id: string;
  name: string;
  category: string;
  selected: boolean;
  description: string;
}

const ChatAndBuild: React.FC<ChatAndBuildProps> = ({ isDarkMode }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m your AI hardware assistant. I can help you build projects, suggest components, and generate code. What would you like to create today?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [hardwarePanelCollapsed, setHardwarePanelCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['microcontrollers']);
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  const [showProjectBuilder, setShowProjectBuilder] = useState(false);

  const hardwareCategories = {
    microcontrollers: [
      { id: 'arduino-uno', name: 'Arduino Uno R3', category: 'microcontrollers', selected: false, description: 'Popular microcontroller for beginners' },
      { id: 'esp32', name: 'ESP32 DevKit', category: 'microcontrollers', selected: false, description: 'WiFi + Bluetooth microcontroller' },
      { id: 'raspberry-pi', name: 'Raspberry Pi 4', category: 'microcontrollers', selected: false, description: 'Single-board computer' },
    ],
    sensors: [
      { id: 'dht22', name: 'DHT22', category: 'sensors', selected: false, description: 'Temperature & humidity sensor' },
      { id: 'ultrasonic', name: 'HC-SR04', category: 'sensors', selected: false, description: 'Ultrasonic distance sensor' },
      { id: 'motion', name: 'PIR Motion', category: 'sensors', selected: false, description: 'Motion detection sensor' },
    ],
    drivers: [
      { id: 'motor-driver', name: 'L298N', category: 'drivers', selected: false, description: 'Dual motor driver' },
      { id: 'servo', name: 'SG90 Servo', category: 'drivers', selected: false, description: 'Micro servo motor' },
      { id: 'stepper', name: 'NEMA17', category: 'drivers', selected: false, description: 'Stepper motor' },
    ],
    others: [
      { id: 'lcd', name: '16x2 LCD', category: 'others', selected: false, description: 'Character display' },
      { id: 'led-strip', name: 'WS2812B', category: 'others', selected: false, description: 'Addressable LED strip' },
      { id: 'buzzer', name: 'Active Buzzer', category: 'others', selected: false, description: 'Sound output' },
    ],
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I understand you want to work with those components. Let me help you create a project with them. Based on your selection, I can suggest a temperature monitoring system with IoT capabilities.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleHardware = (hardwareId: string) => {
    setSelectedHardware(prev =>
      prev.includes(hardwareId)
        ? prev.filter(id => id !== hardwareId)
        : [...prev, hardwareId]
    );
  };

  const generateProject = () => {
    setShowProjectBuilder(true);
  };

  return (
    <div className="h-screen flex">
      {/* Chat Section */}
      <div className={`flex-1 flex flex-col ${
        hardwarePanelCollapsed ? 'mr-12' : 'mr-80'
      } transition-all duration-300`}>
        {/* Chat Header */}
        <div className={`p-4 border-b ${
          isDarkMode 
            ? 'bg-slate-800/90 border-slate-700/50' 
            : 'bg-white/90 border-gray-200/50'
        } backdrop-blur-xl`}>
          <h2 className={`text-xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            AI Chat & Build Assistant
          </h2>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] p-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-emerald-500 text-white ml-auto'
                    : isDarkMode
                    ? 'bg-slate-700/90 text-white'
                    : 'bg-white text-gray-900 border border-gray-200'
                } shadow-lg backdrop-blur-xl`}
              >
                <p className="text-sm">{message.content}</p>
                <span className={`text-xs mt-2 block ${
                  message.type === 'user' ? 'text-emerald-100' : isDarkMode ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${
          isDarkMode 
            ? 'bg-slate-800/90 border-slate-700/50' 
            : 'bg-white/90 border-gray-200/50'
        } backdrop-blur-xl`}>
          <div className="flex space-x-2 mb-3">
            <button
              onClick={generateProject}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
            >
              <Zap size={16} />
              <span>Generate Project Suggestions</span>
            </button>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
              isDarkMode 
                ? 'bg-slate-700 text-white hover:bg-slate-600' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              <Plus size={16} />
              <span>Add New Hardware</span>
            </button>
          </div>

          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about hardware components, project ideas, or code generation..."
                className={`w-full p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDarkMode 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <button className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors">
              <Mic size={20} />
            </button>
            <button 
              onClick={handleSendMessage}
              className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Hardware Panel */}
      <div className={`fixed right-0 top-0 h-full transition-all duration-300 ${
        hardwarePanelCollapsed ? 'w-12' : 'w-80'
      } z-40`}>
        <div className={`h-full ${
          isDarkMode 
            ? 'bg-slate-800/90 border-l border-slate-700/50' 
            : 'bg-white/90 border-l border-gray-200/50'
        } backdrop-blur-xl shadow-2xl`}>
          
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
            {!hardwarePanelCollapsed && (
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Hardware Components
              </h3>
            )}
            <button
              onClick={() => setHardwarePanelCollapsed(!hardwarePanelCollapsed)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              {hardwarePanelCollapsed ? <ChevronRight size={20} /> : <ChevronRight size={20} className="rotate-180" />}
            </button>
          </div>

          {!hardwarePanelCollapsed && (
            <div className="p-4 overflow-y-auto h-full">
              {Object.entries(hardwareCategories).map(([category, items]) => (
                <div key={category} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-slate-700 text-white' : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    <span className="font-medium capitalize">{category}</span>
                    {expandedCategories.includes(category) ? 
                      <ChevronDown size={16} /> : <ChevronRight size={16} />
                    }
                  </button>

                  {expandedCategories.includes(category) && (
                    <div className="mt-2 space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedHardware.includes(item.id)
                              ? isDarkMode 
                                ? 'bg-emerald-500/20 border-emerald-500/50' 
                                : 'bg-emerald-50 border-emerald-200'
                              : isDarkMode 
                              ? 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700' 
                              : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedHardware.includes(item.id)}
                              onChange={() => toggleHardware(item.id)}
                              className="mt-1 w-4 h-4 text-emerald-500 rounded focus:ring-emerald-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h4 className={`font-medium text-sm ${
                                  isDarkMode ? 'text-white' : 'text-gray-900'
                                }`}>
                                  {item.name}
                                </h4>
                                <button className={`text-xs ${
                                  isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'
                                }`}>
                                  <Info size={12} />
                                </button>
                              </div>
                              <p className={`text-xs mt-1 ${
                                isDarkMode ? 'text-slate-400' : 'text-gray-600'
                              }`}>
                                {item.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Project Builder Modal */}
      {showProjectBuilder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-6xl h-[80vh] rounded-2xl ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          } shadow-2xl overflow-hidden`}>
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Generated Project
              </h3>
              <button
                onClick={() => setShowProjectBuilder(false)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                Close
              </button>
            </div>
            
            <div className="flex h-full">
              {/* Code Editor */}
              <div className="flex-1 p-4">
                <div className={`h-full rounded-lg ${
                  isDarkMode ? 'bg-slate-900' : 'bg-gray-900'
                } p-4`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Code size={16} className="text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Generated Code</span>
                  </div>
                  <pre className="text-green-400 text-sm font-mono overflow-auto h-full">
{`#include <WiFi.h>
#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  
  WiFi.begin("YOUR_SSID", "YOUR_PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  Serial.print("Temperature: ");
  Serial.print(temperature);
  Serial.print("°C, Humidity: ");
  Serial.print(humidity);
  Serial.println("%");
  
  delay(2000);
}`}
                  </pre>
                </div>
              </div>
              
              {/* Circuit Diagram & Instructions */}
              <div className="w-1/3 p-4 border-l border-slate-700">
                <h4 className={`font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Wiring Diagram & Instructions
                </h4>
                <div className={`rounded-lg p-4 mb-4 ${
                  isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                    Circuit diagram would be generated here based on selected components.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <h5 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Step 1: Hardware Setup
                    </h5>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Connect DHT22 VCC to 3.3V, GND to GND, and Data to Pin 2
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <h5 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Step 2: Code Upload
                    </h5>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Upload the generated code to your ESP32 board
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-slate-700' : 'bg-gray-100'}`}>
                    <h5 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Step 3: Testing
                    </h5>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      Open Serial Monitor to view temperature readings
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatAndBuild;