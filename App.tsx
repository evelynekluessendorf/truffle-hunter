import 'react-native-gesture-handler';
import React from 'react';
import { useFonts, AsapCondensed_700Bold } from '@expo-google-fonts/asap-condensed';
import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import UserProfileScreen from './src/screens/UserProfileScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AboutScreen from './src/screens/AboutScreen';
import { Registration1Screen } from './src/screens/Registration1Screen';
import RegistrationVerificationScreen from './src/screens/RegistrationVerificationScreen';
import { Registration2Screen } from './src/screens/Registration2Screen';
import Registration3Screen from './src/screens/Registration3Screen';
import Registration4Screen from './src/screens/Registration4Screen';
import Registration5Screen from './src/screens/Registration5Screen';
import RegistrationConfirmationScreen from './src/screens/RegistrationConfirmationScreen';
import RegistrationFactsScreen from './src/screens/RegistrationFactsScreen';
import RegistrationInterestsScreen from './src/screens/RegistrationInterestsScreen';
import ShoutOutScreen from './src/screens/ShoutOutScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OpenerScreen from './src/screens/OpenerScreen';
import { RootStackParamList } from './src/types';
import { UserProvider, useUser } from './src/context/UserContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function Registration1ScreenWrapper({ navigation }: NativeStackScreenProps<RootStackParamList, 'Registration1'>) {
  const { setRegistrationDraft } = useUser();
  return (
    <Registration1Screen
      onNext={({ username, domain }) => {
        setRegistrationDraft({ email: `${username}${domain}` });
        navigation.navigate('Registration2');
      }}
      onBack={() => navigation.goBack()}
    />
  );
}

function Registration2ScreenWrapper({ navigation, route }: NativeStackScreenProps<RootStackParamList, 'Registration2'>) {
  // Logging in skips the rest of registration — verify, then straight to the toggle screen.
  const isLogin = route.params?.mode === 'login';
  return (
    <Registration2Screen
      onNext={() =>
        isLogin
          ? navigation.replace('Main', { screen: 'Home' })
          : navigation.navigate('Registration3')
      }
      onBack={() => navigation.goBack()}
      showProgress={!isLogin}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    AsapCondensed_700Bold,
    Fredoka_600SemiBold,
    Fredoka_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="Registration1" component={Registration1ScreenWrapper} />
            <Stack.Screen name="RegistrationVerification" component={RegistrationVerificationScreen} />
            <Stack.Screen name="Registration2" component={Registration2ScreenWrapper} />
            <Stack.Screen name="Registration3" component={Registration3Screen} />
            <Stack.Screen name="Registration4" component={Registration4Screen} />
            <Stack.Screen name="Registration5" component={Registration5Screen} />
            <Stack.Screen name="RegistrationConfirmation" component={RegistrationConfirmationScreen} />
            <Stack.Screen name="RegistrationFacts" component={RegistrationFactsScreen} />
            <Stack.Screen name="RegistrationInterests" component={RegistrationInterestsScreen} />
            <Stack.Screen name="ShoutOut" component={ShoutOutScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Opener" component={OpenerScreen} />
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="UserProfile" component={UserProfileScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        </BottomSheetModalProvider>
        <StatusBar style="auto" />
      </SafeAreaProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
