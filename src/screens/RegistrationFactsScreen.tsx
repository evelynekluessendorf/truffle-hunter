import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform, Keyboard,
} from 'react-native';
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

const SOCIAL_PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', icon: '📸', placeholder: '@username' },
  { key: 'tiktok' as const, label: 'TikTok', icon: '🎵', placeholder: '@username' },
  { key: 'facebook' as const, label: 'Facebook', icon: '👤', placeholder: 'Profile URL' },
];

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationFacts'>;

export default function RegistrationFactsScreen({ navigation, route }: Props) {
  const { setSocialLinks, registrationDraft, setRegistrationDraft } = useUser();
  const isEditing = route?.params?.isEditing ?? false;
  const insets = useSafeAreaInsets();

  const facts = registrationDraft.facts;
  const setFacts = (updater: string[] | ((prev: string[]) => string[])) =>
    setRegistrationDraft({
      facts: typeof updater === 'function' ? updater(registrationDraft.facts) : updater,
    });

  const social = registrationDraft.social;
  const setSocial = (
    updater:
      | typeof registrationDraft.social
      | ((prev: typeof registrationDraft.social) => typeof registrationDraft.social)
  ) =>
    setRegistrationDraft({
      social: typeof updater === 'function' ? updater(registrationDraft.social) : updater,
    });

  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const canProceed =
    facts[0].trim().length > 0 && facts[1].trim().length > 0 && facts[2].trim().length > 0;

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

  const addFact = () => {
    const next = facts.length;
    setFacts(prev => [...prev, '']);
    setTimeout(() => inputRefs.current[next]?.focus(), 100);
  };

  const label = (i: number) =>
    `${ORDINALS[i] ?? `${i + 1}th`} unknown fact${i < 3 ? '*' : ''}:`;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <BackButton onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        <View
          style={{
            width: '100%', maxWidth: 320, alignSelf: 'center',
            height: 3, backgroundColor: '#E0E0E0', borderRadius: 2,
          }}>
          <View style={{ width: '65%', height: 3, backgroundColor: COLORS.accentCoral, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        <Text
          style={{
            fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple,
            lineHeight: 50, marginBottom: 10,
          }}>
          What makes you... you?
        </Text>
        <Text
          style={{
            fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
            color: '#333333', lineHeight: 22, marginBottom: 20,
          }}>
          These are the things that'll make someone walk across a room and meet you. Read the{' '}
          <Text
            style={{ textDecorationLine: 'underline', color: '#333333' }}
            onPress={() =>
              Alert.alert(
                'Rules',
                'Be specific, surprising, and genuine. Generic facts like "I like music" won\'t spark a conversation. Tell us something only you would say.'
              )
            }>
            rules
          </Text>
          .
        </Text>

        {/* Weak vs strong examples */}
        <View
          style={{
            backgroundColor: COLORS.accentCoralLight, borderRadius: 12,
            padding: 16, marginBottom: 28, gap: 12,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View
              style={{
                backgroundColor: '#FDDCDB', borderRadius: 100,
                paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0, marginTop: 1,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#C0392B' }}>Weak</Text>
            </View>
            <Text
              style={{
                flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                color: '#333333', lineHeight: 20, fontStyle: 'italic',
              }}>
              I like music / I love to travel / I'm a cat person
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View
              style={{
                backgroundColor: COLORS.accentCoralLight, borderRadius: 100,
                paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0, marginTop: 1,
              }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: COLORS.accentCoral }}>Strong</Text>
            </View>
            <Text
              style={{
                flex: 1, fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                color: '#333333', lineHeight: 20, fontStyle: 'italic',
              }}>
              I once got stuck in an elevator with a senator/ I trained in circus acrobatics for 3 years
            </Text>
          </View>
        </View>

        {facts.map((text, i) => (
          <View key={i} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 8 }}>
              {label(i)}
            </Text>
            <TextInput
              ref={el => {
                inputRefs.current[i] = el;
              }}
              style={{
                minHeight: 80, backgroundColor: '#FFFFFF', borderRadius: 10,
                paddingHorizontal: 14, paddingVertical: 14, fontSize: 16,
                color: COLORS.keylinePurple,
                borderWidth: focusedIndex === i ? 1.5 : 1,
                borderColor: focusedIndex === i ? COLORS.accentCoral : '#DDDDDD',
                lineHeight: 24, textAlignVertical: 'top',
              }}
              value={text}
              onChangeText={v => setFacts(prev => prev.map((f, idx) => (idx === i ? v : f)))}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              placeholder="Share something surprising about you..."
              placeholderTextColor="#BBADA5"
              multiline
              textAlignVertical="top"
            />
          </View>
        ))}

        <TouchableOpacity
          onPress={addFact}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 }}>
          <View
            style={{
              width: 32, height: 32, borderRadius: 16,
              borderWidth: 1.5, borderColor: '#888888',
              alignItems: 'center', justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 20, color: '#888888', lineHeight: 22 }}>+</Text>
          </View>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#888888' }}>Add another</Text>
        </TouchableOpacity>

        {/* ── SOCIAL MEDIA ── */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
              Social media
            </Text>
            <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: '#888888' }}>
              (optional)
            </Text>
          </View>
          <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: '#888888', marginBottom: 16 }}>
            Your links are only visible on your profile card
          </Text>

          {SOCIAL_PLATFORMS.map(({ key, icon, placeholder }) => (
            <View
              key={key}
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 10,
                borderWidth: 1, borderColor: '#DDDDDD', borderRadius: 10,
                paddingHorizontal: 14, height: 52, marginBottom: 10, backgroundColor: '#FFFFFF',
              }}>
              <Text style={{ fontSize: 20 }}>{icon}</Text>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: COLORS.keylinePurple, padding: 0 }}
                value={social[key]}
                onChangeText={val => setSocial(prev => ({ ...prev, [key]: val }))}
                placeholder={placeholder}
                placeholderTextColor="#BBADA5"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
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
            setSocialLinks({
              instagram: social.instagram.trim().replace(/^@/, '') || undefined,
              tiktok: social.tiktok.trim().replace(/^@/, '') || undefined,
              facebook: social.facebook.trim().replace(/^@/, '') || undefined,
            });
            if (isEditing) {
              navigation.goBack();
            } else {
              navigation.navigate('RegistrationInterests');
            }
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
