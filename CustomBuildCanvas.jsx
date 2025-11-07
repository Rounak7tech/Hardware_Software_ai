/*
CustomBuild Canvas Module (React + Konva)
-------------------------------------------------
This single-file React component demonstrates a working Custom Build canvas:
- Palette of components
- Renders component images on canvas
- Overlays interactive pins (hover/click)
- Drag & drop placement
- Mock `Auto-Wire` that returns connections and renders wires

How to use:
1. Create a React app (Vite / Create React App) with TypeScript or JS.
2. Install dependencies:
   npm install react-konva konva @types/konva
3. Drop this file as `CustomBuildCanvas.jsx` and import in App.tsx.
4. Provide real component images or use the sample URLs.
5. Hook backend endpoints `/api/custom-build/autowire` and `/api/components` for real data.

NOTE: This file uses mocked backend functions (mockFetchComponents, mockAutoWire)
      Replace them with actual fetch(...) calls to your FastAPI/Node backend.
*/

import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Circle, Group, Line, Text } from 'react-konva';

// Helper hook to load Image from URL
function useImage(url) {
  const [img, setImg] = useState(null);
  useEffect(() => {
    if (!url) return;
    const image = new window.Image();
    image.crossOrigin = 'anonymous';
    image.src = url;
    image.onload = () => setImg(image);
    image.onerror = () => setImg(null);
  }, [url]);
  return img;
}

// Sample component library (replace with API data)
const SAMPLE_COMPONENTS = [
  {
    id: 'arduino_uno',
    name: 'Arduino Uno',
    image: 'https://raw.githubusercontent.com/raspberrypilearning/robotics/master/images/arduino_uno.png',
    width: 200,
    height: 120,
    pins: [
      { name: 'GND', x: 18, y: 100, type: 'gnd' },
      { name: '5V', x: 40, y: 100, type: 'power' },
      { name: 'D2', x: 80, y: 20, type: 'digital' },
      { name: 'D3', x: 110, y: 20, type: 'digital' },
      { name: 'A0', x: 150, y: 80, type: 'analog' }
    ]
  },
  {
    id: 'hc-sr04',
    name: 'Ultrasonic HC-SR04',
    image: 'https://cdn-shop.adafruit.com/970x728/3945-01.jpg',
    width: 140,
    height: 60,
    pins: [
      { name: 'VCC', x: 20, y: 10, type: 'power' },
      { name: 'Trig', x: 80, y: 10, type: 'digital' },
      { name: 'Echo', x: 110, y: 10, type: 'digital' },
      { name: 'GND', x: 130, y: 10, type: 'gnd' }
    ]
  }
];

// Mock backend - replace with real API calls
async function mockFetchComponents() {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 200));
  return SAMPLE_COMPONENTS;
}

// Mock autowire: given placedInstances, return some connections
// placedInstances: [{instanceId, componentId, x, y, scale}]
async function mockAutoWire(placedInstances) {
  // Example: connect HC-SR04 Trig -> Arduino D2, Echo -> D3, VCC->5V, GND->GND
  await new Promise((r) => setTimeout(r, 400));
  const ar = placedInstances.find(p => p.componentId === 'arduino_uno');
  const hc = placedInstances.find(p => p.componentId === 'hc-sr04');
  if (!ar || !hc) return { connections: [] };
  return {
    connections: [
      { from: { inst: hc.instanceId, pin: 'Trig' }, to: { inst: ar.instanceId, pin: 'D2' } },
      { from: { inst: hc.instanceId, pin: 'Echo' }, to: { inst: ar.instanceId, pin: 'D3' } },
      { from: { inst: hc.instanceId, pin: 'VCC' }, to: { inst: ar.instanceId, pin: '5V' } },
      { from: { inst: hc.instanceId, pin: 'GND' }, to: { inst: ar.instanceId, pin: 'GND' } }
    ]
  };
}

// Utility to compute absolute pin coordinates based on instance transform
function getPinAbsolutePos(instance, pin) {
  // instance: {x,y,scale,width,height}
  const sx = instance.x + (pin.x / instance.width) * instance.width * instance.scale;
  const sy = instance.y + (pin.y / instance.height) * instance.height * instance.scale;
  return { x: sx, y: sy };
}

let instanceCounter = 0;

