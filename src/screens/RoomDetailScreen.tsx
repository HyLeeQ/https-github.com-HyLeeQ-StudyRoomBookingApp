import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../navigation/types';
import { useRoomStore } from '../store/useRoomStore';
import { useBookingStore } from '../store/useBookingStore';
import { TIME_SLOTS } from '../constants/timeSlots';
import { TimeSlot } from '../types/booking';
import { TimeSlotButton } from '../components/TimeSlotButton';
import { StatusBadge } from '../components/StatusBadge';
import { getNext7Days, formatDisplayDate } from '../utils/dateHelpers';
import { isSlotAvailable } from '../utils/conflictChecker';

type DetailRouteProp = RouteProp<RootStackParamList, 'RoomDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;

const { width } = Dimensions.get('window');

const EQUIPMENT_SPECS: Record<string, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = {
  projector: { label: 'Máy chiếu độ phân giải cao', icon: 'projector-screen-outline' },
  whiteboard: { label: 'Bảng kính viết bút dạ lớn', icon: 'presentation' },
  high_spec_pc: { label: 'Dàn PC cấu hình cao (Card RTX)', icon: 'desktop-tower-monitor' },
  ac: { label: 'Điều hòa công suất lớn', icon: 'air-conditioner' },
};

export const RoomDetailScreen: React.FC = () => {
  const route = useRoute<DetailRouteProp>();
  const navigation = useNavigation<NavigationProp>();
  const { roomId } = route.params;

  const { getRoomById } = useRoomStore();
  const { bookings } = useBookingStore();

  const room = getRoomById(roomId);

  // 7-day selector options
  const days = useMemo(() => getNext7Days(), []);
  const [selectedDate, setSelectedDate] = useState<string>(days[0].dateStr);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Calculate availability for each slot for the selected room and date
  const slotAvailabilities = useMemo(() => {
    return TIME_SLOTS.map((slot) => {
      const available = isSlotAvailable(roomId, selectedDate, slot.id, bookings);
      return {
        slot,
        isAvailable: available,
      };
    });
  }, [roomId, selectedDate, bookings]);

  // When date changes, deselect if selected slot is not available on new date
  const handleDateSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    if (selectedSlot) {
      const availableOnNewDate = isSlotAvailable(roomId, dateStr, selectedSlot.id, bookings);
      if (!availableOnNewDate) {
        setSelectedSlot(null);
      }
    }
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (selectedSlot?.id === slot.id) {
      setSelectedSlot(null);
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleProceedToBooking = () => {
    if (!room || !selectedSlot) return;

    navigation.navigate('Booking', {
      roomId: room.id,
      date: selectedDate,
      slotId: selectedSlot.id,
    });
  };

  if (!room) {
    return (
      <SafeAreaView style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin phòng học.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Quay lại</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Room Hero Image & Top Navigation Overlay */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: room.photoUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroGradient} />

          <TouchableOpacity
            style={styles.floatingBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.heroBadgeRow}>
            <StatusBadge type="room" status={room.status} size="medium" />
            <View style={styles.heroBuildingTag}>
              <Ionicons name="business" size={14} color="#FFFFFF" />
              <Text style={styles.heroBuildingText}>
                Khu {room.building} • Tầng {room.floor}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          {/* Header Info */}
          <View style={styles.titleSection}>
            <Text style={styles.roomName}>{room.name}</Text>
            <View style={styles.capacityBadge}>
              <Ionicons name="people" size={16} color="#2563EB" />
              <Text style={styles.capacityBadgeText}>{room.capacity} chỗ ngồi</Text>
            </View>
          </View>

          <Text style={styles.roomDescription}>{room.description}</Text>

          {/* Equipment Grid */}
          <View style={styles.specsSection}>
            <Text style={styles.sectionHeader}>Trang thiết bị & Tiện nghi</Text>
            <View style={styles.specsGrid}>
              {room.equipment.map((eq) => {
                const spec = EQUIPMENT_SPECS[eq] || { label: eq, icon: 'check-circle-outline' };
                return (
                  <View key={eq} style={styles.specItem}>
                    <View style={styles.specIconWrapper}>
                      <MaterialCommunityIcons name={spec.icon} size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.specLabel}>{spec.label}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 7-Day Horizontal Date Selector */}
          <View style={styles.dateSection}>
            <View style={styles.dateHeaderRow}>
              <Text style={styles.sectionHeader}>Chọn ngày đặt phòng</Text>
              <Text style={styles.selectedDateHint}>{formatDisplayDate(selectedDate)}</Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScroll}
            >
              {days.map((day) => {
                const isSelected = day.dateStr === selectedDate;
                return (
                  <TouchableOpacity
                    key={day.dateStr}
                    activeOpacity={0.7}
                    onPress={() => handleDateSelect(day.dateStr)}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayOfWeekText,
                        isSelected && styles.dayOfWeekTextSelected,
                      ]}
                    >
                      {day.dayOfWeek}
                    </Text>
                    <Text
                      style={[
                        styles.dayNumberText,
                        isSelected && styles.dayNumberTextSelected,
                      ]}
                    >
                      {day.dayNumber}
                    </Text>
                    <Text
                      style={[
                        styles.monthText,
                        isSelected && styles.monthTextSelected,
                      ]}
                    >
                      {day.monthName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slot Selection */}
          <View style={styles.slotsSection}>
            <View style={styles.slotsHeaderRow}>
              <Text style={styles.sectionHeader}>Chọn khung giờ</Text>
              <Text style={styles.slotsCountHint}>
                (Còn {slotAvailabilities.filter((s) => s.isAvailable).length}/4 khung giờ trống)
              </Text>
            </View>

            {slotAvailabilities.map(({ slot, isAvailable }) => (
              <TimeSlotButton
                key={slot.id}
                slot={slot}
                isAvailable={isAvailable}
                isSelected={selectedSlot?.id === slot.id}
                onSelect={handleSlotSelect}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomSummary}>
          <Text style={styles.bottomSummaryLabel}>Khung giờ đã chọn:</Text>
          <Text style={styles.bottomSummaryValue}>
            {selectedSlot ? `${selectedSlot.label}` : 'Vui lòng chọn khung giờ'}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedSlot}
          onPress={handleProceedToBooking}
          style={[
            styles.submitButton,
            !selectedSlot && styles.submitButtonDisabled,
          ]}
        >
          <Text style={styles.submitButtonText}>Tiếp tục</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color={selectedSlot ? '#FFFFFF' : '#9CA3AF'}
            style={{ marginLeft: 6 }}
          />
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
  scrollContent: {
    paddingBottom: 110,
  },
  heroContainer: {
    width,
    height: 260,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  floatingBackBtn: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 36 : 16,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadgeRow: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroBuildingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  heroBuildingText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
    marginLeft: 6,
  },
  body: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 10,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  capacityBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 4,
  },
  roomDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 21,
    marginBottom: 20,
  },
  specsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  specsGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  specIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  specLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  dateSection: {
    marginBottom: 24,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedDateHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
  dateScroll: {
    paddingVertical: 4,
    gap: 10,
  },
  dateCard: {
    width: 66,
    height: 82,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCardSelected: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  dayOfWeekText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },
  dayOfWeekTextSelected: {
    color: '#BFDBFE',
  },
  dayNumberText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  dayNumberTextSelected: {
    color: '#FFFFFF',
  },
  monthText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  monthTextSelected: {
    color: '#E0E7FF',
  },
  slotsSection: {
    marginBottom: 10,
  },
  slotsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotsCountHint: {
    fontSize: 12,
    color: '#64748B',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  bottomSummary: {
    flex: 1,
    marginRight: 12,
  },
  bottomSummaryLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomSummaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  notFoundText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  backBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
