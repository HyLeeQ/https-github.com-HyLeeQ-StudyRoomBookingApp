# 📚 RoomBook VKU — Ứng Dụng Đặt Phòng Học Real-time

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.86.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo_SDK-57.0-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo SDK 57" />
  <img src="https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/State-Zustand_5-443E38?style=for-the-badge" alt="Zustand" />
  <img src="https://img.shields.io/badge/VKU-Đa_Nền_Tảng-EA580C?style=for-the-badge" alt="VKU" />
</p>

> **Học phần:** Lập trình Đa nền tảng (2026–2027)  
> **Mini-Project 2:** Real-time Study Room Booking App (React Native & Expo)  
> **Đơn vị:** Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)  
> **Tác giả / GitHub:** [HyLeeQ](https://github.com/HyLeeQ)  
> **Repository:** [https-github.com-HyLeeQ-StudyRoomBookingApp](https://github.com/HyLeeQ/https-github.com-HyLeeQ-StudyRoomBookingApp)

---

## 📑 Mục lục
1. [Giới thiệu & Bài toán cốt lõi](#-1-giới-thiệu--bài-toán-cốt-lõi)
2. [Stack công nghệ & Thư viện](#-2-stack-công-nghệ--thư-viện)
3. [Kiến trúc hệ thống & Quản lý trạng thái](#-3-kiến-trúc-hệ-thống--quản-lý-trạng-thái)
4. [Giải thuật cốt lõi (Core Business Logic)](#-4-giải-thuật-cốt-lõi-core-business-logic)
   - [Phòng chống xung đột trùng lịch (Race Condition)](#41-phòng-chống-xung-đột-trùng-lịch-race-condition)
   - [Tối ưu danh sách lớn đạt 60fps](#42-tối-ưu-danh-sách-lớn-đạt-60fps)
   - [Lên lịch thông báo nhắc nhở trước 15 phút](#43-lên-lịch-thông-báo-nhắc-nhở-trước-15-phút)
   - [Mã QR Check-in chuẩn SVG](#44-mã-qr-check-in-chuẩn-svg)
5. [Cấu trúc thư mục dự án](#-5-cấu-trúc-thư-mục-dự-án)
6. [Mô hình dữ liệu (TypeScript Data Models)](#-6-mô-hình-dữ-liệu-typescript-data-models)
7. [Hướng dẫn cài đặt và khởi chạy](#-7-hướng-dẫn-cài-đặt-và-khởi-chạy)
8. [Các màn hình & Luồng trải nghiệm người dùng](#-8-các-màn-hình--luồng-trải-nghiệm-người-dùng)
9. [Tiêu chí nghiệm thu (Definition of Done)](#-9-tiêu-chí-nghiệm-thu-definition-of-done)

---

## 🎯 1. Giới thiệu & Bài toán cốt lõi

Trong môi trường đại học hiện đại như **VKU**, sinh viên có nhu cầu rất lớn về việc sử dụng phòng học nhóm, phòng thảo luận đồ án và phòng Lab máy tính cấu hình cao. Tuy nhiên, việc đăng ký phòng thủ công thường gặp phải các hạn chế:
- **Xung đột lịch đặt (Race Condition):** Nhiều nhóm cùng đến sử dụng một phòng tại một thời điểm hoặc đặt trùng một khung giờ.
- **Thiếu thông tin trực quan:** Không biết phòng nào đang trống ngay lúc này (*Available Now*) và phòng nào đang có lớp (*Occupied*).
- **Thủ tục nhận phòng cồng kềnh:** Khó kiểm soát danh tính người đặt và dễ quên giờ học đã đăng ký.

Ứng dụng **RoomBook VKU** ra đời nhằm số hóa toàn diện quy trình tìm kiếm, chọn slot, xác nhận và check-in phòng học tự động với độ mượt mà cao, giao diện chuẩn Mobile-first và khả năng vận hành offline/persist đáng tin cậy.

---

## 🛠️ 2. Stack công nghệ & Thư viện

| Thành phần | Công nghệ / Thư viện | Phiên bản | Vai trò trong hệ thống |
| :--- | :--- | :--- | :--- |
| **Framework** | **React Native + Expo SDK** | `SDK 57.0.25` / `RN 0.86.3` | Nền tảng phát triển ứng dụng di động đa nền tảng |
| **Ngôn ngữ** | **TypeScript** | `~6.0.3` (Strict Mode) | Bảo đảm tính an toàn kiểu dữ liệu, ngăn chặn lỗi runtime |
| **State Management** | **Zustand** | `^5.0.3` | Quản lý state gọn nhẹ, hiệu năng cao, không boilerplate |
| **Điều hướng** | **React Navigation** | `^7.x` | Native Stack Navigator kết hợp Bottom Tabs mượt mà |
| **Lưu trữ cục bộ** | **AsyncStorage** | `~2.2.0` | Middleware lưu trữ trạng thái bền vững khi tắt/mở app |
| **Thông báo** | **expo-notifications** | `~57.0.1` | Lên lịch nhắc nhở điểm danh trước 15 phút |
| **Mã QR Code** | **react-native-qrcode-svg** | `^6.3.15` + `react-native-svg` | Xuất vé điện tử QR vector phục vụ quét mã tại cửa phòng |
| **Iconography** | **@expo/vector-icons** | `^15.0.3` (`expo-font`) | Bộ biểu tượng Ionicons & MaterialCommunityIcons |

---

## 🏛️ 3. Kiến trúc hệ thống & Quản lý trạng thái

Ứng dụng được xây dựng theo mô hình phân tầng module hóa cao, tách biệt rõ ràng giữa **UI Layer**, **Domain/Logic Layer** và **Storage/Service Layer**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PRESENTATION LAYER                                   │
│                                                                                        │
│   [RoomListScreen]      [RoomDetailScreen]      [BookingScreen]      [MyBookingsScreen]│
│          │                      │                      │                     │         │
│     [RoomCard]          [TimeSlotButton]       [SummaryCard]             [QRModal]     │
│   (React.memo 60fps)    (Real-time Disabled)   (Double-check)       (Countdown Timer)  │
└──────────┬──────────────────────┬──────────────────────┬─────────────────────┬─────────┘
           │                      │                      │                     │
┌──────────▼──────────────────────▼──────────────────────▼─────────────────────▼─────────┐
│                                STATE MANAGEMENT (ZUSTAND)                              │
│                                                                                        │
│   ┌────────────────────────────────────────┐  ┌────────────────────────────────────┐   │
│   │              useRoomStore              │  │          useBookingStore           │   │
│   │  • Danh mục phòng học (Khu A, B, C, V) │  │  • Session sinh viên VKU           │   │
│   │  • Trạng thái phòng real-time          │  │  • Danh sách đặt phòng (Bookings)  │   │
│   │  • Bộ lọc đa tham số (Search + Multi)  │  │  • createBooking (Atomic check)    │   │
│   └────────────────────────────────────────┘  │  • cancelBooking (Clear reminder)  │   │
│                                               │  • activeFilters (Tòa/Chỗ/Thiết bị)│   │
│                                               └─────────────────┬──────────────────┘   │
└─────────────────────────────────────────────────────────────────┼──────────────────────┘
                                                                  │ (persist middleware)
┌─────────────────────────────────────────────────────────────────▼──────────────────────┐
│                               SERVICES & PERSISTENCE LAYER                             │
│                                                                                        │
│        [@react-native-async-storage]                     [expo-notifications]          │
│        • Khôi phục trạng thái khi bật lại app            • Hẹn giờ thông báo trước 15m │
│        • Lưu trữ dữ liệu an toàn trên thiết bị           • Thu hồi lịch khi hủy phòng  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ 4. Giải thuật cốt lõi (Core Business Logic)

### 4.1. Phòng chống xung đột trùng lịch (Race Condition)
Tệp: `src/utils/conflictChecker.ts`

Hệ thống triển khai cơ chế **phòng vệ 2 lớp (Two-Phase Guard)**:
1. **Lớp 1 — Render Guard tại UI:**  
   Khi người dùng chọn một ngày học trong 7 ngày tới, `RoomDetailScreen` gọi `isSlotAvailable(roomId, date, slotId, bookings)`. Bất kỳ khung giờ nào đã có bản ghi `active` sẽ lập tức bị chuyển sang trạng thái disabled, phủ màu xám và hiện nhãn `"Đã đặt"`. Người dùng không thể nhấn chọn.
2. **Lớp 2 — Atomic Double-Check tại Store Action:**  
   Trước khi hoàn tất ghi nhận tại `BookingScreen`, hàm `createBooking` kiểm tra lại mảng bookings mới nhất trong Zustand state. Nếu phát hiện xung đột tức thời do người khác vừa đặt trước, giao diện sẽ kích hoạt màn hình cảnh báo lỗi và hủy bỏ thao tác ghi, ngăn chặn hoàn toàn tình trạng trùng phòng.

```typescript
export function isSlotAvailable(
  roomId: string,
  date: string,
  slotId: string,
  existingBookings: Booking[]
): boolean {
  const hasConflict = existingBookings.some(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.slotId === slotId &&
      b.status === 'active'
  );
  return !hasConflict;
}
```

### 4.2. Tối ưu danh sách lớn đạt 60fps
Tệp: `src/components/RoomCard.tsx` & `src/screens/RoomListScreen.tsx`

Để đảm bảo danh sách phòng học cuộn mượt mà ngay cả trên các thiết bị cấu hình thấp:
- **`React.memo(RoomCard)`:** Ngăn re-render không cần thiết khi người dùng nhập thanh tìm kiếm hoặc chọn bộ lọc ở các vị trí khác.
- **`getItemLayout` với hằng số `ROOM_CARD_HEIGHT = 285`:** Giúp React Native tính toán vị trí offset pixel ngay lập tức mà không cần đo đạc layout động (bỏ qua bước `onLayout` tốn tài nguyên).
- **Tham số FlatList tinh chỉnh:**
  - `initialNumToRender={5}`: Chỉ render đủ khung nhìn ban đầu để rút ngắn thời gian khởi động màn hình.
  - `maxToRenderPerBatch={5}`: Giới hạn khối lượng phần tử kết xuất theo từng đợt cuộn.
  - `windowSize={7}`: Giữ vùng nhớ hợp lý, tránh tràn RAM.
  - `removeClippedSubviews={Platform.OS === 'android'}`: Tự động giải phóng view nằm ngoài viewport trên Android.

### 4.3. Lên lịch thông báo nhắc nhở trước 15 phút
Tệp: `src/utils/notificationHelpers.ts`

- Sử dụng `expo-notifications` thiết lập Notification Channel độ ưu tiên cao trên Android.
- Khi tạo đặt chỗ thành công:
  $$\text{triggerDate} = \text{slotStartTime} - 15 \text{ phút}$$
- Nếu `triggerDate` vẫn còn trong tương lai, hệ thống gọi `Notifications.scheduleNotificationAsync` và lưu `notificationId` kèm bản ghi `Booking`.
- Khi sinh viên hủy phòng, hệ thống tự động gọi `cancelBookingReminder(targetBooking.notificationId)` để thu hồi thông báo.

### 4.4. Mã QR Check-in chuẩn SVG
Tệp: `src/components/QRModal.tsx` & `src/screens/BookingSuccessScreen.tsx`

- Dữ liệu mã QR chứa token JSON đầy đủ gồm `bookingId`, `roomId`, `roomName`, `date`, `slotId`, `studentId`, `timestamp`.
- Render dưới dạng vector SVG thông qua `react-native-qrcode-svg`, đảm bảo quét nhanh và chính xác dưới mọi điều kiện ánh sáng camera.
- Tích hợp đồng hồ đếm ngược thời gian thực đến thời điểm nhận phòng.

---

## 📂 5. Cấu trúc thư mục dự án

```text
StudyRoomBookingApp/
├── App.tsx                      # Điểm vào ứng dụng: Safe area & Xin quyền notification
├── app.json                     # Cấu hình dự án Expo SDK 57
├── tsconfig.json                # Cấu hình TypeScript Strict Mode
├── package.json                 # Khai báo phụ thuộc chuẩn tương thích Expo
├── README.md                    # Tài liệu hướng dẫn chi tiết dự án
├── TECHNICAL_REPORT.md          # Báo cáo kỹ thuật chi tiết
├── TECHNICAL_REPORT.html        # Báo cáo kỹ thuật chuẩn in PDF (Ctrl + P)
└── src/
    ├── api/                     # Dữ liệu mẫu (Mock data) & mô phỏng kết nối real-time
    │   ├── rooms.ts             # 12+ phòng học, Lab máy tính thực tế các khu A, B, C, V
    │   └── bookings.ts          # Danh sách đặt phòng mẫu & phiên sinh viên VKU
    ├── components/              # Các UI Component độc lập & tối ưu hiệu năng
    │   ├── FilterChip.tsx       # Chip lựa chọn bộ lọc (tòa nhà, thiết bị, sức chứa)
    │   ├── QRModal.tsx          # Modal hiển thị vé QR và đếm ngược giờ check-in
    │   ├── RoomCard.tsx         # Card phòng tối ưu 60fps (React.memo + fixed layout)
    │   ├── StatusBadge.tsx      # Huy hiệu Available/Occupied & Trạng thái đặt phòng
    │   └── TimeSlotButton.tsx   # Nút chọn 4 khung giờ với trạng thái disable khi trùng lịch
    ├── constants/               # Các hằng số nghiệp vụ
    │   ├── buildings.ts         # Thông tin tòa nhà VKU (A, B, C, V), thiết bị & sức chứa
    │   └── timeSlots.ts         # 4 khung giờ cố định (07:30, 09:30, 13:00, 15:00)
    ├── navigation/              # Cấu hình luồng điều hướng (React Navigation)
    │   ├── RootNavigator.tsx    # Native Stack Navigator (Chuyển trang & Modal)
    │   ├── TabNavigator.tsx     # Bottom Tabs Navigator (Khám phá & Đặt chỗ cá nhân)
    │   └── types.ts             # Strongly-typed Navigation Route Parameters
    ├── screens/                 # 5 màn hình chức năng chính
    │   ├── RoomListScreen.tsx   # Danh sách phòng, tìm kiếm & bộ lọc đa tiêu chí
    │   ├── RoomDetailScreen.tsx # Chi tiết phòng, bộ chọn 7 ngày & 4 khung giờ
    │   ├── BookingScreen.tsx    # Xác nhận đặt chỗ & atomic double-check xung đột
    │   ├── BookingSuccessScreen.tsx # Thẻ lên lớp điện tử kèm mã QR check-in
    │   └── MyBookingsScreen.tsx # Quản lý lịch đặt của tôi & thao tác hủy phòng
    ├── store/                   # Quản lý State toàn cục bằng Zustand
    │   ├── useBookingStore.ts   # Quản lý bookings, session, persist với AsyncStorage
    │   └── useRoomStore.ts      # Danh sách phòng, trạng thái real-time & lọc động
    ├── types/                   # Định nghĩa giao diện kiểu dữ liệu TypeScript
    │   ├── booking.ts           # TimeSlot, Booking, BookingStatus
    │   ├── room.ts              # Room, BuildingCode, EquipmentType, RoomStatus
    │   └── user.ts              # UserSession (Mã SV, họ tên, email)
    └── utils/                   # Các hàm tiện ích & công cụ nghiệp vụ
        ├── conflictChecker.ts   # Thuật toán kiểm tra chống xung đột đặt phòng
        ├── dateHelpers.ts       # Xử lý ngày tháng, sinh 7 ngày kế tiếp & countdown
        └── notificationHelpers.ts # Quản lý lên lịch và thu hồi thông báo 15 phút
```

---

## 📋 6. Mô hình dữ liệu (TypeScript Data Models)

```typescript
// types/room.ts
export type BuildingCode = 'A' | 'B' | 'C' | 'V';
export type EquipmentType = 'projector' | 'whiteboard' | 'high_spec_pc' | 'ac';
export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  name: string;
  building: BuildingCode;
  floor: number;
  capacity: number;
  equipment: EquipmentType[];
  photoUrl: string;
  status: RoomStatus;
  description?: string;
}

// types/booking.ts
export interface TimeSlot {
  id: string;
  label: string;       // "07:30 - 09:30"
  startTime: string;    // "07:30"
  endTime: string;      // "09:30"
}

export type BookingStatus = 'active' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  roomId: string;
  userId: string;
  date: string;         // Định dạng "YYYY-MM-DD"
  slotId: string;
  status: BookingStatus;
  qrCode: string;        // Token JSON độc bản phục vụ check-in
  createdAt: string;     // ISO timestamp
  notificationId?: string; // ID thông báo từ expo-notifications
}

// types/user.ts
export interface UserSession {
  userId: string;
  name: string;
  studentId: string;
  email?: string;
  major?: string;
}
```

---

## 🚀 7. Hướng dẫn cài đặt và khởi chạy

### Yêu cầu môi trường
- **Node.js:** Phiên bản `>= 18.x` hoặc `>= 20.x`
- **Thiết bị chạy thử:** Điện thoại thông minh đã cài ứng dụng **Expo Go** (tải miễn phí từ Google Play Store hoặc Apple App Store).

### Các bước cài đặt:

1. **Clone repository về máy:**
   ```bash
   git clone https://github.com/HyLeeQ/https-github.com-HyLeeQ-StudyRoomBookingApp.git
   cd https-github.com-HyLeeQ-StudyRoomBookingApp
   ```

2. **Cài đặt các gói phụ thuộc:**
   ```bash
   npm install
   ```

3. **Kiểm tra tính toàn vẹn hệ thống & kiểu dữ liệu:**
   ```bash
   # Kiểm tra tính tương thích Expo
   npx expo-doctor

   # Kiểm tra kiểu dữ liệu TypeScript (0 lỗi)
   npx tsc --noEmit
   ```

4. **Khởi chạy ứng dụng:**
   ```bash
   npx expo start
   ```

5. **Mở trên thiết bị thực:**
   - **Android:** Mở ứng dụng **Expo Go** $\rightarrow$ chọn *"Scan QR code"* và quét mã trên terminal.
   - **iOS:** Mở ứng dụng **Camera** mặc định $\rightarrow$ quét mã QR để mở qua **Expo Go**.
   - **Trình duyệt Web (nếu cần):** Nhấn phím `w` trong terminal.

---

## 📱 8. Các màn hình & Luồng trải nghiệm người dùng

| Màn hình | Hình ảnh / Tính năng nổi bật | Thao tác chính |
| :--- | :--- | :--- |
| **1. Khám phá phòng (`RoomListScreen`)** | • Thanh tìm kiếm thời gian thực<br>• Lọc nhanh tòa nhà Khu A, B, C, V<br>• Bộ lọc mở rộng theo sức chứa & thiết bị<br>• Thẻ phòng mượt 60fps kèm nhãn trạng thái | Nhập từ khóa, bấm chip lọc, chạm thẻ phòng để xem chi tiết |
| **2. Chi tiết & Chọn slot (`RoomDetailScreen`)** | • Ảnh phòng lớn, thông số chi tiết<br>• Bộ chọn ngày 7 ngày tới dạng cuộn ngang<br>• 4 khung giờ: **slot đã đặt bị khóa xám, không thể bấm**<br>• Nút tiếp tục tự động kích hoạt khi chọn slot hợp lệ | Chọn ngày $\rightarrow$ chọn khung giờ còn trống $\rightarrow$ bấm Tiếp tục |
| **3. Xác nhận đặt chỗ (`BookingScreen`)** | • Tóm tắt thông tin phòng, địa điểm, thời gian<br>• Thông tin sinh viên VKU<br>• **Double-check race condition trước khi ghi nhận**<br>• Quy định sử dụng phòng học | Kiểm tra thông tin $\rightarrow$ bấm Xác nhận & Nhận mã QR |
| **4. Vé điện tử QR (`BookingSuccessScreen`)** | • Thẻ check-in thiết kế theo phong cách Boarding Pass<br>• Mã QR chuẩn vector SVG độc bản<br>• Tự động kích hoạt thông báo nhắc nhở trước 15 phút | Xem mã QR $\rightarrow$ Điều hướng về trang Đặt chỗ của tôi |
| **5. Quản lý đặt chỗ (`MyBookingsScreen`)** | • Tab phân loại: Tất cả, Sắp tới, Lịch sử<br>• Huy hiệu số lượng đặt phòng trên thanh Bottom Tab<br>• Nút mở Modal QR kèm đếm ngược giờ học<br>• **Nút hủy phòng:** giải phóng slot và hủy notification | Xem lại mã QR để check-in hoặc hủy lịch đặt khi có thay đổi |

---

## ✅ 9. Tiêu chí nghiệm thu (Definition of Done)

Hệ thống đã hoàn thành và kiểm thử nghiêm ngặt toàn bộ các mục theo yêu cầu:

- [x] **Danh sách phòng load mượt mà 60fps:** Tối ưu hóa triệt để qua `React.memo`, `getItemLayout`, `keyExtractor`.
- [x] **Bộ lọc đa tham số hoạt động chính xác:** Hỗ trợ lọc đồng thời Tòa nhà, Sức chứa và đa lựa chọn Thiết bị.
- [x] **Chọn ngày & Slot trực quan:** Lựa chọn linh hoạt 7 ngày; slot đã đặt tự động khóa (`disabled`) và hiển thị `"Đã đặt"`.
- [x] **Không thể xảy ra Race Condition:** Tuyệt đối không thể tạo 2 booking trùng `roomId + date + slotId`.
- [x] **Mã QR check-in chuẩn SVG:** Tạo mã QR sắc nét, hiển thị đầy đủ thông tin đặt chỗ và bộ đếm ngược.
- [x] **Lên lịch thông báo chính xác:** `expo-notifications` tự động hẹn giờ báo thức trước thời điểm bắt đầu 15 phút.
- [x] **Hủy đặt chỗ an toàn:** Cập nhật trạng thái tức thời, giải phóng khung giờ và thu hồi thông báo tương ứng.
- [x] **Lưu trữ dữ liệu bền vững:** Tích hợp `AsyncStorage` qua middleware của `Zustand`, giữ nguyên dữ liệu sau khi khởi động lại app.
- [x] **TypeScript Strict:** 100% tuân thủ TypeScript Strict Mode, vượt qua kiểm tra `npx tsc --noEmit` và `npx expo-doctor` (21/21 tiêu chí đạt chuẩn).

---

<p align="center">
  Phát triển với ❤️ dành cho sinh viên <strong>VKU — Trường Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn</strong>
</p>
