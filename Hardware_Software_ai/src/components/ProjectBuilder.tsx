import React, { useState, useMemo } from 'react';
import { Settings, Code, ChevronDown, ChevronRight, Zap, BookOpen, Search, Check, Plus, Trash2 } from 'lucide-react';
// import PDFExportButton from './PDFExportButton'; // <-- COMMENTED OUT: Prevents error if file is missing
import CustomBuild from './CustomBuild'; // <-- Ensure this file (CustomBuild.tsx) exists and exports 'CustomBuild'

// =========================================================================
// --- TYPES & INTERFACES (Must match CustomBuild.tsx) --- 
// =========================================================================

interface WiringStep {
    instruction: string;
    image_url: string;
    component: string;
}

interface CustomComponent {
    name: string;
    type: string;
    pin: string;
}

// Custom Check icon for selected items
const CheckIcon: React.FC<any> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// =========================================================================
// --- WIRING VISUALIZATION COMPONENTS (Simplified) ---
// =========================================================================

const BreadboardVisualizer: React.FC<{ activeStep: WiringStep | null }> = ({ activeStep }) => {
  if (!activeStep) return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Select a step to view the wiring diagram.</div>;
  const { instruction, component } = activeStep;
  
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-inner min-h-[350px] flex flex-col items-center space-y-4">
      <h4 className="text-lg font-bold text-teal-600 dark:text-teal-400 border-b pb-2 w-full text-center">Active Component: {component}</h4>
      <p className="text-center text-sm text-slate-700 dark:text-slate-300 max-w-lg italic">{instruction}</p>
      <div className="relative w-full max-w-sm h-48 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center p-4 border-4 border-orange-300 dark:border-orange-700 shadow-md">
        <span className="text-xl font-bold text-slate-700 dark:text-slate-200">Breadboard View Mockup</span>
      </div>
    </div>
  );
};

const WiringStepList: React.FC<{ wiring: WiringStep[], activeStep: number, setActiveStep: (index: number) => void }> = ({ wiring, activeStep, setActiveStep }) => (
  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 scroll-panel">
    {wiring.map((step, index) => (
      <button
        key={index}
        onClick={() => setActiveStep(index)}
        className={`w-full text-left p-4 rounded-xl transition-all duration-200 border-l-4 ${
          index === activeStep
            ? 'bg-teal-50 dark:bg-teal-900/30 border-teal-500 shadow-lg text-teal-800 dark:text-teal-300'
            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-700 dark:text-slate-200'
        }`}
      >
        <span className="font-semibold block">Step {index + 1}: {step.component}</span>
        <span className="text-xs block mt-1 opacity-80">{step.instruction}</span>
      </button>
    ))}
  </div>
);

// =========================================================================
// --- MOCK DATABASE (Project & Hardware Data) ---
// =========================================================================
const mockProjects = [
  {
    id: 'weather_station',
    name: 'IoT Weather Station',
    requiredComponents: ['esp32-devkit', 'bme280', 'ssd1306'], 
    difficulty: 'Medium',
    description: 'Measures and displays local temperature, humidity, and barometric pressure over Wi-Fi.',
    guide: {
      wiring: [
        { instruction: 'Connect BME280 SCL pin to ESP32 pin D22.', component: 'BME280 Sensor', image_url: '' },
        { instruction: 'Connect SSD1306 SCL pin to ESP32 pin D22 (sharing I2C).', component: 'SSD1306 Driver', image_url: '' },
      ],
      code: `// Arduino/ESP32 Code for IoT Weather Station
#include <Wire.h>
// ... (code snippet)
}`
    }
  }
];

const hardwareCategories = {
    microcontrollers: {
      arduino: [{ id: 'arduino-uno-r3', name: 'Arduino Uno R3', description: 'ATmega328P', specs: '16MHz, 32KB Flash', image_url: 'https://placehold.co/80x80/00979C/FFFFFF?text=UNO' }],
      esp: [{ id: 'esp32-devkit', name: 'ESP32 DevKit V1', description: 'Wi-Fi & Bluetooth', specs: '240MHz, 520KB SRAM', image_url: 'https://placehold.co/80x80/673AB7/FFFFFF?text=ESP32' }],
    },
    sensors: {
      environmental: [{ id: 'bme280', name: 'BME280', description: 'Pressure, temp & humidity', specs: 'I2C/SPI', image_url: 'https://placehold.co/80x80/8BC34A/333333?text=BME280' }],
    },
    drivers: {
      display: [{ id: 'ssd1306', name: 'SSD1306 OLED Driver', description: '128x64 OLED display', specs: 'I2C/SPI', image_url: 'https://placehold.co/80x80/00BCD4/FFFFFF?text=OLED' }],
    }
  };

// =========================================================================
// --- MAIN PROJECT BUILDER COMPONENT ---
// =========================================================================

