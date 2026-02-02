
import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface ManualQuestionEditorProps {
  onSave: (questions: Question[]) => void;
  onClose: () => void;
  initialQuestions?: Question[];
}

const ManualQuestionEditor: React.FC<ManualQuestionEditorProps> = ({ onSave, onClose, initialQuestions = [] }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('manual_question_library');
    return saved ? JSON.parse(saved) : initialQuestions;
  });

  const [currentEdit, setCurrentEdit] = useState<Partial<Question>>({
    question: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    discussionHint: ''
  });

  useEffect(() => {
    localStorage.setItem('manual_question_library', JSON.stringify(questions));
  }, [questions]);

  const handleAdd = () => {
    if (!currentEdit.question || currentEdit.options?.some(o => !o)) {
      alert("Vui lòng nhập đầy đủ câu hỏi và 4 đáp án!");
      return;
    }
    const newQ: Question = {
      ...currentEdit as Question,
      id: `manual-${Date.now()}`
    };
    setQuestions([...questions, newQ]);
    setCurrentEdit({
      question: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
      explanation: '',
      discussionHint: ''
    });
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const editQuestion = (q: Question) => {
    setCurrentEdit(q);
    removeQuestion(q.id);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
      <div className="bg-slate-900 w-full max-w-7xl rounded-[60px] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border-4 border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-800 p-8 text-white flex justify-between items-center border-b-4 border-slate-700">
          <div className="flex items-center space-x-6">
            <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(147,51,234,0.4)] border-2 border-purple-400 font-black">✍️</div>
            <div>
              <h2 className="text-4xl font-black uppercase tracking-tighter text-shadow-strong">BIÊN TẬP THƯ VIỆN</h2>
              <p className="text-amber-300 font-black text-sm tracking-[0.2em] uppercase">Xây dựng bộ đề trắc nghiệm riêng</p>
            </div>
          </div>
          <button onClick={onClose} className="w-14 h-14 bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black text-2xl border border-white/20">✕</button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col lg:flex-row p-8 gap-8 bg-slate-900/50">
          
          {/* Form Soạn Thảo */}
          <div className="flex-[1.2] space-y-6 overflow-y-auto pr-4 custom-scrollbar">
            <div className="bg-slate-950 p-10 rounded-[40px] border-2 border-slate-700 shadow-xl space-y-8">
              <h3 className="text-xl font-black text-white uppercase tracking-widest flex items-center space-x-3">
                <span className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-sm font-black border border-purple-400">✚</span>
                <span className="text-shadow-strong">SOẠN THẢO CÂU MỚI</span>
              </h3>
              
              <div className="space-y-3">
                <label className="text-xs font-black text-white uppercase tracking-[0.3em] text-shadow-strong">Nội dung câu hỏi</label>
                <textarea 
                  value={currentEdit.question}
                  onChange={e => setCurrentEdit({...currentEdit, question: e.target.value})}
                  className="w-full p-8 rounded-3xl bg-black border-2 border-slate-700 focus:border-purple-400 outline-none text-2xl font-black text-white min-h-[160px] resize-none transition-all shadow-inner placeholder:text-slate-300"
                  placeholder="Ví dụ: Thủ đô của Việt Nam là gì?..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentEdit.options?.map((opt, idx) => (
                  <div key={idx} className={`p-4 rounded-3xl border-2 transition-all flex items-center space-x-4 shadow-md ${currentEdit.correctAnswerIndex === idx ? 'border-green-400 bg-green-500/30' : 'border-slate-800 bg-black/60'}`}>
                    <input 
                      type="radio" 
                      name="correctIdx" 
                      checked={currentEdit.correctAnswerIndex === idx}
                      onChange={() => setCurrentEdit({...currentEdit, correctAnswerIndex: idx})}
                      className="w-6 h-6 accent-green-400 cursor-pointer scale-125"
                    />
                    <div className="flex-grow flex items-center space-x-3">
                      <span className="font-black text-amber-300">{String.fromCharCode(65 + idx)}.</span>
                      <input 
                        value={opt}
                        onChange={e => {
                          const newOpts = [...(currentEdit.options || [])];
                          newOpts[idx] = e.target.value;
                          setCurrentEdit({...currentEdit, options: newOpts});
                        }}
                        className="w-full bg-black/80 rounded-xl p-3 outline-none font-black text-lg text-white border-2 border-transparent focus:border-purple-400/60 placeholder:text-slate-400"
                        placeholder={`Phương án ${String.fromCharCode(65 + idx)}...`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <label className="text-xs font-black text-white uppercase tracking-widest text-shadow-strong">Lời giải chi tiết</label>
                  <input 
                    value={currentEdit.explanation}
                    onChange={e => setCurrentEdit({...currentEdit, explanation: e.target.value})}
                    className="w-full p-5 rounded-2xl bg-black border-2 border-slate-700 focus:border-purple-400 outline-none font-black text-white text-sm placeholder:text-slate-300"
                    placeholder="Giải thích tại sao đáp án này đúng..."
                  />
                </div>
              </div>

              <button 
                onClick={handleAdd}
                className="w-full py-6 rounded-3xl text-2xl btn-gameshow btn-purple"
              >
                LƯU CÂU HỎI VÀO DANH SÁCH 📥
              </button>
            </div>
          </div>

          {/* Danh Sách Đã Soạn */}
          <div className="flex-1 flex flex-col space-y-4">
            <div className="bg-slate-950 p-6 rounded-3xl border-2 border-slate-700 flex justify-between items-center shadow-lg">
              <span className="font-black text-white uppercase text-xs tracking-widest text-shadow-strong">SỐ CÂU ĐÃ SOẠN: <span className="text-amber-300">{questions.length}</span></span>
              <button onClick={() => { if(confirm('Xóa sạch thư viện?')) setQuestions([]); }} className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-widest border border-red-500/30 px-3 py-1 rounded-full">Xóa tất cả</button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {questions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 space-y-6">
                  <span className="text-9xl opacity-20">📖</span>
                  <p className="font-black text-sm uppercase tracking-widest text-center">Đang chờ bạn soạn câu hỏi đầu tiên</p>
                </div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className="bg-black/60 p-6 rounded-[35px] border-2 border-slate-800 group hover:border-purple-500/50 transition-all shadow-md">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-full text-white tracking-widest border border-slate-600">CÂU {idx + 1}</span>
                      <div className="flex space-x-2">
                        <button onClick={() => editQuestion(q)} className="w-10 h-10 flex items-center justify-center bg-blue-600/30 text-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-500/30">✏️</button>
                        <button onClick={() => removeQuestion(q.id)} className="w-10 h-10 flex items-center justify-center bg-red-600/30 text-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-500/30">🗑️</button>
                      </div>
                    </div>
                    <p className="font-black text-white text-lg line-clamp-2 mb-4 leading-tight text-shadow-strong">{q.question}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] px-3 py-1 bg-green-500/30 text-green-200 rounded-full font-black border border-green-500/40 uppercase tracking-tighter shadow-sm">
                        ĐÁP ÁN: {String.fromCharCode(65 + q.correctAnswerIndex)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button 
              onClick={() => { onSave(questions); onClose(); }}
              disabled={questions.length === 0}
              className={`w-full py-8 rounded-[40px] text-3xl btn-gameshow ${
                questions.length > 0 
                  ? 'btn-orange' 
                  : 'btn-disabled'
              }`}
            >
              HOÀN TẤT THƯ VIỆN 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualQuestionEditor;
