import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useRoomStore } from '../store/useRoomStore';
import { useBookingStore } from '../store/useBookingStore';
import { RoomCard, ROOM_CARD_HEIGHT } from '../components/RoomCard';
import { FilterChip } from '../components/FilterChip';
import { BUILDINGS, CAPACITY_OPTIONS, EQUIPMENT_LIST } from '../constants/buildings';
import { BuildingCode, EquipmentType, Room } from '../types/room';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MainTabs'>;

export const RoomListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { getFilteredRooms } = useRoomStore();
  const { activeFilters, setFilters, resetFilters } = useBookingStore();

  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  // Compute filtered rooms dynamically
  const filteredRooms = useMemo(() => {
    return getFilteredRooms(activeFilters);
  }, [getFilteredRooms, activeFilters]);

  // Handle Search Input
  const handleSearchChange = (text: string) => {
    setFilters({ searchQuery: text });
  };

  const handleClearSearch = () => {
    setFilters({ searchQuery: '' });
  };

  // Building filter selection
  const handleSelectBuilding = (code: BuildingCode | 'ALL') => {
    setFilters({ building: code });
  };

  // Capacity range selection
  const handleSelectCapacity = (capacityId: string) => {
    setFilters({ capacityRangeId: capacityId });
  };

  // Equipment multi-select toggle
  const handleToggleEquipment = (eq: EquipmentType) => {
    const currentList = activeFilters.equipment;
    const exists = currentList.includes(eq);
    const updated = exists
      ? currentList.filter((item) => item !== eq)
      : [...currentList, eq];
    setFilters({ equipment: updated });
  };

  const handleRoomPress = useCallback(
    (room: Room) => {
      navigation.navigate('RoomDetail', { roomId: room.id });
    },
    [navigation]
  );

  // FlatList optimization items
  const renderItem = useCallback(
    ({ item }: { item: Room }) => <RoomCard room={item} onPress={handleRoomPress} />,
    [handleRoomPress]
  );

  const keyExtractor = useCallback((item: Room) => item.id, []);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: ROOM_CARD_HEIGHT + 16,
      offset: (ROOM_CARD_HEIGHT + 16) * index,
      index,
    }),
    []
  );

  // Check if any non-default filters are active
  const hasActiveFilters =
    activeFilters.building !== 'ALL' ||
    activeFilters.capacityRangeId !== 'all' ||
    activeFilters.equipment.length > 0 ||
    activeFilters.searchQuery.trim().length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header & Branding */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>RoomBook VKU</Text>
          <Text style={styles.brandSubtitle}>Hệ thống đặt phòng học nhóm & Lab real-time</Text>
        </View>
        <TouchableOpacity
          onPress={() => setIsFilterExpanded((prev) => !prev)}
          style={[
            styles.filterToggleBtn,
            hasActiveFilters && styles.filterToggleBtnActive,
          ]}
        >
          <Ionicons
            name={hasActiveFilters ? 'funnel' : 'funnel-outline'}
            size={18}
            color={hasActiveFilters ? '#FFFFFF' : '#374151'}
          />
          {activeFilters.equipment.length > 0 && (
            <View style={styles.filterBadgeCount}>
              <Text style={styles.filterBadgeCountText}>
                {activeFilters.equipment.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên phòng, khu A/B/C/V..."
            placeholderTextColor="#9CA3AF"
            value={activeFilters.searchQuery}
            onChangeText={handleSearchChange}
            clearButtonMode="while-editing"
          />
          {activeFilters.searchQuery.length > 0 && Platform.OS !== 'ios' && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Horizontal Building Chips Bar (Always visible for rapid filtering) */}
      <View style={styles.buildingFilterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
        >
          <FilterChip
            label="Tất cả tòa"
            isSelected={activeFilters.building === 'ALL'}
            onPress={() => handleSelectBuilding('ALL')}
          />
          {BUILDINGS.map((b) => (
            <FilterChip
              key={b.code}
              label={b.name}
              isSelected={activeFilters.building === b.code}
              onPress={() => handleSelectBuilding(b.code)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Expandable Advanced Filters (Capacity + Equipment multi-select) */}
      {isFilterExpanded && (
        <View style={styles.expandedFilterContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sức chứa chỗ ngồi:</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {CAPACITY_OPTIONS.map((cap) => (
                <FilterChip
                  key={cap.id}
                  label={cap.label}
                  isSelected={activeFilters.capacityRangeId === cap.id}
                  onPress={() => handleSelectCapacity(cap.id)}
                />
              ))}
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Thiết bị cần có (chọn nhiều):</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {EQUIPMENT_LIST.map((eq) => (
                <FilterChip
                  key={eq.type}
                  label={eq.label}
                  isSelected={activeFilters.equipment.includes(eq.type)}
                  onPress={() => handleToggleEquipment(eq.type)}
                  iconName={eq.iconName as any}
                />
              ))}
            </ScrollView>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={resetFilters}
              style={styles.resetFiltersBtn}
            >
              <Ionicons name="refresh" size={14} color="#EF4444" />
              <Text style={styles.resetFiltersText}>Đặt lại bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Results Header Count */}
      <View style={styles.resultsInfoRow}>
        <Text style={styles.resultsCountText}>
          Tìm thấy <Text style={styles.resultsBold}>{filteredRooms.length}</Text> phòng học phù hợp
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={resetFilters}>
            <Text style={styles.resetTextLink}>Xóa lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 60fps High-Performance Room FlatList */}
      <FlatList
        data={filteredRooms}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        initialNumToRender={5}
        maxToRenderPerBatch={5}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={56} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không tìm thấy phòng phù hợp</Text>
            <Text style={styles.emptySubtitle}>
              Thử tìm kiếm với từ khóa khác hoặc điều chỉnh lại các tiêu chí bộ lọc.
            </Text>
            <TouchableOpacity
              style={styles.emptyResetBtn}
              onPress={resetFilters}
            >
              <Text style={styles.emptyResetBtnText}>Xem tất cả phòng</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterToggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterToggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  filterBadgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  clearBtn: {
    padding: 4,
  },
  buildingFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
  },
  expandedFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  filterSection: {
    marginTop: 10,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  chipRow: {
    paddingVertical: 2,
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 6,
  },
  resetFiltersText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  resultsCountText: {
    fontSize: 13,
    color: '#64748B',
  },
  resultsBold: {
    fontWeight: '700',
    color: '#0F172A',
  },
  resetTextLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#2563EB',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
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
    marginBottom: 20,
  },
  emptyResetBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
