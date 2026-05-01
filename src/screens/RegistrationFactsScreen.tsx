import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import { useUser } from '../context/UserContext';
import RegistrationProgressBar from '../components/RegistrationProgressBar';

const SOCIAL_PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', placeholder: '@username' },
  { key: 'tiktok'    as const, label: 'TikTok',    placeholder: '@username' },
  { key: 'facebook'  as const, label: 'Facebook',  placeholder: 'username or profile name' },
];
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationFacts'>;

export default function RegistrationFactsScreen({ navigation }: Props) {
  const { setSocialLinks, registrationDraft, setRegistrationDraft } = useUser();
  const insets = useSafeAreaInsets();
  const facts = registrationDraft.facts;
  const setFacts = (updater: string[] | ((prev: string[]) => string[])) =>
    setRegistrationDraft({ facts: typeof updater === 'function' ? updater(registrationDraft.facts) : updater });
  const social = registrationDraft.social;
  const setSocial = (updater: typeof social | ((prev: typeof social) => typeof social)) =>
    setRegistrationDraft({ social: typeof updater === 'function' ? updater(registrationDraft.social) : updater });
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const canProceed = facts[0].trim().length > 0 && facts[1].trim().length > 0 && facts[2].trim().length > 0;

  const addFact = () => {
    const next = facts.length;
    setFacts(prev => [...prev, '']);
    setTimeout(() => inputRefs.current[next]?.focus(), 100);
  };

  const label = (i: number) => `${ORDINALS[i] ?? `${i + 1}th`} unknown fact${i < 3 ? '*' : ''}`;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <RegistrationProgressBar step={4} />
            <Text style={styles.heading}>What makes you... you?</Text>
            <Text style={styles.subheading}>
              These are the things that'll make someone walk across a room and meet you. Read the{' '}
              <Text style={styles.rulesLink} onPress={() => Alert.alert('Rules', "Be specific, surprising, and genuine. Generic facts like \"I like music\" won't spark a conversation. Tell us something only you would say.")}>
                rules
              </Text>.
            </Text>

            <View style={styles.examplesCard}>
              <View style={styles.exampleRow}>
                <View style={[styles.weakBadge, styles.weakRed]}><Text style={[styles.weakText, styles.weakRedText]}>Weak</Text></View>
                <Text style={styles.exampleText}>I like music / I love to travel / I'm a cat person</Text>
              </View>
              <View style={styles.exampleRow}>
                <View style={[styles.weakBadge, styles.weakTeal]}><Text style={[styles.weakText, styles.weakTealText]}>Strong</Text></View>
                <Text style={styles.exampleText}>I once got stuck in an elevator with a senator / I trained in circus acrobatics for 3 years</Text>
              </View>
            </View>

            {facts.map((text, i) => (
              <View key={i} style={styles.factGroup}>
                <Text style={styles.factLabel}>{label(i)}</Text>
                <TextInput
                  ref={el => { inputRefs.current[i] = el; }}
                  style={[styles.factInput, focusedIndex === i && styles.factInputActive]}
                  value={text}
                  onChangeText={v => setFacts(prev => prev.map((f, idx) => idx === i ? v : f))}
                  onFocus={() => setFocusedIndex(i)}
                  onBlur={() => setFocusedIndex(null)}
                  placeholder="Share something surprising about you..."
                  placeholderTextColor="#BBADA5"
                  multiline
                  textAlignVertical="top"
                />
                {i === facts.length - 1 && i >= 2 && (
                  <TouchableOpacity style={styles.addRow} onPress={addFact} activeOpacity={0.7}>
                    <View style={styles.addCircle}><Text style={styles.addCircleText}>+1</Text></View>
                    <Text style={styles.addRowText}>Add another</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.socialSection}>
              <Text style={styles.socialHeading}>Social (optional)</Text>
              <Text style={styles.socialSub}>Let people find you after you meet</Text>
              {SOCIAL_PLATFORMS.map(({ key, label: lbl, placeholder }) => (
                <View key={key} style={styles.socialRow}>
                  <View style={styles.socialField}>
                    <Text style={styles.socialLabel}>{lbl}</Text>
                    <TextInput
                      style={styles.socialInput}
                      value={social[key]}
                      onChangeText={val => setSocial(prev => ({ ...prev, [key]: val }))}
                      placeholder={placeholder}
                      placeholderTextColor="#BBADA5"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              ))}
            </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.nextBtn, !canProceed && styles.nextBtnDisabled]}
          onPress={() => {
            if (!canProceed) return;
            setSocialLinks({
              instagram: social.instagram.trim().replace(/^@/, '') || undefined,
              tiktok: social.tiktok.trim().replace(/^@/, '') || undefined,
              facebook: social.facebook.trim().replace(/^@/, '') || undefined,
            });
            navigation.navigate('RegistrationInterests');
          }}
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
  scroll: { paddingHorizontal: Spacing.screen, paddingBottom: 16 },
  heading: { fontSize: FontSize.displayMedium, fontWeight: '600', color: Colors.body, marginTop: 20, marginBottom: 10, lineHeight: 36, letterSpacing: LetterSpacing.displayMedium, fontFamily: FontFamily.brand },
  subheading: { fontSize: FontSize.body, fontWeight: '400', color: Colors.muted, lineHeight: 24, marginBottom: 20 },
  rulesLink: { color: Colors.body, textDecorationLine: 'underline' },
  examplesCard: { backgroundColor: Colors.secondaryCTA, borderRadius: Radius.card, padding: Spacing.card, marginBottom: 24, gap: 12 },
  exampleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  weakBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, marginTop: 1, flexShrink: 0 },
  weakRed: { backgroundColor: 'rgba(239,69,20,0.12)' },
  weakTeal: { backgroundColor: 'rgba(0,14,225,0.08)' },
  weakText: { fontSize: FontSize.micro, fontWeight: '700', letterSpacing: LetterSpacing.micro },
  weakRedText: { color: '#EF4514' },
  weakTealText: { color: Colors.brand },
  exampleText: { flex: 1, fontSize: FontSize.caption, fontWeight: '400', color: Colors.body, lineHeight: 18, letterSpacing: LetterSpacing.caption },
  factGroup: { marginBottom: 16 },
  factLabel: { fontSize: FontSize.micro, fontWeight: '700', color: Colors.body, letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase' },
  factInput: { minHeight: 80, backgroundColor: Colors.white, borderRadius: Radius.button, paddingHorizontal: Spacing.card, paddingVertical: 14, fontSize: FontSize.body, fontWeight: '400', color: Colors.body, borderWidth: 1, borderColor: Colors.border, lineHeight: 26, textAlignVertical: 'top' },
  factInputActive: { borderColor: Colors.brand, borderWidth: 1.5 },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, marginBottom: 8 },
  addCircle: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1.5, borderColor: Colors.brand, alignItems: 'center', justifyContent: 'center' },
  addCircleText: { fontSize: FontSize.bodySmall, color: Colors.brand, fontWeight: '700' },
  addRowText: { fontSize: FontSize.body, fontWeight: '400', color: Colors.brand },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 12, backgroundColor: Colors.white },
  nextBtn: { height: 56, backgroundColor: Colors.orange, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  nextBtnDisabled: { backgroundColor: Colors.brand, opacity: 0.4 },
  nextRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  nextText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false },
  nextArrow: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false, lineHeight: 20 },
  socialSection: { marginBottom: 24, marginTop: 8 },
  socialHeading: { fontSize: FontSize.body, fontWeight: '700', color: Colors.body, letterSpacing: LetterSpacing.body, marginBottom: 4 },
  socialSub: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted, marginBottom: 16 },
  socialRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: Radius.button, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.card, paddingVertical: 12, gap: 12, marginBottom: 10 },
  socialField: { flex: 1 },
  socialLabel: { fontSize: FontSize.bodySmall, fontWeight: '600', color: Colors.muted, marginBottom: 2 },
  socialInput: { fontSize: FontSize.body, fontWeight: '400', color: Colors.body, padding: 0 },
});
