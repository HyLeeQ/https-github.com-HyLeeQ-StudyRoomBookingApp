import { BuildingCode, EquipmentType } from '../types/room';

export interface BuildingInfo {
  code: BuildingCode;
  name: string;
  description: string;
}

export const BUILDINGS: BuildingInfo[] = [
  { code: 'A', name: 'Khu A', description: 'Tòa nhà Hành chính & Giảng đường A' },
  { code: 'B', name: 'Khu B', description: 'Khu Giảng đường & Phòng học nhóm B' },
  { code: 'C', name: 'Khu C', description: 'Khu Lab Máy tính & Phòng hội thảo C' },
  { code: 'V', name: 'Khu V', description: 'Tòa nhà Đổi mới Sáng tạo & MakerSpace' },
];

export interface EquipmentInfo {
  type: EquipmentType;
  label: string;
  iconName: string;
}

export const EQUIPMENT_LIST: EquipmentInfo[] = [
  { type: 'projector', label: 'Máy chiếu HD', iconName: 'projector-screen-outline' },
  { type: 'whiteboard', label: 'Bảng viết dạ', iconName: 'presentation' },
  { type: 'high_spec_pc', label: 'PC cấu hình cao', iconName: 'desktop-tower-monitor' },
  { type: 'ac', label: 'Điều hòa 2 chiều', iconName: 'air-conditioner' },
];

export interface CapacityFilterOption {
  id: string;
  label: string;
  min: number;
  max: number;
}

export const CAPACITY_OPTIONS: CapacityFilterOption[] = [
  { id: 'all', label: 'Tất cả', min: 0, max: 100 },
  { id: 'small', label: 'Nhỏ (2 - 6 chỗ)', min: 2, max: 6 },
  { id: 'medium', label: 'Vừa (7 - 15 chỗ)', min: 7, max: 15 },
  { id: 'large', label: 'Lớn (16 - 40 chỗ)', min: 16, max: 40 },
];
