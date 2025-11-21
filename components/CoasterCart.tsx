import React from 'react';

interface CoasterCartProps {
  x: number;
  y: number;
  angle: number;
  color: string;
  opacity?: number;
}

export const CoasterCart: React.FC<CoasterCartProps> = ({ x, y, angle, color, opacity = 1 }) => {
  return (
    <g 
      transform={`translate(${x}, ${y}) rotate(${angle})`} 
      style={{ opacity, transition: 'opacity 0.1s' }}
    >
      {/* Cart Body - Simplified for horizontal view */}
      <path
        d="M-15,-5 L15,-5 L18,0 L18,5 L-18,5 L-18,0 Z"
        fill={color}
        stroke="white"
        strokeWidth="2"
        className="drop-shadow-lg"
      />
      
      {/* Windshield/Detail */}
      <path 
        d="M-10,-5 L-8,-12 L8,-12 L10,-5" 
        fill="none" 
        stroke={color} 
        strokeWidth="2"
        strokeOpacity="0.6"
      />
      
      {/* Wheels */}
      <circle cx="-10" cy="5" r="4" fill="#1e293b" stroke="white" strokeWidth="1.5" />
      <circle cx="10" cy="5" r="4" fill="#1e293b" stroke="white" strokeWidth="1.5" />
      
      {/* Passengers (Dots) */}
      <circle cx="-5" cy="-2" r="2" fill="white" opacity="0.8" />
      <circle cx="5" cy="-2" r="2" fill="white" opacity="0.8" />
    </g>
  );
};