import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RoomStatus } from '../types/room';
import { BookingStatus } from '../types/booking';

interface StatusBadgeProps {
  type: 'room' | 'booking';
  status: RoomStatus | BookingStatus;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  type,
  status,
  size = 'small',
}) => {
  let label = '';
  let bgColor = '#F3F4F6';
  let textColor = '#374151';
  let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

  if (type === 'room') {
    if (status === 'available') {
      label = 'Available Now';
      bgColor = '#DCFCE7'; // light green
      textColor = '#15803D'; // dark green
      iconName = 'checkmark-circle';
    } else {
      label = 'Occupied';
      bgColor = '#FEE2E2'; // light red
      textColor = '#B91C1C'; // dark red
      iconName = 'time';
    }
  } else {
    // booking status
    if (status === 'active') {
      label = 'Đã đặt';
      bgColor = '#DBEAFE'; // light blue
      textColor = '#1D4ED8';
      iconName = 'calendar';
    } else if (status === 'completed') {
      label = 'Hoàn thành';
      bgColor = '#DCFCE7';
      textColor = '#15803D';
      iconName = 'checkmark-done';
    } else {
      label = 'Đã hủy';
      bgColor = '#F3F4F6';
      textColor = '#6B7280';
      iconName = 'close-circle';
    }
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bgColor },
        isSmall ? styles.badgeSmall : styles.badgeMedium,
      ]}
    >
      <Ionicons
        name={iconName}
        size={isSmall ? 12 : 14}
        color={textColor}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color: textColor },
          isSmall ? styles.textSmall : styles.textMedium,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeMedium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 11,
  },
  textMedium: {
    fontSize: 13,
  },
});
