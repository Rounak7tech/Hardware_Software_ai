import React from 'react';
import { useDrag } from 'react-dnd';

interface ComponentItemProps {
  id: string;
  type: 'microcontroller' | 'sensor' | 'driver';
  name: string;
  imageUrl: string;
  onHoverPin?: () => void;
}

const ComponentItem: React.FC<ComponentItemProps> = ({ id, type, name, imageUrl, onHoverPin }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'COMPONENT',
    item: { id, type, name },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="relative inline-block cursor-pointer"
      style={{ opacity: isDragging ? 0.5 : 1 }}
      onMouseEnter={onHoverPin}
      onMouseLeave={onHoverPin}
    >
      <img src={imageUrl} alt={name} width={100} />
      {/* Pins pop-up example */}
      <div className="absolute top-0 left-0">
        {/* Can render pins here conditionally */}
      </div>
    </div>
  );
};

export default ComponentItem;
