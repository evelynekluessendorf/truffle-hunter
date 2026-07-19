import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF', paddingTop: insets.top, paddingBottom: insets.bottom }}>

      {/* Top content — logo + wordmark + tagline */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 48 }}>
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 56, fontWeight: '900', color: '#000FE1', letterSpacing: -1, marginTop: 8 }}>MEEX</Text>
        <Text style={{ fontSize: 18, color: '#000FE1', fontWeight: '500', marginTop: 4 }}>Designed to be closed.</Text>
      </View>

      {/* Bottom — fine print + buttons */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 12 }}>
        <Text style={{ fontSize: 13, color: '#000FE1', textAlign: 'center', lineHeight: 20, marginBottom: 4 }}>
          University email required - 18+{'\n'}- Always free for students.
        </Text>

        {/* Register — outlined */}
        <TouchableOpacity
          onPress={() => navigation.navigate('About')}
          activeOpacity={0.85}
          style={{ height: 56, borderRadius: 12, borderWidth: 2, borderColor: '#000FE1', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#000FE1' }}>Register</Text>
        </TouchableOpacity>

        {/* Log In — filled */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Registration2', { mode: 'login' })}
          activeOpacity={0.85}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>Log In</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
