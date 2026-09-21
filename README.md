# Field Survey (Capacitor) — Project 1.2

Ứng dụng khảo sát hiện trường đa nền tảng: **Web, Android, iOS** dùng chung một
codebase React + Capacitor. Ưu tiên trải nghiệm mobile native (camera, GPS,
lưu trữ offline, đăng nhập Google) nhưng vẫn chạy tốt trên trình duyệt.

## Tính năng

- **Đăng nhập bằng Google** (Firebase Authentication) — native trên
  Android/iOS, popup trên web.
- **Chụp ảnh hiện trường** bằng camera thiết bị (hoặc chọn từ thư viện ảnh).
- **Ghi toạ độ GPS** hiện tại, có link mở trực tiếp trên Google Maps.
- **CRUD khảo sát**: tạo / xem / sửa / xoá bản ghi khảo sát (tiêu đề, người
  khảo sát, vị trí, ghi chú, ảnh, toạ độ).
- **Lưu offline**: dữ liệu lưu trên máy bằng `@capacitor/preferences` — dùng
  được ngay cả khi không có mạng.
- **Tự động đồng bộ**: `@capacitor/network` theo dõi trạng thái mạng; khi có
  mạng trở lại, các khảo sát "chờ đồng bộ" (kể cả xoá) tự động đẩy lên
  server. Có thể nhấn "Đồng bộ ngay" để đồng bộ thủ công.

## Kiến trúc thư mục

```
src/
  types/survey.ts          Kiểu dữ liệu Survey (bao gồm photo, coordinates)
  services/storage.ts       CRUD offline qua Capacitor Preferences
  services/network.ts       Wrapper Capacitor Network plugin
  services/syncService.ts   Đẩy khảo sát "pending" / xoá lên backend
  services/camera.ts        Wrapper Capacitor Camera plugin
  services/geolocation.ts   Wrapper Capacitor Geolocation plugin
  services/firebase.ts      Khởi tạo Firebase App (đọc từ .env)
  services/authService.ts   Wrapper @capacitor-firebase/authentication
  hooks/useAuth.ts           Theo dõi trạng thái đăng nhập
  hooks/useNetworkStatus.ts  Theo dõi online/offline
  hooks/useAutoSync.ts       Tự sync khi có mạng
  pages/                     LoginPage, SurveyListPage, SurveyFormPage, SurveyDetailPage
  components/                NetworkBanner, SyncBadge, UserMenu
server/                     Backend demo (Express) để test đồng bộ
android/, ios/              Native project do Capacitor sinh ra
```

## Cài đặt

```bash
npm install
cp .env.example .env   # rồi điền VITE_FIREBASE_* (xem mục bên dưới)
```

## Chạy trên Web

```bash
npm run dev            # http://localhost:5173
npm run server         # http://localhost:4000 (backend demo, tuỳ chọn)
```

## Chạy trên Android / iOS

```bash
npm run cap:android    # build web -> cap sync -> mở Android Studio
npm run cap:ios        # build web -> cap sync -> mở Xcode (cần macOS)
```

Mỗi khi sửa code web, chạy lại `npm run cap:sync` để native project lấy bản
build mới nhất.

Vì thiết bị thật/emulator không truy cập được `localhost` của máy tính, muốn
test đồng bộ thật trên Android/iOS hãy đặt `VITE_API_BASE_URL` trong `.env`
thành địa chỉ LAN của máy chạy backend, ví dụ `http://192.168.1.10:4000/api`.

## Cấu hình đăng nhập Google (Firebase)

Tính năng đăng nhập dùng **Firebase Authentication** qua plugin
`@capacitor-firebase/authentication` (native trên Android/iOS, Firebase JS SDK
trên web) — đây là cách được khuyến nghị chính thức để làm "Sign in with
Google" đa nền tảng với Capacitor. Bạn **phải tự tạo project Firebase của
riêng mình** — không có sẵn giá trị nào chạy được ngay.

### 1. Tạo project & bật Google Sign-In

