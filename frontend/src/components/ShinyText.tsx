'use client';

import React from 'react';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ 
  text, 
  disabled = false, 
  speed = 8, 
  className = "" 
}) => {
  const animationStyle = disabled 
    ? {} 
    : { animation: `shimmer-move ${speed}s linear infinite` };

  return (
    <div
      style={animationStyle}
      className={`text-[#b5b5b5] bg-clip-text text-transparent bg-[linear-gradient(120deg,rgba(255,255,255,0.1),rgba(255,255,255,0.75),rgba(255,255,255,0.1))] bg-[length:200%_100%] ${className}`}
    >
      {text}
    </div>
  );
};

export default ShinyText;
