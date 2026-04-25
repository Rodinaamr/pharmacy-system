import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PharmacyProvider } from './src/context/PharmacyContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PharmacyProvider>
          <StatusBar style="light" backgroundColor="#2E7D32" />
          <AppNavigator />
        </PharmacyProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
