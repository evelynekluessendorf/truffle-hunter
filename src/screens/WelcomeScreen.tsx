import React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Truffle Hunter colors
const COLORS = {
  piggyPink: '#FFB0C7',
  piggyPinkBright: '#FF7D9E',
  keylinePurple: '#201642',
  cream: '#FAF9F6',
  accentCoral: '#FF6B35',
  accentCoralLight: '#FFF0EB',
  sunnyYellow: '#FFF1C6',
  sunnyYellowBright: '#E8A33D',
};

const hardShadow = '3px 3px 0px rgba(32,22,66,0.18)';

const { width: screenWidth } = Dimensions.get('window');
const PIG_ASPECT = 1388 / 1020;
const pigWidth = screenWidth * 0.65;
const pigHeight = pigWidth * PIG_ASPECT;

export default function WelcomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream, paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <View style={{ alignItems: 'center', paddingTop: 56 }}>
        <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
          Truffle Hunter
        </Text>
        <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.accentCoral, marginTop: 4 }}>
          Designed to be closed
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'center' }}>
        <Image
          source={require('../assets/illustrations/welcome-pig.png')}
          style={{ width: pigWidth, height: pigHeight, marginLeft: -pigWidth * 0.12 }}
          resizeMode="contain"
        />
      </View>

      <View style={{ paddingHorizontal: 24, paddingBottom: 16, gap: 12 }}>
        <Text
          style={{
            fontSize: 11,
            fontFamily: 'PlusJakartaSans_400Regular',
            color: '#999',
            textAlign: 'center',
            lineHeight: 20,
            marginBottom: 4,
          }}>
          University email required - 18+{'\n'}- Always free for students.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('About')}
          activeOpacity={0.85}
          style={{
            height: 48,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: COLORS.keylinePurple,
            backgroundColor: 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hardShadow,
          } as any}>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
            Register
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Registration2', { mode: 'login' })}
          activeOpacity={0.85}
          style={{
            height: 48,
            borderRadius: 24,
            backgroundColor: COLORS.accentCoral,
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hardShadow,
          } as any}>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
