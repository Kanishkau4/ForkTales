import React from 'react';

const AnimatedSprite = ({
  spriteUrl,
  frameCount,
  width,
  height,
  animationDuration = '1s',
  className = ''
}) => {
  // හැම sprite එකකටම වෙනම නමක් හදනවා, එතකොට එකිනෙකාට ගැටෙන්නේ නෑ
  const uniqueAnimationName = `play-sprite-${width}-${frameCount}-${Math.floor(Math.random() * 1000)}`;

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundImage: `url(${spriteUrl})`,
        backgroundSize: `${width * frameCount}px ${height}px`, // මුළු පින්තූරයේම සයිස් එක
        backgroundRepeat: 'no-repeat',
        animation: `${uniqueAnimationName} ${animationDuration} steps(${frameCount}) infinite`,
        imageRendering: 'pixelated' // Retro පෙනුම එන්න
      }}
    >
      <style>{`
        @keyframes ${uniqueAnimationName} {
          0% { background-position: 0px 0px; }
          100% { background-position: -${width * frameCount}px 0px; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedSprite;