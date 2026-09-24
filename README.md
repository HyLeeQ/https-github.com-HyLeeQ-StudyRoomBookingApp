# 📱 RoomBook VKU - Ứng dụng đặt phòng học Real-time

> **Mini-Project 2: Real-time Study Room Booking App**  
> **Nền tảng:** React Native & Expo (Managed Workflow, TypeScript Strict Mode)  
> **Đối tượng:** Sinh viên Đại học Công nghệ Thông tin & Truyền thông Việt - Hàn (VKU)  
> **Đơn vị phát triển:** Đa nền tảng 2026-2027

---

## 🌟 1. Tổng quan dự án

Ứng dụng **RoomBook VKU** giải quyết bài toán cốt lõi trong khuôn viên trường đại học:
- **Tránh trùng lịch đặt phòng (Race Condition Prevention):** Kiểm tra xung đột đa tầng (UI level và Store atomic level) ngay trước khi tạo đặt chỗ.
- **Trạng thái phòng học thời gian thực (Real-time Availability):** Hiển thị rõ trạng thái phòng (Available Now vs Occupied) và các khung giờ đã được sinh viên khác đặt.
- **Tối ưu trải nghiệm cuộn 60fps (High Performance FlatList):** Áp dụng `React.memo`, `getItemLayout`, `keyExtractor`, `initialNumToRender`, `windowSize` cho danh sách phòng dài.
- **Mã QR check-in & Thông báo tự động:** Cấp mã QR độc bản sau khi đặt thành công, tự động kích hoạt thông báo nhắc nhở 15 phút trước giờ nhận phòng qua `expo-notifications`.
- **Lưu trữ dữ liệu bền vững:** Tích hợp middleware `persist` của Zustand cùng `@react-native-async-storage/async-storage`.

---

## 🛠️ 2. Stack công nghệ

| Thành phần | Công nghệ / Thư viện | Phiên bản |
| :--- | :--- | :--- |
| **Framework** | React Native + Expo SDK | `SDK 57.0.25` / `RN 0.86.3` |
| **Ngôn ngữ** | TypeScript (Strict Mode) | `~6.0.3` |
| **State Management** | Zustand (with Persist Middleware) | `^5.0.3` |
| **Điều hướng** | React Navigation (Native Stack + Bottom Tabs) | `^7.x` |
| **Lưu trữ cục bộ** | `@react-native-async-storage/async-storage` | `~2.2.0` |
| **Thông báo cục bộ** | `expo-notifications` | `~57.0.1` |
| **QR Code** | `react-native-qrcode-svg` + `react-native-svg` | `^6.3.15` / `~15.15.1` |
| **Biểu tượng (Icons)** | `@expo/vector-icons` (Ionicons & MaterialCommunityIcons) | `^15.0.3` |

---

## 📂 3. Cấu trúc thư mục dự án

```text
StudyRoomBookingApp/
├── App.tsx                      # Root component, xin quyền notification & bọc SafeAreaProvider
├── app.json                     # Cấu hình Expo application
├── tsconfig.json                # TypeScript strict config
├── package.json
└── src/
    ├── api/                     # Mock data và tầng kết nối dịch vụ
    │   ├── rooms.ts             # Danh sách 12+ phòng học & lab VKU (Khu A, B, C, V)
    │   └── bookings.ts          # Dữ liệu đặt chỗ mẫu & thông tin sinh viên
    ├── components/              # Các UI Component độc lập & tái sử dụng
    │   ├── FilterChip.tsx       # Chip chọn bộ lọc (tòa nhà, sức chứa, thiết bị)
    │   ├── QRModal.tsx          # Modal hiển thị mã QR check-in và đồng hồ đếm ngược
    │   ├── RoomCard.tsx         # Card phòng tối ưu 60fps (React.memo + fixed height)
    │   ├── StatusBadge.tsx      # Huy hiệu trạng thái (Available/Occupied, Active/Cancelled)
    │   └── TimeSlotButton.tsx   # Nút chọn khung giờ (tự động disable khi bị trùng lịch)
    ├── constants/               # Hằng số toàn dự án
    │   ├── buildings.ts         # Danh sách tòa nhà VKU, bộ lọc sức chứa & tiện nghi
    │   └── timeSlots.ts         # 4 khung giờ học cố định (2 giờ/slot)
    ├── navigation/              # Cấu hình hệ thống điều hướng
    │   ├── RootNavigator.tsx    # Native Stack Navigator (Tabs, Detail, Booking, Success)
    │   ├── TabNavigator.tsx     # Bottom Tabs Navigator (Khám phá & Đặt chỗ của tôi)
    │   └── types.ts             # Định nghĩa kiểu TypeScript cho Route Param List
    ├── screens/                 # Các màn hình chính
    │   ├── BookingScreen.tsx    # Xác nhận đặt chỗ & kiểm tra race-condition
    │   ├── BookingSuccessScreen.tsx # Vé điện tử & mã QR sau khi đặt thành công
    │   ├── MyBookingsScreen.tsx # Quản lý danh sách đặt chỗ & thao tác hủy phòng
    │   ├── RoomDetailScreen.tsx # Chi tiết phòng, bộ chọn 7 ngày & 4 khung giờ
    │   └── RoomListScreen.tsx   # Danh sách phòng, tìm kiếm & bộ lọc đa tiêu chí
    ├── store/                   # Quản lý State toàn cục bằng Zustand
    │   ├── useBookingStore.ts   # Quản lý booking, session, filters & AsyncStorage persist
    │   └── useRoomStore.ts      # Danh sách phòng, trạng thái phòng & bộ lọc đa tham số
    ├── types/                   # Định nghĩa TypeScript data models
    │   ├── booking.ts           # TimeSlot, Booking, BookingStatus
    │   ├── room.ts              # Room, BuildingCode, EquipmentType, RoomStatus
    │   └── user.ts              # UserSession
    └── utils/                   # Hàm tiện ích & logic nghiệp vụ
        ├── conflictChecker.ts   # Thuật toán kiểm tra xung đột trùng lịch
        ├── dateHelpers.ts       # Xử lý ngày tháng, tạo 7 ngày tiếp theo & đếm ngược
        └── notificationHelpers.ts # Xin quyền, đặt lịch và hủy thông báo trước 15 phút
```

