import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useBookingStore } from '../store/useBookingStore';
import { useRoomStore } from '../store/useRoomStore';
import { getSlotById } from '../constants/timeSlots';
import { formatDisplayDate } from '../utils/dateHelpers';

type SuccessRouteProp = RouteProp<RootStackParamList, 'BookingSuccess'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'BookingSuccess'>;

export const BookingSuccessScreen: React.FC = () => {
  const route = useRoute<SuccessRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { bookingId } = route.params;

  const { bookings } = useBookingStore();
  const { getRoomById } = useRoomStore();

  const booking = bookings.find((b) => b.id === bookingId);
  const room = booking ? getRoomById(booking.roomId) : undefined;
  const slot = booking ? getSlotById(booking.slotId) : undefined;

  const handleGoToMyBookings = () => {
    // Navigate to MyBookingsTab in MainTabs
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabs',
          params: {
            screen: 'MyBookingsTab',
          },
        },
      ],
    });
  };

  const handleBackToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Success Icon */}
        <View style={styles.successBadgeContainer}>
          <View style={styles.successIconCircle}>
            <Ionicons name="checkmark-sharp" size={44} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Đặt phòng thành công!</Text>
          <Text style={styles.subtitle}>
            Thông tin đặt chỗ của bạn đã được ghi nhận vào hệ thống VKU.
          </Text>
        </View>

        {/* QR Code Pass Card */}
        <View style={styles.passCard}>
          <View style={styles.passHeader}>
            <Text style={styles.passOrg}>ĐẠI HỌC CÔNG NGHỆ THÔNG TIN & TRUYỀN THÔNG VIỆT - HÀN</Text>
            <Text style={styles.passTitle}>THẺ CHECK-IN PHÒNG HỌC</Text>
          </View>

          {/* QR Code Section */}
          <View style={styles.qrWrapper}>
            <QRCode
              value={booking?.qrCode || `VKU-${bookingId}`}
              size={180}
              color="#0F172A"
              backgroundColor="#FFFFFF"
            />
            <Text style={styles.codeText}>MÃ ĐẶT: {bookingId.toUpperCase()}</Text>
          </View>

          {/* Cut-out ticket line */}
          <View style={styles.ticketDivider}>
            <View style={styles.ticketHoleLeft} />
            <View style={styles.ticketDottedLine} />
            <View style={styles.ticketHoleRight} />
          </View>

          {/* Booking Summary */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phòng học:</Text>
              <Text style={styles.infoValue}>{room?.name || 'Phòng học VKU'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vị trí:</Text>
              <Text style={styles.infoValue}>
                {room ? `Khu ${room.building} • Tầng ${room.floor}` : 'VKU Campus'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày học:</Text>
              <Text style={styles.infoValue}>
                {booking ? formatDisplayDate(booking.date) : ''}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khung giờ:</Text>
              <Text style={styles.infoValue}>{slot?.label || '07:30 - 09:30'}</Text>
            </View>
          </View>
        </View>

        {/* Reminder alert card */}
        <View style={styles.reminderBanner}>
          <Ionicons name="notifications-outline" size={20} color="#2563EB" />
          <Text style={styles.reminderText}>
            Hệ thống đã tự động cài đặt nhắc nhở 15 phút trước giờ bắt đầu để bạn kịp thời check-in.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleGoToMyBookings}
            style={styles.primaryBtn}
          >
            <Ionicons name="calendar-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Xem danh sách đặt chỗ của tôi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleBackToHome}
            style={styles.secondaryBtn}
          >
            <Ionicons name="home-outline" size={18} color="#2563EB" style={{ marginRight: 8 }} />
            <Text style={styles.secondaryBtnText}>Về trang chủ tìm phòng khác</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  successBadgeContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  successIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 300,
  },
  passCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  passHeader: {
    backgroundColor: '#1E3A8A',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  passOrg: {
    color: '#93C5FD',
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 2,
  },
  passTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  qrWrapper: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  codeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginTop: 12,
    letterSpacing: 1,
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    height: 24,
  },
  ticketHoleLeft: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginLeft: -12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  ticketDottedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
  },
  ticketHoleRight: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    marginRight: -12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoSection: {
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  reminderBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  reminderText: {
    flex: 1,
    fontSize: 12.5,
    color: '#1D4ED8',
    marginLeft: 10,
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#2563EB',
    height: 50,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },
});