const ProjectBuilder: React.FC = () => {
  // --- STATE FOR CustomBuild.tsx (Passed as Props) ---
  const [projectName, setProjectName] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [features, setFeatures] = useState<string[]>([]);
  const [customComponents, setCustomComponents] = useState<CustomComponent[]>([{ name: '', type: '', pin: '' }]);
  
  // --- STATE FOR Hardware Catalog & Guide ---
  const [selectedHardware, setSelectedHardware] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['microcontrollers']);
  const [searchText, setSearchText] = useState(''); 
  const [suggestedProjects, setSuggestedProjects] = useState<any[]>([]);
  const [selectedProjectGuide, setSelectedProjectGuide] = useState<any | null>(null);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false); 
  const [activeWiringStep, setActiveWiringStep] = useState(0); 

  // --- HANDLERS PASSED TO CustomBuild.tsx ---
  const toggleFeature = (feature: string) => {
    setFeatures(prev => prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]);
  };
  const addCustomComponent = () => {
    setCustomComponents([...customComponents, { name: '', type: '', pin: '' }]);
  };
  const removeCustomComponent = (index: number) => {
    setCustomComponents(customComponents.filter((_, i) => i !== index));
  };
  const updateCustomComponent = (index: number, field: string, value: string) => {
    const updated = [...customComponents];
    updated[index] = { ...updated[index], [field]: value };
    setCustomComponents(updated);
  };
  // ------------------------------------------

  // --- CORE LOGIC FUNCTIONS ---
  const filteredHardwareCategories = useMemo(() => {
    if (!searchText) return hardwareCategories;
    const lowerCaseSearch = searchText.toLowerCase();
    const filtered: Record<string, any> = {};

    Object.entries(hardwareCategories).forEach(([categoryKey, categoryValue]) => {
      let filteredCategoryData: Record<string, any> = {};
      
      if (typeof categoryValue === 'object' && !Array.isArray(categoryValue)) {
        Object.entries(categoryValue).forEach(([subCategoryKey, items]: [string, any]) => {
          const filteredItems = items.filter((item: any) =>
            item.name.toLowerCase().includes(lowerCaseSearch) || item.id.toLowerCase().includes(lowerCaseSearch)
          );
          if (filteredItems.length > 0) {
            filteredCategoryData = { ...filteredCategoryData, [subCategoryKey]: filteredItems };
          }
        });
        if (Object.keys(filteredCategoryData).length > 0) { (filtered as any)[categoryKey] = filteredCategoryData; }
      }
    });
    return filtered;
  }, [searchText]);
  
  const findSuggestedProjects = () => {
    setSelectedProjectGuide(null); 
    setIsSearchPerformed(true);
    if (selectedHardware.length === 0) { setSuggestedProjects([]); return; }
    const suggestions = mockProjects.filter(project => 
      project.requiredComponents.some(requiredId => selectedHardware.includes(requiredId))
    );
    setSuggestedProjects(suggestions);
  };
  
  const selectProject = (project: any) => {
    setSelectedProjectGuide(project.guide);
    setProjectName(project.name); 
    setActiveWiringStep(0); 
  };

  const toggleHardware = (id: string) => {
    setIsSearchPerformed(false);
    setSelectedProjectGuide(null);
    setSelectedHardware(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) ? prev.filter(cat => cat !== category) : [...prev, category]
    );
  };

  // RENDER FUNCTION FOR HARDWARE CATALOG
  const renderHardwareCategory = (categoryName: string, categoryData: any) => {
    const isExpanded = expandedCategories.includes(categoryName);
    const categoryHasContent = Object.keys(categoryData).length > 0;
    
    if (!categoryHasContent && searchText) return null;
    
    return (
      <div key={categoryName} className="mb-6">
        <button
          onClick={() => toggleCategory(categoryName)}
          className="flex items-center justify-between w-full p-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 transition-all duration-200 mb-4 border border-blue-200/50 dark:border-blue-700/50"
        >
          <span className="font-semibold text-slate-800 dark:text-white capitalize text-lg">{categoryName.replace('-', ' ')}</span>
          {isExpanded ? <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <ChevronRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
        </button>

        {isExpanded && categoryHasContent && (
          <div className="space-y-4 ml-4">
            {Object.entries(categoryData).map(([subCategory, items]: [string, any]) => (
                <div key={subCategory} className="mb-4">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300 mb-3 capitalize text-sm bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg">{subCategory.toUpperCase()}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex items-start space-x-3 p-4 rounded-xl bg-white/70 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 group">
                        <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700/50">
                          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h5 className="font-semibold text-slate-800 dark:text-white text-sm group-hover:text-teal-600 dark:group-hover:text-teal-400">{item.name}</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mb-1">{item.description}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{item.specs}</p>
                        </div>
                        <button onClick={() => toggleHardware(item.id)} className="mt-1 flex-shrink-0 transition-colors duration-200">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedHardware.includes(item.id) ? 'bg-teal-500 border-teal-500' : 'border-slate-300 dark:border-slate-600 hover:border-teal-500'
                          }`}>
                            {selectedHardware.includes(item.id) && (<CheckIcon className="w-3 h-3 text-white" />)}
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // --- MAIN RENDER ---
  return (
    <div className="p-4 sm:p-8 max-w-full lg:max-w-7xl mx-auto min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white font-sans">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Project Recommendation Engine</h1>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        
        {/* Left Column (xl:col-span-2) */}
        <div className="xl:col-span-2 space-y-6 order-1">
          
          {/* 1. Custom Project Builder Component (THE FORM) */}
          <CustomBuild 
            projectName={projectName}
            setProjectName={setProjectName}
            selectedBoard={selectedBoard}
            setSelectedBoard={setSelectedBoard}
            features={features}
            toggleFeature={toggleFeature}
            customComponents={customComponents}
            addCustomComponent={addCustomComponent}
            removeCustomComponent={removeCustomComponent}
            updateCustomComponent={updateCustomComponent}
          />

          {/* 2. Hardware Catalog Selection Panel */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-fuchsia-500" />
              <span>Hardware Catalog ({selectedHardware.length} Components)</span>
            </h2>
            <div className="relative mb-6">
              <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search components..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/50 focus:ring-2 focus:ring-fuchsia-500 text-slate-800 dark:text-white"
              />
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            </div>
            
            <div className="space-y-6 max-h-[60vh] overflow-y-auto scroll-panel pr-4">
              {Object.entries(filteredHardwareCategories).map(([category, data]) => renderHardwareCategory(category, data))}
            </div>
          </div>
          
          {/* 3. Project Search & Results Panel */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
            <button
              onClick={findSuggestedProjects}
              disabled={selectedHardware.length === 0}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-white transition-all duration-300 ${
                selectedHardware.length > 0
                  ? 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 shadow-lg shadow-teal-500/30'
                  : 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
              }`}
            >
              <Code className="w-5 h-5" />
              <span>{selectedHardware.length === 0 ? 'Select Hardware to Search' : `Find Projects with ${selectedHardware.length} Components`}</span>
            </button>
            
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mt-6 mb-3 border-b border-slate-200 dark:border-slate-700 pb-2">Matching Project Ideas</h3>
            {isSearchPerformed && suggestedProjects.length > 0 ? (
              <div className="space-y-4">
                {suggestedProjects.map(project => (
                  <div key={project.id} onClick={() => selectProject(project)} className="p-4 rounded-xl cursor-pointer bg-slate-50 dark:bg-slate-700/50 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors duration-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h4 className="font-semibold text-slate-800 dark:text-white flex items-center justify-between"><span>{project.name}</span><span className="text-xs font-normal text-blue-600 dark:text-blue-400">{project.difficulty}</span></h4>
                  </div>
                ))}
              </div>
            ) : isSearchPerformed ? (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">No matching projects found.</p>
            ) : (
              <p className="text-center py-8 text-slate-500 dark:text-slate-400">Hit 'Find Projects' after selecting hardware to see suggestions.</p>
            )}
          </div>
        </div>
        
        {/* Right Column: Guide & AI Assistant Panel (xl:col-span-2) */}
        <div className="xl:col-span-2 space-y-6 order-2">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 min-h-[700px]">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-blue-500" />
              <span>Project Guide: {projectName || 'Custom Build'}</span>
            </h2>

            {selectedProjectGuide ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center space-x-2 mb-4">
                    <Settings className="w-5 h-5 text-fuchsia-500" />
                    <span>Wiring Guide Steps</span>
                  </h3>
                  <WiringStepList wiring={selectedProjectGuide.wiring} activeStep={activeWiringStep} setActiveStep={setActiveWiringStep} />
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center space-x-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Code className="w-5 h-5 text-teal-500" />
                    <span>Code Snippet</span>
                  </h3>
                  <pre className="bg-slate-900 text-white p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-md max-h-40">
                    <code>{selectedProjectGuide.code.substring(0, 300)}...</code>
                  </pre>
                  {/* <PDFExportButton projectName={projectName || 'Custom Project'} guide={selectedProjectGuide} /> */}
                </div>
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white flex items-center space-x-2 mb-4">
                    <Zap className="w-5 h-5 text-red-500" />
                    <span>Visual Connection (Step {activeWiringStep + 1})</span>
                  </h3>
                  <BreadboardVisualizer activeStep={selectedProjectGuide.wiring[activeWiringStep]} />
                </div>
              </div>
            ) : (
              <div className="text-center p-16 text-slate-500 dark:text-slate-400">
                <BookOpen className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-semibold">No Guide Selected</p>
                <p className="text-sm">Select a project idea from the **Matching Project Ideas** section to view its guide here.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProjectBuilder;