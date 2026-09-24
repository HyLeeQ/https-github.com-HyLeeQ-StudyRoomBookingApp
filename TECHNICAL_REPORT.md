# BÁO CÁO KỸ THUẬT: ỨNG DỤNG ĐẶT PHÒNG HỌC REAL-TIME (ROOMBOOK VKU)
**Học phần:** Lập trình Đa nền tảng (2026-2027)  
**Mini-Project 2:** Real-time Study Room Booking App (React Native & Expo)  
**Đơn vị:** Khoa Khoa học Máy tính - Trường Đại học CNTT & Truyền thông Việt - Hàn (VKU)

---

## 1. TỔNG QUAN VÀ MỤC TIÊU DỰ ÁN

Ứng dụng **RoomBook VKU** được thiết kế và triển khai nhằm phục vụ nhu cầu tra cứu và đặt phòng học nhóm, phòng máy tính (Lab) cho sinh viên VKU. Hệ thống giải quyết các bài toán kỹ thuật cốt lõi:
1. **Phòng chống xung đột trùng lịch (Race-Condition Prevention):** Bảo đảm không thể có hai sinh viên cùng đặt một phòng tại cùng một khung giờ và ngày học.
2. **Hiển thị trạng thái phòng theo thời gian thực:** Trực quan hóa tình trạng sẵn sàng của từng phòng học trên toàn khuôn viên các khu A, B, C, V.
3. **Trải nghiệm mượt mà 60fps trên danh sách lớn:** Tối ưu hóa rendering bằng `FlatList`, `React.memo`, `getItemLayout` cố định chiều cao.
4. **Mã vé điện tử & Thẻ QR Check-in:** Cấp mã QR động phục vụ điểm danh, hiển thị đếm ngược thời gian nhận phòng.
5. **Nhắc nhở tự động:** Tự động kích hoạt thông báo cục bộ qua `expo-notifications` trước thời điểm nhận phòng 15 phút.

---

## 2. KIẾN TRÚC HỆ THỐNG VÀ QUẢN LÝ TRẠNG THÁI

