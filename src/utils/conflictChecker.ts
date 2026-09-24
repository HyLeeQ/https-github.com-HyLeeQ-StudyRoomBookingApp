import { Booking } from '../types/booking';

/**
 * Checks if a specific room slot on a specific date is currently available.
 * Returns false if there is an existing 'active' booking matching roomId + date + slotId.
 * 
 * Used in 2 critical places:
 * 1. Rendering TimeSlotButton UI in RoomDetailScreen (disabling booked slots)
 * 2. Final atomic double-check right before creating a new booking in useBookingStore / BookingScreen
 * 
 * @param roomId ID of the room
 * @param date Target date in YYYY-MM-DD
 * @param slotId Slot identifier (e.g. 'slot1', 'slot2')
 * @param existingBookings Array of current bookings
 * @returns boolean true if slot is free to book, false if already taken
 */
export function isSlotAvailable(
  roomId: string,
  date: string,
  slotId: string,
  existingBookings: Booking[]
): boolean {
  // A conflict exists if there is an 'active' booking for the same room, date, and slot
  const hasConflict = existingBookings.some(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.slotId === slotId &&
      b.status === 'active'
  );

  return !hasConflict;
}

/**
 * Finds the conflicting booking if one exists
 */
export function getConflictingBooking(
  roomId: string,
  date: string,
  slotId: string,
  existingBookings: Booking[]
): Booking | undefined {
  return existingBookings.find(
    (b) =>
      b.roomId === roomId &&
      b.date === date &&
      b.slotId === slotId &&
      b.status === 'active'
  );
}
