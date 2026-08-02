import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ExpoClipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import BackButton from '../components/BackButton';

// Truffle Hunter design tokens — .claude/skills/truffle-hunter-design/SKILL.md
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

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationVerification'>;

function generateCode(): string {
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      behavior="padding"
      keyboardVerticalOffset={0}>

      <View style={{ paddingTop: insets.top, paddingHorizontal: 24 }}>
        <BackButton onPress={() => navigation.goBack()} style={{ paddingVertical: 12 }} />
        <View
          style={{
            width: '100%', maxWidth: 320, alignSelf: 'center',
            height: 3, backgroundColor: '#E0E0E0', borderRadius: 2,
          }}>
          <View style={{ width: '35%', height: 3, backgroundColor: COLORS.accentCoral, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Text style={{ fontSize: 28, fontWeight: '700', color: COLORS.keylinePurple, lineHeight: 34, marginBottom: 10 }}>
          Account verification
        </Text>
        <Text style={{ fontSize: 15, fontWeight: '400', color: '#444444', lineHeight: 22, marginBottom: 28 }}>
          We'll send you 6-digit code to your phone to confirm it's really you
        </Text>

        <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.keylinePurple, marginBottom: 10 }}>
          Your Phone Number*:
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          <TextInput
            ref={phoneRef}
            style={{
              flex: 65, height: 52, backgroundColor: '#FFFFFF', borderRadius: 10,
              paddingHorizontal: 14, fontSize: 16, color: COLORS.keylinePurple,
              borderWidth: 1, borderColor: '#D0D0D0',
            }}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1 (555) 000-000"
            placeholderTextColor="#BBADA5"
            keyboardType="phone-pad"
          />
          <TouchableOpacity
            onPress={handleSendCode}
            style={{
              flex: 35, height: 52, borderRadius: 10,
              borderWidth: 1.5, borderColor: COLORS.accentCoral,
              alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
            }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.accentCoral }}>Send code</Text>
          </TouchableOpacity>
        </View>

        <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.keylinePurple, marginBottom: 10 }}>
          Your Verification Code*:
        </Text>
        <View ref={verifyRef}>
          <TextInput
            ref={codeInputRef}
            style={{
              height: 52, backgroundColor: '#FFFFFF', borderRadius: 10,
              paddingHorizontal: 14, fontSize: 20, color: COLORS.keylinePurple,
              borderWidth: 1, borderColor: '#D0D0D0', letterSpacing: 6,
            }}
            value={code}
            onChangeText={t => setCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="######"
            placeholderTextColor="#BBADA5"
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            maxLength={6}
          />
        </View>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: insets.bottom + 8, backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={() =>
            canProceed && (isLogin ? navigation.replace('Main') : navigation.navigate('Registration2'))
          }
          activeOpacity={canProceed ? 0.85 : 1}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            opacity: canProceed ? 1 : 0.5,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
