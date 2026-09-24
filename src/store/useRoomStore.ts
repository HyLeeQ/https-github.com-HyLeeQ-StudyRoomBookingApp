import { create } from 'zustand';
import { Room } from '../types/room';
import { MOCK_ROOMS } from '../api/rooms';
import { FilterState } from './useBookingStore';
import { CAPACITY_OPTIONS } from '../constants/buildings';

interface RoomStoreState {
  rooms: Room[];
  selectedRoom: Room | null;
  isLoading: boolean;

  // Actions
  setSelectedRoom: (room: Room | null) => void;
  getRoomById: (id: string) => Room | undefined;
  updateRoomStatus: (roomId: string, status: 'available' | 'occupied') => void;
  getFilteredRooms: (filters: FilterState) => Room[];
}

export const useRoomStore = create<RoomStoreState>((set, get) => ({
  // Seed with comprehensive mock VKU campus rooms
  // ARCHITECTURE NOTE: In production with backend, this connects to a WebSocket / Supabase Realtime / Firebase
  // e.g.:
  // const socket = io(WS_URL);
  // socket.on('room_status_changed', ({ roomId, status }) => updateRoomStatus(roomId, status));
  rooms: MOCK_ROOMS,
  selectedRoom: null,
  isLoading: false,

  setSelectedRoom: (room) => set({ selectedRoom: room }),

  getRoomById: (id) => {
    return get().rooms.find((r) => r.id === id);
  },

  updateRoomStatus: (roomId, status) => {
    set((state) => ({
      rooms: state.rooms.map((room) =>
        room.id === roomId ? { ...room, status } : room
      ),
    }));
  },

  getFilteredRooms: (filters: FilterState) => {
    const { rooms } = get();

    return rooms.filter((room) => {
      // 1. Search Query (Name, Building, or Description)
      if (filters.searchQuery.trim().length > 0) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesName = room.name.toLowerCase().includes(query);
        const matchesDesc = (room.description || '').toLowerCase().includes(query);
        const matchesBuilding = `khu ${room.building}`.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBuilding) {
          return false;
        }
      }

      // 2. Building Filter
      if (filters.building !== 'ALL' && room.building !== filters.building) {
        return false;
      }

      // 3. Capacity Bucket Filter
      if (filters.capacityRangeId !== 'all') {
        const option = CAPACITY_OPTIONS.find((c) => c.id === filters.capacityRangeId);
        if (option) {
          if (room.capacity < option.min || room.capacity > option.max) {
            return false;
          }
        }
      }

      // 4. Equipment Filter (Multi-select: Room must have ALL selected equipment)
      if (filters.equipment.length > 0) {
        const hasAllEquipment = filters.equipment.every((eq) =>
          room.equipment.includes(eq)
        );
        if (!hasAllEquipment) {
          return false;
        }
      }

      return true;
    });
  },
}));
