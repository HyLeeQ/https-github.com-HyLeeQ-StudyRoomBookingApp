import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useRoomStore } from '../store/useRoomStore';
import { useBookingStore } from '../store/useBookingStore';
import { getSlotById } from '../constants/timeSlots';
import { formatDisplayDate } from '../utils/dateHelpers';

type BookingRouteProp = RouteProp<RootStackParamList, 'Booking'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Booking'>;

export const BookingScreen: React.FC = () => {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { roomId, date, slotId } = route.params;

  const { getRoomById } = useRoomStore();
  const { createBooking, session } = useBookingStore();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const room = getRoomById(roomId);
  const slot = getSlotById(slotId);

  const handleConfirmReservation = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setConflictError(null);

    try {
      // Calls createBooking which does the atomic double-check conflict detection
      const result = await createBooking(roomId, date, slotId);

      if (result.success && result.booking) {
        // Successfully reserved without conflict
        navigation.replace('BookingSuccess', { bookingId: result.booking.id });
      } else {
        // Race condition conflict detected!
        const errorMessage =
          result.error ||
          'Rất tiếc! Khung giờ này vừa có sinh viên khác đặt trước. Vui lòng quay lại chọn khung giờ khác.';
        setConflictError(errorMessage);
        Alert.alert('Trùng lịch đặt phòng', errorMessage, [
          {
            text: 'Chọn khung giờ khác',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Lỗi hệ thống', err?.message || 'Có lỗi xảy ra khi tạo đặt chỗ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!room || !slot) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Dữ liệu đặt phòng không hợp lệ.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận đặt phòng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Race condition alert banner if error caught */}
        {conflictError && (
          <View style={styles.conflictBanner}>
            <Ionicons name="alert-circle" size={24} color="#DC2626" />
            <View style={styles.conflictBannerContent}>
              <Text style={styles.conflictBannerTitle}>Xung đột lịch đặt (Race condition)!</Text>
              <Text style={styles.conflictBannerText}>{conflictError}</Text>
            </View>
          </View>
        )}

        {/* Summary Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Thông tin chi tiết đặt chỗ</Text>

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name="business" size={18} color="#2563EB" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Phòng học</Text>
              <Text style={styles.detailValue}>{room.name}</Text>
              <Text style={styles.detailSub}>Khu {room.building} • Tầng {room.floor} • Sức chứa {room.capacity} người</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name="calendar" size={18} color="#2563EB" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Ngày học</Text>
              <Text style={styles.detailValue}>{formatDisplayDate(date)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.iconBox}>
              <Ionicons name="time" size={18} color="#2563EB" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Khung giờ</Text>
              <Text style={styles.detailValue}>{slot.label}</Text>
              <Text style={styles.detailSub}>Thời lượng 2 giờ liên tục</Text>
            </View>
          </View>
        </View>

        {/* Student Session Card */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Thông tin sinh viên đăng ký</Text>

          <View style={styles.userRow}>
            <View style={styles.userAvatar}>
              <Ionicons name="person" size={20} color="#2563EB" />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{session?.name || 'Sinh viên VKU'}</Text>
              <Text style={styles.userSub}>Mã SV: {session?.studentId || 'Chưa cập nhật'}</Text>
              {session?.email && (
                <Text style={styles.userEmail}>{session.email}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Policy & Notes */}
        <View style={styles.noticeCard}>
          <Ionicons name="information-circle-outline" size={20} color="#0284C7" />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Quy định sử dụng phòng học VKU</Text>
            <Text style={styles.noticeItem}>• Hệ thống sẽ tự động gửi thông báo nhắc nhở 15 phút trước giờ nhận phòng.</Text>
            <Text style={styles.noticeItem}>• Vui lòng quét mã QR tại cửa phòng để check-in đúng giờ.</Text>
            <Text style={styles.noticeItem}>• Bạn có thể hủy lịch đặt phòng bất kỳ lúc nào trước khi khung giờ bắt đầu.</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled={isSubmitting}
          onPress={handleConfirmReservation}
          style={[styles.confirmBtn, isSubmitting && styles.confirmBtnDisabled]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.confirmBtnText}>Xác nhận & Nhận mã QR</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  conflictBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#F87171',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  conflictBannerContent: {
    flex: 1,
    marginLeft: 10,
  },
  conflictBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B91C1C',
    marginBottom: 2,
  },
  conflictBannerText: {
    fontSize: 12.5,
    color: '#991B1B',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cardHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  detailSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  userSub: {
    fontSize: 13,
    color: '#475569',
    marginTop: 1,
  },
  userEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 10,
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0369A1',
    marginBottom: 4,
  },
  noticeItem: {
    fontSize: 12,
    color: '#0C4A6E',
    lineHeight: 18,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  confirmBtn: {
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#64748B',
  },
  backBtn: {
    marginTop: 16,
    alignSelf: 'center',
    padding: 10,
  },
  backBtnText: {
    color: '#2563EB',
    fontWeight: '600',
  },
});
