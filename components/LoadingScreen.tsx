
import React, { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message }) => {
  const [tipIndex, setTipIndex] = useState(0);
  const tips = [
    "Đang triệu hồi các hạt tri thức từ vũ trụ...",
    "Kiến thức là siêu năng lực, hãy sẵn sàng nhé!",
    "Bạn có biết: Học tập chủ động giúp não bộ hưng phấn hơn 60%!",
    "Hệ thống đang thiết lập các tầng thử thách mới...",
    "Sắp xong rồi, hãy khởi động trí óc nào!",
    "AI đang tinh chỉnh nội dung tốt nhất cho lớp học của bạn..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % tips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-16 py-32 animate-fadeIn text-center h-full">
      <div className="relative">
        {/* Glow Effects */}
        <div className="absolute inset-0 bg-blue-600/20 blur-[100px] rounded-full animate-pulse"></div>
        <div className="absolute inset-0 bg-purple-600/10 blur-[80px] rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Modern Spinner */}
        <div className="w-56 h-56 border-[12px] border-slate-800 border-t-blue-500 rounded-full animate-spin relative z-10 shadow-[0_0_40px_rgba(37,99,235,0.3)]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl z-20 animate-bounce">
          ⚡
        </div>
      </div>

      <div className="space-y-10 max-w-3xl">
        <h3 className="text-6xl font-black text-white uppercase tracking-tighter">HỆ THỐNG ĐANG SOẠN BÀI</h3>
        <div className="h-32 flex items-center justify-center bg-slate-900/50 backdrop-blur-md p-10 rounded-[50px] border-2 border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
          <p className="text-4xl text-blue-400 font-black italic animate-slideUp leading-tight">
            "{tips[tipIndex]}"
          </p>
        </div>
        <p className="text-slate-500 text-xl font-black uppercase tracking-[0.3em]">{message}</p>
      </div>

      <div className="flex space-x-6">
        {[0, 1, 2].map(i => (
          <div 
            key={i} 
            className="w-4 h-4 bg-blue-500 rounded-full animate-bounce shadow-[0_0_15px_rgba(59,130,246,0.6)]" 
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
