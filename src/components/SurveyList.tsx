import React, { useState, useEffect } from 'react';
import { Search, Trash2, Clock, CheckCircle2, RefreshCw, Star, Image as ImageIcon, Database } from 'lucide-react';
import { SurveyDraft, SyncStatus } from '../types/survey';
import { getAllSurveyDrafts, deleteSurveyDraft, seedSampleData } from '../services/db';

interface SurveyListProps {
  onRefreshNeeded?: () => void;
  isOffline: boolean;
}

export const SurveyList: React.FC<SurveyListProps> = ({
  onRefreshNeeded,
  isOffline: _isOffline
}) => {
  const [surveys, setSurveys] = useState<SurveyDraft[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | SyncStatus>('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const data = await getAllSurveyDrafts();
      setSurveys(data);
    } catch (err) {
      console.error('Failed to load surveys from IndexedDB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleDelete = async (id: string, room: string) => {
    if (confirm(`Are you sure you want to delete the survey record for ${room}?`)) {
      await deleteSurveyDraft(id);
      await loadSurveys();
      if (onRefreshNeeded) onRefreshNeeded();
    }
  };

  const handleSeed = async () => {
    await seedSampleData();
    await loadSurveys();
    if (onRefreshNeeded) onRefreshNeeded();
  };

  // Filtered surveys list
  const filteredSurveys = surveys.filter((item) => {
    const matchesSearch =
      item.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.defectNotes.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const pendingCount = surveys.filter((s) => s.status === 'PENDING_SYNC').length;
  const syncedCount = surveys.filter((s) => s.status === 'SYNCED').length;

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4 animate-fade-in">
      
      {/* Header & Stats Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Danh Sách Khảo Sát</h2>
          <p className="text-xs font-semibold text-[#0047BA]">Bộ nhớ cục bộ IndexedDB</p>
        </div>

        <button
          onClick={loadSurveys}
          className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
          title="Tải lại dữ liệu từ bộ nhớ máy"
        >
          <RefreshCw className="w-4 h-4 text-[#0047BA]" />
        </button>
      </div>

      {/* Quick Summary Chips - White Base with Red & Blue Touches */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border-2 border-red-100 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-extrabold text-[#E31B23] uppercase tracking-wider">Chờ đồng bộ</p>
            <p className="text-2xl font-extrabold text-slate-900">{pendingCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-red-50 text-[#E31B23] flex items-center justify-center border border-red-100">
            <Clock className="w-5 h-5 text-[#E31B23]" />
          </div>
        </div>

        <div className="bg-white border-2 border-blue-100 rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-[11px] font-extrabold text-[#0047BA] uppercase tracking-wider">Đã tải lên</p>
            <p className="text-2xl font-extrabold text-slate-900">{syncedCount}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0047BA] flex items-center justify-center border border-blue-100">
            <CheckCircle2 className="w-5 h-5 text-[#0047BA]" />
          </div>
        </div>
      </div>

      {/* Search & Filter Control Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tòa nhà, phòng, danh mục..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0047BA]"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
          {(['ALL', 'PENDING_SYNC', 'SYNCED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-[#0047BA] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PENDING_SYNC' ? 'Chờ gửi' : 'Đã tải lên'}
            </button>
          ))}
        </div>
      </div>

      {/* Surveys List Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0047BA]" />
          <p className="text-xs font-semibold">Đang tải dữ liệu từ IndexedDB...</p>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3 shadow-sm">
          <Database className="w-10 h-10 text-slate-300 mx-auto" />
          <div>
            <h3 className="text-sm font-bold text-slate-800">Không có dữ liệu</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Không tìm thấy kết quả phù hợp với bộ lọc.'
                : 'Chưa có phiếu khảo sát nào được tạo.'}
            </p>
          </div>
          {surveys.length === 0 && (
            <button
              onClick={handleSeed}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-[#0047BA] text-xs font-bold rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
            >
              <Database className="w-4 h-4" />
              <span>Tạo dữ liệu mẫu dùng thử</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSurveys.map((survey) => {
            const isPending = survey.status === 'PENDING_SYNC';
            return (
              <div
                key={survey.id}
                className={`bg-white rounded-2xl border p-4 shadow-sm space-y-3 hover:shadow-md transition-all relative overflow-hidden ${
                  isPending ? 'border-l-4 border-l-[#E31B23] border-slate-200' : 'border-l-4 border-l-[#0047BA] border-slate-200'
                }`}
              >
                {/* Header Info: Building, Room, Status Badge */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-slate-900">
                        {survey.building}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-bold">
                        {survey.roomNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {survey.floor} • {survey.createdAt}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {survey.status === 'PENDING_SYNC' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-red-50 text-[#E31B23] text-[11px] font-bold border border-red-200">
                      <Clock className="w-3 h-3 text-[#E31B23]" />
                      <span>Chờ gửi</span>
                    </span>
                  )}
                  {survey.status === 'SYNCING' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-[#D97706] text-[11px] font-bold border border-amber-200 animate-pulse">
                      <RefreshCw className="w-3 h-3 text-[#D97706] animate-spin" />
                      <span>Đang gửi...</span>
                    </span>
                  )}
                  {survey.status === 'SYNCED' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#0047BA] text-[11px] font-bold border border-blue-200">
                      <CheckCircle2 className="w-3 h-3 text-[#0047BA]" />
                      <span>Đã tải lên</span>
                    </span>
                  )}
                </div>

                {/* Details Pill: Category & Star Rating */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-xs font-bold text-[#0047BA] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    {survey.category}
                  </span>

                  <div className="flex items-center space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < survey.rating
                            ? 'fill-[#FDB813] text-[#FDB813]'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Defect Notes */}
                {survey.defectNotes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic leading-relaxed">
                    "{survey.defectNotes}"
                  </p>
                )}

                {/* Photo Thumbnail & Actions */}
                <div className="flex items-center justify-between pt-1">
                  {survey.photoUrl ? (
                    <button
                      onClick={() => setSelectedPhoto(survey.photoUrl!)}
                      className="flex items-center space-x-1.5 text-xs text-[#0047BA] font-bold hover:underline"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#0047BA]" />
                      <span>Xem ảnh chụp thực tế</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Không kèm hình ảnh</span>
                  )}

                  <button
                    onClick={() => handleDelete(survey.id, survey.roomNumber)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-[#E31B23] hover:bg-red-50 transition-colors"
                    title="Xóa khỏi máy"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="relative max-w-sm w-full bg-white rounded-3xl overflow-hidden shadow-2xl p-2 border border-slate-200">
            <img
              src={selectedPhoto}
              alt="Full size survey evidence"
              className="w-full h-80 object-contain rounded-2xl bg-slate-900"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="mt-3 w-full py-2.5 bg-[#0047BA] text-white font-bold text-xs rounded-xl hover:bg-[#002A54]"
            >
              Đóng xem ảnh
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

