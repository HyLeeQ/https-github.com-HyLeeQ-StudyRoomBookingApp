import { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  ExploreTab: undefined;
  MyBookingsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  RoomDetail: { roomId: string };
  Booking: { roomId: string; date: string; slotId: string };
  BookingSuccess: { bookingId: string };
};
