export type BuildingCode = 'A' | 'B' | 'C' | 'V';

export type EquipmentType = 'projector' | 'whiteboard' | 'high_spec_pc' | 'ac';

export type RoomStatus = 'available' | 'occupied';

export interface Room {
  id: string;
  name: string;
  building: BuildingCode;
  floor: number;
  capacity: number;
  equipment: EquipmentType[];
  photoUrl: string;
  status: RoomStatus; // trạng thái hiện tại (real-time)
  description?: string;
}
