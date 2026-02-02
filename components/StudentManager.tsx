
import React, { useState, useRef } from 'react';

interface StudentManagerProps {
  initialNames: string[];
  onUpdate: (names: string[]) => void;
  onClose: () => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ initialNames, onUpdate, onClose }) => {
  const [inputText, setInputText] = useState(initialNames.join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentList = inputText.split('\n').map(s => s.trim()).filter(s => s.length > 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const names = content.split(/[\n\r,;]/).map(s => s.trim()).filter(s => s.length > 0);
      const existingNames = new Set(currentList);
      const uniqueNewNames = names.filter(name => !existingNames.has(name));
      if (uniqueNewNames.length > 0) {
        setInputText(prev => (prev.trim() ? prev.trim() + '\n' : '') + uniqueNewNames.join('\n'));
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const templateContent = "Họ và tên học sinh\nNguyễn Văn A\nTrần Thị B\nLê Văn C";
    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "mau_danh_sach_hoc_sinh.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const removeStudent = (index: number) => {
    const newList = [...currentList];
    newList.splice(index, 1);
    setInputText(newList.join('\n'));
  };

  const handleSave = () => {
    onUpdate(currentList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
      <div className="bg-slate-900 w-full max-w-6xl rounded-[60px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border-4 border-slate-700">
        
        {/* Header */}
        <div className="bg-slate-800 p-10 text-white flex justify-between items-center border-b-4 border-slate-700">
          <div>
            <h2 className="text-4xl font-black flex items-center space-x-4 text-shadow-strong">
              <span>👥 QUẢN LÝ ĐẤU THỦ</span>
            </h2>
            <p className="text-amber-300 mt-2 font-black text-lg uppercase tracking-widest">Danh sách học sinh tham gia đấu trường</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-16 h-16 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-2xl transition-all font-black text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="flex-grow overflow-hidden flex flex-col lg:flex-row p-10 gap-10 bg-slate-900/50">
          {/* Left: Editor Area */}
          <div className="flex-[1.5] flex flex-col space-y-6">
            <div className="flex justify-between items-center bg-black/60 p-6 rounded-3xl border-2 border-slate-700 shadow-lg">
              <label className="font-black text-white uppercase text-sm tracking-widest text-shadow-strong">Nhập tên (Mỗi bạn một dòng)</label>
              <div className="flex space-x-3">
                <button 
                  onClick={downloadTemplate}
                  className="text-xs font-black text-white bg-slate-800 px-6 py-3 rounded-xl hover:bg-slate-700 border border-slate-600"
                >
                  📥 MẪU FILE
                </button>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-black text-blue-100 bg-blue-600/30 px-6 py-3 rounded-xl hover:bg-blue-600/50 border-2 border-blue-400/50"
                >
                  📁 TẢI LÊN CSV
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".txt,.csv" className="hidden" />
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full flex-grow p-8 rounded-[40px] border-4 border-slate-700 bg-black focus:border-blue-400 outline-none text-2xl font-black text-white resize-none shadow-inner leading-relaxed placeholder:text-slate-300"
              placeholder="Nguyễn Văn A&#10;Trần Thị B..."
            />
          </div>

          {/* Right: Preview Area */}
          <div className="flex-1 flex flex-col space-y-6">
            <div className="bg-black/60 p-6 rounded-3xl text-white flex justify-between items-center border-2 border-slate-700 shadow-xl">
              <span className="font-black uppercase text-sm tracking-widest text-amber-300 text-shadow-strong">Sĩ số: {currentList.length} bạn</span>
              <button onClick={() => setInputText('')} className="text-xs font-black text-red-400 uppercase hover:text-red-300 tracking-widest">Xóa hết</button>
            </div>
            
            <div className="flex-grow border-4 border-slate-700 rounded-[40px] overflow-y-auto p-6 space-y-4 bg-black/40 custom-scrollbar">
              {currentList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-10 text-center space-y-6">
                  <div className="text-8xl opacity-10">👥</div>
                  <p className="font-black text-xl uppercase tracking-widest">Danh sách trống</p>
                </div>
              ) : (
                currentList.map((name, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900/80 p-5 rounded-2xl border-2 border-slate-800 group hover:border-blue-500/50 transition-all">
                    <div className="flex items-center space-x-5">
                      <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black border border-blue-400/30 shadow-md">{idx + 1}</div>
                      <span className="font-black text-white text-lg text-shadow-strong">{name}</span>
                    </div>
                    <button onClick={() => removeStudent(idx)} className="text-red-400 font-black hover:scale-125 transition-all p-2 bg-red-600/20 rounded-lg">🗑️</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-10 bg-slate-800 border-t-4 border-slate-700 flex justify-between items-center">
          <p className="text-xl font-black text-amber-200 italic text-shadow-strong">💡 Mẹo: Dán trực tiếp từ Excel để tiết kiệm thời gian!</p>
          <div className="flex space-x-6">
            <button onClick={onClose} className="px-12 py-5 rounded-3xl font-black text-xl text-white hover:bg-white/10 uppercase tracking-widest transition-all">HỦY BỎ</button>
            <button onClick={handleSave} className="px-16 py-5 bg-blue-600 text-white rounded-3xl font-black text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all border-b-8 border-blue-900 active:border-b-0 uppercase tracking-tighter text-shadow-strong">LƯU DANH SÁCH ✅</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentManager;
