import React, { useState, useRef } from 'react';
import * as Haptics from 'expo-haptics';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize, LetterSpacing, Spacing, Radius } from '../constants/theme';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ShoutOut'>;
const MAX_CHARS = 120;

const RANGES: { label: string; people: number }[] = [
  { label: '50m',    people: 12 },
  { label: '200m',   people: 47 },
  { label: '500m',   people: 89 },
  { label: 'Campus', people: 234 },
];

const INSPIRATIONS = [
  'Anyone up for a coffee run?',
  "Free tickets to tonight's game",
  'Looking for a developer for some ideas input.',
];

export default function ShoutOutScreen({ navigation }: Props) {
  const [text, setText] = useState('');
  const [range, setRange] = useState('200m');
  const [selectedInspiration, setSelectedInspiration] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);
  const { setActiveShout } = useUser();
  const insets = useSafeAreaInsets();

  const currentPeople = RANGES.find(r => r.label === range)?.people ?? 0;

  const handleInspiration = (inspiration: string) => {
    if (selectedInspiration === inspiration) {
      setSelectedInspiration(null); setText('');
    } else {
      setSelectedInspiration(inspiration); setText(inspiration);
      inputRef.current?.focus();
    }
  };

  const handleTextChange = (val: string) => {
    setText(val.slice(0, MAX_CHARS));
    if (selectedInspiration && val !== selectedInspiration) setSelectedInspiration(null);
  };

  const handleShout = () => {
    if (!text.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setActiveShout({ text: text.trim(), people: currentPeople });
    navigation.goBack();
  };

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

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Say something to everyone nearby</Text>
        <Text style={styles.subheading}>
          This is a one-way public shout – not a message, not a chat. Anyone available in range will see it as a notification.
        </Text>

        <View style={styles.inputCard}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={text}
            onChangeText={handleTextChange}
            placeholder="What do you want to shout?"
            placeholderTextColor="rgba(215,87,46,0.4)"
            multiline
            maxLength={MAX_CHARS}
            autoFocus={false}
          />
        </View>
        <Text style={styles.charCount}>{text.length}/ {MAX_CHARS}</Text>

        <Text style={styles.sectionLabel}>WHO SEES IT?</Text>
        <View style={styles.rangeRow}>
          {RANGES.map(r => {
            const on = range === r.label;
            return (
              <TouchableOpacity key={r.label} style={[styles.rangeBtn, on && styles.rangeBtnOn]} onPress={() => setRange(r.label)} activeOpacity={0.75}>
                <Text style={[styles.rangeBtnText, on && styles.rangeBtnTextOn]}>{r.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={styles.peopleCount}>~ {currentPeople} people currently available nearby</Text>

        <Text style={styles.sectionLabel}>NEED INSPIRATION?</Text>
        {INSPIRATIONS.map(insp => {
          const on = selectedInspiration === insp;
          return (
            <TouchableOpacity key={insp} style={[styles.inspirationBtn, on && styles.inspirationBtnOn]} onPress={() => handleInspiration(insp)} activeOpacity={0.75}>
              <Text style={[styles.inspirationText, on && styles.inspirationTextOn]}>{insp}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.shoutBtn, !text.trim() && styles.shoutBtnDisabled]}
          onPress={handleShout}
          activeOpacity={text.trim() ? 0.85 : 1}
        >
          <Text style={styles.shoutBtnText}>Shout it out</Text>
        </TouchableOpacity>
        <Text style={styles.expiry}>Expires automatically in 2 hours. You can withdraw anytime.</Text>
      </View>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { paddingHorizontal: Spacing.screen, paddingVertical: 12 },
  backText: { fontSize: FontSize.body, color: Colors.body, fontWeight: '500' },
  scroll: { paddingHorizontal: Spacing.screen, paddingBottom: 12 },
  heading: { fontSize: FontSize.displayMedium, fontWeight: '600', color: Colors.body, lineHeight: 36, letterSpacing: LetterSpacing.displayMedium, marginBottom: 12, fontFamily: FontFamily.brand },
  subheading: { fontSize: FontSize.body, fontWeight: '400', color: Colors.muted, lineHeight: 24, marginBottom: 20 },
  inputCard: { backgroundColor: Colors.white, borderRadius: Radius.card, padding: Spacing.card, minHeight: 130, borderWidth: 1, borderColor: Colors.border, shadowColor: undefined, shadowOffset: undefined, shadowOpacity: undefined, shadowRadius: undefined, elevation: undefined },
  textInput: { fontSize: FontSize.body, fontWeight: '400', color: Colors.orange, lineHeight: 26, minHeight: 100, textAlignVertical: 'top' },
  charCount: { textAlign: 'right', color: Colors.muted, fontSize: FontSize.caption, marginTop: 6, marginBottom: 20 },
  sectionLabel: { fontSize: FontSize.micro, fontWeight: '700', color: Colors.body, letterSpacing: 0.8, marginBottom: 12 },
  rangeRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  rangeBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: Colors.white, alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border },
  rangeBtnOn: { borderColor: Colors.brand, backgroundColor: Colors.selected },
  rangeBtnText: { fontSize: FontSize.body, fontWeight: '600', color: Colors.muted },
  rangeBtnTextOn: { color: Colors.brand, fontWeight: '700' },
  peopleCount: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted, marginBottom: 24 },
  inspirationBtn: { backgroundColor: Colors.secondaryCTA, borderRadius: 12, paddingVertical: 16, paddingHorizontal: Spacing.card, marginBottom: 10, borderWidth: 1.5, borderColor: 'transparent' },
  inspirationBtnOn: { borderColor: Colors.brand, backgroundColor: Colors.selected },
  inspirationText: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.body },
  inspirationTextOn: { color: Colors.brand, fontWeight: '600' },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 8, gap: 8, backgroundColor: Colors.white },
  shoutBtn: { height: 56, backgroundColor: Colors.orange, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  shoutBtnDisabled: { opacity: 0.45 },
  shoutBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, includeFontPadding: false },
  expiry: { textAlign: 'center', fontSize: FontSize.micro, fontWeight: '400', color: Colors.muted, letterSpacing: LetterSpacing.micro },
});
