import React, { useState, useRef, useEffect } from 'react';
import { useFnBStore } from '../stores/useFnBStore';
import { QrCode, Camera, Upload, X, CheckCircle2, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

interface QrScannerModalProps {
  onSelectTableToken: (token: string) => void;
  onClose: () => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onSelectTableToken, onClose }) => {
  const { tables } = useFnBStore();
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'demo'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize camera stream if user selects camera tab
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (activeTab === 'camera') {
      setIsScanning(true);
      setCameraError(null);
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.warn('Camera access denied or unhandled:', err);
          setCameraError('Không thể truy cập Camera. Vui lòng cho phép quyền Camera hoặc thử chọn bàn bên dưới!');
          setIsScanning(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [activeTab]);

  const handleSimulateScan = (qrToken: string) => {
    onSelectTableToken(qrToken);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate reading QR code from uploaded image
      const randomTable = tables[Math.floor(Math.random() * tables.length)];
      handleSimulateScan(randomTable.qrToken);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden text-slate-100 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Quét Mã QR Đặt Món Tại Bàn</h3>
              <p className="text-[11px] text-slate-400">Camera Scanner • Instant QR Token Resolution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selector */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'camera' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>Camera Web</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Tải Ảnh QR</span>
          </button>
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'demo' ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Danh Sách Bàn</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
          {activeTab === 'camera' && (
            <div className="w-full space-y-4 flex flex-col items-center">
              {cameraError ? (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-xs text-red-400 space-y-2 text-center w-full">
                  <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
                  <p>{cameraError}</p>
                  <button
                    onClick={() => setActiveTab('demo')}
                    className="mt-2 px-4 py-2 bg-slate-800 text-white font-bold rounded-xl text-xs"
                  >
                    Chọn Bàn Từ Danh Sách Mô Phỏng
                  </button>
                </div>
              ) : (
                <div className="relative w-64 h-64 bg-slate-950 rounded-2xl border-2 border-dashed border-orange-500/60 overflow-hidden flex items-center justify-center group shadow-2xl">
                  <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Scanning Laser Beam Line Animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse-subtle top-1/2 -translate-y-1/2 shadow-[0_0_15px_#f97316]" />

                  <div className="absolute inset-0 border-2 border-orange-500/40 rounded-2xl pointer-events-none" />
                  <div className="absolute bottom-3 left-0 right-0 text-center">
                    <span className="text-[10px] font-bold bg-slate-950/80 text-orange-400 px-3 py-1 rounded-full border border-orange-500/30">
                      Đang hướng Camera vào mã QR tại bàn...
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="w-full space-y-4 flex flex-col items-center">
              <label className="w-full h-48 border-2 border-dashed border-slate-700 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer bg-slate-950/50 transition">
                <Upload className="w-10 h-10 text-orange-400 mb-2" />
                <span className="font-bold text-xs text-white">Bấm để tải ảnh QR Code từ thư viện</span>
                <span className="text-[10px] text-slate-500 mt-1">Hỗ trợ PNG, JPG, WebP</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'demo' && (
            <div className="w-full space-y-3">
              <span className="text-xs text-slate-400 font-semibold block text-left">Chọn bàn để giải mã QR token:</span>
              <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto">
                {tables.map(tbl => (
                  <button
                    key={tbl.id}
                    onClick={() => handleSimulateScan(tbl.qrToken)}
                    className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-orange-500 rounded-xl text-left transition flex items-center justify-between"
                  >
                    <div>
                      <span className="font-extrabold text-xs text-white block">{tbl.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">/q/{tbl.qrToken.substring(0, 8)}</span>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-orange-400 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
