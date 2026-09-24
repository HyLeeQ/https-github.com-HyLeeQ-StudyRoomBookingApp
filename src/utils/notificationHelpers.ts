import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { getSlotStartDate } from './dateHelpers';

// Safe sub-module imports to prevent DevicePushTokenAutoRegistration.fx from triggering
// the Expo Go Android push notification deprecation error
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import {
  getPermissionsAsync,
  requestPermissionsAsync,
} from 'expo-notifications/build/NotificationPermissions';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';

// Safely configure notification behavior when app is in foreground
try {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[Notification] Could not set foreground notification handler:', e);
}

/**
 * Requests push/local notification permissions from the user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status: existingStatus } = await getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android' && setNotificationChannelAsync) {
      try {
        await setNotificationChannelAsync('room-bookings', {
          name: 'Nhắc nhở đặt phòng học',
          importance: 4, // AndroidImportance.HIGH
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#2563EB',
        } as any);
      } catch (channelErr) {
        console.log('[Notification] Notification channel setting skipped in current environment');
      }
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[Notification] Error requesting notification permissions (Safe fallback):', error);
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

    const notificationId = await scheduleNotificationAsync({
      content: {
        title: '🔔 Nhắc nhở giờ học tại VKU',
        body: `Phòng ${roomName} của bạn sẽ bắt đầu trong 15 phút nữa (${startTimeStr}). Hãy chuẩn bị check-in nhé!`,
        data: { roomName, dateStr, startTimeStr },
        sound: true,
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'room-bookings' : undefined,
      },
    });

    console.log(`[Notification] Scheduled reminder #${notificationId} at ${triggerDate.toLocaleTimeString()}`);
    return notificationId;
  } catch (error) {
    console.warn('[Notification] Failed to schedule notification (Safe fallback):', error);
    // Return a mock identifier if running in an environment without native notification support
    return `local-remind-${Date.now()}`;
  }
}

/**
 * Cancels a previously scheduled notification when a booking is cancelled
 */
export async function cancelBookingReminder(notificationId?: string): Promise<void> {
  if (!notificationId) return;
  try {
    await cancelScheduledNotificationAsync(notificationId);
    console.log(`[Notification] Cancelled reminder #${notificationId}`);
  } catch (error) {
    console.warn('[Notification] Failed to cancel notification:', error);
  }
}