---

## ⚡ 4. Hướng dẫn cài đặt và khởi chạy

### Yêu cầu tiên quyết
- Đã cài đặt **Node.js** (khuyến nghị v18+)
- Đã cài ứng dụng **Expo Go** trên điện thoại (iOS hoặc Android)

### Các bước thực hiện:

1. **Cài đặt thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Kiểm tra tính tương thích của hệ thống:**
   ```bash
   npx expo-doctor
   ```

3. **Kiểm tra kiểu dữ liệu TypeScript (Zero errors):**
   ```bash
   npx tsc --noEmit
   ```

4. **Khởi chạy máy chủ phát triển Expo:**
   ```bash
   npx expo start
   ```

5. **Trải nghiệm trên thiết bị:**
   - **Android:** Mở ứng dụng **Expo Go** và quét mã QR trên terminal.
   - **iOS:** Mở ứng dụng **Camera** quét mã QR để mở trong **Expo Go**.
   - **Web (Tùy chọn):** Nhấn phím `w` trong terminal.

---

## 🧠 5. Kiến trúc & Logic nghiệp vụ cốt lõi

### 5.1. Thuật toán chống Race Condition (`conflictChecker.ts`)
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
- **Tầng 1 (Giao diện):** Khi người dùng chọn phòng và ngày tại `RoomDetailScreen`, hàm kiểm tra trạng thái của cả 4 slot. Slot nào đã có người đặt (`status === 'active'`) sẽ bị khóa (`disabled`), chuyển sang màu xám và hiện nhãn *"Đã đặt"*.
- **Tầng 2 (Atomic Store Action):** Tại thời điểm người dùng nhấn *"Xác nhận đặt phòng"* trên `BookingScreen`, hàm `createBooking` trong `useBookingStore` sẽ thực hiện kiểm tra lại một lần nữa trên mảng bookings mới nhất. Nếu phát hiện xung đột, giao diện cảnh báo ngay lập tức và ngăn chặn ghi dữ liệu trùng lặp.

### 5.2. Quản lý trạng thái với Zustand & AsyncStorage Persist
- Toàn bộ trạng thái đặt phòng (`bookings`), phiên đăng nhập (`session`), và bộ lọc (`activeFilters`) được lưu trữ tập trung tại `useBookingStore`.
- Sử dụng `createJSONStorage(() => AsyncStorage)` để tự động lưu trạng thái xuống bộ nhớ máy, đảm bảo khi tắt ứng dụng hoặc mở lại, các phòng đã đặt vẫn được giữ nguyên vẹn.

### 5.3. Hệ thống thông báo nhắc nhở 15 phút (`notificationHelpers.ts`)
- Khi người dùng đặt phòng thành công, hàm `scheduleBookingReminder` sẽ tính toán thời điểm bắt đầu khung giờ trừ đi 15 phút (`triggerDate = slotStartTime - 15 minutes`).
- Lên lịch cục bộ thông qua `Notifications.scheduleNotificationAsync` và lưu `notificationId` kèm bản ghi booking.
- Khi người dùng hủy phòng trước giờ nhận phòng, hệ thống tự động gọi `cancelBookingReminder(notificationId)` để hủy bỏ thông báo.

---

## ✅ 6. Tiêu chí nghiệm thu (Definition of Done)

- [x] **Danh sách phòng mượt mà 60fps:** `FlatList` tích hợp `React.memo`, `getItemLayout`, `initialNumToRender`.
- [x] **Bộ lọc đa tham số:** Lọc tức thời theo Tòa nhà (A, B, C, V), Sức chứa (2-6, 7-15, 16-40), và Thiết bị (Máy chiếu, Bảng kính, PC Đồ họa, Điều hòa).
- [x] **Bộ chọn ngày & Khung giờ:** Lựa chọn linh hoạt trong 7 ngày tới với 4 khung giờ cố định 2 tiếng.
- [x] **Chống trùng lịch tuyệt đối:** Không thể tạo 2 đặt phòng trùng `roomId + date + slotId`.
- [x] **Mã QR Check-in chuẩn SVG:** Render mã QR sắc nét, hiển thị chi tiết thông tin và đồng hồ đếm ngược.
- [x] **Nhắc nhở thông minh:** Tự động lên lịch thông báo 15 phút trước giờ bắt đầu.
- [x] **Hủy đặt phòng an toàn:** Cho phép hủy lịch hợp lệ, cập nhật trạng thái và giải phóng khung giờ.
- [x] **Lưu trữ dữ liệu bền bỉ:** Tự động khôi phục qua AsyncStorage sau khi khởi động lại app.
- [x] **TypeScript Strict:** 100% không phát sinh lỗi hoặc cảnh báo TypeScript (`tsc --noEmit` thành công).

---

## 👥 Nhóm phát triển
- **Đại học CNTT & Truyền thông Việt - Hàn (VKU)**
- Mini-Project 2: Ứng dụng đặt phòng học Real-time (React Native & Expo)
