export interface DayOption {
  dateStr: string;      // "YYYY-MM-DD"
  dayOfWeek: string;    // "T2", "T3", "CN", ...
  dayNumber: string;    // "25"
  monthName: string;    // "Th09"
  fullLabel: string;    // "Thứ Sáu, 25/09/2026"
  isToday: boolean;
}

export const getNext7Days = (baseDate: Date = new Date()): DayOption[] => {
  const days: DayOption[] = [];
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const fullDayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const dayOfWeek = i === 0 ? 'Hôm nay' : dayNames[d.getDay()];
    const fullLabel = `${fullDayNames[d.getDay()]}, ${day}/${month}/${year}`;

    days.push({
      dateStr,
      dayOfWeek,
      dayNumber: day,
      monthName: `Th${month}`,
      fullLabel,
      isToday: i === 0,
    });
  }

  return days;
};

export const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
};

/**
 * Returns a JS Date object representing the slot start time on the given date
 * @param dateStr "YYYY-MM-DD"
 * @param timeStr "07:30"
 */
export const getSlotStartDate = (dateStr: string, timeStr: string): Date => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

/**
 * Checks whether a booking slot is in the past compared to the current timestamp
 */
export const isSlotInPast = (dateStr: string, endTimeStr: string): boolean => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = endTimeStr.split(':').map(Number);
  const slotEnd = new Date(year, month - 1, day, hours, minutes, 0, 0);
  return new Date().getTime() > slotEnd.getTime();
};

/**
 * Checks whether user can cancel booking
 */
export const canCancelBooking = (_dateStr: string, _startTimeStr: string): boolean => {
  return true;
};

/**
 * Calculates countdown string until slot start
 */
export const getTimeUntilSlot = (dateStr: string, startTimeStr: string): string => {
  const target = getSlotStartDate(dateStr, startTimeStr).getTime();
  const now = new Date().getTime();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return 'Đã đến giờ check-in';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const mins = diffMinutes % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `Còn ${days} ngày nữa`;
  }
  if (hours > 0) {
    return `Còn ${hours} giờ ${mins} phút`;
  }
  return `Còn ${mins} phút`;
};
