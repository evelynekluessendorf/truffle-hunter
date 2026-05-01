import 'react-native-gesture-handler';
import React from 'react';
import { useFonts, AsapCondensed_700Bold } from '@expo-google-fonts/asap-condensed';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import UserProfileScreen from './src/screens/UserProfileScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import Registration1Screen from './src/screens/Registration1Screen';
import RegistrationVerificationScreen from './src/screens/RegistrationVerificationScreen';
import Registration2Screen from './src/screens/Registration2Screen';
import RegistrationFactsScreen from './src/screens/RegistrationFactsScreen';
import RegistrationInterestsScreen from './src/screens/RegistrationInterestsScreen';
import ShoutOutScreen from './src/screens/ShoutOutScreen';
import OpenerScreen from './src/screens/OpenerScreen';
import { RootStackParamList } from './src/types';
import { UserProvider } from './src/context/UserContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({ AsapCondensed_700Bold });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Registration1" component={Registration1Screen} />
            <Stack.Screen name="RegistrationVerification" component={RegistrationVerificationScreen} />
            <Stack.Screen name="Registration2" component={Registration2Screen} />
            <Stack.Screen name="RegistrationFacts" component={RegistrationFactsScreen} />
            <Stack.Screen name="RegistrationInterests" component={RegistrationInterestsScreen} />
            <Stack.Screen name="ShoutOut" component={ShoutOutScreen} />
            <Stack.Screen name="Opener" component={OpenerScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="auto" />
      </SafeAreaProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
