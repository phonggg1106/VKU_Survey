import React, { useState } from 'react';
import { Star, Building2, MapPin, Tag, FileText, CheckCircle2, Save, Send } from 'lucide-react';
import { CategoryType, BuildingType } from '../types/survey';
import { saveSurveyDraft } from '../services/db';
import { syncPendingSurveys } from '../services/sync';
import { CameraCapture } from './CameraCapture';

interface SurveyFormProps {
  onSurveySubmitted: () => void;
  isOffline: boolean;
}

const BUILDINGS: BuildingType[] = [
  'Building A',
  'Building B',
  'Building C',
  'Building V',
  'Central Library',
  'Admin Building',
  'Dormitory Complex'
];

const CATEGORIES: { id: CategoryType; label: string; icon: string }[] = [
  { id: 'Hardware', label: 'Computer & Hardware', icon: '💻' },
  { id: 'Projector', label: 'Projector & Display', icon: '📹' },
  { id: 'Air Conditioner', label: 'Air Conditioner (AC)', icon: '❄️' },
  { id: 'Network / IT', label: 'Network & Wi-Fi', icon: '🌐' },
  { id: 'Furniture', label: 'Desks & Furniture', icon: '🪑' },
  { id: 'Lighting & Electrical', label: 'Lighting & Power', icon: '💡' },
  { id: 'Other', label: 'Other Facilities', icon: '📦' }
];

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', '5th Floor', 'Basement'];

