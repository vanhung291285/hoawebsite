
import React, { useRef, useEffect, useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface HandDetectorProps {
  onHandRaised: () => void;
  isActive: boolean;
}

const HandDetector: React.FC<HandDetectorProps> = ({ onHandRaised, isActive }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  
  // Khởi tạo AI bên trong useEffect hoặc ngay trước khi dùng để đảm bảo API_KEY mới nhất
  const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isActive) {
      // Thử dùng camera trước (user) với độ phân giải thấp để tiết kiệm băng thông
      const attemptGetUserMedia = async () => {
        try {
          // Thử với facingMode: user trước
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
        } catch (err) {
          console.warn("Thử camera 'user' thất bại, đang thử camera mặc định...", err);
          try {
            // Fallback: Thử bất kỳ camera nào có sẵn
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
          } catch (finalErr) {
            console.error("Camera error:", finalErr);
            alert("Không tìm thấy camera hoặc quyền truy cập bị từ chối.");
            return;
          }
        }

        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      };

      attemptGetUserMedia();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsCameraReady(false);
    };
  }, [isActive]);

  // AI Detection Loop
  useEffect(() => {
    if (!isActive || !isCameraReady) return;

    const detectLoop = async () => {
      // Nếu đang trong quá trình xử lý hoặc camera chưa sẵn sàng thì bỏ qua
      if (!isActive || isDetecting || !isCameraReady) return;
      
      try {
        if (!canvasRef.current || !videoRef.current) return;
        
        const canvas = canvasRef.current;
        const video = videoRef.current;
        
        // Chụp frame hình thấp để AI xử lý nhanh (320x240)
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64Image = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];

        setIsDetecting(true);
        const ai = getAI();
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: {
            parts: [
              { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
              { text: "Phân tích hình ảnh này: Có ai đang giơ tay (giơ tay phát biểu hoặc giơ tay cao) không? Trả lời duy nhất từ 'YES' nếu có, 'NO' nếu không." }
            ]
          },
          config: {
            thinkingConfig: { thinkingBudget: 0 } // Tắt thinking để phản hồi nhanh nhất có thể
          }
        });

        const result = response.text?.trim().toUpperCase();
        if (result?.includes('YES')) {
          onHandRaised();
        }
      } catch (err) {
        console.warn("Tạm dừng quét AI do lỗi hoặc giới hạn rate limit", err);
      } finally {
        setIsDetecting(false);
      }
    };

    // Tần suất quét: 4 giây một lần để tránh tốn token và lag máy chiếu
    const interval = setInterval(detectLoop, 4000); 
    return () => clearInterval(interval);
  }, [isActive, isCameraReady, isDetecting]);

  if (!isActive) return null;

  return (
    <div className="relative group overflow-hidden rounded-2xl border-4 border-blue-400/50 shadow-lg bg-black w-48 h-36">
      <video 
        ref={videoRef} 
        autoPlay 
        muted 
        playsInline 
        className="w-full h-full object-cover grayscale brightness-110 contrast-125"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      {/* HUD quét Camera */}
      <div className="absolute inset-0 border-2 border-blue-400/30 animate-pulse pointer-events-none"></div>
      
      <div className="absolute top-2 right-2 flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></div>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-blue-600/80 p-1 flex items-center justify-center">
        <span className="text-[9px] text-white font-black uppercase tracking-widest animate-pulse">
          {isDetecting ? 'AI ĐANG QUÉT...' : 'AI CAMERA LIVE'}
        </span>
      </div>
    </div>
  );
};

export default HandDetector;
