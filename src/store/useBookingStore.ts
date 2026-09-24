import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, BookingStatus } from '../types/booking';
import { UserSession } from '../types/user';
import { BuildingCode, EquipmentType } from '../types/room';
import { isSlotAvailable } from '../utils/conflictChecker';
import { scheduleBookingReminder, cancelBookingReminder } from '../utils/notificationHelpers';
import { DEFAULT_USER, getInitialMockBookings } from '../api/bookings';
import { MOCK_ROOMS } from '../api/rooms';
import { getSlotById } from '../constants/timeSlots';

export interface FilterState {
  building: BuildingCode | 'ALL';
  capacityRangeId: string; // 'all', 'small', 'medium', 'large'
  equipment: EquipmentType[];
  searchQuery: string;
}

interface BookingState {
  session: UserSession | null;
  bookings: Booking[];
  activeFilters: FilterState;

  // Actions
  setSession: (session: UserSession | null) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  resetFilters: () => void;
  
  /**
   * Atomic booking creation with race condition / double-booking conflict check
   */
  createBooking: (
    roomId: string,
    date: string,
    slotId: string
  ) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

  /**
   * Cancellation action with scheduled notification cleanup
   */
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>;

  /**
   * Get all bookings belonging to the current user
   */
  getUserBookings: () => Booking[];
}

const defaultFilters: FilterState = {
  building: 'ALL',
  capacityRangeId: 'all',
  equipment: [],
  searchQuery: '',
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      session: DEFAULT_USER,
      bookings: getInitialMockBookings(),
      activeFilters: defaultFilters,

      setSession: (session) => set({ session }),

      setFilters: (newFilters) =>
        set((state) => ({
          activeFilters: { ...state.activeFilters, ...newFilters },
        })),

      resetFilters: () => set({ activeFilters: defaultFilters }),

      createBooking: async (roomId, date, slotId) => {
        const { bookings, session } = get();

        // 1. Race-condition check: double check slot availability against latest state
        const available = isSlotAvailable(roomId, date, slotId, bookings);
        if (!available) {
          return {
            success: false,
            error: 'Rất tiếc! Khung giờ này vừa có người đặt trước. Vui lòng chọn khung giờ hoặc phòng khác.',
          };
        }

        const slot = getSlotById(slotId);
        const room = MOCK_ROOMS.find((r) => r.id === roomId);

        if (!slot || !room) {
          return {
            success: false,
            error: 'Thông tin phòng học hoặc khung giờ không hợp lệ.',
          };
        }

        const userId = session?.userId || 'anonymous-vku-user';
        const bookingId = `book-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

        // Unique QR Code payload
        const qrPayload = JSON.stringify({
          bookingId,
          roomId,
          roomName: room.name,
          date,
          slotId,
          slotLabel: slot.label,
          userId,
          studentId: session?.studentId || 'N/A',
          timestamp: new Date().toISOString(),
        });

        // 2. Schedule push/local notification reminder 15 minutes before slot start
        // NOTE: In production with backend, this would also trigger FCM / APNs payload
        let notificationId: string | undefined;
        try {
          notificationId = await scheduleBookingReminder(room.name, date, slot.startTime);
        } catch (err) {
          console.warn('[Store] Notification scheduling failed:', err);
        }

        const newBooking: Booking = {
          id: bookingId,
          roomId,
          userId,
          date,
          slotId,
          status: 'active',
          qrCode: qrPayload,
          createdAt: new Date().toISOString(),
          notificationId,
        };

        // 3. Atomically persist to state
        set((state) => ({
          bookings: [newBooking, ...state.bookings],
        }));

        return {
          success: true,
          booking: newBooking,
        };
      },

      cancelBooking: async (bookingId) => {
        const { bookings } = get();
        const targetBooking = bookings.find((b) => b.id === bookingId);

        if (!targetBooking) {
          return { success: false, error: 'Không tìm thấy thông tin đặt phòng này.' };
        }

        // Cancel scheduled local notification if existed
        if (targetBooking.notificationId) {
          try {
            await cancelBookingReminder(targetBooking.notificationId);
          } catch (e) {
            console.warn('[Store] Failed to cancel scheduled reminder notification', e);
          }
        }

        // Update status to 'cancelled'
        set((state) => ({
          bookings: state.bookings.map((b) =>
            b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
          ),
        }));

        return { success: true };
      },

      getUserBookings: () => {
        const { bookings, session } = get();
        if (!session) return [];
        return bookings.filter((b) => b.userId === session.userId);
      },
    }),
    {
      name: 'vku-room-booking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist bookings and activeFilters
      partialize: (state) => ({
        bookings: state.bookings,
        activeFilters: state.activeFilters,
        session: state.session,
      }),
    }
  )
);
