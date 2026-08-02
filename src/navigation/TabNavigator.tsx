import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Image, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import { RootTabParamList } from '../types';

// Truffle Hunter colors
const COLORS = {
  keylinePurple: '#201642',
  cream: '#FAF9F6',
  accentCoral: '#FF6B35',
  iconInactive: '#6B7280',
  labelInactive: '#A4A4A4',
};

const ICONS = {
  Home: require('../assets/TapBar/Home.png'),
  Discover: require('../assets/TapBar/Discover.png'),
  Profile: require('../assets/TapBar/USer.png'),
};

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabItem({ label, icon, focused }: { label: string; icon: any; focused: boolean }) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'flex-start', minWidth: 88, paddingHorizontal: 4 }}>
      <Image
        source={icon}
        style={{
          width: 26,
          height: 26,
          tintColor: focused ? COLORS.keylinePurple : COLORS.iconInactive,
        }}
        resizeMode="contain"
      />
      <Text
        numberOfLines={1}
        style={{
          marginTop: 6,
          fontSize: 11,
          fontFamily: 'Fredoka_700Bold',
          color: focused ? COLORS.keylinePurple : COLORS.labelInactive,
          textAlign: 'center',
        }}>
        {label}
      </Text>
      <View
        style={{
          marginTop: 6,
          width: 56,
          height: 5,
          borderRadius: 3,
          backgroundColor: focused ? COLORS.accentCoral : 'transparent',
        }}
      />
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom;
  const tabBarHeight = 78 + bottomPadding;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 0,
          height: tabBarHeight,
          paddingTop: 10,
          paddingBottom: bottomPadding,
        },
        tabBarItemStyle: {
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingHorizontal: 4,
        },
        // the icon slot hosts the whole item (icon + label + indicator), so let it
        // take the full item width — otherwise a narrow slot wraps the label text
        tabBarIconStyle: { width: '100%', height: 'auto', flex: 1 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem label="Home" icon={ICONS.Home} focused={focused} /> }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem label="Discover" icon={ICONS.Discover} focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={MyProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabItem label="Profile" icon={ICONS.Profile} focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}
