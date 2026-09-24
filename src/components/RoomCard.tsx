import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Room } from '../types/room';
import { StatusBadge } from './StatusBadge';

interface RoomCardProps {
  room: Room;
  onPress: (room: Room) => void;
}

const EQUIPMENT_ICON_MAP: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  projector: 'projector-screen-outline',
  whiteboard: 'presentation',
  high_spec_pc: 'desktop-tower-monitor',
  ac: 'air-conditioner',
};

const EQUIPMENT_LABEL_MAP: Record<string, string> = {
  projector: 'Máy chiếu',
  whiteboard: 'Bảng kính',
  high_spec_pc: 'PC Đồ họa',
  ac: 'Điều hòa',
};

export const ROOM_CARD_HEIGHT = 285; // Fixed height constant for FlatList getItemLayout optimization

export const RoomCard: React.FC<RoomCardProps> = React.memo(({ room, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => onPress(room)}
      style={styles.card}
    >
      {/* Room Photo & Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: room.photoUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />

        {/* Real-time Status Badge top-left */}
        <View style={styles.statusBadgeWrapper}>
          <StatusBadge type="room" status={room.status} size="small" />
        </View>

        {/* Building & Floor Tag top-right */}
        <View style={styles.locationTag}>
          <Ionicons name="location-sharp" size={13} color="#FFFFFF" />
          <Text style={styles.locationTagText}>
            Khu {room.building} • Tầng {room.floor}
          </Text>
        </View>
      </View>

      {/* Room Details */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.name}
          </Text>
          <View style={styles.capacityBadge}>
            <Ionicons name="people" size={14} color="#2563EB" />
            <Text style={styles.capacityText}>{room.capacity} chỗ</Text>
          </View>
        </View>

        {room.description && (
          <Text style={styles.description} numberOfLines={2}>
            {room.description}
          </Text>
        )}

        {/* Equipment Badges */}
        <View style={styles.equipmentRow}>
          {room.equipment.map((eq) => (
            <View key={eq} style={styles.equipmentChip}>
              <MaterialCommunityIcons
                name={EQUIPMENT_ICON_MAP[eq] || 'check'}
                size={13}
                color="#4B5563"
                style={styles.eqIcon}
              />
              <Text style={styles.equipmentChipText}>
                {EQUIPMENT_LABEL_MAP[eq] || eq}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    height: ROOM_CARD_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#1F2937',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    height: 145,
    width: '100%',
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  statusBadgeWrapper: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  locationTag: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  locationTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 3,
  },
  content: {
    padding: 14,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  capacityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginLeft: 4,
  },
  description: {
    fontSize: 12.5,
    color: '#6B7280',
    lineHeight: 18,
    marginVertical: 4,
  },
  equipmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    gap: 6,
  },
  equipmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eqIcon: {
    marginRight: 4,
  },
  equipmentChipText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
});
