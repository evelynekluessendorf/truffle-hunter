import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser, ShoutRadius, SHOUT_TTL_MS } from '../context/UserContext';
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

const HARD_SHADOW = '3px 3px 0px rgba(32,22,66,0.18)';
const MUTED = '#666';
const MAX_CHARS = 120;

/** Radius options with the number of people reachable at each. */
const RADIUS_OPTIONS: { value: ShoutRadius; label: string; people: number }[] = [
  { value: '50m', label: '50m', people: 12 },
  { value: '200m', label: '200m', people: 47 },
  { value: '500m', label: '500m', people: 156 },
  { value: 'campus', label: 'Campus', people: 892 },
];

const TEMPLATES = [
  'Anyone up for a coffee run?',
  "Free tickets to tonight's game",
  'Looking for a developer for some ideas input.',
];

export default function ShoutOutScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { activeShout, setActiveShout } = useUser();

  // Pre-load an existing live shout so the screen doubles as an editor.
  const [text, setText] = useState(activeShout?.text ?? '');
  const [radius, setRadius] = useState<ShoutRadius | null>(activeShout?.radius ?? null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const hasText = text.trim().length > 0;
  const canShout = hasText && radius !== null;
  const isDirty = hasText || radius !== null;
  const selectedOption = RADIUS_OPTIONS.find(o => o.value === radius);

  const handleBack = () => {
    if (isDirty) setShowLeaveConfirm(true);
    else navigation.goBack();
  };

  const handleShout = () => {
    if (!canShout || !selectedOption) return;
    setActiveShout({
      text: text.trim(),
      radius: selectedOption.value,
      timestamp: new Date(),
      expiresIn: SHOUT_TTL_MS,
      seenBy: selectedOption.people,
    });
    // Land back on the toggle screen, where the live shout card now shows.
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleWithdraw = () => {
    setActiveShout(null);
    navigation.navigate('Main', { screen: 'Home' });
  };

  /** Appends the template so a partially-typed shout isn't destroyed. */
  const applyTemplate = (template: string) => {
    setText(prev => {
      const base = prev.trim();
      const next = base.length ? `${base} ${template}` : template;
      return next.slice(0, MAX_CHARS);
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.cream }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}>

      {/* ── HEADER ── */}
      <View
        style={{
          paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 8,
          flexDirection: 'row', alignItems: 'center',
        }}>
        <BackButton onPress={handleBack} style={{ width: 44 }} />
        <Text
          numberOfLines={1}
          style={{ flex: 1, textAlign: 'center', fontSize: 32, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
          Shout Outs
        </Text>
        {/* mirrors the back button so the title stays optically centered */}
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Text style={{ fontSize: 28, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, lineHeight: 34 }}>
          Say something to everyone nearby
        </Text>
        <Text
          style={{
            fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: MUTED,
            lineHeight: 20, marginTop: 10, marginBottom: 22,
          }}>
          This is a one-way public shout, not a message, not a chat. Anyone available in range will see it as a notification.
        </Text>

        <TextInput
          style={{
            minHeight: 150,
            backgroundColor: '#FFFFFF',
            borderWidth: 2,
            borderColor: COLORS.keylinePurple,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingTop: 14,
            paddingBottom: 14,
            fontSize: 15,
            fontFamily: 'PlusJakartaSans_400Regular',
            color: COLORS.keylinePurple,
            textAlignVertical: 'top',
            boxShadow: HARD_SHADOW,
          } as any}
          multiline
          maxLength={MAX_CHARS}
          value={text}
          onChangeText={setText}
        />
        <Text
          style={{
            fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular',
            color: COLORS.keylinePurple, textAlign: 'right', marginTop: 8,
          }}>
          {text.length}/{MAX_CHARS}
        </Text>

        <Text
          style={{
            fontSize: 16, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple,
            letterSpacing: 0.5, marginTop: 22, marginBottom: 12,
          }}>
          WHO SEES IT?
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {RADIUS_OPTIONS.map(option => {
            const selected = radius === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => setRadius(option.value)}
                activeOpacity={0.85}
                style={{
                  flex: 1, height: 48, borderRadius: 20,
                  borderWidth: 2, borderColor: COLORS.keylinePurple,
                  backgroundColor: selected ? COLORS.accentCoral : '#FFFFFF',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14, fontFamily: 'Fredoka_700Bold',
                    color: selected ? '#FFFFFF' : COLORS.keylinePurple,
                  }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular', color: MUTED, marginTop: 10 }}>
          {selectedOption
            ? `~ ${selectedOption.people} people currently available nearby`
            : 'Pick a range to see how many people are nearby'}
        </Text>

        <Text
          style={{
            fontSize: 16, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple,
            letterSpacing: 0.5, marginTop: 26, marginBottom: 12,
          }}>
          NEED INSPIRATION?
        </Text>
        {TEMPLATES.map(template => (
          <TouchableOpacity
            key={template}
            onPress={() => applyTemplate(template)}
            activeOpacity={0.85}
            style={{
              borderWidth: 2, borderColor: COLORS.keylinePurple, borderRadius: 20,
              backgroundColor: '#FFFFFF', paddingHorizontal: 18, paddingVertical: 14, marginBottom: 10,
            }}>
            <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.keylinePurple }}>
              {template}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── FOOTER CTA ── */}
      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: insets.bottom + 12, backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={handleShout}
          disabled={!canShout}
          activeOpacity={0.85}
          style={{
            height: 56, borderRadius: 999, backgroundColor: COLORS.accentCoral,
            opacity: canShout ? 1 : 0.5,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: HARD_SHADOW,
          } as any}>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>Shout it out</Text>
        </TouchableOpacity>

        {activeShout && (
          <TouchableOpacity onPress={handleWithdraw} activeOpacity={0.7} style={{ alignItems: 'center', marginTop: 12 }}>
            <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.accentCoral }}>
              Withdraw shout
            </Text>
          </TouchableOpacity>
        )}

        <Text
          style={{
            fontSize: 11, fontFamily: 'PlusJakartaSans_400Regular',
            color: MUTED, textAlign: 'center', marginTop: 10,
          }}>
          Expires automatically in 2 hours. You can withdraw anytime.
        </Text>
      </View>

      {/* ── LEAVE CONFIRMATION ── */}
      <Modal
        transparent
        animationType="fade"
        visible={showLeaveConfirm}
        onRequestClose={() => setShowLeaveConfirm(false)}>
        <View
          style={{
            flex: 1, backgroundColor: 'rgba(32,22,66,0.45)',
            alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32,
          }}>
          <View
            style={{
              width: '100%', backgroundColor: COLORS.cream, borderRadius: 20,
              borderWidth: 2, borderColor: COLORS.keylinePurple, padding: 24,
              boxShadow: HARD_SHADOW,
            } as any}>
            <Text style={{ fontSize: 20, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
              Are you sure you want to leave?
            </Text>
            <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: MUTED, marginBottom: 22 }}>
              You'll lose your shout.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowLeaveConfirm(false);
                navigation.goBack();
              }}
              activeOpacity={0.85}
              style={{
                height: 48, borderRadius: 999, backgroundColor: COLORS.accentCoral,
                alignItems: 'center', justifyContent: 'center', marginBottom: 10,
              }}>
              <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>Leave</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowLeaveConfirm(false)}
              activeOpacity={0.85}
              style={{
                height: 48, borderRadius: 999, backgroundColor: '#FFFFFF',
                borderWidth: 2, borderColor: COLORS.keylinePurple,
                alignItems: 'center', justifyContent: 'center',
              }}>
              <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
                Keep editing
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
