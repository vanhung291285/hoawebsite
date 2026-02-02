
import React, { useState, useCallback, useEffect } from 'react';
import { Question, Student } from '../types';
import Avatar from './Avatar';
import HandDetector from './HandDetector';
import { soundService } from '../services/soundService';

interface GameScreenProps {
  questions: Question[];
  currentIndex: number;
  onAnswer: (isCorrect: boolean, isStealAttempt: boolean) => void;
  students: Student[];
  currentStudentIndex: number;
  isExpanded?: boolean;
}

const GameScreen: React.FC<GameScreenProps> = ({ 
  questions, 
  currentIndex, 
  onAnswer, 
  students, 
  currentStudentIndex,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isQuestionVisible, setIsQuestionVisible] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [showTeacherSecret, setShowTeacherSecret] = useState(false);

  const currentQuestion = questions[currentIndex];
  const activeStudent = students[currentStudentIndex];

  useEffect(() => {
    setSelectedOption(null);
    setIsRevealed(false);
    setShowTeacherSecret(false);
  }, [currentIndex]);

  const handleRevealAnswer = () => {
    if (selectedOption === null || isRevealed) return;
    setIsRevealed(true);
    if (selectedOption === currentQuestion.correctAnswerIndex) soundService.playCorrect();
    else soundService.playWrong();
  };

  const handleExit = () => {
    if (window.confirm("⚠️ BẠN CÓ CHẮC CHẮN MUỐN THOÁT?\nTiến trình trận đấu hiện tại sẽ không được lưu lại.")) {
      window.location.reload();
    }
  };

  const startRandomPick = useCallback(() => {
    if (isPicking) return;
    setIsPicking(true);
    setIsQuestionVisible(false);
    setTimeout(() => {
      setIsPicking(false);
      setIsQuestionVisible(true);
    }, 2000);
  }, [isPicking]);

  return (
    <div className="flex flex-col h-full w-full bg-[#020617] overflow-hidden">
      
      {/* 1. TOP HUD (STATUS & CAMERA) */}
      <div className="flex justify-between items-center px-10 py-6 shrink-0 z-50 h-32">
        <div className="flex items-center gap-6">
          <div className="arena-card px-8 py-4 rounded-[30px] border-l-8 border-l-blue-500 shadow-xl">
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-1">CÂU HỎI HIỆN TẠI</span>
             <div className="text-4xl font-black text-white tabular-nums">
               {currentIndex + 1} <span className="text-xl text-slate-600">/ {questions.length}</span>
             </div>
          </div>
          <div className="flex flex-col">
             <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LIVE ARENA 3.0</span>
             </div>
             <button 
               onMouseEnter={() => setShowTeacherSecret(true)} 
               onMouseLeave={() => setShowTeacherSecret(false)}
               className="text-[9px] font-black text-slate-600 hover:text-blue-400 uppercase border border-slate-800 px-4 py-1.5 rounded-full bg-black/40 transition-all"
             >
               {showTeacherSecret ? `ĐÁP ÁN: ${String.fromCharCode(65 + currentQuestion.correctAnswerIndex)}` : '👁️ SOI ĐÁP ÁN'}
             </button>
          </div>
        </div>

        {/* ACTIVE PLAYER FOCUS (CENTER TOP) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center">
           <div className="arena-card px-12 py-3 rounded-full flex items-center gap-6 border-2 border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] shimmer">
              <span className="text-xs font-black text-amber-500 uppercase tracking-[0.3em]">LƯỢT CỦA:</span>
              <span className="text-4xl font-black text-white italic uppercase tracking-tighter">{activeStudent.name}</span>
              <div className="w-px h-8 bg-white/10"></div>
              <span className="text-3xl font-black text-amber-400 tabular-nums">{activeStudent.score}đ</span>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="arena-card w-48 h-24 rounded-[30px] overflow-hidden flex items-center justify-center relative border-r-8 border-r-indigo-500">
             <HandDetector isActive={isCameraActive} onHandRaised={startRandomPick} />
             {!isCameraActive && (
               <button onClick={() => setIsCameraActive(true)} className="text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-all z-10">
                 BẬT CAMERA AI 🎥
               </button>
             )}
          </div>
        </div>
      </div>

      {/* 2. MAIN ARENA (QUESTION & OPTIONS) */}
      <div className="flex-1 px-10 pb-6 flex flex-col min-h-0">
        <div className="flex-1 arena-card rounded-[60px] p-12 flex flex-col relative overflow-hidden shadow-inner border-2 border-white/5">
          {isQuestionVisible ? (
            <div className="flex-1 flex flex-col animate-pop-in">
              {/* Question Text */}
              <div className="flex-1 flex items-center justify-center text-center px-10">
                 <h2 className="text-giant text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
                   {currentQuestion.question}
                 </h2>
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-6 mt-10 shrink-0">
                {currentQuestion.options.map((option, index) => {
                  const label = String.fromCharCode(65 + index);
                  const isSelected = index === selectedOption;
                  const isCorrect = index === currentQuestion.correctAnswerIndex;
                  
                  let stateStyle = "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20";
                  if (isRevealed) {
                    if (isCorrect) stateStyle = "bg-emerald-600 border-emerald-300 text-white shadow-[0_0_40px_rgba(16,185,129,0.5)] scale-[1.03]";
                    else if (isSelected) stateStyle = "bg-rose-700/60 border-rose-500 text-white opacity-40 grayscale";
                    else stateStyle = "opacity-10 grayscale";
                  } else if (isSelected) {
                    stateStyle = "bg-blue-600 border-blue-400 text-white scale-[1.03] shadow-[0_0_30px_rgba(37,99,235,0.35)]";
                  }

                  return (
                    <button
                      key={index}
                      disabled={isRevealed}
                      onClick={() => { setSelectedOption(index); }}
                      className={`arena-card rounded-[40px] border-4 p-8 flex items-center gap-8 text-left transition-all duration-200 ${stateStyle}`}
                    >
                      <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center font-black text-4xl shadow-lg transition-colors ${
                        isSelected || (isRevealed && isCorrect) ? 'bg-white text-slate-950' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {label}
                      </div>
                      <span className="text-answer">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-8 mt-12 h-24 shrink-0">
                {!isRevealed ? (
                  <button
                    disabled={selectedOption === null}
                    onClick={handleRevealAnswer}
                    className={`px-24 py-6 text-4xl btn-gameshow min-w-[500px] ${selectedOption !== null ? 'btn-orange' : 'btn-disabled'}`}
                  >
                    🎯 KIỂM TRA ĐÁP ÁN
                  </button>
                ) : (
                  <button
                    onClick={() => onAnswer(selectedOption === currentQuestion.correctAnswerIndex, false)}
                    className="px-24 py-6 text-4xl btn-gameshow btn-blue min-w-[500px]"
                  >
                    TIẾP TỤC 🚀
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-10">
              <div className="relative w-48 h-48 flex items-center justify-center">
                 <div className="absolute inset-0 border-[12px] border-slate-800 rounded-full"></div>
                 <div className="absolute inset-0 border-[12px] border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-7xl animate-bounce">🎲</span>
              </div>
              <p className="text-5xl font-black text-blue-400 uppercase tracking-[0.2em] animate-pulse">ĐANG GỌI Tên ĐỐI THỦ...</p>
            </div>
          )}

          {/* AI EXPLANATION DRAWER (NON-BLOCKING) */}
          {isRevealed && (
            <div className="absolute bottom-6 inset-x-6 arena-card bg-emerald-950/90 border-2 border-emerald-500/50 rounded-[45px] p-8 animate-pop-in flex items-center gap-8 shadow-2xl z-[100]">
               <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center text-5xl shadow-inner shrink-0">💡</div>
               <div className="flex-1">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block mb-2">BẬT MÍ TỪ AI ARENA:</span>
                  <p className="text-2xl font-bold text-white leading-tight">{currentQuestion.explanation}</p>
               </div>
               <div className="w-px h-16 bg-white/10 shrink-0"></div>
               <div className="w-1/4">
                  <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">GỢI Ý THẢO LUẬN:</span>
                  <p className="text-xs font-bold text-slate-300 italic">"{currentQuestion.discussionHint}"</p>
               </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. OCEAN DOCK (BOTTOM AVATARS) & GLOBAL CONTROL */}
      <div className="h-44 bg-black/40 border-t border-white/5 flex flex-col shrink-0">
         <div className="px-10 py-3 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">ĐỘI NGŨ CHIẾN BINH ARENA</span>
            </div>
            
            <div className="flex items-center gap-6">
               <button 
                 onClick={startRandomPick} 
                 className="px-6 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-xl font-black text-[10px] uppercase tracking-widest border border-blue-500/30 transition-all active:scale-95"
               >
                 🎲 ĐỔI ĐỐI THỦ
               </button>
               
               <div className="w-px h-8 bg-white/10"></div>
               
               <button 
                 onClick={handleExit}
                 className="px-10 py-3 bg-red-600 text-white rounded-2xl font-black text-lg btn-gameshow btn-red shadow-[0_10px_30px_rgba(220,38,38,0.3)] shimmer-active"
               >
                 🏠 RA TRANG CHỦ
               </button>
            </div>
         </div>
         <div className="ocean-dock flex-1 px-10">
            {students.map((s, idx) => (
              <div key={s.id} className={`flex flex-col items-center gap-2 transition-all duration-500 shrink-0 ${
                currentStudentIndex === idx ? 'scale-110' : 'opacity-40 grayscale-[0.5] scale-90'
              }`}>
                <div className={`relative p-2 rounded-2xl border-2 transition-all ${
                  currentStudentIndex === idx ? 'bg-blue-600/30 border-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'bg-transparent border-white/5'
                }`}>
                  <div className="w-20 h-24 flex items-center justify-center overflow-hidden">
                    <div className="scale-[0.45]">
                      <Avatar name="" type="jellyfish" color={s.color} size="sm" isActive={currentStudentIndex === idx} />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-white text-slate-950 font-black text-[10px] w-6 h-6 rounded-lg flex items-center justify-center shadow-lg">
                    {s.score}
                  </div>
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter truncate max-w-[80px] ${
                  currentStudentIndex === idx ? 'text-blue-400' : 'text-slate-600'
                }`}>
                  {s.name}
                </span>
              </div>
            ))}
         </div>
      </div>

    </div>
  );
};

export default GameScreen;
