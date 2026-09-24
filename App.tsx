import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { requestNotificationPermission } from './src/utils/notificationHelpers';

export default function App() {
  useEffect(() => {
    // Request notification permission when user launches app for the first time
    const initApp = async () => {
      try {
        await requestNotificationPermission();
      } catch (err) {
        console.warn('[App] Could not initialize notification permissions:', err);
      }
    };

    initApp();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
