import React from 'react';

const GameCard = ({ title, creator, tags, description }) => {
  const coverUrl = `https://image.pollinations.ai/prompt/pixel%20art%20cover%20for%20${encodeURIComponent(title)}?width=400&height=225&seed=${Math.random()}`;
  const avatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(creator)}`;

  return (
    <div className="glass rounded-xl overflow-hidden group cursor-pointer hover:neon-border-cyan transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={coverUrl} 
          alt={title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 pixelated"
        />
        <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded text-[10px] font-pixel">
          GIF
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <img src={avatarUrl} alt={creator} className="w-8 h-8 rounded-full border border-white/20" />
          <h3 className="text-sm font-pixel truncate">{title}</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag} className="text-[10px] font-pixel text-neon-cyan">#{tag}</span>
          ))}
        </div>
        
        <p className="text-sm text-gray-400 font-retro line-clamp-2 leading-tight">
          {description}
        </p>
      </div>
    </div>
  );
};

export default GameCard;
