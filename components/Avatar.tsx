
import React, { useMemo } from 'react';
import { AvatarType } from '../types';

interface AvatarProps {
  name: string;
  type: AvatarType;
  color: string;
  isActive?: boolean;
  isWinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isHighlighted?: boolean;
  showName?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  type, 
  color, 
  isActive, 
  isWinner, 
  size = 'md', 
  isHighlighted,
  showName = false
}) => {
  // Bảng màu Neon - Tối ưu cho việc phân biệt từ xa
  const vibrantPalette = [
    { main: '#2dd4bf', light: '#99f6e4', glow: 'rgba(45, 212, 191, 0.7)' }, // Turquoise
    { main: '#f472b6', light: '#fbcfe8', glow: 'rgba(244, 114, 182, 0.7)' }, // Pink
    { main: '#fbbf24', light: '#fde68a', glow: 'rgba(251, 191, 36, 0.7)' },  // Amber
    { main: '#a855f7', light: '#ddd6fe', glow: 'rgba(168, 85, 247, 0.7)' },  // Purple
    { main: '#38bdf8', light: '#bae6fd', glow: 'rgba(56, 189, 248, 0.7)' },  // Sky
    { main: '#4ade80', light: '#bbf7d0', glow: 'rgba(74, 222, 128, 0.7)' },  // Emerald
    { main: '#fb7185', light: '#fecdd3', glow: 'rgba(251, 113, 133, 0.7)' }, // Rose
  ];

  const jellyConfig = useMemo(() => {
    const tentacleCount = 12 + Math.floor(Math.random() * 4);
    const floatDuration = 8 + Math.random() * 4;
    const floatDelay = Math.random() * -10;
    
    const tentacles = Array.from({ length: tentacleCount }).map((_, i) => {
      const p = vibrantPalette[i % vibrantPalette.length];
      return {
        height: 60 + Math.random() * 35,
        width: 3 + Math.random() * 3,
        left: 15 + (i / (tentacleCount - 1)) * 70,
        delay: Math.random() * -5,
        duration: 3 + Math.random() * 2,
        color: p.main,
        glow: p.glow,
        zIndex: i % 2 === 0 ? 25 : 15
      };
    });

    return { floatDuration, floatDelay, tentacles };
  }, []);

  const sizeStyles = {
    sm: 'w-24 h-32',
    md: 'w-44 h-64',
    lg: 'w-72 h-96'
  };

  const isSelected = isActive || isHighlighted;
  const baseColor = color.replace('bg-', '');

  return (
    <div 
      className={`relative flex flex-col items-center transition-all duration-700 ${isSelected ? 'z-[60]' : 'z-10'}`}
      style={{
        animation: `jelly-float ${isSelected ? jellyConfig.floatDuration * 0.7 : jellyConfig.floatDuration}s ease-in-out infinite`,
        animationDelay: `${jellyConfig.floatDelay}s`,
        transform: isSelected ? 'scale(1.15)' : 'scale(1)'
      }}
    >
      {/* TÊN HỌC SINH - HIỂN THỊ PHÍA TRÊN */}
      {(showName || isSelected) && (
        <div className={`mb-4 px-8 py-2.5 rounded-[25px] font-black shadow-2xl transition-all border-[3px] animate-pop-in-top whitespace-nowrap ${
          isSelected
            ? 'bg-white text-slate-950 border-white scale-110 shadow-[0_0_40px_rgba(255,255,255,0.4)] text-2xl'
            : 'bg-slate-900/80 text-white border-slate-700 backdrop-blur-md text-sm opacity-80'
        }`}>
          <div className="flex items-center gap-2">
            {isSelected && <span className="animate-ping text-blue-500">●</span>}
            {name}
          </div>
        </div>
      )}

      {/* HIỆU ỨNG PHÁT SÁNG NỀN KHI ĐƯỢC CHỌN */}
      {isSelected && (
        <div 
          className="absolute inset-0 -m-16 rounded-full blur-[70px] opacity-30 animate-pulse pointer-events-none"
          style={{ backgroundColor: baseColor }}
        ></div>
      )}

      <div className={`${sizeStyles[size]} relative flex flex-col items-center`}>
        
        {/* THÂN SỨA (DOME) */}
        <div 
          className={`relative w-full h-[50%] rounded-t-[65%] rounded-b-[30%] border-[3px] overflow-hidden flex items-center justify-center z-20 transition-all duration-500 shadow-2xl ${
            isSelected ? 'border-white animate-jelly-pulse-active' : 'border-white/20 animate-jelly-pulse'
          }`}
          style={{ 
            background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, ${baseColor} 25%, #020617 110%)`,
            backgroundColor: baseColor,
            boxShadow: isSelected 
              ? `inset 0 0 40px rgba(255,255,255,0.4), 0 0 45px ${baseColor}88` 
              : `inset 0 0 20px rgba(255,255,255,0.1)`
          }}
        >
          {/* Vệt sáng thủy tinh */}
          <div className="absolute top-[10%] left-[15%] w-[40%] h-[20%] bg-white/30 rounded-full blur-[5px] -rotate-15"></div>
          
          {/* MẮT */}
          <div className={`flex space-x-5 translate-y-2 transition-all ${isSelected ? 'scale-125' : ''}`}>
            <div className="w-4 h-4 bg-slate-950 rounded-full animate-jelly-blink relative">
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <div className="w-4 h-4 bg-slate-950 rounded-full animate-jelly-blink relative">
              <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* XÚC TU (TENTACLES) */}
        <div className="absolute top-[45%] inset-x-0 bottom-0 pointer-events-none">
          {jellyConfig.tentacles.map((t, i) => (
            <div 
              key={i} 
              className={`absolute rounded-full shadow-lg ${isSelected ? 'animate-tentacle-active' : 'animate-tentacle-normal'}`} 
              style={{ 
                height: `${t.height}%`,
                width: `${t.width}px`,
                left: `${t.left}%`,
                animationDelay: `${t.delay}s`,
                animationDuration: `${isSelected ? t.duration * 0.6 : t.duration}s`,
                transformOrigin: 'top center',
                background: `linear-gradient(to bottom, ${t.color}, ${t.color}cc 60%, transparent)`,
                boxShadow: isSelected ? `0 0 15px ${t.glow}` : 'none',
                zIndex: t.zIndex,
                opacity: isSelected ? 1 : 0.6
              }}
            >
              {/* Điểm sáng hạt lựu lan tỏa dọc xúc tu */}
              {isSelected && (
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white blur-[1px] opacity-80 animate-ping"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes jelly-float {
          0%, 100% { transform: translateY(0) rotate(-1.5deg); }
          50% { transform: translateY(-35px) rotate(1.5deg); }
        }

        @keyframes jelly-pulse {
          0%, 100% { transform: scale(1, 1); border-radius: 65% 65% 30% 30%; }
          50% { transform: scale(1.05, 0.95); border-radius: 55% 55% 40% 40%; }
        }

        @keyframes jelly-pulse-active {
          0%, 100% { transform: scale(1, 1); border-radius: 65% 65% 30% 30%; }
          50% { transform: scale(1.15, 0.85); border-radius: 50% 50% 45% 45%; }
        }

        @keyframes tentacle-normal {
          0%, 100% { transform: rotate(-10deg) skewX(4deg); }
          50% { transform: rotate(10deg) skewX(-4deg); }
        }

        @keyframes tentacle-active {
          0%, 100% { transform: rotate(-22deg) skewX(10deg) scaleY(1.1); }
          50% { transform: rotate(22deg) skewX(-10deg) scaleY(0.8); }
        }

        @keyframes jelly-blink {
          0%, 92%, 100% { transform: scaleY(1); }
          96% { transform: scaleY(0.1); }
        }

        @keyframes pop-in-top {
          from { transform: translateY(15px) scale(0.6); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Avatar;
