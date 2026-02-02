
import React, { useEffect, useState } from 'react';
import { Grade, Subject, Team, GameHistory } from '../types';

interface SummaryScreenProps {
  teams: Team[];
  onRestart: () => void;
  grade: Grade;
  subject: Subject;
  topic: string;
}

const SummaryScreen: React.FC<SummaryScreenProps> = ({ teams, onRestart, grade, subject, topic }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winner = sortedTeams[0];
  const [aiMessage, setAiMessage] = useState("");

  const encouragementMessages = [
    `"Hỡi các chiến binh lớp ${grade}, hôm nay các bạn đã phá đảo kiến thức về ${topic}! Đội ${winner.name} thật sự bùng nổ!"`,
    `"Trận đấu mãn nhãn! AI rất ấn tượng với tốc độ của lớp. Đội ${winner.name} đã chứng minh bản lĩnh quán quân!"`,
    `"Cả lớp đã chiến đấu hết mình, nhưng ngôi vị vinh quang hôm nay chỉ dành cho ${winner.name}. Hãy tự hào về nỗ lực của mình!"`,
    `"Gay cấn đến giây cuối cùng! ${topic} không thể làm khó các bạn. ${winner.name} chính là chủ nhân sân khấu hôm nay!"`
  ];

  useEffect(() => {
    setAiMessage(encouragementMessages[Math.floor(Math.random() * encouragementMessages.length)]);
    
    // Lưu lịch sử trận đấu
    const currentHistory: GameHistory[] = JSON.parse(localStorage.getItem('app_history') || '[]');
    const newRecord: GameHistory = {
      date: new Date().toLocaleString('vi-VN'),
      topic,
      subject,
      winner: winner.name,
      topScores: sortedTeams.slice(0, 3).map(t => ({ name: t.name, score: t.score }))
    };
    localStorage.setItem('app_history', JSON.stringify([...currentHistory, newRecord]));
  }, []);

  return (
    <div className="max-w-6xl mx-auto text-center space-y-20 animate-fadeIn py-16">
      <div className="relative">
        <div className="text-[16rem] leading-none mb-4 animate-bounce drop-shadow-[0_0_50px_rgba(251,191,36,0.4)]">🏆</div>
        <h2 className="text-9xl font-black text-white tracking-tighter uppercase italic">BẢNG VÀNG DANH DỰ</h2>
        <div className="flex flex-col items-center mt-10 space-y-6">
          <div className="px-16 py-4 bg-blue-600 text-white rounded-[40px] font-black text-4xl shadow-[0_0_30px_rgba(37,99,235,0.4)] border-4 border-blue-400 uppercase tracking-tighter">
            {topic}
          </div>
          <div className="flex space-x-4">
             <span className="px-8 py-2 bg-slate-900 text-slate-400 rounded-full font-black text-xl border-2 border-slate-800">
               {subject}
             </span>
             <span className="px-8 py-2 bg-slate-900 text-slate-400 rounded-full font-black text-xl border-2 border-slate-800">
               {grade}
             </span>
          </div>
        </div>
      </div>

      {/* Podium Panel */}
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[80px] p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-slate-800">
        <div className="flex flex-col space-y-8">
          {sortedTeams.slice(0, 5).map((team, index) => (
            <div 
              key={index} 
              className={`flex items-center p-12 rounded-[50px] transition-all duration-700 border-4 ${
                index === 0 
                  ? 'bg-amber-400 border-amber-600 text-slate-950 scale-105 shadow-[0_0_60px_rgba(251,191,36,0.3)] z-10' 
                  : 'bg-slate-950 border-slate-800 text-white opacity-80'
              }`}
            >
              <div className="w-40 text-8xl font-black italic tabular-nums opacity-40">0{index + 1}</div>
              <div className="flex-grow text-left flex items-center space-x-12">
                <div className={`w-24 h-24 rounded-[30%] ${team.color} border-4 ${index === 0 ? 'border-slate-950' : 'border-white/10'} shadow-2xl`}></div>
                <span className="text-6xl font-black tracking-tighter uppercase">{team.name}</span>
              </div>
              <div className="text-8xl font-black tabular-nums">
                {team.score} <span className="text-2xl font-black uppercase opacity-60">PTS</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Speech Panel */}
      <div className="bg-slate-950 p-16 rounded-[70px] border-4 border-slate-800 relative overflow-hidden group">
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"></div>
         <h4 className="text-2xl font-black mb-10 text-blue-400 uppercase tracking-[0.5em] animate-pulse">
           Lời chúc từ trợ lý AI
         </h4>
         <p className="text-5xl font-black leading-tight italic text-white/90 drop-shadow-lg">
           {aiMessage}
         </p>
      </div>

      <div className="flex justify-center pt-20">
        <button
          onClick={onRestart}
          className="px-24 py-10 rounded-[60px] text-5xl btn-gameshow btn-blue"
        >
          🎮 THIẾT LẬP TRẬN MỚI
        </button>
      </div>
    </div>
  );
};

export default SummaryScreen;
