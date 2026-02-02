
import React, { useState } from 'react';
import { Question, Difficulty } from '../types';

interface QuestionReviewScreenProps {
  questions: Question[];
  topic: string;
  difficulty: Difficulty;
  onConfirm: (updatedQuestions: Question[]) => void;
  onBack: () => void;
}

const QuestionReviewScreen: React.FC<QuestionReviewScreenProps> = ({ 
  questions: initialQuestions, 
  topic, 
  difficulty, 
  onConfirm, 
  onBack 
}) => {
  const [editableQuestions, setEditableQuestions] = useState<Question[]>([...initialQuestions]);

  const handleUpdateField = (id: string, field: keyof Question, value: any) => {
    setEditableQuestions(prev => prev.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleUpdateOption = (id: string, optIndex: number, value: string) => {
    setEditableQuestions(prev => prev.map(q => {
      if (q.id === id) {
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  return (
    <div className="h-full flex flex-col p-4 space-y-6 animate-fadeIn overflow-hidden">
      
      {/* COMPACT CONTROL BAR */}
      <div className="bg-slate-900/80 border-2 border-slate-800 p-6 rounded-[35px] shadow-2xl flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 border-blue-400">🧐</div>
          <div>
            <h2 className="text-3xl text-white font-black uppercase tracking-tighter text-shadow-strong leading-none mb-2">KIỂM DUYỆT BỘ ĐỀ</h2>
            <div className="flex gap-3">
              <span className="px-3 py-1 bg-blue-500/10 rounded-lg text-[9px] font-black border border-blue-500/20 text-blue-300 uppercase">{topic}</span>
              <span className="px-3 py-1 bg-amber-500/10 rounded-lg text-[9px] font-black border border-amber-500/20 text-amber-300 uppercase">{difficulty}</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button onClick={onBack} className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all uppercase tracking-widest text-[10px] font-black">LÀM LẠI</button>
          <button onClick={() => onConfirm(editableQuestions)} className="px-10 py-3 bg-blue-600 text-white rounded-xl shadow-xl hover:scale-105 transition-all text-sm font-black border-b-4 border-blue-900 uppercase">CHỐT BỘ ĐỀ 🚀</button>
        </div>
      </div>

      {/* QUESTION CARDS GRID */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
        {editableQuestions.map((q, idx) => (
          <div key={q.id} className="bg-slate-900/50 border-2 border-slate-800 rounded-[45px] p-8 flex flex-col lg:flex-row gap-8 transition-all hover:border-blue-500/30">
            
            <div className="lg:w-1/2 space-y-4">
              <div className="flex items-center space-x-3">
                <span className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg">
                  {idx + 1}
                </span>
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">NỘI DUNG CÂU HỎI</span>
              </div>
              <textarea
                value={q.question}
                onChange={(e) => handleUpdateField(q.id, 'question', e.target.value)}
                className="w-full bg-black/50 border-2 border-slate-800 rounded-3xl p-6 text-2xl font-black text-white focus:border-blue-400 outline-none resize-none transition-all h-40 shadow-inner"
              />
            </div>

            <div className="lg:w-1/2 space-y-4">
              <span className="text-[10px] text-slate-500 font-black tracking-widest block uppercase">CÁC ĐÁP ÁN (CHỌN ● ĐÚNG)</span>
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((opt, oIdx) => (
                  <div key={oIdx} className={`flex items-center space-x-3 p-3 rounded-2xl border-2 transition-all ${oIdx === q.correctAnswerIndex ? 'bg-green-600/20 border-green-500' : 'bg-black/30 border-slate-800'}`}>
                    <input
                      type="radio" name={`correct-${q.id}`}
                      checked={oIdx === q.correctAnswerIndex}
                      onChange={() => handleUpdateField(q.id, 'correctAnswerIndex', oIdx)}
                      className="w-5 h-5 accent-green-400 cursor-pointer"
                    />
                    <input
                      type="text" value={opt}
                      onChange={(e) => handleUpdateOption(q.id, oIdx, e.target.value)}
                      className="w-full bg-transparent outline-none font-bold text-white text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <span className="text-[9px] text-slate-600 font-black uppercase">GIẢI THÍCH NHANH</span>
                <input
                  type="text" value={q.explanation}
                  onChange={(e) => handleUpdateField(q.id, 'explanation', e.target.value)}
                  className="w-full bg-black/30 border-2 border-slate-800 rounded-xl p-3 text-[11px] font-bold text-slate-300 focus:border-blue-400 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center py-2">
        <p className="text-[10px] text-blue-500/50 uppercase tracking-[0.5em] font-black">AI ARENA CONTENT REVIEW SYSTEM</p>
      </div>
    </div>
  );
};

export default QuestionReviewScreen;