1. Vào [Firebase console](https://console.firebase.google.com/) → tạo project mới.
2. Vào **Authentication → Sign-in method** → bật provider **Google**.

### 2. Web app (bắt buộc — dùng chung cho cả 3 nền tảng)

1. Trong project, thêm **Web app** (biểu tượng `</>`).
2. Copy object `firebaseConfig` được cấp, điền vào file `.env`:
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
3. Chạy `npm run build` lại để Vite nạp biến môi trường mới.

Không có bước này, app vẫn chạy nhưng màn hình đăng nhập sẽ báo "chưa cấu
hình Firebase" và nút Google bị disable — các tính năng khảo sát khác (CRUD,
camera, GPS, sync) không phụ thuộc vào đăng nhập nên vẫn dùng thử được sau khi
tạm bỏ qua bước gate trong `App.tsx` nếu cần demo nhanh.

### 3. Android

1. Trong Firebase console, thêm **Android app** với package name
   `com.vku.fieldsurvey`.
2. Lấy SHA-1 debug: `cd android && ./gradlew signingReport` (hoặc
   `keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android`),
   dán vào Firebase console.
3. Tải file `google-services.json`, đặt vào `android/app/google-services.json`
   (file này đã nằm trong `.gitignore`, không commit).
4. `npm run cap:sync` rồi build lại trong Android Studio.

### 4. iOS

1. Trong Firebase console, thêm **iOS app** với bundle ID `com.vku.fieldsurvey`.
2. Tải file `GoogleService-Info.plist`, đặt vào
   `ios/App/App/GoogleService-Info.plist` (đã nằm trong `.gitignore`).
3. Mở file, tìm giá trị `REVERSED_CLIENT_ID`, dán thay cho chuỗi
   `REPLACE_WITH_REVERSED_CLIENT_ID` trong
   `ios/App/App/Info.plist` (khoá `CFBundleURLTypes`) — hoặc làm qua Xcode:
   target **App** → tab **Info** → **URL Types** → thêm URL Scheme này.
4. `npm run cap:sync` rồi build lại trong Xcode.

> Project dùng Swift Package Manager (không có `Podfile`) nên không cần thêm
> pod thủ công — dependency `GoogleSignIn` được kéo theo tự động.

## Camera & GPS — quyền truy cập

- **Android**: quyền camera/vị trí được các plugin Capacitor tự khai báo
  trong `AndroidManifest.xml` lúc build, không cần chỉnh tay. App sẽ tự hỏi
  quyền khi bạn bấm "Chụp ảnh" / "Lấy vị trí hiện tại" lần đầu.
- **iOS**: bắt buộc phải có chuỗi mô tả quyền trong `Info.plist` (đã được
  thêm sẵn: `NSCameraUsageDescription`, `NSPhotoLibraryUsageDescription`,
  `NSLocationWhenInUseUsageDescription`) — thiếu các key này app sẽ crash khi
  xin quyền.
- **Web**: `Camera.getPhoto` mở hộp thoại chọn file/webcam của trình duyệt;
  Geolocation dùng Geolocation API chuẩn của trình duyệt (yêu cầu HTTPS hoặc
  `localhost`).

## Backend demo (`server/`)

Một Express server tối giản, lưu dữ liệu vào `server/data.json`, mô phỏng
việc "đồng bộ lên server" cho mini project này:

- `POST /api/surveys` — upsert theo `id` (bao gồm cả ảnh dạng base64).
- `DELETE /api/surveys/:id` — xoá khi khảo sát bị xoá ở client.

Đây không phải backend production — chỉ phục vụ demo offline-first + sync.

## Plugin Capacitor đã dùng

| Plugin | Mục đích |
|---|---|
| `@capacitor/preferences` | Lưu trữ khảo sát offline trên thiết bị |
| `@capacitor/network` | Phát hiện online/offline để tự đồng bộ |
| `@capacitor/camera` | Chụp ảnh / chọn ảnh hiện trường |
| `@capacitor/geolocation` | Lấy toạ độ GPS |
| `@capacitor-firebase/authentication` | Đăng nhập Google (native + web) |
| `@capacitor/status-bar` | Style status bar trên native |
| `@capacitor/app` | Vòng đời app native (sẵn sàng mở rộng) |
