import { Booking } from '../types/booking';
import { UserSession } from '../types/user';

export const DEFAULT_USER: UserSession = {
  userId: 'vku-sv-22da001',
  name: 'Nguyễn Văn An',
  studentId: '22DA001',
  email: 'annv.22da@vku.udn.vn',
  major: 'Kỹ thuật Phần mềm (VKU)',
};

// Generates initial seed bookings so that testers see some slots already occupied
export const getInitialMockBookings = (): Booking[] => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  // Tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tYear = tomorrow.getFullYear();
  const tMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tDay = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${tYear}-${tMonth}-${tDay}`;

  return [
    {
      id: 'book-seed-001',
      roomId: 'room-a101',
      userId: 'vku-sv-other1',
      date: todayStr,
      slotId: 'slot2', // 09:30 - 11:30
      status: 'active',
      qrCode: JSON.stringify({
        bookingId: 'book-seed-001',
        roomId: 'room-a101',
        slotId: 'slot2',
        studentId: '21IT045',
      }),
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'book-seed-002',
      roomId: 'room-c105',
      userId: DEFAULT_USER.userId,
      date: todayStr,
      slotId: 'slot3', // 13:00 - 15:00
      status: 'active',
      qrCode: JSON.stringify({
        bookingId: 'book-seed-002',
        roomId: 'room-c105',
        slotId: 'slot3',
        studentId: DEFAULT_USER.studentId,
      }),
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'book-seed-003',
      roomId: 'room-v101',
      userId: 'vku-sv-other2',
      date: tomorrowStr,
      slotId: 'slot1', // 07:30 - 09:30
      status: 'active',
      qrCode: JSON.stringify({
        bookingId: 'book-seed-003',
        roomId: 'room-v101',
        slotId: 'slot1',
        studentId: '22CE012',
      }),
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];
};
