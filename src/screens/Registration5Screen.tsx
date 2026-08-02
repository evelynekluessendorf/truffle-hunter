import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎬', label: 'Film' },
  { emoji: '📖', label: 'Reading' },
  { emoji: '🍕', label: 'Food' },
  { emoji: '✈️', label: 'Travel' },
  { emoji: '🏃', label: 'Running' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🎨', label: 'Art' },
  { emoji: '🍀', label: 'Nature' },
  { emoji: '🧠', label: 'Psychology' },
  { emoji: '⚽', label: 'Sports' },
  { emoji: '💻', label: 'Tech' },
  { emoji: '🎙️', label: 'Podcasts' },
  { emoji: '🌍', label: 'Languages' },
  { emoji: '📸', label: 'Photography' },
  { emoji: '🎭', label: 'Theatre' },
  { emoji: '🔬', label: 'Science' },
  { emoji: '🎸', label: 'Concerts' },
  { emoji: '🧘', label: 'Wellness' },
  { emoji: '📝', label: 'Writing' },
];

export default function InterestsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { setRegistrationDraft } = useUser();
  const [selected, setSelected] = useState<string[]>([]);

  const canProceed = selected.length >= 3;

  const toggle = (label: string) => {
    setSelected(prev => (prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <BackButton onPress={() => navigation.goBack()} style={{ marginBottom: 12 }} />
        <View
          style={{
            width: '100%', maxWidth: 320, alignSelf: 'center',
            height: 3, backgroundColor: '#E0E0E0', borderRadius: 2,
          }}>
          <View style={{ width: '90%', height: 3, backgroundColor: COLORS.accentCoral, borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 6 }}>
          What are you into?
        </Text>
        <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: '#444444', marginBottom: 24 }}>
          Pick <Text style={{ fontWeight: '800', textDecorationLine: 'underline' }}>at least 3</Text>. These help us sort your people nearby
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
          {INTERESTS.map(item => {
            const isSelected = selected.includes(item.label);
            return (
              <TouchableOpacity
                key={item.label}
                onPress={() => toggle(item.label)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 14, paddingVertical: 10, borderRadius: 100,
                  backgroundColor: isSelected ? COLORS.accentCoralLight : '#FFFFFF',
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected ? COLORS.accentCoral : '#DDDDDD',
                }}>
                <Text style={{ fontSize: 15, marginRight: 6 }}>{item.emoji}</Text>
                <Text
                  style={{
                    fontSize: 15, fontFamily: 'Fredoka_700Bold',
                    color: isSelected ? COLORS.accentCoral : '#111111',
                  }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 24, paddingTop: 8,
          paddingBottom: insets.bottom + 8, backgroundColor: COLORS.cream,
        }}>
        <TouchableOpacity
          onPress={() => {
            if (!canProceed) return;
            setRegistrationDraft({ selectedInterests: selected });
            navigation.navigate('RegistrationConfirmation');
          }}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{
            height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral,
            opacity: canProceed ? 1 : 0.5,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>Next →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
