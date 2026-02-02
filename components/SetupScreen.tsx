
import React, { useState, useEffect } from 'react';
import { Grade, Subject, Difficulty, Question, AppData, GameHistory } from '../types';
import StudentManager from './StudentManager';
import ManualQuestionEditor from './ManualQuestionEditor';
import DataSync from './DataSync';

interface SetupScreenProps {
  onStart: (grade: Grade | null, subject: Subject | null, topic: string, difficulty: Difficulty, studentNames: string[], questionCount: number, manualQuestions?: Question[]) => void;
  initialStudentNames: string[];
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStart, initialStudentNames }) => {
  const [mode, setMode] = useState<'AI' | 'MANUAL'>('AI');
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.Recognition);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [studentNames, setStudentNames] = useState<string[]>(() => {
    const saved = localStorage.getItem('app_students');
    return saved ? JSON.parse(saved) : initialStudentNames;
  });
  const [topic, setTopic] = useState('');
  const [showStudentManager, setShowStudentManager] = useState(false);
  const [showManualEditor, setShowManualEditor] = useState(false);
  const [showDataSync, setShowDataSync] = useState(false);
  const [manualQuestions, setManualQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('manual_question_library');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('app_students', JSON.stringify(studentNames));
  }, [studentNames]);

  const grades = Object.values(Grade) as Grade[];
  const subjects = Object.values(Subject) as Subject[];
  const difficulties = Object.values(Difficulty) as Difficulty[];

  const isFormValid = studentNames.length > 0 && (
    mode === 'AI' 
      ? (selectedGrade && selectedSubject && topic.trim().length > 2)
      : (manualQuestions.length > 0)
  );

  return (
    <div className="h-full flex flex-col p-8 space-y-6 animate-fadeIn overflow-hidden">
      {/* HEADER SETUP */}
      <div className="flex justify-between items-center bg-slate-900/60 p-6 rounded-[35px] border border-slate-700/50 shadow-2xl shrink-0">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white leading-none tracking-tighter uppercase">
            CẤU HÌNH <span className="text-blue-400">ARENA</span>
          </h1>
          <p className="text-amber-300 font-bold text-[9px] uppercase tracking-[0.3em]">Hệ thống AI Soạn bài Pro 2024</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowDataSync(true)} className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition-all text-lg shadow-lg">🔄</button>
          <button 
            onClick={() => setMode(mode === 'AI' ? 'MANUAL' : 'AI')} 
            className={`px-5 py-2 rounded-xl font-black text-[10px] border-2 transition-all uppercase tracking-widest ${mode === 'AI' ? 'bg-purple-600/10 border-purple-500/40 text-purple-300' : 'bg-blue-600/10 border-blue-500/40 text-blue-300'}`}
          >
            {mode === 'AI' ? '📚 THƯ VIỆN RIÊNG' : '🤖 AI SOẠN BÀI'}
          </button>
        </div>
      </div>
      
      {/* SETUP CONTENT GRID */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        
        {/* THÔNG SỐ BÀI HỌC (7 Cột) */}
        <div className="col-span-7 bg-slate-900/30 p-8 rounded-[45px] border border-slate-800 shadow-2xl flex flex-col gap-6 overflow-y-auto custom-scrollbar backdrop-blur-md">
          {mode === 'AI' ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-[9px] text-white">01</span> KHỐI LỚP
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {grades.map(g => (
                    <button key={g} onClick={() => setSelectedGrade(g)} className={`p-3 rounded-xl border-2 transition-all font-black text-xs ${selectedGrade === g ? 'border-blue-400 bg-blue-500/20 text-white shadow-lg' : 'border-slate-800 bg-black/30 text-slate-400 hover:border-slate-600'}`}>{g}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-[9px] text-white">02</span> MÔN HỌC
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {subjects.map(s => (
                    <button key={s} onClick={() => setSelectedSubject(s)} className={`p-2.5 rounded-xl border-2 transition-all text-[9px] font-black uppercase tracking-tighter ${selectedSubject === s ? 'border-blue-400 bg-blue-400/20 text-white shadow-md' : 'border-slate-800 bg-black/30 text-slate-400 hover:border-slate-600'}`}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-5 h-5 bg-blue-600 rounded-lg flex items-center justify-center text-[9px] text-white">03</span> TÊN CHỦ ĐỀ
                </label>
                <input
                  type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ví dụ: Quang hợp, Lịch sử 8..."
                  className="w-full p-5 rounded-2xl bg-black/50 border border-slate-700 text-xl font-black placeholder:text-slate-800 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="text-7xl opacity-30 drop-shadow-[0_0_20px_rgba(147,51,234,0.3)]">📖</div>
              <h3 className="text-2xl font-black text-white uppercase italic">THƯ VIỆN TỰ SOẠN</h3>
              <p className="text-xs text-slate-400 font-bold px-10">Bạn đang lưu trữ {manualQuestions.length} câu hỏi tùy chỉnh.</p>
              <button onClick={() => setShowManualEditor(true)} className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black text-sm shadow-xl border-b-4 border-purple-800 uppercase tracking-widest hover:scale-105 transition-all">MỞ BIÊN TẬP VIÊN ✍️</button>
            </div>
          )}
        </div>

        {/* THIẾT LẬP GAME & BẮT ĐẦU (5 Cột) */}
        <div className="col-span-5 flex flex-col gap-4 overflow-hidden">
          <div className="bg-slate-900/30 p-6 rounded-[45px] border border-slate-800 shadow-2xl flex flex-col gap-6 overflow-hidden backdrop-blur-md">
            <div className="space-y-3">
               <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ĐỐI THỦ ({studentNames.length})</label>
                 <button onClick={() => setShowStudentManager(true)} className="text-[9px] font-black text-blue-400 hover:text-blue-300 uppercase tracking-widest">SỬA ĐỔI</button>
               </div>
               <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-2 custom-scrollbar p-4 bg-black/20 rounded-2xl border border-slate-800/50">
                 {studentNames.length === 0 ? (
                    <span className="text-[9px] font-black text-red-500/70 p-2 uppercase">⚠️ Chưa có ai đăng ký</span>
                 ) : (
                    studentNames.map((n, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 text-[8px] font-black rounded-lg border border-slate-700 text-slate-400 uppercase truncate max-w-[90px]">{n}</span>
                    ))
                 )}
               </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">THÔNG SỐ TRẬN ĐẤU</label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black text-slate-500 uppercase">SỐ CÂU:</span>
                  <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="bg-transparent text-amber-400 font-black text-lg outline-none cursor-pointer">
                    {[5, 10, 15, 20].map(n => <option key={n} value={n} className="bg-slate-900">{n} CÂU</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between p-3 bg-black/30 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-black text-slate-500 uppercase">MỨC ĐỘ:</span>
                  <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="bg-transparent text-blue-400 font-black text-sm outline-none cursor-pointer uppercase">
                    {difficulties.map(d => <option key={d} value={d} className="bg-slate-900">{d}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            disabled={!isFormValid}
            onClick={() => onStart(selectedGrade, selectedSubject, mode === 'AI' ? topic : 'Thư viện', difficulty, studentNames, questionCount, mode === 'MANUAL' ? manualQuestions : undefined)}
            className={`flex-grow py-10 rounded-[45px] text-4xl btn-gameshow shadow-3xl ${isFormValid ? 'btn-blue shimmer-effect' : 'btn-disabled'}`}
          >
            {mode === 'AI' ? 'SOẠN BÀI AI 🚀' : 'BẮT ĐẦU CHƠI 🎮'}
          </button>
        </div>
      </div>

      {showStudentManager && <StudentManager initialNames={studentNames} onUpdate={setStudentNames} onClose={() => setShowStudentManager(false)} />}
      {showManualEditor && <ManualQuestionEditor onSave={setManualQuestions} onClose={() => setShowManualEditor(false)} initialQuestions={manualQuestions} />}
      {showDataSync && <DataSync onImport={(data) => { setStudentNames(data.students); setManualQuestions(data.manualQuestions); localStorage.setItem('app_history', JSON.stringify(data.history)); }} onClose={() => setShowDataSync(false)} />}
    </div>
  );
};

export default SetupScreen;
