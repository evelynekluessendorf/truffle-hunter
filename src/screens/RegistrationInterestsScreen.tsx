import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';
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

const INTERESTS = [
  { label: 'Music', emoji: '🎵' },
  { label: 'Film', emoji: '🎬' },
  { label: 'Reading', emoji: '📖' },
  { label: 'Food', emoji: '🍕' },
  { label: 'Travel', emoji: '✈️' },
  { label: 'Running', emoji: '🏃' },
  { label: 'Gaming', emoji: '🎮' },
  { label: 'Art', emoji: '🎨' },
  { label: 'Nature', emoji: '🍀' },
  { label: 'Psychology', emoji: '🧠' },
  { label: 'Sports', emoji: '⚽' },
  { label: 'Tech', emoji: '💻' },
  { label: 'Podcasts', emoji: '🎙️' },
  { label: 'Languages', emoji: '🌍' },
  { label: 'Photography', emoji: '📸' },
  { label: 'Theatre', emoji: '🎭' },
  { label: 'Science', emoji: '🔬' },
  { label: 'Concerts', emoji: '🎸' },
  { label: 'Wellness', emoji: '🧘' },
  { label: 'Writing', emoji: '📝' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationInterests'>;

export default function RegistrationInterestsScreen({ navigation, route }: Props) {
  const { registrationDraft, setRegistrationDraft } = useUser();
  const isEditing = route?.params?.isEditing ?? false;
  const insets = useSafeAreaInsets();

  const selected = new Set(registrationDraft.selectedInterests);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const toggle = (label: string) => {
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    setRegistrationDraft({ selectedInterests: Array.from(next) });
  };

  const canProceed = selected.size >= 3;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <BackButton onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        <View
          style={{
            width: '100%', maxWidth: 320, alignSelf: 'center',
            height: 3, backgroundColor: '#E0E0E0', borderRadius: 2,
          }}>
          <View style={{ width: '85%', height: 3, backgroundColor: COLORS.accentCoral, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>

        <Text
          style={{
            fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple,
            lineHeight: 50, marginBottom: 10,
          }}>
          What are you into?
        </Text>
        <Text
          style={{
            fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
            color: '#333333', lineHeight: 22, marginBottom: 28,
          }}>
          Pick{' '}
          <Text style={{ fontWeight: '700', textDecorationLine: 'underline', color: '#333333' }}>
            at least 3
          </Text>
          . These help us sort your people nearby
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {INTERESTS.map(({ label, emoji }) => {
            const on = selected.has(label);
            return (
              <TouchableOpacity
                key={label}
                onPress={() => toggle(label)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  borderRadius: 100,
                  borderWidth: on ? 1.5 : 1,
                  borderColor: on ? COLORS.accentCoral : '#DDDDDD',
                  backgroundColor: on ? COLORS.accentCoralLight : '#FFFFFF',
                  paddingHorizontal: 14, paddingVertical: 10,
                }}>
                <Text style={{ fontSize: 14 }}>{emoji}</Text>
                <Text
                  style={{
                    fontSize: 15, fontFamily: 'Fredoka_700Bold',
                    color: on ? COLORS.accentCoral : '#111111',
                  }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: keyboardHeight > 0 ? keyboardHeight + 12 : insets.bottom + 8,
          backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={() => {
            if (!canProceed) return;
            isEditing ? navigation.goBack() : navigation.replace('Main');
          }}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            opacity: canProceed ? 1 : 0.5,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 15 }}>
            {isEditing ? 'Save' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
