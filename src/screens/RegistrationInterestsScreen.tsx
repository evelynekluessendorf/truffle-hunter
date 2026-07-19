import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationInterests'>;

const INTERESTS = [
  { label: 'Music',       emoji: '🎵' }, { label: 'Film',        emoji: '🎬' },
  { label: 'Reading',     emoji: '📖' }, { label: 'Food',        emoji: '🍕' },
  { label: 'Travel',      emoji: '✈️' }, { label: 'Running',     emoji: '🏃' },
  { label: 'Gaming',      emoji: '🎮' }, { label: 'Art',         emoji: '🎨' },
  { label: 'Nature',      emoji: '🍀' }, { label: 'Psychology',  emoji: '🧠' },
  { label: 'Sports',      emoji: '⚽' }, { label: 'Tech',        emoji: '💻' },
  { label: 'Podcasts',    emoji: '🎙️' }, { label: 'Languages',   emoji: '🌍' },
  { label: 'Photography', emoji: '📸' }, { label: 'Theatre',     emoji: '🎭' },
  { label: 'Science',     emoji: '🔬' }, { label: 'Concerts',    emoji: '🎸' },
  { label: 'Wellness',    emoji: '🧘' }, { label: 'Writing',     emoji: '📝' },
];

export default function RegistrationInterestsScreen({ navigation, route }: Props) {
  const { registrationDraft, setRegistrationDraft } = useUser();
  const isEditing = route?.params?.isEditing ?? false;
  const insets = useSafeAreaInsets();
  const selected = new Set(registrationDraft.selectedInterests);

  const toggle = (label: string) => {
    const next = new Set(selected);
    next.has(label) ? next.delete(label) : next.add(label);
    setRegistrationDraft({ selectedInterests: Array.from(next) });
  };

  const canProceed = selected.size >= 3;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

      {/* BACK + PROGRESS */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={{ height: 3, backgroundColor: '#E5E7F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
          <View style={{ width: '85%', height: '100%', backgroundColor: '#000FE1', borderRadius: 3 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >

        {/* HEADING */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000', lineHeight: 34, marginBottom: 10 }}>
          What are you into?
        </Text>

        {/* SUBTITLE */}
        <Text style={{ fontSize: 15, color: '#333333', lineHeight: 22, marginBottom: 28 }}>
          Pick{' '}
          <Text style={{ fontWeight: '700', textDecorationLine: 'underline', color: '#333333' }}>
            at least 3
          </Text>
          . These help us sort your people nearby
        </Text>

        {/* INTEREST PILLS */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {INTERESTS.map(({ label, emoji }) => {
            const on = selected.has(label);
            return (
              <TouchableOpacity
                key={label}
                onPress={() => toggle(label)}
                activeOpacity={0.75}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  borderRadius: 100,
                  borderWidth: on ? 1.5 : 1,
                  borderColor: on ? '#000FE1' : '#DDDDDD',
                  backgroundColor: on ? '#EEF0FB' : '#FFFFFF',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                }}
              >
                <Text style={{ fontSize: 14 }}>{emoji}</Text>
                <Text style={{
                  fontSize: 14,
                  fontWeight: on ? '700' : '500',
                  color: on ? '#000FE1' : '#111111',
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

      </ScrollView>

      {/* CTA */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: insets.bottom + 8,
        backgroundColor: '#FFFFFF',
      }}>
        <TouchableOpacity
          onPress={() => { if (!canProceed) return; isEditing ? navigation.goBack() : navigation.replace('Main'); }}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{
            height: 56,
            borderRadius: 12,
            backgroundColor: '#000FE1',
            opacity: canProceed ? 1 : 0.4,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 16 }}>{isEditing ? 'Save' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