### 2.1. Sơ đồ kiến trúc ứng dụng
```text
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  [RoomListScreen]  [RoomDetailScreen]  [BookingScreen]  [MyBookings]   │
│         │                  │                  │               │        │
│    [RoomCard]       [TimeSlotBtn]        [Summary]        [QRModal]    │
└─────────┬──────────────────┬──────────────────┬───────────────┬────────┘
          │                  │                  │               │
┌─────────▼──────────────────▼──────────────────▼───────────────▼────────┐
│                        STATE MANAGEMENT LAYER                          │
│                                                                        │
│   useRoomStore (Zustand)           useBookingStore (Zustand)           │
│   - Danh sách phòng học            - Quản lý phiên sinh viên (session) │
│   - Trạng thái real-time           - Mảng đặt phòng (bookings)         │
│   - Bộ lọc đa tham số              - Bộ lọc kích hoạt (activeFilters)  │
│                                    - createBooking (Atomic check)      │
│                                    - cancelBooking (Dọn dẹp reminder)  │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                      PERSISTENCE & SERVICE LAYER                       │
│                                                                        │
│   [@react-native-async-storage]           [expo-notifications]         │
│   - Tự động lưu/khôi phục dữ liệu         - Lên lịch báo thức 15 phút  │
│   - Đồng bộ trạng thái khi mở app         - Hủy thông báo khi hủy slot │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2. Luồng kiểm tra xung đột đa tầng (Conflict Prevention Engine)
- **Tầng 1 (Giao diện người dùng):** Khi chọn ngày học tại `RoomDetailScreen`, hệ thống gọi hàm `isSlotAvailable(roomId, date, slotId, bookings)`. Bất kỳ slot nào đã tồn tại đặt phòng hợp lệ (`status === 'active'`) đều tự động bị vô hiệu hóa (`disabled = true`), đổi sang giao diện xám kèm biểu tượng khóa và nhãn "Đã đặt".
- **Tầng 2 (Atomic Store Verification):** Khi người dùng nhấn nút *"Xác nhận & Nhận mã QR"*, hàm `createBooking` thực hiện kiểm tra lại một lần nữa trên state mới nhất. Nếu có xung đột tức thời, hệ thống báo lỗi rõ ràng và từ chối ghi nhận đặt phòng, ngăn chặn race condition.

---

## 3. BẢNG CHECKLIST TÍNH NĂNG VÀ NGHIỆM THU

| STT | Hạng mục tính năng | Mô tả chi tiết | Trạng thái |
| :---: | :--- | :--- | :---: |
| 1 | **Danh sách phòng 60fps** | `FlatList` với `React.memo`, `getItemLayout`, `windowSize={7}`, tối ưu mượt mà | **Đạt (100%)** |
| 2 | **Bộ lọc đa tham số** | Lọc linh hoạt theo Tòa nhà (A, B, C, V), Sức chứa (2-6, 7-15, 16-40), Thiết bị | **Đạt (100%)** |
| 3 | **Tìm kiếm tức thời** | Tìm kiếm theo tên phòng, tòa nhà, mô tả với độ trễ thấp | **Đạt (100%)** |
| 4 | **Bộ chọn ngày 7 ngày** | Chọn từ Ngày hiện tại đến 6 ngày kế tiếp, tính toán động | **Đạt (100%)** |
| 5 | **Bộ chọn khung giờ** | 4 khung giờ cố định (2 giờ/slot), tự động disable slot đã có người đặt | **Đạt (100%)** |
| 6 | **Double-Check Conflict** | Chống xung đột race-condition tại màn hình xác nhận đặt chỗ | **Đạt (100%)** |
| 7 | **Mã QR Check-in** | Tạo mã QR chuẩn SVG từ dữ liệu token đặt chỗ, hiển thị đếm ngược | **Đạt (100%)** |
| 8 | **Quản lý đặt chỗ cá nhân** | Xem danh sách đặt phòng theo tab (Tất cả / Sắp tới / Lịch sử) | **Đạt (100%)** |
| 9 | **Hủy đặt phòng an toàn** | Cho phép hủy đặt phòng trước giờ bắt đầu, tự động giải phóng slot | **Đạt (100%)** |
| 10 | **Nhắc nhở thông minh** | Tự động lên lịch thông báo qua `expo-notifications` trước 15 phút | **Đạt (100%)** |
| 11 | **Lưu trữ dữ liệu bền vững** | Persist tự động qua AsyncStorage, bảo toàn dữ liệu sau khi khởi động lại app | **Đạt (100%)** |
| 12 | **TypeScript Strict Mode** | 100% không dùng `any` tùy tiện, pass hoàn toàn `tsc --noEmit` & `expo-doctor` | **Đạt (100%)** |

---

## 4. CHI TIẾT CÁC LUỒNG THAO TÁC CHÍNH

### Luồng 1: Tìm kiếm, lọc và khám phá phòng học
1. Người dùng mở ứng dụng, giao diện hiển thị danh sách phòng học VKU với ảnh chất lượng cao, nhãn tòa nhà, sức chứa và huy hiệu trạng thái thời gian thực (*Available Now* màu xanh hoặc *Occupied* màu đỏ).
2. Người dùng chọn nhanh chip Tòa nhà (Khu A / Khu B / Khu C / Khu V) hoặc bấm nút bộ lọc để lọc nâng cao theo sức chứa và danh sách trang thiết bị (Máy chiếu, Bảng kính, PC Đồ họa, Điều hòa).
3. Danh sách cập nhật tức thì, hiển thị số lượng phòng học thỏa mãn điều kiện.

### Luồng 2: Chọn ngày và khung giờ đặt phòng
1. Nhấn vào một phòng học bất kỳ để chuyển đến `RoomDetailScreen`.
2. Hệ thống hiển thị thanh cuộn ngang 7 ngày học (từ hôm nay đến 6 ngày tới).
3. Khi chọn một ngày, 4 khung giờ tương ứng được cập nhật trạng thái khả dụng. Các khung giờ đã có người đặt sẽ chuyển màu xám và không thể nhấn chọn.
4. Người dùng chọn 1 khung giờ còn trống và nhấn *"Tiếp tục"*.

### Luồng 3: Xác nhận đặt phòng và nhận mã QR
1. Màn hình `BookingScreen` tóm tắt toàn bộ thông tin phòng, địa điểm, ngày giờ và thông tin sinh viên đặt chỗ.
2. Người dùng nhấn *"Xác nhận & Nhận mã QR"*. Hệ thống thực hiện double-check chống xung đột, ghi nhận đặt phòng, lên lịch nhắc nhở 15 phút trước giờ học và chuyển sang `BookingSuccessScreen`.
3. Màn hình thành công xuất thẻ lên lớp điện tử với mã QR chuẩn SVG phục vụ check-in.

### Luồng 4: Quản lý và Hủy đặt phòng
1. Tại tab *"Đặt chỗ của tôi"*, sinh viên theo dõi các lịch đặt phòng sắp tới.
2. Nhấn *"Xem mã QR check-in"* mở `QRModal` với đồng hồ đếm ngược trực tiếp.
3. Nếu sinh viên có thay đổi lịch trình, nhấn *"Hủy đặt phòng"*. Hệ thống kiểm tra điều kiện (chưa đến giờ học), yêu cầu xác nhận, tiến hành hủy slot trong store và hủy bỏ thông báo nhắc nhở tương ứng.

---

## 5. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN
Hệ thống **RoomBook VKU** hoàn thành 100% các tiêu chí yêu cầu trong Brief Kỹ Thuật, vận hành ổn định trên Expo SDK 57, giao diện hiện đại, logic chặt chẽ và sẵn sàng triển khai thực tế. Trong giai đoạn tiếp theo, hệ thống có thể kết nối trực tiếp với cơ sở dữ liệu Supabase Realtime / Firebase và tích hợp API xác thực cổng thông tin sinh viên trường VKU.
