# MINI-PROJECT SHORT TECHNICAL REPORT
**Course:** Cross-Platform Mobile App Development (VKU)
**Mini-Project Title:** Mini-Project 1.2 — Capacitor: Field Survey
**Team / Student Name:** Nguyễn Thiên Mã
**Submission Date:** 21/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS
* **Team Members:**
  1. Nguyễn Thiên Mã — Student ID: 23IT257 — Role: Sole Developer (Full-stack Mobile) — Contribution: 100%
* **🔗 Live Demo URL:** Chưa triển khai bản public online. Chạy local qua `npm run dev` (web) hoặc `npm run cap:android` / `npm run cap:ios` (native) — xem hướng dẫn chi tiết trong `README.md`.
* **💻 GitHub Repository:** https://github.com/AlenJason/Mini-Project2-LTDNT
* **🎥 Video Demo (Optional):** Không có.

---

## 2. FEATURE IMPLEMENTATION CHECKLIST
| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | Responsive Mobile Viewport | ✅ Complete | Layout mobile-first (tối đa 480px, canh giữa trên màn lớn), kiểm tra không tràn ngang ở 320px, hỗ trợ Dark/Light mode tự động theo `prefers-color-scheme`. |
| 2 | Local Offline Persistence | ✅ Complete | Dùng `@capacitor/preferences` (key-value storage native trên Android/iOS, `localStorage` trên web) để lưu toàn bộ danh sách khảo sát dạng JSON — hoạt động đầy đủ khi mất mạng. |
| 3 | Automatic Background Sync | ✅ Complete | `@capacitor/network` theo dõi trạng thái kết nối; khi có mạng trở lại, các khảo sát ở trạng thái "Chờ đồng bộ" (tạo/sửa/xoá) tự động được đẩy lên backend qua `fetch`. Có nút "Đồng bộ ngay" để đồng bộ thủ công. |
| 4 | Chụp ảnh hiện trường (Camera) | ✅ Complete | `@capacitor/camera` (nguồn Prompt: Camera hoặc Thư viện ảnh), lưu dưới dạng data URL, hiển thị preview + thumbnail trong danh sách. |
| 5 | Ghi toạ độ GPS (Geolocation) | ✅ Complete | `@capacitor/geolocation` lấy vị trí hiện tại (high accuracy), hiển thị toạ độ và link mở trực tiếp trên Google Maps. |
| 6 | Đăng nhập bằng Google (Social Login) | ✅ Complete | `@capacitor-firebase/authentication` + Firebase Authentication — dùng SDK native trên Android/iOS, popup Firebase JS SDK trên web; tự động điền tên người khảo sát từ tài khoản Google. |
| 7 | CRUD khảo sát | ✅ Complete | Tạo / xem / sửa / xoá bản ghi khảo sát với đầy đủ tiêu đề, người khảo sát, vị trí, ghi chú, ảnh, toạ độ. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

**Stack:** React 19 + TypeScript + Vite, đóng gói đa nền tảng bằng Capacitor 8 (Web / Android / iOS dùng chung 1 codebase).

**Cấu trúc thư mục chính:**
```
src/
  types/survey.ts          Kiểu dữ liệu Survey (title, surveyor, location, notes, photoDataUrl, coordinates, syncStatus...)
  services/
    storage.ts              CRUD offline qua Capacitor Preferences (nguồn sự thật duy nhất, local-first)
    network.ts               Wrapper Capacitor Network plugin
    syncService.ts            Đẩy khảo sát "pending" / xoá lên backend, đánh dấu "synced"
    camera.ts                 Wrapper Capacitor Camera plugin
    geolocation.ts             Wrapper Capacitor Geolocation plugin
    firebase.ts                Khởi tạo Firebase App (đọc config từ biến môi trường .env)
    authService.ts              Wrapper @capacitor-firebase/authentication
  hooks/
    useAuth.ts                 Theo dõi trạng thái đăng nhập (user, loading, configured)
    useNetworkStatus.ts         Theo dõi online/offline (subscribe Network plugin)
    useAutoSync.ts               Tự động gọi syncService khi phát hiện có mạng trở lại
  pages/                      LoginPage, SurveyListPage, SurveyFormPage, SurveyDetailPage
  components/                 NetworkBanner, SyncBadge, UserMenu
server/                      Backend demo (Express + file JSON) để test đồng bộ thật
android/, ios/                Native project do Capacitor sinh ra (Gradle / Xcode + Swift Package Manager)
```

