import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, AsapCondensed_700Bold } from '@expo-google-fonts/asap-condensed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width } = Dimensions.get('window');

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
      }}>

        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>

        <Text style={{
          fontFamily: 'AsapCondensed_700Bold',
          fontSize: width * 0.45,
          color: '#000FE1',
          marginLeft: -4,
          letterSpacing: -3,
          lineHeight: width * 0.48,
        }}>
          MEEX
        </Text>

        <Text style={{
          fontSize: 17,
          color: '#000FE1',
          textAlign: 'center',
          marginTop: 8,
          fontWeight: '400',
        }}>
          Designed to be closed.
        </Text>

        <View style={{ flex: 1 }} />

        <View style={{
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 16,
          paddingTop: 8,
          gap: 12,
        }}>
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
            fontSize: 11,
            color: 'rgba(0,14,225,0.45)',
            marginTop: 2,
          }}>
            University email required - 18+ - Always free for students.
          </Text>
        </View>
      </View>
    </View>
  );
}
