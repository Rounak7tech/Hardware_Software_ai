import React, { useState, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { 
  Search, Plus, List, Play, Type, Link2, Grid, Undo, Redo, 
  ZoomOut, ZoomIn, Trash2, Sparkles, Download, Share2, 
  ChevronDown, ChevronRight, X
} from 'lucide-react';

// Pin position interface
interface Pin {
  name: string;
  x: number; // percentage from left (0-100)
  y: number; // percentage from top (0-100)
  type?: 'power' | 'ground' | 'digital' | 'analog' | 'i2c' | 'spi' | 'uart' | 'other';
}

// Component types for drag and drop
interface Component {
  id: string;
  name: string;
  type: 'microcontroller' | 'sensor' | 'driver' | 'breadboard' | 'capacitor' | 'resistor' | 'button' | 'led' | 'battery' | 'other';
  category: string;
  image: string;
  width?: number;
  height?: number;
  pins?: Pin[];
}

interface PlacedComponent extends Component {
  instanceId: string;
  x: number;
  y: number;
  rotation?: number;
}

// Component library data matching the image
const componentLibrary: Component[] = [
  
  // Microcontrollers
  { 
    id: 'esp32-30pin', 
    name: 'ESP32 (30 pin)', 
    type: 'microcontroller', 
    category: 'Parts', 
    image: '/assets/components/microcontrollers/esp32.png',
    pins: [
      { name: '3V3', x: 5, y: 5, type: 'power' },
      { name: 'EN', x: 5, y: 10, type: 'other' },
      { name: 'GPIO36', x: 5, y: 15, type: 'analog' },
      { name: 'GPIO39', x: 5, y: 20, type: 'analog' },
      { name: 'GPIO34', x: 5, y: 25, type: 'analog' },
      { name: 'GPIO35', x: 5, y: 30, type: 'analog' },
      { name: 'GPIO32', x: 5, y: 40, type: 'digital' },
      { name: 'GPIO33', x: 5, y: 45, type: 'digital' },
      { name: 'GPIO25', x: 5, y: 50, type: 'digital' },
      { name: 'GPIO26', x: 5, y: 55, type: 'digital' },
      { name: 'GPIO27', x: 5, y: 60, type: 'digital' },
      { name: 'GPIO14', x: 5, y: 65, type: 'digital' },
      { name: 'GPIO12', x: 5, y: 70, type: 'digital' },
      { name: 'GND', x: 5, y: 75, type: 'ground' },
      { name: 'GND', x: 5, y: 80, type: 'ground' },
      { name: 'GPIO13', x: 95, y: 5, type: 'digital' },
      { name: 'GPIO9', x: 95, y: 10, type: 'digital' },
      { name: 'GPIO10', x: 95, y: 15, type: 'digital' },
      { name: 'GPIO11', x: 95, y: 20, type: 'digital' },
      { name: 'VIN', x: 95, y: 30, type: 'power' },
      { name: 'GND', x: 95, y: 35, type: 'ground' },
      { name: 'GPIO23', x: 95, y: 40, type: 'digital' },
      { name: 'GPIO22', x: 95, y: 45, type: 'digital' },
      { name: 'GPIO1', x: 95, y: 50, type: 'digital' },
      { name: 'GPIO3', x: 95, y: 55, type: 'digital' },
      { name: 'GPIO21', x: 95, y: 60, type: 'i2c' }, // SDA
      { name: 'GPIO19', x: 95, y: 65, type: 'i2c' }, // SCL
      { name: 'GPIO18', x: 95, y: 70, type: 'digital' },
      { name: 'GPIO5', x: 95, y: 75, type: 'digital' },
      { name: 'GPIO17', x: 95, y: 80, type: 'digital' },
      { name: 'GPIO16', x: 95, y: 85, type: 'digital' },
      { name: 'GPIO4', x: 95, y: 90, type: 'digital' },
      { name: 'GPIO0', x: 95, y: 95, type: 'digital' },
      { name: 'GPIO2', x: 50, y: 95, type: 'digital' },
      { name: 'GPIO15', x: 50, y: 50, type: 'digital' },
    ]
  },
  { 
    id: 'arduino-uno-r3', 
    name: 'Arduino Uno R3', 
    type: 'microcontroller', 
    category: 'Parts', 
    image: '/assets/components/microcontrollers/arduino.png',
    pins: [
      { name: 'GND', x: 5, y: 5, type: 'ground' },
      { name: 'AREF', x: 5, y: 10, type: 'other' },
      { name: 'A0', x: 5, y: 15, type: 'analog' },
      { name: 'A1', x: 5, y: 20, type: 'analog' },
      { name: 'A2', x: 5, y: 25, type: 'analog' },
      { name: 'A3', x: 5, y: 30, type: 'analog' },
      { name: 'A4', x: 5, y: 35, type: 'analog' }, // SDA
      { name: 'A5', x: 5, y: 40, type: 'analog' }, // SCL
      { name: 'VIN', x: 95, y: 5, type: 'power' },
      { name: 'GND', x: 95, y: 10, type: 'ground' },
      { name: '5V', x: 95, y: 15, type: 'power' },
      { name: '3.3V', x: 95, y: 20, type: 'power' },
      { name: 'RESET', x: 95, y: 25, type: 'other' },
      { name: 'IOREF', x: 95, y: 30, type: 'other' },
      { name: 'D13', x: 95, y: 40, type: 'digital' },
      { name: 'D12', x: 95, y: 45, type: 'digital' },
      { name: 'D11', x: 95, y: 50, type: 'digital' }, // SPI MOSI
      { name: 'D10', x: 95, y: 55, type: 'digital' }, // SPI SS
      { name: 'D9', x: 95, y: 60, type: 'digital' },
      { name: 'D8', x: 95, y: 65, type: 'digital' },
      { name: 'D7', x: 50, y: 95, type: 'digital' },
      { name: 'D6', x: 50, y: 90, type: 'digital' },
      { name: 'D5', x: 50, y: 85, type: 'digital' },
      { name: 'D4', x: 50, y: 80, type: 'digital' },
      { name: 'D3', x: 50, y: 75, type: 'digital' },
      { name: 'D2', x: 50, y: 70, type: 'digital' },
      { name: 'D1', x: 50, y: 65, type: 'uart' }, // TX
      { name: 'D0', x: 50, y: 60, type: 'uart' }, // RX
    ]
  },
  
  // Sensors
  { 
    id: 'dht11', 
    name: 'DHT11 Humidity and Temperature Sensor (Sim test)', 
    type: 'sensor', 
    category: 'Parts', 
    image: '/assets/components/sensors/dht11.png',
    pins: [
      { name: 'VCC', x: 10, y: 10, type: 'power' },
      { name: 'DATA', x: 50, y: 50, type: 'digital' },
      { name: 'NC', x: 70, y: 50, type: 'other' },
      { name: 'GND', x: 10, y: 90, type: 'ground' },
    ]
  },
  { 
    id: 'hc-sr04', 
    name: 'HC-SR04 Ultrasonic', 
    type: 'sensor', 
    category: 'Parts', 
    image: '/assets/components/sensors/ultrasonic.png',
    pins: [
      { name: 'VCC', x: 10, y: 10, type: 'power' },
      { name: 'Trig', x: 30, y: 50, type: 'digital' },
      { name: 'Echo', x: 70, y: 50, type: 'digital' },
      { name: 'GND', x: 10, y: 90, type: 'ground' },
    ]
  },
  { 
    id: 'soil-moisture', 
    name: 'Soil Moisture Sensor', 
    type: 'sensor', 
    category: 'Parts', 
    image: '/assets/components/sensors/soil-moisture.png',
    width: 60,
    height: 60,
  },
  
  // Drivers
  { 
    id: 'l298n', 
    name: 'L298N Motor Driver', 
    type: 'driver', 
    category: 'Parts', 
    image: '/assets/components/drivers/l298n.png',
    width: 120,
    height: 80,
    pins: [
      { name: 'VCC', x: 10, y: 10, type: 'power' },
      { name: 'GND', x: 10, y: 20, type: 'ground' },
      { name: 'IN1', x: 10, y: 40, type: 'digital' },
      { name: 'IN2', x: 10, y: 50, type: 'digital' },
      { name: 'IN3', x: 10, y: 60, type: 'digital' },
      { name: 'IN4', x: 10, y: 70, type: 'digital' },
      { name: 'ENA', x: 10, y: 30, type: 'digital' },
      { name: 'ENB', x: 10, y: 80, type: 'digital' },
      { name: 'OUT1', x: 90, y: 40, type: 'other' },
      { name: 'OUT2', x: 90, y: 50, type: 'other' },
      { name: 'OUT3', x: 90, y: 60, type: 'other' },
      { name: 'OUT4', x: 90, y: 70, type: 'other' },
    ]
  },
  { 
    id: 'relay-module', 
    name: 'Relay Module', 
    type: 'driver', 
    category: 'Parts', 
    image: '/assets/components/drivers/relay.png',
    width: 80,
    height: 60,
    pins: [
      { name: 'VCC', x: 10, y: 20, type: 'power' },
      { name: 'GND', x: 10, y: 80, type: 'ground' },
      { name: 'IN', x: 50, y: 50, type: 'digital' },
      { name: 'COM', x: 90, y: 30, type: 'other' },
      { name: 'NO', x: 90, y: 50, type: 'other' },
      { name: 'NC', x: 90, y: 70, type: 'other' },
    ]
  },
  
  // Diodes & Transistors
  { 
    id: 'diode', 
    name: 'Diode', 
    type: 'other', 
    category: 'Parts', 
    image: '/assets/components/diode.png',
    width: 50,
    height: 30,
    pins: [
      { name: 'Anode', x: 10, y: 50, type: 'other' },
      { name: 'Cathode', x: 90, y: 50, type: 'other' },
    ]
  },
  { 
    id: 'npn-transistor', 
    name: 'NPN Transistor (EBC)', 
    type: 'other', 
    category: 'Parts', 
    image: '/assets/components/transistor-npn.png',
    width: 50,
    height: 60,
    pins: [
      { name: 'Emitter', x: 50, y: 10, type: 'other' },
      { name: 'Base', x: 10, y: 50, type: 'other' },
      { name: 'Collector', x: 50, y: 90, type: 'other' },
    ]
  },
  
  // Power & Others
  { 
    id: '9v-battery', 
    name: '9V Battery', 
    type: 'battery', 
    category: 'Parts', 
    image: '/assets/components/battery-9v.png',
    width: 50,
    height: 70,
    pins: [
      { name: '+', x: 50, y: 10, type: 'power' },
      { name: '-', x: 50, y: 90, type: 'ground' },
    ]
  },
  { 
    id: 'led', 
    name: 'LED', 
    type: 'led', 
    category: 'Parts', 
    image: '/assets/components/led.png',
    width: 30,
    height: 40,
    pins: [
      { name: 'Anode (+)', x: 50, y: 10, type: 'power' },
      { name: 'Cathode (-)', x: 50, y: 90, type: 'ground' },
    ]
  },
  { 
    id: 'servo', 
    name: 'Servo Motor', 
    type: 'driver', 
    category: 'Parts', 
    image: '/assets/components/servo.png',
    width: 60,
    height: 50,
    pins: [
      { name: 'VCC', x: 10, y: 20, type: 'power' },
      { name: 'GND', x: 10, y: 80, type: 'ground' },
      { name: 'Signal', x: 50, y: 50, type: 'digital' },
    ]
  },
  { 
    id: 'breadboard-half', 
    name: 'Half Breadboard', 
    type: 'breadboard', 
    category: 'Parts', 
    image: '/assets/components/breadboard-half.png',
    width: 160,
    height: 100,
  },
  { 
    id: 'breadboard-full', 
    name: 'Full Breadboard', 
    type: 'breadboard', 
    category: 'Parts', 
    image: '/assets/components/breadboard-full.png',
    width: 250,
    height: 100,
  },
  { 
    id: 'resistor', 
    name: 'Resistor', 
    type: 'resistor', 
    category: 'Parts', 
    image: '/assets/components/resistor.png',
    width: 60,
    height: 20,
    pins: [
      { name: 'Terminal 1', x: 5, y: 50, type: 'other' },
      { name: 'Terminal 2', x: 95, y: 50, type: 'other' },
    ]
  },
  { 
    id: 'pushbutton', 
    name: 'Push Button', 
    type: 'button', 
    category: 'Parts', 
    image: '/assets/components/pushbutton.png',
    width: 40,
    height: 40,
    pins: [
      { name: 'Pin 1', x: 20, y: 10, type: 'digital' },
      { name: 'Pin 2', x: 80, y: 10, type: 'digital' },
      { name: 'Pin 3', x: 20, y: 90, type: 'digital' },
      { name: 'Pin 4', x: 80, y: 90, type: 'digital' },
    ]
  },
  { 
    id: 'capacitor-electrolytic', 
    name: 'Electrolytic Capacitor', 
    type: 'capacitor', 
    category: 'Parts', 
    image: '/assets/components/capacitor-electrolytic.png',
    width: 40,
    height: 60,
    pins: [
      { name: '+', x: 50, y: 10, type: 'power' },
      { name: '-', x: 50, y: 90, type: 'ground' },
    ]
  },
  { 
    id: 'capacitor-ceramic', 
    name: 'Ceramic Capacitor', 
    type: 'capacitor', 
    category: 'Parts', 
    image: '/assets/components/capacitor-ceramic.png',
    width: 30,
    height: 40,
    pins: [
      { name: 'Terminal 1', x: 50, y: 10, type: 'other' },
      { name: 'Terminal 2', x: 50, y: 90, type: 'other' },
    ]
  },
];

// Draggable Component Item (in sidebar)
const DraggableComponent: React.FC<{ component: Component }> = ({ component }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
      title={component.name}
    >
      <img
        src={component.image}
        alt={component.name}
        className="w-full h-auto object-contain mb-1"
        draggable={false}
      />
      <p className="text-xs text-center text-slate-600 dark:text-slate-400 truncate">
        {component.name}
      </p>
    </div>
  );
};