export const SurveyForm: React.FC<SurveyFormProps> = ({
  onSurveySubmitted,
  isOffline
}) => {
  const [building, setBuilding] = useState<BuildingType>('Building A');
  const [floor, setFloor] = useState<string>('2nd Floor');
  const [roomNumber, setRoomNumber] = useState<string>('');
  const [category, setCategory] = useState<CategoryType>('Projector');
  const [rating, setRating] = useState<number>(3);
  const [defectNotes, setDefectNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState<string>('Field Inspector');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      alert('Please enter a room number or area code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to local IndexedDB via LocalForage
      const draft = await saveSurveyDraft({
        building,
        floor,
        roomNumber: roomNumber.trim().toUpperCase(),
        category,
        rating,
        defectNotes: defectNotes.trim(),
        photoUrl: photoUrl || undefined,
        inspectorName: inspectorName.trim() || 'Anonymous Inspector'
      });

      setLastSubmittedId(draft.id);

      // 2. Trigger auto-sync if online
      if (!isOffline) {
        syncPendingSurveys().catch(console.error);
      }

      // 3. Reset Form & Trigger Callback
      setShowSuccessModal(true);
      onSurveySubmitted();

    } catch (err) {
      console.error('Failed to save survey draft:', err);
      alert('Failed to save survey. Please check device storage space.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRoomNumber('');
    setDefectNotes('');
    setPhotoUrl(null);
    setRating(3);
    setShowSuccessModal(false);
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-5 animate-fade-in">
      
      {/* Header Banner - White Base with VKU Tri-Color Accent */}
      <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0047BA] via-[#E31B23] to-[#FDB813]" />
        
        <div className="flex items-center space-x-3 mb-2 pt-1">
          <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[#0047BA]">
            <Building2 className="w-6 h-6 text-[#0047BA]" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Phiếu Khảo Sát Mới</h2>
            <p className="text-xs font-semibold text-[#0047BA]">Kiểm định cơ sở vật chất VKU</p>
          </div>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Ghi nhận hiện trạng, hư hỏng thiết bị. Dữ liệu tự động lưu vào bộ nhớ máy (IndexedDB) khi hoạt động ngoại tuyến.
        </p>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* 1. Location Details Section */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <MapPin className="w-4 h-4 text-[#0047BA]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              1. Địa điểm khảo sát
            </h3>
          </div>

          {/* Building Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tòa nhà / Khu vực <span className="text-[#E31B23]">*</span>
            </label>
            <select
              value={building}
              onChange={(e) => setBuilding(e.target.value as BuildingType)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:bg-white transition-all"
            >
              {BUILDINGS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Floor and Room Input Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tầng
              </label>
              <select
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:bg-white transition-all"
              >
                {FLOORS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã phòng / Khu vực <span className="text-[#E31B23]">*</span>
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="VD: A-302, LAB-1"
                required
                className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:bg-white transition-all uppercase"
              />
            </div>
          </div>
        </div>

        {/* 2. Equipment Category & Condition Rating */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <Tag className="w-4 h-4 text-[#E31B23]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Hạng mục & Đánh giá chất lượng
            </h3>
          </div>

          {/* Category Chip Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Danh mục thiết bị <span className="text-[#E31B23]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isSelected
                        ? 'bg-[#0047BA] text-white border-[#0047BA] shadow-sm ring-2 ring-blue-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5-Star Condition Rating */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Mức độ hoạt động (1 = Rất kém, 5 = Tốt)
              </label>
              <span className="text-xs font-bold text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center space-x-1">
                <Star className="w-3 h-3 fill-[#FDB813] text-[#FDB813]" />
                <span>{rating} / 5 Sao</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform active:scale-95"
                >
                  <Star
                    className={`w-7 h-7 ${
                      star <= rating
                        ? 'fill-[#FDB813] text-[#FDB813]'
                        : 'text-slate-300 fill-slate-100'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Defect Notes & Camera Attachment */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-[#FDB813]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Mô tả sự cố & Hình ảnh thực tế
            </h3>
          </div>

          {/* Inspector Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Cán bộ / Người kiểm tra
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="Nhập tên người khảo sát"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:bg-white transition-all"
            />
          </div>

          {/* Defect Notes Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Ghi chú chi tiết hỏng hóc & Đề xuất sửa chữa
            </label>
            <textarea
              rows={3}
              value={defectNotes}
              onChange={(e) => setDefectNotes(e.target.value)}
              placeholder="Mô tả chi tiết linh kiện hỏng, mã lỗi máy chiếu, dây mạng hỏng, bàn ghế gãy..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047BA] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Camera Photo Component */}
          <CameraCapture
            photoUrl={photoUrl}
            onPhotoCaptured={setPhotoUrl}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full h-13 py-3.5 px-6 rounded-2xl font-bold text-white text-sm shadow-md flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
            isOffline
              ? 'bg-[#E31B23] hover:bg-[#B91C1C] shadow-red-500/20'
              : 'bg-[#0047BA] hover:bg-[#002A54] shadow-blue-600/20'
          } disabled:opacity-50 border border-transparent`}
        >
          {isOffline ? (
            <>
              <Save className="w-5 h-5" />
              <span>Lưu Ngoại Tuyến Vô IndexedDB</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Gửi Phiếu & Đồng Bộ Ngay</span>
            </>
          )}
        </button>
      </form>

      {/* Submission Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0047BA] via-[#E31B23] to-[#FDB813]" />

            <div className="w-14 h-14 rounded-full bg-blue-50 text-[#0047BA] border border-blue-100 mx-auto flex items-center justify-center pt-1">
              <CheckCircle2 className="w-8 h-8 text-[#0047BA]" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Lưu Khảo Sát Thành Công!</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {isOffline
                  ? 'Phiếu đã lưu trữ an toàn trong IndexedDB của máy. Sẽ tự động tải lên máy chủ khi kết nối mạng trở lại.'
                  : 'Đã hoàn thành khảo sát và đồng bộ về máy chủ VKU.'}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-left text-xs space-y-1 font-mono text-slate-600 border border-slate-200">
              <p><span className="font-semibold text-slate-800">Mã khảo sát:</span> #{lastSubmittedId.substring(0, 8)}</p>
              <p><span className="font-semibold text-slate-800">Địa điểm:</span> {building} ({roomNumber})</p>
              <p><span className="font-semibold text-slate-800">Trạng thái:</span> {isOffline ? 'CHỜ ĐỒNG BỘ (Offline)' : 'ĐÃ ĐỒNG BỘ'}</p>
            </div>

            <button
              onClick={resetForm}
              className="w-full py-3 bg-[#0047BA] text-white font-bold text-xs rounded-xl hover:bg-[#002A54] active:scale-95 transition-all shadow-md"
            >
              Hoàn tất & Thêm khảo sát khác
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

