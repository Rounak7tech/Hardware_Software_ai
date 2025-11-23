import React, { useState } from 'react';
import { DndProvider, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ComponentItem from './ComponentItem';

const initialComponents = [
  {
    id: '1',
    type: 'microcontroller',
    name: 'Arduino Uno',
    imageUrl: 'https://example.com/arduino.png',
  },
  {
    id: '2',
    type: 'sensor',
    name: 'Ultrasonic Sensor',
    imageUrl: 'https://example.com/ultrasonic.png',
  },
  {
    id: '3',
    type: 'driver',
    name: 'Motor Driver',
    imageUrl: 'https://example.com/motor_driver.png',
  },
];

const Board: React.FC = () => {
  const [components, setComponents] = useState(initialComponents);

  const [, drop] = useDrop(() => ({
    accept: 'COMPONENT',
    drop: (item: any, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      // Handle new position if needed
    },
  }));

  const handleHoverPin = () => {
    // Show pin tooltip here
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div ref={drop} className="w-full h-[500px] border border-gray-300 relative">
        {components.map((comp) => (
          <ComponentItem
            key={comp.id}
            {...comp}
            onHoverPin={handleHoverPin}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default Board;
