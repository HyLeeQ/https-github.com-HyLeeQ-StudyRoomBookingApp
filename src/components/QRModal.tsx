import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { Booking } from '../types/booking';
import { Room } from '../types/room';
import { TimeSlot } from '../types/booking';
import { formatDisplayDate, getTimeUntilSlot } from '../utils/dateHelpers';
import { StatusBadge } from './StatusBadge';

interface QRModalProps {
  visible: boolean;
  booking: Booking | null;
  room?: Room;
  slot?: TimeSlot;
  onClose: () => void;
}

export const QRModal: React.FC<QRModalProps> = ({
  visible,
  booking,
  room,
  slot,
  onClose,
}) => {
  const [countdownText, setCountdownText] = useState<string>('');

  useEffect(() => {
    if (!booking || !slot) return;

    const updateTimer = () => {
      setCountdownText(getTimeUntilSlot(booking.date, slot.startTime));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, [booking, slot]);

  if (!booking) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.modalTitle}>Mã Check-in Phòng Học</Text>
              <Text style={styles.modalSubtitle}>Đưa mã này cho quản lý phòng hoặc máy quét</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* QR Code Canvas */}
          <View style={styles.qrContainer}>
            <View style={styles.qrWrapper}>
              <QRCode
                value={booking.qrCode || `VKU-BOOKING-${booking.id}`}
                size={180}
                color="#0F172A"
                backgroundColor="#FFFFFF"
              />
            </View>
            <Text style={styles.bookingIdText}>Mã: {booking.id.toUpperCase()}</Text>
          </View>

          {/* Countdown & Status */}
          <View style={styles.countdownSection}>
            <Ionicons name="timer-outline" size={18} color="#2563EB" />
            <Text style={styles.countdownText}>{countdownText}</Text>
            <StatusBadge type="booking" status={booking.status} size="small" />
          </View>

          {/* Details Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phòng học:</Text>
              <Text style={styles.infoValue}>{room?.name || booking.roomId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày học:</Text>
              <Text style={styles.infoValue}>{formatDisplayDate(booking.date)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khung giờ:</Text>
              <Text style={styles.infoValue}>{slot?.label || booking.slotId}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vị trí:</Text>
              <Text style={styles.infoValue}>
                {room ? `Khu ${room.building} • Tầng ${room.floor}` : 'VKU Campus'}
              </Text>
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            style={styles.doneButton}
          >
            <Text style={styles.doneButtonText}>Đóng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: Math.min(width - 40, 380),
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrWrapper: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  bookingIdText: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#475569',
  },
  countdownSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    marginVertical: 14,
  },
  countdownText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
    flex: 1,
    marginLeft: 6,
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  doneButton: {
    width: '100%',
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
