import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ExpoClipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationVerification'>;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function RegistrationVerificationScreen({ navigation, route }: Props) {
  const isLogin = route.params?.mode === 'login';
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const verifyRef = useRef<View>(null);
  const phoneRef = useRef<TextInput>(null);
  const codeInputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => phoneRef.current?.focus(), 400);
    return () => clearTimeout(timer);
  }, []);

  const canProceed = sentCode !== null && code.trim().length === 6;

  const handleSendCode = () => {
    if (!phone.trim()) {
      Alert.alert('Enter your phone number', 'Please enter your phone number first.');
      return;
    }
    const newCode = generateCode();
    setSentCode(newCode);
    setTimeout(() => {
      verifyRef.current?.measureLayout(
        scrollRef.current as any,
        (_x, y) => scrollRef.current?.scrollTo({ y: y - 16, animated: true }),
        () => {}
      );
      setTimeout(() => codeInputRef.current?.focus(), 300);
    }, 150);
    Alert.alert(
      '📱 New Message',
      `From: MEEX\n\nYour MEEX verification code is:\n\n${newCode}\n\nDo not share this code with anyone.`,
      [
        {
          text: 'Copy Code',
          onPress: async () => {
            await ExpoClipboard.setStringAsync(newCode);
            Alert.alert('Copied!', 'Paste it into the verification code field.');
          },
        },
        { text: 'OK' },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <RegistrationProgressBar step={2} />

        <Text style={styles.heading}>Verify your account</Text>
        <Text style={styles.subheading}>
          We'll send a 6-digit code to your phone to confirm it's really you.
        </Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>YOUR PHONE NUMBER*</Text>
          <TextInput
            ref={phoneRef}
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-0000"
            placeholderTextColor="#BBADA5"
            keyboardType="phone-pad"
          />
          <TouchableOpacity onPress={handleSendCode} style={styles.sendBtn}>
            <Text style={styles.sendBtnText}>Send verification code</Text>
          </TouchableOpacity>
        </View>

        <View ref={verifyRef} style={styles.verifySection}>
          <Text style={styles.label}>YOUR VERIFICATION CODE</Text>
          <TextInput
            ref={codeInputRef}
            style={styles.phoneInput}
            value={code}
            onChangeText={t => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder=""
            placeholderTextColor="#BBADA5"
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={() => canProceed && (isLogin ? navigation.replace('Main') : navigation.navigate('Registration2'))}
          activeOpacity={canProceed ? 0.85 : 1}
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
  scroll: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: 16,
  },
  heading: {
    fontSize: FontSize.displayMedium,
    fontWeight: '600',
    color: Colors.body,
    lineHeight: 36,
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: LetterSpacing.displayMedium,
    fontFamily: FontFamily.brand,
  },
  subheading: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.coral,
    lineHeight: 24,
    marginBottom: 32,
  },
  fieldGroup: { marginBottom: 24 },
  verifySection: { marginBottom: 16 },
  label: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  phoneInput: {
    height: 44,
    backgroundColor: Colors.white,
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.card,
    fontSize: FontSize.body,
    color: Colors.body,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '60%',
  },
  sendBtn: {
    marginTop: 14,
    height: 46,
    backgroundColor: Colors.brand,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  sendBtnText: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: LetterSpacing.body,
    includeFontPadding: false,
  },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: 12,
    backgroundColor: Colors.white,
  },
  nextBtn: {
    height: 56,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnDisabled: { backgroundColor: Colors.brand, opacity: 0.4 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false },
  nextArrow: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false, lineHeight: 20 },
});
