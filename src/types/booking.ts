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
  date: string;         // Format "YYYY-MM-DD" e.g., "2026-09-25"
  slotId: string;
  status: BookingStatus;
  qrCode: string;        // Unique string/JSON token for check-in
  createdAt: string;     // ISO timestamp
  notificationId?: string; // ID from expo-notifications for scheduled reminder
}
