import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import RegistrationProgressBar from '../components/RegistrationProgressBar';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationInterests'>;

const INTERESTS = [
  { label: 'Music', emoji: '🎵' }, { label: 'Film', emoji: '🎬' },
  { label: 'Reading', emoji: '📖' }, { label: 'Food', emoji: '🍕' },
  { label: 'Travel', emoji: '✈️' }, { label: 'Running', emoji: '🏃' },
  { label: 'Gaming', emoji: '🎮' }, { label: 'Art', emoji: '🎨' },
  { label: 'Nature', emoji: '🌿' }, { label: 'Psychology', emoji: '🧠' },
  { label: 'Sports', emoji: '⚽' }, { label: 'Tech', emoji: '💻' },
  { label: 'Podcasts', emoji: '🎙️' }, { label: 'Languages', emoji: '🌍' },
  { label: 'Photography', emoji: '📸' }, { label: 'Theatre', emoji: '🎭' },
  { label: 'Science', emoji: '🔬' }, { label: 'Concerts', emoji: '🎸' },
  { label: 'Wellness', emoji: '🧘' }, { label: 'Writing', emoji: '📝' },
];

export default function RegistrationInterestsScreen({ navigation }: Props) {
  const { registrationDraft, setRegistrationDraft } = useUser();
  const insets = useSafeAreaInsets();
  const selected = new Set(registrationDraft.selectedInterests);

  const toggle = (label: string) => {
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    setRegistrationDraft({ selectedInterests: Array.from(next) });
  };

  const canProceed = selected.size >= 3;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Colors.white }}
    >
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]} showsVerticalScrollIndicator={false}>
            <RegistrationProgressBar step={5} />
            <Text style={styles.heading}>Select at least 3 interests</Text>
            <Text style={styles.subheading}>This will be presented on your profile and can help people around you to know what you have in common</Text>
            <View style={styles.tagsWrap}>
              {INTERESTS.map(({ label, emoji }) => {
                const on = selected.has(label);
                return (
                  <TouchableOpacity
                    key={label}
                    style={[styles.tag, on && styles.tagOn]}
                    onPress={() => toggle(label)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.tagText}>{emoji} <Text style={[styles.tagLabel, on && styles.tagLabelOn]}>{label}</Text></Text>
                  </TouchableOpacity>
                );
              })}
            </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.doneBtn, !canProceed && styles.doneBtnDisabled]}
          onPress={() => canProceed && navigation.replace('Main')}
          activeOpacity={canProceed ? 0.85 : 1}
        >
          <Text style={styles.doneBtnText}>Finish →</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.screen, paddingBottom: 16 },
  heading: { fontSize: FontSize.displayMedium, fontWeight: '600', color: Colors.body, marginTop: 20, marginBottom: 10, lineHeight: 36, letterSpacing: LetterSpacing.displayMedium, fontFamily: FontFamily.brand },
  subheading: { fontSize: FontSize.body, fontWeight: '400', color: Colors.muted, lineHeight: 24, marginBottom: 28 },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tag: { borderRadius: Radius.tag, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white, paddingVertical: 10, paddingHorizontal: 16 },
  tagOn: { borderColor: Colors.brand, backgroundColor: Colors.selected },
  tagText: { fontSize: FontSize.body, fontWeight: '400', color: Colors.body },
  tagLabel: { fontWeight: '400', color: Colors.body },
  tagLabelOn: { color: Colors.brand, fontWeight: '700' },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 12, backgroundColor: Colors.white },
  doneBtn: { height: 56, backgroundColor: Colors.orange, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  doneBtnDisabled: { backgroundColor: Colors.brand, opacity: 0.4 },
  doneBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false },
});
