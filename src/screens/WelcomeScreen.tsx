import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, AsapCondensed_700Bold } from '@expo-google-fonts/asap-condensed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const { width } = Dimensions.get('window');
const SPLIT = 56;

export default function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [fontsLoaded] = useFonts({ AsapCondensed_700Bold });

  if (!fontsLoaded) return null;

  return (
    <View style={{ flex: 1 }}>
      {/* Blue left panel */}
      <View style={[StyleSheet.absoluteFillObject, { width: SPLIT, backgroundColor: '#000FE1' }]} />
      {/* White right panel */}
      <View style={[StyleSheet.absoluteFillObject, { left: SPLIT, backgroundColor: '#FFFFFF' }]} />

      <View style={{ flex: 1, paddingTop: insets.top + 16 }}>

        {/* Logo — centered on white area */}
        <View style={{ alignItems: 'center', marginBottom: 6 }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: 110, height: 110 }}
            resizeMode="contain"
          />
        </View>

        {/* MEEX — two overlapping texts clipped at SPLIT */}
        <View style={{ height: 90, overflow: 'hidden' }}>
          <Text style={[styles.meex, { color: '#FFFFFF', position: 'absolute' }]}
            numberOfLines={1}>MEEX</Text>
          <Text style={[styles.meex, { color: '#000FE1', position: 'absolute', left: SPLIT }]}
            numberOfLines={1}>MEEX</Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>Designed to be closed.</Text>

        <View style={{ flex: 1 }} />

        {/* Buttons */}
        <View style={{ paddingHorizontal: 8, paddingBottom: insets.bottom + 16, gap: 10 }}>

          {/* Register: blue left | white right */}
          <TouchableOpacity
            onPress={() => navigation.navigate('About')}
            activeOpacity={0.85}
            style={styles.btnWrap}>
            <View style={[styles.btnLeft, { backgroundColor: '#000FE1' }]} />
            <View style={[styles.btnRight, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.btnBorder, { borderColor: '#000FE1' }]} />
            <Text style={[styles.btnLabelLeft, { color: '#FFFFFF' }]}>Register</Text>
            <Text style={[styles.btnLabelRight, { color: '#000FE1' }]}>Register</Text>
          </TouchableOpacity>

          {/* Log In: white left | blue right */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Registration1', { mode: 'login' })}
            activeOpacity={0.85}
            style={styles.btnWrap}>
            <View style={[styles.btnLeft, { backgroundColor: '#FFFFFF' }]} />
            <View style={[styles.btnRight, { backgroundColor: '#000FE1' }]} />
            <View style={[styles.btnBorder, { borderColor: '#FFFFFF' }]} />
            <Text style={[styles.btnLabelLeft, { color: '#000FE1' }]}>Log In</Text>
            <Text style={[styles.btnLabelRight, { color: '#FFFFFF' }]}>Log In</Text>
          </TouchableOpacity>

          <Text style={styles.micro}>University email required - 18+ - Always free for students.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  meex: {
    fontFamily: 'AsapCondensed_700Bold',
    fontSize: 96,
    lineHeight: 96,
    letterSpacing: -3,
    left: 0,
    top: 0,
  },
  tagline: {
    fontFamily: 'AsapCondensed_700Bold',
    fontSize: 16,
    color: '#000FE1',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
  },
  btnWrap: {
    position: 'relative',
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
  },
  btnLeft: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: SPLIT,
  },
  btnRight: {
    position: 'absolute',
    left: SPLIT, right: 0, top: 0, bottom: 0,
  },
  btnBorder: {
    position: 'absolute',
    inset: 0,
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 12,
    borderWidth: 2,
  },
  btnLabelLeft: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  btnLabelRight: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  micro: {
    fontSize: 11,
    color: 'rgba(0,14,225,0.45)',
    textAlign: 'center',
    marginTop: 4,
  },
});
