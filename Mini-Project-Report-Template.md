# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)  
**Mini-Project Title:** Mini-Project 1: VKU Field Survey PWA  
**Student / Account Name:** phonggg1106  
**Submission Date:** 03/09/2026  

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Student Information:**
  - **Full Name:** Bùi Hoàng Phong
  - **Role:** Full-Stack PWA Architecture, Offline Engine & UI/UX Design — Contribution: 100%
* **🔗 Live Demo URL:** [https://vku-field-survey-4g7.pages.dev](https://vku-field-survey-4g7.pages.dev)
* **💻 GitHub Repository:** [https://github.com/phonggg1106/VKU_Survey](https://github.com/phonggg1106/VKU_Survey)

---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **VKU Brand UI/UX & Responsive Viewport** | ✅ Complete | 100% responsive mobile layout. Main theme is clean White (`#FFFFFF`) with official VKU Logo tri-color accents: VKU Blue (`#0047BA`), VKU Red (`#E31B23`), and VKU Yellow (`#FDB813`). |
| 2 | **Offline-First PWA & Cache-First SW** | ✅ Complete | Configured via `vite-plugin-pwa` with Workbox Service Worker. Pre-caches core App Shell (HTML/CSS/JS) for sub-second offline booting. |
| 3 | **Local Offline Storage (IndexedDB)** | ✅ Complete | Integrated `localforage` (IndexedDB driver) in `src/services/db.ts` to store structured survey drafts, 5-star ratings, defect descriptions, and photo attachments locally. |
| 4 | **Hardware Access (Camera Integration)** | ✅ Complete | Built `src/hooks/useCamera.ts` leveraging `@capacitor/camera` with HTML File Input fallbacks for mobile browsers to capture live evidence photos offline. |
| 5 | **Automatic Offline Queue & Background Sync** | ✅ Complete | Developed `src/services/sync.ts` and `useNetwork.ts` to listen to online/offline state transitions and automatically flush queued `PENDING_SYNC` records when connected. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### Directory Structure & Responsibilities
```text
VKU_Survey/
├── public/
│   ├── images.png               # Official VKU Brand Logo
│   ├── manifest.webmanifest     # PWA Web App Manifest (Standalone Mode)
│   
├── src/
│   ├── components/
│   │   ├── Header.tsx           # Sticky Navigation Header with VKU Tri-Color Accent Line
│   │   ├── BottomNav.tsx        # Mobile Tab Navigation & Real-time Pending Badge
│   │   ├── Home.tsx             # Welcome Dashboard & Quick Action Grid
│   │   ├── SurveyForm.tsx       # Campus Facility Survey Form & Star Rating
│   │   ├── SurveyList.tsx       # IndexedDB Local Survey History & Photo Lightbox
│   │   ├── SyncManager.tsx      # Queue Status, Manual Sync & Live Logs
│   │   ├── Settings.tsx         # PWA Info, Network Diagnostic & Sample Data Seed
│   │   └── CameraCapture.tsx    # Native Camera Hardware Capture UI
│   ├── hooks/
│   │   ├── useNetwork.ts        # Capacitor Network Plugin + Browser OnLine Event Hook
│   │   └── useCamera.ts         # Capacitor Camera Plugin + Fallback Handler
│   ├── services/
│   │   ├── db.ts                # LocalForage IndexedDB Storage Controller
│   │   └── sync.ts              # Event-Driven Offline Queue Sync Engine
│   ├── types/
│   │   └── survey.ts            # TypeScript Models (SurveyDraft, CategoryType, etc.)
│   ├── App.tsx                  # Main Container & Reactive State Subscribers
│   ├── index.css                # Tailwind Directives & Custom VKU Tri-Color CSS Bar
│   └── main.tsx
├── tailwind.config.js           # Extended Color Palette (VKU Blue, Red, Yellow Tokens)
└── vite.config.ts               # Vite PWA Service Worker Configuration
```

### State Management & Sync Queue Strategy
- **Local Database (IndexedDB):** All survey submissions are assigned a unique ID, timestamp, and initial status `PENDING_SYNC`.
- **Reactive Subscription Engine:** `subscribeSyncState` pushes queue length updates to `App.tsx` and `BottomNav.tsx` in real-time.
- **Auto-Sync Trigger:** When `useNetwork` detects a transition from `isOffline = true` to `isOffline = false`, `syncPendingSurveys()` automatically executes, uploading payloads and updating status to `SYNCED`.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

1. **Trang Chủ (Home Dashboard):**
   Giao diện nền trắng kết hợp dải viền 3 màu VKU (Xanh - Đỏ - Vàng), hiển thị thẻ đón chào, nút tạo khảo sát nhanh và trạng thái kết nối mạng thời gian thực.
2. **Phiếu Khảo Sát Mới (New Survey Form):**
   Cho phép chọn Tòa nhà (Building A, B, C, V...), Tầng, Mã phòng, Danh mục thiết bị, đánh giá chất lượng 5 sao, ghi chú sự cố và chụp ảnh thực tế qua Camera.
3. **Lịch Sử Khảo Sát (IndexedDB Local Records):**
   Hiển thị danh sách phiếu đã lưu trong máy với đường viền màu đỏ cho phiếu `Chờ gửi` và màu xanh cho phiếu `Đã tải lên`, kèm tính năng xem ảnh lightbox.
4. **Trình Quản Lý Đồng Bộ (Offline Sync Manager):**
   Hiển thị số lượng phiếu đang chờ, nút kích hoạt đồng bộ thủ công, tính năng dọn dẹp bộ nhớ và Nhật ký tiến trình (Live Logs).

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Challenge 1: Lưu trữ hình ảnh đính kèm khi ngoại tuyến không gây tràn bộ nhớ
- **Vấn đề:** Ứng dụng cần lưu ảnh chụp sự cố trực tiếp khi không có mạng mà không làm đơ giao diện hay quá tải LocalStorage.
- **Giải pháp:** Sử dụng `localforage` kích hoạt driver **IndexedDB** không bất đồng bộ, nén ảnh đính kèm dưới dạng chuỗi Base64 / Blob để lưu trữ an toàn với dung lượng lên tới hàng trăm MB mà không chặn UI thread.

### Challenge 2: Tự động phát hiện mạng và đồng bộ ngầm mượt mà
- **Vấn đề:** Tránh việc người dùng phải tự kiểm tra kết nối để bấm gửi lại dữ liệu thủ công.
- **Giải pháp:** Kết hợp Capacitor Network API với `window.addEventListener('online')`, đăng ký hàm callback tự động gọi `syncPendingSurveys()` ngay khi có lại tín hiệu mạng, đồng thời cập nhật Real-time Badge counter trên thanh điều hướng BottomNav.
