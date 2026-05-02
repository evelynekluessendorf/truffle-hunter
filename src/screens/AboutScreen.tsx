import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, AsapCondensed_700Bold } from '@expo-google-fonts/asap-condensed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ AsapCondensed_700Bold });
  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={{ height: 3, backgroundColor: '#E0E0E0', borderRadius: 2 }}>
          <View style={{ width: '15%', height: 3, backgroundColor: '#000FE1', borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16 }}>
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Image source={require('../../assets/logo.png')} style={{ width: 120, height: 120 }} resizeMode="contain" />
        </View>

        <Text style={{ fontFamily: 'AsapCondensed_700Bold', fontSize: 52, color: '#000FE1', letterSpacing: -2, marginLeft: -4, lineHeight: 56 }}>MEEX</Text>

        <Text style={{ fontSize: 15, color: '#000FE1', marginTop: 2, marginBottom: 16 }}>Designed to be closed.</Text>

        <View style={{ height: 1, backgroundColor: '#EF4514', marginBottom: 24 }} />

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: 'AsapCondensed_700Bold', fontSize: 22, color: '#000FE1', marginBottom: 4 }}>Be open and curious</Text>
          <Text style={{ fontSize: 15, color: '#111111', lineHeight: 22 }}>People around you are set as available and they are up for a chat.</Text>
        </View>

        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontFamily: 'AsapCondensed_700Bold', fontSize: 22, color: '#000FE1', marginBottom: 4 }}>We'll slide you a killer opener</Text>
          <Text style={{ fontSize: 15, color: '#111111', lineHeight: 22 }}>We'll help you with the first step.</Text>
        </View>

        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontFamily: 'AsapCondensed_700Bold', fontSize: 22, color: '#000FE1', marginBottom: 4 }}>Off you go!</Text>
          <Text style={{ fontSize: 15, color: '#111111', lineHeight: 22 }}>Seriously. Put the phone down and start talking. The best part is coming next.</Text>
        </View>

        <Text style={{ fontSize: 14, color: '#888888', fontStyle: 'italic', textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 }}>
          The best connections happen when you look up from your phone, and enjoy reality.
        </Text>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Registration1', { mode: 'register' })}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
