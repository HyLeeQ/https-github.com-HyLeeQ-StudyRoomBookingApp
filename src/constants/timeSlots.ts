import { TimeSlot } from '../types/booking';

export const TIME_SLOTS: TimeSlot[] = [
  { id: 'slot1', label: '07:30 - 09:30', startTime: '07:30', endTime: '09:30' },
  { id: 'slot2', label: '09:30 - 11:30', startTime: '09:30', endTime: '11:30' },
  { id: 'slot3', label: '13:00 - 15:00', startTime: '13:00', endTime: '15:00' },
  { id: 'slot4', label: '15:00 - 17:00', startTime: '15:00', endTime: '17:00' },
];

export const getSlotById = (slotId: string): TimeSlot | undefined => {
  return TIME_SLOTS.find((s) => s.id === slotId);
};
