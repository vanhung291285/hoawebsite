
import React, { useState } from 'react';
import { AppData } from '../types';

interface DataSyncProps {
  onImport: (data: AppData) => void;
  onClose: () => void;
}

const DataSync: React.FC<DataSyncProps> = ({ onImport, onClose }) => {
  const [syncCode, setSyncCode] = useState('');

  const exportData = () => {
    const data: AppData = {
      students: JSON.parse(localStorage.getItem('app_students') || '[]'),
      manualQuestions: JSON.parse(localStorage.getItem('manual_question_library') || '[]'),
      history: JSON.parse(localStorage.getItem('app_history') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DuLieu_ChinhPhucTriThuc_${new Date().toLocaleDateString()}.json`;
    a.click();
  };

  const handleImportCode = () => {
    try {
      const decoded = JSON.parse(atob(syncCode));
      if (confirm('Dữ liệu mới sẽ ghi đè lên dữ liệu hiện tại. Tiếp tục?')) {
        onImport(decoded);
        alert('Đồng bộ thành công!');
        onClose();
      }
    } catch (e) {
      alert('Mã đồng bộ không hợp lệ!');
    }
  };

  const generateSyncCode = () => {
    const data: AppData = {
      students: JSON.parse(localStorage.getItem('app_students') || '[]'),
      manualQuestions: JSON.parse(localStorage.getItem('manual_question_library') || '[]'),
      history: JSON.parse(localStorage.getItem('app_history') || '[]'),
    };
    const code = btoa(JSON.stringify(data));
    navigator.clipboard.writeText(code);
    alert('Đã sao chép mã đồng bộ vào bộ nhớ tạm!');
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-2xl animate-fadeIn">
      <div className="bg-slate-900 w-full max-w-2xl rounded-[60px] shadow-2xl overflow-hidden border-4 border-slate-700">
        <div className="bg-slate-800 p-8 text-white text-center border-b-4 border-slate-700">
          <h2 className="text-3xl font-black text-shadow-strong">🔄 TRUNG TÂM DỮ LIỆU</h2>
          <p className="text-amber-200 font-bold mt-2 uppercase tracking-widest text-xs">Lưu trữ và chuyển đổi thiết bị</p>
        </div>
        
        <div className="p-10 space-y-8 bg-slate-900/50">
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={exportData}
              className="p-8 bg-slate-950 border-2 border-slate-700 rounded-[40px] hover:bg-slate-800 hover:border-blue-500 transition-all flex flex-col items-center space-y-4 shadow-lg group"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">💾</span>
              <span className="font-black text-white uppercase tracking-tighter">XUẤT FILE DATA</span>
            </button>
            <button 
              onClick={generateSyncCode}
              className="p-8 bg-slate-950 border-2 border-slate-700 rounded-[40px] hover:bg-slate-800 hover:border-indigo-500 transition-all flex flex-col items-center space-y-4 shadow-lg group"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">📋</span>
              <span className="font-black text-white uppercase tracking-tighter">COPY MÃ NHANH</span>
            </button>
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-8">
            <label className="block text-center font-black text-slate-300 uppercase text-xs tracking-[0.3em]">NHẬP MÃ ĐỒNG BỘ TỪ MÁY KHÁC</label>
            <textarea 
              value={syncCode}
              onChange={(e) => setSyncCode(e.target.value)}
              placeholder="Dán mã đồng bộ bí mật vào đây..."
              className="w-full p-6 h-32 bg-slate-950 rounded-3xl border-2 border-slate-800 outline-none focus:border-blue-500 font-mono text-[10px] text-blue-300 placeholder-slate-700"
            />
            <button 
              onClick={handleImportCode}
              className="w-full py-6 bg-green-600 text-white rounded-[30px] font-black shadow-xl hover:bg-green-500 transition-all border-b-8 border-green-800 active:border-b-0 active:translate-y-2 uppercase tracking-widest"
            >
              KÍCH HOẠT ĐỒNG BỘ ✅
            </button>
          </div>

          <button onClick={onClose} className="w-full py-4 text-slate-400 font-black hover:text-white uppercase tracking-widest text-xs transition-colors">ĐÓNG CỬA SỔ</button>
        </div>
      </div>
    </div>
  );
};

export default DataSync;
