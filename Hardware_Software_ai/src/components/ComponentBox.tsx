import React from 'react';
import Draggable from 'react-draggable';
import './ComponentBox.css'; // CSS for tooltip

interface ComponentBoxProps {
  image: string;
  alt: string;
  pins: string[];
}

const ComponentBox: React.FC<ComponentBoxProps> = ({ image, alt, pins }) => {
  return (
    <Draggable>
      <div className="component-box">
        <img src={image} alt={alt} />
        <div className="pins-tooltip">
          {pins.map((pin, index) => (
            <div key={index}>{pin}</div>
          ))}
        </div>
      </div>
    </Draggable>
  );
};

export default ComponentBox;