// Pin Tooltip Component
const PinTooltip: React.FC<{ pin: Pin; componentWidth: number; componentHeight: number }> = ({ 
  pin, 
  componentWidth, 
  componentHeight 
}) => {
  const pinX = (pin.x / 100) * componentWidth;
  const pinY = (pin.y / 100) * componentHeight;
  
  const getPinColor = (type?: string) => {
    switch (type) {
      case 'power': return 'bg-red-500';
      case 'ground': return 'bg-black';
      case 'digital': return 'bg-blue-500';
      case 'analog': return 'bg-green-500';
      case 'i2c': return 'bg-purple-500';
      case 'spi': return 'bg-yellow-500';
      case 'uart': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="relative">
      {/* Pin indicator circle */}
      <div
        className={`absolute w-3 h-3 rounded-full border-2 border-white ${getPinColor(pin.type)} animate-pulse z-10`}
        style={{
          left: `${pinX - 6}px`,
          top: `${pinY - 6}px`,
        }}
      />
      {/* Pin label tooltip */}
      <div
        className="absolute bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg px-2 py-1 text-xs font-semibold z-20 pointer-events-none whitespace-nowrap"
        style={{
          left: `${pinX + 10}px`,
          top: `${pinY - 10}px`,
        }}
      >
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full ${getPinColor(pin.type)}`} />
          <span className="text-slate-700 dark:text-slate-200">{pin.name}</span>
        </div>
        {pin.type && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {pin.type.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

// Placed Component on Canvas
const PlacedComponentItem: React.FC<{
  component: PlacedComponent;
  onSelect: (id: string) => void;
  isSelected: boolean;
}> = ({ component, onSelect, isSelected }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredPin, setHoveredPin] = useState<Pin | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLACED_COMPONENT',
    item: component,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(component.instanceId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!component.pins || component.pins.length === 0 || !componentRef.current) return;
    
    const rect = componentRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Find the closest pin
    let closestPin: Pin | null = null;
    let minDistance = Infinity;
    const threshold = 5; // 5% threshold for pin detection
    
    component.pins.forEach((pin) => {
      const distance = Math.sqrt(Math.pow(pin.x - x, 2) + Math.pow(pin.y - y, 2));
      if (distance < threshold && distance < minDistance) {
        minDistance = distance;
        closestPin = pin;
      }
    });
    
    setHoveredPin(closestPin);
  };

  const componentWidth = component.width || 120;
  const componentHeight = component.height || 80;

  return (
    <div
      ref={(node) => {
        drag(node);
        if (componentRef.current !== node) {
          (componentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredPin(null);
      }}
      onMouseMove={handleMouseMove}
      className={`absolute cursor-move ${isDragging ? 'opacity-50' : ''} ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${isHovered && component.pins ? 'z-10' : ''}`}
      style={{
        left: `${component.x}px`,
        top: `${component.y}px`,
        transform: component.rotation ? `rotate(${component.rotation}deg)` : undefined,
      }}
    >
      <div className="relative">
        <img
          src={component.image}
          alt={component.name}
          className="pointer-events-none"
          style={{ width: componentWidth, height: componentHeight }}
          draggable={false}
          onError={(e) => {
            // Fallback to placeholder if image doesn't exist
            (e.target as HTMLImageElement).src = `https://placehold.co/${componentWidth}x${componentHeight}/64748B/FFFFFF?text=${component.name.substring(0, 10)}`;
          }}
        />
        {/* Show all pins when hovering over component */}
        {isHovered && component.pins && component.pins.length > 0 && (
          <div className="absolute inset-0 pointer-events-none">
            {component.pins.map((pin, index) => (
              <div key={index}>
                {/* Pin dot indicator */}
                <div
                  className={`absolute w-2 h-2 rounded-full border border-white ${
                    pin.type === 'power' ? 'bg-red-500' :
                    pin.type === 'ground' ? 'bg-black' :
                    pin.type === 'digital' ? 'bg-blue-500' :
                    pin.type === 'analog' ? 'bg-green-500' :
                    pin.type === 'i2c' ? 'bg-purple-500' :
                    pin.type === 'spi' ? 'bg-yellow-500' :
                    pin.type === 'uart' ? 'bg-orange-500' :
                    'bg-gray-500'
                  } ${hoveredPin?.name === pin.name ? 'w-3 h-3 z-10' : 'opacity-70'}`}
                  style={{
                    left: `${(pin.x / 100) * componentWidth - 4}px`,
                    top: `${(pin.y / 100) * componentHeight - 4}px`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {/* Show pin tooltip for hovered pin */}
        {isHovered && hoveredPin && (
          <PinTooltip
            pin={hoveredPin}
            componentWidth={componentWidth}
            componentHeight={componentHeight}
          />
        )}
      </div>
      {isSelected && (
        <div className="absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
          {component.name}
        </div>
      )}
    </div>
  );
};

// Main CustomBuild Component
interface CustomBuildProps {
  isDarkMode?: boolean;
}

const CustomBuild: React.FC<CustomBuildProps> = ({ isDarkMode = true }) => {
  // Apply dark mode class to root element if needed
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);
  
  const [circuitName, setCircuitName] = useState('Custom Build');
  const [activeMode, setActiveMode] = useState<'design' | 'code' | 'simulate'>('design');
  const [activeTab, setActiveTab] = useState<'all' | 'simulation'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Parts']);
  const [placedComponents, setPlacedComponents] = useState<PlacedComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [canvasOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<PlacedComponent[][]>([]);
  const historyIndexRef = useRef(-1);

  // Filter components based on search and tab
  const filteredComponents = componentLibrary.filter((comp) => {
    const matchesSearch = comp.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || (activeTab === 'simulation' && comp.type !== 'other');
    return matchesSearch && matchesTab;
  });

  // Group components by category
  const componentsByCategory = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.category]) acc[comp.category] = [];
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, Component[]>);

  const saveToHistory = () => {
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    historyRef.current.push([...placedComponents]);
    historyIndexRef.current = historyRef.current.length - 1;
  };

  const undo = () => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      setPlacedComponents([...historyRef.current[historyIndexRef.current]]);
    }
  };

  const redo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      setPlacedComponents([...historyRef.current[historyIndexRef.current]]);
    }
  };

  const deleteSelected = () => {
    if (selectedComponent) {
      saveToHistory();
      setPlacedComponents((prev) => prev.filter((comp) => comp.instanceId !== selectedComponent));
      setSelectedComponent(null);
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const selectedComponentData = placedComponents.find((c) => c.instanceId === selectedComponent);

  // Debug: Log to ensure component is rendering
  console.log('CustomBuild rendering', {
    filteredComponents: filteredComponents.length,
    componentsByCategory: Object.keys(componentsByCategory),
    expandedCategories,
    searchQuery
  });

  // Create a wrapper component that uses useDrop inside DndProvider
  const CanvasArea = () => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: ['COMPONENT', 'PLACED_COMPONENT'],
      drop: (item: Component | PlacedComponent, monitor) => {
        const offset = monitor.getClientOffset();
        if (!offset || !canvasRef.current) return;

        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = (offset.x - canvasRect.left - canvasOffset.x) / zoom;
        const y = (offset.y - canvasRect.top - canvasOffset.y) / zoom;

        if ('instanceId' in item) {
          // Moving existing component
          setPlacedComponents((prev) =>
            prev.map((comp) =>
              comp.instanceId === item.instanceId
                ? { ...comp, x: Math.max(0, x), y: Math.max(0, y) }
                : comp
            )
          );
        } else {
          // Adding new component
          const newComponent: PlacedComponent = {
            ...item,
            instanceId: `comp-${Date.now()}-${Math.random()}`,
            x: Math.max(0, x),
            y: Math.max(0, y),
          };
          saveToHistory();
          setPlacedComponents((prev) => [...prev, newComponent]);
          setSelectedComponent(newComponent.instanceId);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
    }));

    return (
      <div
        ref={drop}
        className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 relative"
        onClick={() => setSelectedComponent(null)}
      >
        <div
          ref={canvasRef}
          className={`relative min-w-full min-h-full ${
            showGrid
              ? 'bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[linear-gradient(to_right,#475569_1px,transparent_1px),linear-gradient(to_bottom,#475569_1px,transparent_1px)]'
              : ''
          }`}
          style={{
            transform: `scale(${zoom}) translate(${canvasOffset.x}px, ${canvasOffset.y}px)`,
            transformOrigin: 'top left',
            width: '2000px',
            height: '2000px',
          }}
        >
          {placedComponents.map((comp) => (
            <PlacedComponentItem
              key={comp.instanceId}
              component={comp}
              onSelect={setSelectedComponent}
              isSelected={comp.instanceId === selectedComponent}
            />
          ))}
          {isOver && (
            <div className="absolute inset-0 bg-blue-100 dark:bg-blue-900/20 border-2 border-dashed border-blue-500 pointer-events-none" />
          )}
        </div>
      </div>
    );
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full w-full flex flex-col bg-slate-100 dark:bg-slate-900">
        {/* Header Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between shadow-sm">
          {/* Left: Logo & Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {/* Logo - circuit board icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-blue-600">
                <path
                  d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h6v2H8v-2z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                value={circuitName}
                onChange={(e) => setCircuitName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 rounded dark:text-white"
              />
            </div>
            <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
              <button className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                File
              </button>
              <button className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                Edit
              </button>
              <button className="px-3 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                Help
              </button>
            </div>
          </div>

          {/* Center: Mode Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveMode('design')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMode === 'design'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              <span className="flex items-center space-x-2">
                <span>Design</span>
                {activeMode === 'design' && <span className="text-xs">✓</span>}
              </span>
            </button>
            <button
              onClick={() => setActiveMode('code')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMode === 'code'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setActiveMode('simulate')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeMode === 'simulate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
              }`}
            >
              Simulate
            </button>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 flex items-center space-x-1">
              <Sparkles className="w-4 h-4" />
              <span>Mirai AI</span>
            </button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center space-x-1">
              <Download className="w-4 h-4" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 flex items-center space-x-1">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <button className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600">
              Sign In
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Components"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <List className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All Parts
              </button>
              <button
                onClick={() => setActiveTab('simulation')}
                className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'simulation'
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Simulation Ready
              </button>
            </div>

            {/* Create Custom Component Button */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Custom Component</span>
              </button>
            </div>

            {/* Component Categories */}
            <div className="flex-1 overflow-y-auto">
              {Object.entries(componentsByCategory).map(([category, components]) => {
                const isExpanded = expandedCategories.includes(category);
                return (
                  <div key={category} className="border-b border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {category}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="p-2 grid grid-cols-2 gap-2">
                        {components.map((comp) => (
                          <DraggableComponent key={comp.id} component={comp} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Additional Categories */}
              <div className="border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => toggleCategory('My Custom Parts')}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    My Custom Parts
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => toggleCategory('Favorite Parts')}
                  className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Favorite Parts
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </aside>

          {/* Main Canvas Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <Play className="w-4 h-4 text-green-600" />
              </button>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <Type className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <Link2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded ${
                  showGrid ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
              >
                <Grid className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <button onClick={undo} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <Undo className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button onClick={redo} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                <Redo className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <button
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ZoomOut className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-400 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
              >
                <ZoomIn className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <button
                onClick={deleteSelected}
                disabled={!selectedComponent}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>

            {/* Canvas */}
            <CanvasArea />
          </div>

          {/* Right Sidebar - Properties Panel */}
          {selectedComponentData && (
            <aside className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {selectedComponentData.name} Properties
                </h3>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={selectedComponentData.name}
                    className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                    Position
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={Math.round(selectedComponentData.x)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                    <input
                      type="number"
                      value={Math.round(selectedComponentData.y)}
                      className="w-full px-2 py-1.5 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      readOnly
                    />
                  </div>
                </div>
                <button
                  onClick={deleteSelected}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete {selectedComponentData.name}</span>
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

export default CustomBuild;