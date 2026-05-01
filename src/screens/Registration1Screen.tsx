import React from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import RegistrationProgressBar from '../components/RegistrationProgressBar';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration1'>;

export default function Registration1Screen({ navigation, route }: Props) {
  const isLogin = route.params?.mode === 'login';
  const { registrationDraft, setRegistrationDraft } = useUser();
  const insets = useSafeAreaInsets();
  const email = registrationDraft.email;
  const setEmail = (v: string) => setRegistrationDraft({ email: v });
  const canProceed = email.trim().length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <RegistrationProgressBar step={1} />

        <View style={styles.badge}>
          <Text style={styles.badgeText}>💡 .edu email only</Text>
        </View>

        <Text style={styles.heading}>Provide university email</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>UNIVERSITY EMAIL*</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="maya.chen@georgetown.edu"
            placeholderTextColor="#BBADA5"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={() => canProceed && navigation.navigate('RegistrationVerification', { mode: isLogin ? 'login' : undefined })}
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
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,14,225,0.08)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginTop: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: FontSize.caption,
    color: Colors.brand,
    fontWeight: '600',
    letterSpacing: LetterSpacing.caption,
  },
  heading: {
    fontSize: FontSize.displayMedium,
    fontWeight: '600',
    color: Colors.body,
    lineHeight: 36,
    marginBottom: 10,
    letterSpacing: LetterSpacing.displayMedium,
    fontFamily: FontFamily.brand,
  },
  fieldGroup: { marginBottom: 24 },
  label: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    height: 52,
    backgroundColor: Colors.white,
    borderRadius: Radius.button,
    paddingHorizontal: Spacing.card,
    fontSize: FontSize.body,
    color: Colors.body,
    borderWidth: 1,
    borderColor: Colors.border,
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
