import React from 'react';

interface StarsProps {
  count?: number;
  layer?: number;
}

const Stars: React.FC<StarsProps> = ({ count = 50, layer = 1 }) => {
  const stars = Array.from({ length: count }, (_, i) => {
    const size = Math.random() * 3;
    const top = Math.random() * 100;
    const left = Math.random() * 100;
    const animationDelay = Math.random() * 5;
    const animationDuration = 3 + Math.random() * 7;
    const baseOpacity = Math.random() * 0.5 + 0.3;
    
    return (
      <div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          top: `${top}%`,
          left: `${left}%`,
          opacity: baseOpacity,
          animation: `twinkle ${animationDuration}s infinite ${animationDelay}s`,
          transform: `translateZ(${layer * 2}px)`,
          transition: 'all 0.3s ease-in-out',
        }}
      />
    );
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ perspective: '1000px' }}>
      {stars}
    </div>
  );
};

export default Stars; 