import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, FontFamily, Spacing } from '../constants/theme';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'About'>;

export default function AboutScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: Colors.white }}
      >
        <View style={{ paddingTop: insets.top }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <RegistrationProgressBar step={0} />

          <View style={styles.logoSection}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.wordmark}>MEEX</Text>
            <Text style={styles.tagline}>Designed to be closed.</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.body}>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Be there</Text>
              <Text style={styles.blockBody}>let the people around you know you're open</Text>
            </View>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>We'll slide you a killer opener</Text>
              <Text style={styles.blockBody}>tailored to who they actually are</Text>
            </View>
            <View style={styles.block}>
              <Text style={styles.blockTitle}>Off you go</Text>
              <Text style={styles.blockBody}>seriously, put the phone down, we mean it</Text>
            </View>
            <Text style={styles.quote}>
              "The best connections happen when you look up from your phone, and enjoy reality."
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.nextBtn}
            onPress={() => navigation.navigate('Registration1', {})}
            activeOpacity={0.85}
          >
            <View style={styles.nextRow}>
              <Text style={styles.nextText}>Next</Text>
              <Text style={styles.nextArrow}>→</Text>
            </View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { paddingHorizontal: Spacing.screen, paddingVertical: 12 },
  backText: { fontSize: FontSize.body, color: Colors.body, fontWeight: '500' },
  scroll: { paddingBottom: 16 },
  logoSection: { alignItems: 'center', paddingHorizontal: Spacing.screen, paddingTop: 24, paddingBottom: 24 },
  logo: { width: 120, height: 120, alignSelf: 'center', marginBottom: 8 },
  wordmark: {
    fontFamily: FontFamily.brand,
    fontSize: 72,
    color: Colors.brand,
    letterSpacing: -2,
    lineHeight: 76,
    alignSelf: 'stretch',
    marginBottom: 6,
  },
  tagline: { fontSize: FontSize.body, fontWeight: '400', color: Colors.brand, alignSelf: 'flex-start' },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.screen, marginBottom: 28 },
  body: { paddingHorizontal: Spacing.screen },
  block: { marginBottom: 28 },
  blockTitle: {
    fontSize: FontSize.sectionHeader,
    fontWeight: '600',
    color: Colors.body,
    letterSpacing: LetterSpacing.sectionHeader,
    marginBottom: 8,
  },
  blockBody: { fontSize: FontSize.body, fontWeight: '400', color: Colors.muted, lineHeight: 24 },
  quote: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.muted,
    fontStyle: 'italic',
    lineHeight: 24,
    marginTop: 4,
    marginBottom: 8,
  },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 12, backgroundColor: Colors.white },
  nextBtn: {
    height: 56,
    backgroundColor: Colors.brand,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextText: { color: Colors.white, fontWeight: '600', fontSize: FontSize.body, includeFontPadding: false },
  nextArrow: { color: Colors.white, fontWeight: '600', fontSize: FontSize.body, includeFontPadding: false, lineHeight: 20 },
});
