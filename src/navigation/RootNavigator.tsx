import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { RoomDetailScreen } from '../screens/RoomDetailScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen
          name="RoomDetail"
          component={RoomDetailScreen}
          options={{
            animation: 'default',
          }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="BookingSuccess"
          component={BookingSuccessScreen}
          options={{
            gestureEnabled: false,
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
