import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Registration5'>;

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

export default function InterestsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { setRegistrationDraft } = useUser();
  const [selected, setSelected] = useState<string[]>([]);
  const canProceed = selected.length >= 3;

  const toggle = (label: string) => {
    setSelected(prev =>
      prev.includes(label) ? prev.filter(i => i !== label) : [...prev, label]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={0}>

      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={{ height: 3, backgroundColor: '#E0E0E0', borderRadius: 2 }}>
          <View style={{ width: '90%', height: 3, backgroundColor: '#000FE1', borderRadius: 2 }} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 24 }}
        keyboardShouldPersistTaps="handled">

        <Text style={{ fontSize: 28, fontWeight: '800', color: '#000000', marginBottom: 6 }}>What are you into?</Text>
        <Text style={{ fontSize: 15, color: '#444444', marginBottom: 24 }}>
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
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 100,
                  backgroundColor: isSelected ? '#EEF0FB' : '#FFFFFF',
                  borderWidth: isSelected ? 1.5 : 1,
                  borderColor: isSelected ? '#000FE1' : '#DDDDDD',
                }}>
                <Text style={{ fontSize: 15, marginRight: 6 }}>{item.emoji}</Text>
                <Text style={{ fontSize: 14, fontWeight: isSelected ? '700' : '500', color: isSelected ? '#000FE1' : '#111111' }}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => {
            if (!canProceed) return;
            setRegistrationDraft({ selectedInterests: selected });
            navigation.navigate('Main');
          }}
          activeOpacity={canProceed ? 0.85 : 1}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', opacity: canProceed ? 1 : 0.4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Next →</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}
