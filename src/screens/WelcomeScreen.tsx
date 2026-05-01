import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, AsapCondensed_700Bold } from '@expo-google-fonts/asap-condensed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ AsapCondensed_700Bold });
  const [registerPressed, setRegisterPressed] = useState(false);
  const [loginPressed, setLoginPressed] = useState(false);

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#000FE1' }}>
      <View style={{
        flex: 1,
        backgroundColor: '#FFFFFF',
        marginHorizontal: 4,
        paddingTop: insets.top + 32,
        paddingBottom: insets.bottom,
        overflow: 'hidden',
      }}>

        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>

        <View style={{ width: '100%', overflow: 'hidden' }}>
          <Text
            style={{
              fontFamily: 'AsapCondensed_700Bold',
              fontSize: 200,
              color: '#000FE1',
              lineHeight: 210,
              marginLeft: -20,
              letterSpacing: -3,
            }}
          >
            MEEX
          </Text>
        </View>

        <Text style={{
          fontSize: 16,
          fontWeight: '400',
          color: '#000FE1',
          textAlign: 'center',
          marginTop: 8,
        }}>
          Designed to be closed.
        </Text>

        <View style={{ flex: 1 }} />

        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20, gap: 12 }}>

          <TouchableOpacity
            onPressIn={() => setRegisterPressed(true)}
            onPressOut={() => setRegisterPressed(false)}
            onPress={() => navigation.navigate('About')}
            activeOpacity={1}
            style={{
              height: 56,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#000FE1',
              backgroundColor: registerPressed ? '#000FE1' : '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontWeight: '600',
              fontSize: 16,
              color: registerPressed ? '#FFFFFF' : '#000FE1',
            }}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPressIn={() => setLoginPressed(true)}
            onPressOut={() => setLoginPressed(false)}
            onPress={() => navigation.navigate('Registration1', { mode: 'login' })}
            activeOpacity={1}
            style={{
              height: 56,
              borderRadius: 12,
              borderWidth: 1.5,
              borderColor: '#000FE1',
              backgroundColor: loginPressed ? '#FFFFFF' : '#000FE1',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              fontWeight: '600',
              fontSize: 16,
              color: loginPressed ? '#000FE1' : '#FFFFFF',
            }}>Log In</Text>
          </TouchableOpacity>

          <Text style={{
            textAlign: 'center',
            fontSize: 12,
            fontWeight: '400',
            color: 'rgba(0,14,225,0.45)',
            letterSpacing: 0.2,
            marginTop: 4,
          }}>
            University email required - 18+ - Always free for students.
          </Text>

        </View>
      </View>
    </View>
  );
}
