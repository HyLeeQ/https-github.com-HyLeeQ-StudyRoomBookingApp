import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBookingStore } from '../store/useBookingStore';
import { useRoomStore } from '../store/useRoomStore';
import { Booking } from '../types/booking';
import { getSlotById } from '../constants/timeSlots';
import { StatusBadge } from '../components/StatusBadge';
import { QRModal } from '../components/QRModal';
import { formatDisplayDate, canCancelBooking } from '../utils/dateHelpers';

export const MyBookingsScreen: React.FC = () => {
  const { getUserBookings, cancelBooking } = useBookingStore();
  const { getRoomById } = useRoomStore();

  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'history'>('all');
  const [selectedQRBooking, setSelectedQRBooking] = useState<Booking | null>(null);

  // Get user bookings
  const userBookings = getUserBookings();

  // Filter based on tab
  const displayedBookings = useMemo(() => {
    if (filterTab === 'active') {
      return userBookings.filter((b) => b.status === 'active');
    }
    if (filterTab === 'history') {
      return userBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');
    }
    return userBookings;
  }, [userBookings, filterTab]);

  const handleOpenQR = (booking: Booking) => {
    setSelectedQRBooking(booking);
  };

  const handleCancelReservation = (booking: Booking) => {
    const slot = getSlotById(booking.slotId);
    const room = getRoomById(booking.roomId);

    if (!slot) return;

    if (!canCancelBooking(booking.date, slot.startTime)) {
      Alert.alert(
        'Không thể hủy phòng',
        'Khung giờ đặt phòng này đã đến hoặc đã qua giờ bắt đầu, không thể thực hiện thao tác hủy.'
      );
      return;
    }

    Alert.alert(
      'Hủy lịch đặt phòng',
      `Bạn có chắc chắn muốn hủy đặt phòng ${room?.name || 'này'} vào ${formatDisplayDate(booking.date)} (${slot.label})?`,
      [
        { text: 'Giữ lại', style: 'cancel' },
        {
          text: 'Xác nhận hủy',
          style: 'destructive',
          onPress: async () => {
            const res = await cancelBooking(booking.id);
            if (res.success) {
              Alert.alert('Thành công', 'Lịch đặt phòng đã được hủy và giải phóng khung giờ.');
            } else {
              Alert.alert('Lỗi', res.error || 'Không thể hủy đặt chỗ.');
            }
          },
        },
      ]
    );
  };

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const room = getRoomById(item.roomId);
    const slot = getSlotById(item.slotId);
    const isActive = item.status === 'active';
    const isCancellable = isActive && slot ? canCancelBooking(item.date, slot.startTime) : false;

    return (
      <View style={styles.bookingCard}>
        {/* Top Header of Card */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.roomMeta}>
            <Text style={styles.roomName}>{room?.name || item.roomId}</Text>
            <Text style={styles.locationText}>
              {room ? `Khu ${room.building} • Tầng ${room.floor} • Sức chứa ${room.capacity} chỗ` : 'VKU Campus'}
            </Text>
          </View>
          <StatusBadge type="booking" status={item.status} size="small" />
        </View>

        <View style={styles.cardDivider} />

        {/* Date and Time Info */}
        <View style={styles.cardInfoRow}>
          <View style={styles.infoCol}>
            <View style={styles.iconLabel}>
              <Ionicons name="calendar-outline" size={14} color="#64748B" />
              <Text style={styles.infoColLabel}>Ngày học</Text>
            </View>
            <Text style={styles.infoColValue}>{formatDisplayDate(item.date)}</Text>
          </View>

          <View style={styles.infoCol}>
            <View style={styles.iconLabel}>
              <Ionicons name="time-outline" size={14} color="#64748B" />
              <Text style={styles.infoColLabel}>Khung giờ</Text>
            </View>
            <Text style={styles.infoColValue}>{slot?.label || item.slotId}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.cardActionRow}>
          {isActive && (
            <>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleOpenQR(item)}
                style={styles.qrActionBtn}
              >
                <Ionicons name="qr-code-outline" size={16} color="#2563EB" />
                <Text style={styles.qrActionText}>Xem mã QR</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleCancelReservation(item)}
                style={styles.cancelActionBtn}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
                <Text style={styles.cancelActionText}>Hủy phòng</Text>
              </TouchableOpacity>
            </>
          )}

          {!isActive && (
            <View style={styles.inactiveNote}>
              <Text style={styles.inactiveNoteText}>
                {item.status === 'cancelled' ? 'Lịch đặt đã bị hủy' : 'Lịch đặt đã hoàn tất'}
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const selectedRoomForModal = selectedQRBooking
    ? getRoomById(selectedQRBooking.roomId)
    : undefined;
  const selectedSlotForModal = selectedQRBooking
    ? getSlotById(selectedQRBooking.slotId)
    : undefined;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Lịch Đặt Chỗ Của Tôi</Text>
        <Text style={styles.subtitle}>Quản lý thẻ check-in và lịch học phòng nhóm VKU</Text>

        {/* Filter Segment Tabs */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentBtn, filterTab === 'all' && styles.segmentBtnActive]}
            onPress={() => setFilterTab('all')}
          >
            <Text style={[styles.segmentText, filterTab === 'all' && styles.segmentTextActive]}>
              Tất cả ({userBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, filterTab === 'active' && styles.segmentBtnActive]}
            onPress={() => setFilterTab('active')}
          >
            <Text style={[styles.segmentText, filterTab === 'active' && styles.segmentTextActive]}>
              Sắp tới ({userBookings.filter((b) => b.status === 'active').length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, filterTab === 'history' && styles.segmentBtnActive]}
            onPress={() => setFilterTab('history')}
          >
            <Text style={[styles.segmentText, filterTab === 'history' && styles.segmentTextActive]}>
              Lịch sử
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Booking List */}
      <FlatList
        data={displayedBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBookingItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={60} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Chưa có lịch đặt phòng nào</Text>
            <Text style={styles.emptySubtitle}>
              Khám phá danh sách phòng học và chọn cho mình khung giờ thích hợp ngay hôm nay!
            </Text>
          </View>
        }
      />

      {/* QR Code Check-in Modal */}
      <QRModal
        visible={!!selectedQRBooking}
        booking={selectedQRBooking}
        room={selectedRoomForModal}
        slot={selectedSlotForModal}
        onClose={() => setSelectedQRBooking(null)}
        onCancel={() => {
          if (selectedQRBooking) {
            const bookingToCancel = selectedQRBooking;
            setSelectedQRBooking(null);
            handleCancelReservation(bookingToCancel);
          }
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 14,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748B',
  },
  segmentTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  roomMeta: {
    flex: 1,
    marginRight: 10,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  locationText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  infoCol: {
    flex: 1,
  },
  iconLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoColLabel: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 4,
  },
  infoColValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#1E293B',
  },
  cardActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qrActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  qrActionText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 6,
  },
  cancelActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 4,
  },
  inactiveNote: {
    paddingVertical: 4,
  },
  inactiveNoteText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#334155',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
});