**Quản lý trạng thái:** Không dùng thư viện global state (Redux/Zustand) vì quy mô ứng dụng nhỏ — mỗi trang tự quản lý state cục bộ bằng React hooks (`useState`/`useEffect`), với `Preferences` đóng vai trò "nguồn sự thật" (source of truth) offline-first: mọi thao tác CRUD ghi thẳng vào storage trước, UI chỉ đọc lại (`refresh()`) sau mỗi thay đổi — tránh lệch trạng thái giữa các màn hình khi điều hướng qua lại.

**Chiến lược xử lý ngoại lệ:**
- Mọi lời gọi plugin native (Camera, Geolocation, Firebase Auth) đều được bọc `try/catch`, lỗi hiển thị bằng thông báo tiếng Việt thân thiện thay vì crash trắng màn hình (ví dụ: "Không thể mở camera. Kiểm tra quyền truy cập camera của ứng dụng.").
- `capturePhoto()` phân biệt riêng trường hợp người dùng chủ động huỷ (bỏ qua êm, không coi là lỗi) với lỗi thật sự.
- Đồng bộ mạng thất bại không chặn ứng dụng: khảo sát vẫn ở trạng thái "Chờ đồng bộ" và được thử lại ở lần sau, không mất dữ liệu.
- Khi chưa cấu hình Firebase (thiếu biến môi trường `VITE_FIREBASE_*`), ứng dụng tự động bỏ qua màn hình đăng nhập thay vì chặn cứng toàn bộ app, để vẫn demo được các tính năng còn lại.

---

## 4. EMPIRICAL EVIDENCE & SCREENSHOTS

*(Ảnh chụp trực tiếp từ ứng dụng đang chạy, viewport mô phỏng 390×844 — kích thước điện thoại phổ biến)*

**Ảnh 1 — Màn hình đăng nhập Google** (`docs/screenshots/01-login.png`)
Hiển thị khi đã cấu hình Firebase; bấm nút sẽ mở popup/SDK Google Sign-In thật.

**Ảnh 2 — Form tạo khảo sát với đầy đủ ảnh + GPS** (`docs/screenshots/02-form-full.png`)
Minh hoạ tính năng chụp ảnh (preview) và lấy toạ độ GPS thực tế (giả lập 16.0544, 108.2022 — toạ độ Đà Nẵng).

**Ảnh 3 — Trang chi tiết khảo sát** (`docs/screenshots/03-detail.png`)
Hiển thị ảnh hiện trường, toạ độ GPS dạng link mở Google Maps, badge trạng thái đồng bộ.

**Ảnh 4 — Danh sách khảo sát** (`docs/screenshots/04-list.png`)
Danh sách nhiều khảo sát với thumbnail ảnh, trạng thái "Đã đồng bộ", nút đồng bộ thủ công.

---

## 5. TECHNICAL CHALLENGES & RESOLUTIONS

**Thách thức 1 — `@capacitor/camera` bị treo vô hạn trên nền tảng Web**
Khi bấm "Chụp ảnh" trên trình duyệt, nút chuyển sang "Đang mở camera…" và không bao giờ phản hồi, không có lỗi console. Qua kiểm tra mã nguồn plugin (`@capacitor/camera/dist/esm/web.js`), phát hiện nguyên nhân: implementation web của plugin dùng nguồn `Prompt` sẽ tạo custom element `<pwa-action-sheet>` và chờ sự kiện `onSelection` — nhưng element này chỉ hoạt động nếu package `@ionic/pwa-elements` được cài và đăng ký (`defineCustomElements`). Thiếu package này khiến phần tử không có hành vi gì, promise không bao giờ resolve/reject.
**Giải pháp:** Cài `@ionic/pwa-elements` và gọi `defineCustomElements(window)` trong `main.tsx` (chỉ áp dụng khi chạy trên web, bỏ qua trên native vì Android/iOS dùng camera thật). Đây là giải pháp chính thức được Capacitor khuyến nghị cho các plugin UI trên web.

**Thách thức 2 — Xoá khảo sát ở client không đồng bộ xoá lên backend (dữ liệu mồ côi)**
Khi test bằng công cụ tự động hoá trình duyệt, phát hiện: xoá một khảo sát đã đồng bộ trước đó chỉ xoá bản ghi cục bộ (`Preferences`), trong khi bản ghi trên server vẫn còn tồn tại vĩnh viễn — gây lệch dữ liệu giữa client và server.
**Giải pháp:** Bổ sung hàm `deleteRemoteSurvey(id)` trong `syncService.ts`, gọi `DELETE /api/surveys/:id` mỗi khi người dùng xoá khảo sát (best-effort, không chặn UI nếu đang offline). Đã xác nhận lại bằng kiểm thử: request `DELETE` trả về `204` và dữ liệu trên backend được xoá đúng.
