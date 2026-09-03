# VKU Field Survey PWA (Mini-Project 1)

**Trường Đại học Công nghệ Thông tin và Truyền thông Việt - Hàn (VKU)**  
**Môn học:** Đổi mới sáng tạo & Phát triển ứng dụng di động đa nền tảng (Cross-Platform Mobile App Development)  
**Giảng viên:** TS. Nguyễn Thanh Tuấn  
**Tác giả:** phonggg1106  

---

## 📌 Giới thiệu dự án

**VKU Field Survey PWA** là ứng dụng Progressive Web App (PWA) hỗ trợ cán bộ và sinh viên thực hiện khảo sát, kiểm định cơ sở vật chất và ghi nhận hư hỏng thiết bị tại các tòa nhà trong khuôn viên VKU.

Ứng dụng được thiết kế theo kiến trúc **Offline-First**, cho phép ghi nhận phiếu khảo sát, chụp ảnh minh chứng và lưu trữ dữ liệu an toàn ngay cả khi **không có kết nối mạng**. Khi thiết bị kết nối mạng trở lại, ứng dụng sẽ tự động đồng bộ hàng chờ khảo sát lên máy chủ.

---

## ✨ Tính năng chính

1. **Giao diện nhận diện thương hiệu VKU**:
   - Tông màu chủ đạo Trắng kết hợp với màu phụ đạo đặc trưng VKU Logo (**Xanh dương `#0047BA`**, **Đỏ `#E31B23`**, **Vàng `#FDB813`**).
   - Thiết kế tối ưu cho thiết bị di động (Mobile Viewport First).

2. **Lưu trữ Offline qua IndexedDB (`localforage`)**:
   - Ghi nhận thông tin tòa nhà, tầng, mã phòng, hạng mục thiết bị, mức độ hoạt động (1 - 5 sao), ghi chú sự cố và ảnh đính kèm.
   - Lưu trữ dữ liệu trực tiếp vào bộ nhớ thiết bị mà không cần mạng.

3. **Chụp ảnh sự cố (Hardware Access)**:
   - Tích hợp **Capacitor Camera Bridge** chụp ảnh trực tiếp hoặc chọn ảnh từ thư viện thiết bị.

4. **Tự động đồng bộ Offline Queue**:
   - Engine tự động lắng nghe trạng thái mạng (`useNetwork`).
   - Đẩy hàng chờ phiếu khảo sát (`PENDING_SYNC`) lên máy chủ khi có kết nối Wi-Fi/4G.

5. **PWA Standalone & Cache-First Service Worker**:
   - Đã cấu hình `manifest.webmanifest` hỗ trợ cài đặt vào màn hình chính (Add to Home Screen).
   - Service Worker pre-cache toàn bộ App Shell (HTML, CSS, JS) cho phép ứng dụng mở tức thì không phụ thuộc mạng.

---

## 🛠️ Công nghệ sử dụng

- **Frontend Core:** React 18, TypeScript, Vite
- **Styling:** TailwindCSS (Custom VKU Color Tokens), Lucide Icons
- **Offline Storage:** LocalForage (IndexedDB Driver)
- **PWA & Caching:** `vite-plugin-pwa`, Workbox Service Worker
- **Hardware Integration:** `@capacitor/core`, `@capacitor/camera`, `@capacitor/network`

---

## 🚀 Hướng dẫn cài đặt và khởi chạy

```bash
# 1. Clone repository
git clone https://github.com/phonggg1106/VKU_Survey.git
cd VKU_Survey

# 2. Cài đặt thư viện
npm install

# 3. Khởi chạy ở chế độ phát triển
npm run dev

# 4. Build sản phẩm PWA
npm run build
```

---

## 🌐 Deploy Link & Repository

- **GitHub Repository:** [https://github.com/phonggg1106/VKU_Survey](https://github.com/phonggg1106/VKU_Survey)
- **Cloudflare Pages / Live Link:** Deploy via Cloudflare Pages CLI (`wrangler`)