export default function CustomBuildCanvas() {
  const [components, setComponents] = useState([]);
  const [placed, setPlaced] = useState([]); // placed instances
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [connections, setConnections] = useState([]);
  const stageRef = useRef();

  useEffect(() => {
    (async () => {
      const comps = await mockFetchComponents();
      setComponents(comps);
    })();
  }, []);

  // add component to canvas at default position
  function addComponentToCanvas(component) {
    const inst = {
      instanceId: `i${++instanceCounter}`,
      componentId: component.id,
      name: component.name,
      x: 120 + 30 * placed.length,
      y: 60 + 30 * placed.length,
      scale: 1,
      width: component.width,
      height: component.height,
      component
    };
    setPlaced(prev => [...prev, inst]);
  }

  async function handleAutoWire() {
    const result = await mockAutoWire(placed);
    setConnections(result.connections);
  }

  function updateInstance(instId, changes) {
    setPlaced(prev => prev.map(p => p.instanceId === instId ? { ...p, ...changes } : p));
  }

  return (
    <div style={{ display: 'flex', height: '80vh', gap: 12 }}>
      <div style={{ width: 260, borderRight: '1px solid #eee', padding: 12 }}>
        <h3>Palette</h3>
        {components.map(c => (
          <div key={c.id} style={{ marginBottom: 12, cursor: 'pointer' }} onClick={() => addComponentToCanvas(c)}>
            <img src={c.image} alt={c.name} width={120} style={{ borderRadius: 6 }} />
            <div>{c.name}</div>
          </div>
        ))}

        <button onClick={handleAutoWire} style={{ marginTop: 20, padding: '8px 12px' }}>Auto-Wire</button>

        <h4 style={{ marginTop: 20 }}>Placed Instances</h4>
        {placed.map(p => (
          <div key={p.instanceId} style={{ fontSize: 13 }}>
            {p.name} — {p.instanceId}
          </div>
        ))}

      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <Stage width={900} height={600} ref={stageRef} style={{ background: '#fafafa', border: '1px solid #ddd' }}>
          <Layer>
            {/* render wires first */}
            {connections.map((conn, idx) => {
              const fromInst = placed.find(p => p.instanceId === conn.from.inst);
              const toInst = placed.find(p => p.instanceId === conn.to.inst);
              if (!fromInst || !toInst) return null;
              const fromPin = fromInst.component.pins.find(pp => pp.name === conn.from.pin);
              const toPin = toInst.component.pins.find(pp => pp.name === conn.to.pin);
              if (!fromPin || !toPin) return null;
              const p1 = getPinAbsolutePos(fromInst, fromPin);
              const p2 = getPinAbsolutePos(toInst, toPin);
              // simple bezier curve
              const points = [p1.x, p1.y, (p1.x + p2.x) / 2, p1.y, (p1.x + p2.x) / 2, p2.y, p2.x, p2.y];
              return (
                <Line key={idx} points={points} tension={0.5} stroke="black" strokeWidth={2} lineCap="round" />
              );
            })}

            {/* render placed components */}
            {placed.map(inst => (
              <Group key={inst.instanceId} x={inst.x} y={inst.y} draggable
                onDragEnd={(e) => updateInstance(inst.instanceId, { x: e.target.x(), y: e.target.y() })}
              >
                <KonvaImageComponent inst={inst} />
              </Group>
            ))}

          </Layer>
        </Stage>
      </div>

      <div style={{ width: 300, borderLeft: '1px solid #eee', padding: 12 }}>
        <h3>Inspector</h3>
        <p>Click a placed component to view pins (hover pins to see names)</p>
        {/* Simple inspector: list components and pins with coordinates */}
        {placed.map(p => (
          <div key={p.instanceId} style={{ marginBottom: 12 }}>
            <b>{p.name} ({p.instanceId})</b>
            <div style={{ fontSize: 12 }}>
              Pins:
              {p.component.pins.map(pin => {
                const pos = getPinAbsolutePos(p, pin);
                return <div key={pin.name}>{pin.name} — type:{pin.type} — coords: {Math.round(pos.x)},{Math.round(pos.y)}</div>
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KonvaImageComponent({ inst }) {
  const img = useImage(inst.component.image);
  const [hoveredPin, setHoveredPin] = useState(null);

  return (
    <>
      {/* main image */}
      <KonvaImage image={img} width={inst.width * inst.scale} height={inst.height * inst.scale} />

      {/* pins overlay */}
      {inst.component.pins.map((pin, idx) => {
        const px = (pin.x / inst.component.width) * inst.width * inst.scale;
        const py = (pin.y / inst.component.height) * inst.height * inst.scale;
        return (
          <Group key={idx}>
            <Circle
              x={px}
              y={py}
              radius={6}
              fill={pin.type === 'power' ? '#f59e0b' : pin.type === 'gnd' ? '#6b7280' : '#10b981'}
              opacity={0.95}
              onMouseEnter={() => setHoveredPin(pin)}
              onMouseLeave={() => setHoveredPin(null)}
            />
            {hoveredPin === pin && (
              <Group>
                <RectText x={px + 12} y={py - 8} text={`${pin.name} (${pin.type})`} />
              </Group>
            )}
          </Group>
        );
      })}
    </>
  );
}

function RectText({ x, y, text }) {
  return (
    <Group>
      <Text x={x} y={y} text={text} fontSize={12} padding={6} fill="#111" />
    </Group>
  );
}
