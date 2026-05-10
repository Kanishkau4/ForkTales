import React from 'react';

const AnimatedSprite = ({ 
  spriteUrl, 
  frameCount, 
  width, 
  height, 
  animationDuration = '1s', 
  className = '' 
}) => {
  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      <div 
        className="absolute top-0 left-0 h-full bg-no-repeat"
        style={{
          width: `${width * frameCount}px`,
          backgroundImage: `url(${spriteUrl})`,
          backgroundSize: `${width * frameCount}px ${height}px`,
          animation: `sprite-anim ${animationDuration} steps(${frameCount}) infinite`,
          imageRendering: 'pixelated'
        }}
      />
      <style>{`
        @keyframes sprite-anim {
          from { background-position: 0px 0px; }
          to { background-position: -${width * frameCount}px 0px; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedSprite;
