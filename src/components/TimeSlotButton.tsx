import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimeSlot } from '../types/booking';

interface TimeSlotButtonProps {
  slot: TimeSlot;
  isAvailable: boolean;
  isSelected: boolean;
  onSelect: (slot: TimeSlot) => void;
  style?: StyleProp<ViewStyle>;
}

export const TimeSlotButton: React.FC<TimeSlotButtonProps> = React.memo(
  ({ slot, isAvailable, isSelected, onSelect, style }) => {
    const handlePress = () => {
      if (isAvailable) {
        onSelect(slot);
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={isAvailable ? 0.75 : 1}
        onPress={handlePress}
        disabled={!isAvailable}
        style={[
          styles.container,
          !isAvailable && styles.containerDisabled,
          isAvailable && !isSelected && styles.containerAvailable,
          isSelected && styles.containerSelected,
          style,
        ]}
      >
        <View style={styles.leftSection}>
          <View
            style={[
              styles.iconWrapper,
              !isAvailable && styles.iconWrapperDisabled,
              isAvailable && !isSelected && styles.iconWrapperAvailable,
              isSelected && styles.iconWrapperSelected,
            ]}
          >
            <Ionicons
              name={
                !isAvailable
                  ? 'lock-closed'
                  : isSelected
                  ? 'checkmark'
                  : 'time-outline'
              }
              size={18}
              color={
                !isAvailable
                  ? '#9CA3AF'
                  : isSelected
                  ? '#FFFFFF'
                  : '#2563EB'
              }
            />
          </View>
          <View style={styles.slotInfo}>
            <Text
              style={[
                styles.slotTime,
                !isAvailable && styles.textDisabled,
                isSelected && styles.textSelectedBold,
              ]}
            >
              {slot.label}
            </Text>
            <Text
              style={[
                styles.slotDuration,
                !isAvailable && styles.textDisabledSmall,
              ]}
            >
              2 tiếng (Cố định)
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.statusTag,
            !isAvailable && styles.statusTagDisabled,
            isAvailable && !isSelected && styles.statusTagAvailable,
            isSelected && styles.statusTagSelected,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              !isAvailable && styles.statusTextDisabled,
              isAvailable && !isSelected && styles.statusTextAvailable,
              isSelected && styles.statusTextSelected,
            ]}
          >
            {!isAvailable ? 'Đã đặt' : isSelected ? 'Đã chọn' : 'Còn trống'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  containerAvailable: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  containerDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapperAvailable: {
    backgroundColor: '#DBEAFE',
  },
  iconWrapperSelected: {
    backgroundColor: '#2563EB',
  },
  iconWrapperDisabled: {
    backgroundColor: '#E5E7EB',
  },
  slotInfo: {
    justifyContent: 'center',
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  slotDuration: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  textSelectedBold: {
    color: '#1D4ED8',
  },
  textDisabled: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  textDisabledSmall: {
    color: '#9CA3AF',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTagAvailable: {
    backgroundColor: '#DCFCE7',
  },
  statusTagSelected: {
    backgroundColor: '#2563EB',
  },
  statusTagDisabled: {
    backgroundColor: '#E5E7EB',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: '#15803D',
  },
  statusTextSelected: {
    color: '#FFFFFF',
  },
  statusTextDisabled: {
    color: '#6B7280',
  },
});
