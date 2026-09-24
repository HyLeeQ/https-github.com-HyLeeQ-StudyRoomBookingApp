import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getSlotStartDate } from './dateHelpers';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Requests push/local notification permissions from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('room-bookings', {
        name: 'Nhắc nhở đặt phòng học',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563EB',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[Notification] Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedules a local reminder notification 15 minutes before the booked slot starts.
 * 
 * @param roomName Name of the room reserved
 * @param dateStr Date "YYYY-MM-DD"
 * @param startTimeStr Start time "07:30"
 * @returns notificationId string if scheduled successfully, undefined otherwise
 */
export async function scheduleBookingReminder(
  roomName: string,
  dateStr: string,
  startTimeStr: string
): Promise<string | undefined> {
  try {
    const slotStartDate = getSlotStartDate(dateStr, startTimeStr);
    // 15 minutes before start
    const triggerDate = new Date(slotStartDate.getTime() - 15 * 60 * 1000);
    const now = new Date();

    // If trigger date has already passed, we do not schedule
    if (triggerDate.getTime() <= now.getTime()) {
      console.log('[Notification] Target reminder time has already passed, skipping notification');
      return undefined;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Nhắc nhở giờ học tại VKU',
        body: `Phòng ${roomName} của bạn sẽ bắt đầu trong 15 phút nữa (${startTimeStr}). Hãy chuẩn bị check-in nhé!`,
        data: { roomName, dateStr, startTimeStr },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'room-bookings' : undefined,
      },
    });

    console.log(`[Notification] Scheduled reminder #${notificationId} at ${triggerDate.toLocaleTimeString()}`);
    return notificationId;
  } catch (error) {
    console.warn('[Notification] Failed to schedule notification:', error);
    return undefined;
  }
}

/**
 * Cancels a previously scheduled notification when a booking is cancelled
 */
export async function cancelBookingReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notification] Cancelled reminder #${notificationId}`);
  } catch (error) {
    console.warn('[Notification] Failed to cancel notification:', error);
  }
}
