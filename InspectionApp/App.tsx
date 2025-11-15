/**
 * Главный компонент приложения
 * React Native (Expo) приложение для структурированной фотофиксации
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { RootStackParamList } from './src/types';

// Экраны
import MainScreen from './src/screens/MainScreen';
import PhotoCameraScreen from './src/screens/PhotoCameraScreen';
import AudioRecordingScreen from './src/screens/AudioRecordingScreen';
import VideoModeScreen from './src/screens/VideoModeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Main"
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="Main"
            component={MainScreen}
          />
          <Stack.Screen
            name="PhotoCamera"
            component={PhotoCameraScreen}
          />
          <Stack.Screen
            name="AudioRecording"
            component={AudioRecordingScreen}
          />
          <Stack.Screen
            name="VideoMode"
            component={VideoModeScreen}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
