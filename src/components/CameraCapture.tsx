import React from 'react';
import { Camera, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';

interface CameraCaptureProps {
  photoUrl: string | null;
  onPhotoCaptured: (url: string | null) => void;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  photoUrl,
  onPhotoCaptured
}) => {
  const { takePhoto, chooseFromGallery, isCapturing, error } = useCamera();

  const handleSnapPhoto = async () => {
    const dataUrl = await takePhoto();
    if (dataUrl) {
      onPhotoCaptured(dataUrl);
    }
  };

  const handlePickGallery = async () => {
    const dataUrl = await chooseFromGallery();
    if (dataUrl) {
      onPhotoCaptured(dataUrl);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoCaptured(null);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Hình ảnh minh chứng sự cố / hiện trạng
      </label>

      {/* Captured Photo Preview Card */}
      {photoUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 group">
          <img
            src={photoUrl}
            alt="Survey inspection capture"
            className="w-full h-56 object-cover"
          />

          {/* Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-4">
            <div className="flex items-center space-x-2 text-white text-xs font-bold bg-[#0047BA]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-blue-400/30">
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Đã đính kèm ảnh</span>
            </div>

            <button
              type="button"
              onClick={handleRemovePhoto}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-[#E31B23]/90 text-white text-xs font-bold hover:bg-red-700 transition-all backdrop-blur-md shadow-md active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa ảnh</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty Capture Card */
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center bg-slate-50 hover:bg-slate-100/80 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0047BA] border border-blue-100 mx-auto flex items-center justify-center mb-3">
            <Camera className="w-6 h-6 text-[#0047BA]" />
          </div>

          <h3 className="text-sm font-bold text-slate-800 mb-1">
            Chụp ảnh thiết bị / Hư hỏng thực tế
          </h3>
          <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
            Chụp ảnh trực tiếp bằng Camera hoặc chọn từ Thư viện thiết bị. Hoạt động 100% khi ngoại tuyến.
          </p>

          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-50 text-[#E31B23] text-xs font-semibold flex items-center justify-center space-x-1.5 border border-red-200">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-center space-x-3">
            <button
              type="button"
              onClick={handleSnapPhoto}
              disabled={isCapturing}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-[#0047BA] text-white text-xs font-bold hover:bg-[#002A54] active:scale-95 transition-all shadow-sm disabled:opacity-50 border border-blue-700"
            >
              <Camera className="w-4 h-4" />
              <span>{isCapturing ? 'Đang mở Camera...' : 'Chụp ảnh'}</span>
            </button>

            <button
              type="button"
              onClick={handlePickGallery}
              disabled={isCapturing}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-slate-700 text-xs font-bold border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
            >
              <ImageIcon className="w-4 h-4 text-slate-500" />
              <span>Thư viện</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

