import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from './types';
import { RoomListScreen } from '../screens/RoomListScreen';
import { MyBookingsScreen } from '../screens/MyBookingsScreen';
import { useBookingStore } from '../store/useBookingStore';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const TabNavigator: React.FC = () => {
  const { getUserBookings } = useBookingStore();
  const activeBookingsCount = getUserBookings().filter((b) => b.status === 'active').length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="ExploreTab"
        component={RoomListScreen}
        options={{
          tabBarLabel: 'Khám phá phòng',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'business' : 'business-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MyBookingsTab"
        component={MyBookingsScreen}
        options={{
          tabBarLabel: 'Đặt chỗ của tôi',
          tabBarBadge: activeBookingsCount > 0 ? activeBookingsCount : undefined,
          tabBarBadgeStyle: styles.tabBadge,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    paddingTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});
