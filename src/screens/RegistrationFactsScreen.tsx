import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

const SOCIAL_PLATFORMS = [
  { key: 'instagram' as const, label: 'Instagram', icon: '📸', placeholder: '@username' },
  { key: 'tiktok'    as const, label: 'TikTok',    icon: '🎵', placeholder: '@username' },
  { key: 'facebook'  as const, label: 'Facebook',  icon: '👤', placeholder: 'Profile URL' },
];
const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th'];

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationFacts'>;

export default function RegistrationFactsScreen({ navigation, route }: Props) {
  const { setSocialLinks, registrationDraft, setRegistrationDraft } = useUser();
  const isEditing = route?.params?.isEditing ?? false;
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

  const label = (i: number) => `${ORDINALS[i] ?? `${i + 1}th`} unknown fact${i < 3 ? '*' : ''}:`;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#FFFFFF' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >

      {/* BACK + PROGRESS */}
      <View style={{ paddingTop: insets.top, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
        <View style={{ height: 3, backgroundColor: '#E5E7F0', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
          <View style={{ width: '65%', height: '100%', backgroundColor: '#000FE1', borderRadius: 3 }} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* HEADING */}
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#000000', lineHeight: 34, marginBottom: 10 }}>
          What makes you... you?
        </Text>

        {/* SUBTITLE with rules link */}
        <Text style={{ fontSize: 15, color: '#333333', lineHeight: 22, marginBottom: 20 }}>
          These are the things that'll make someone walk across a room and meet you. Read the{' '}
          <Text
            style={{ textDecorationLine: 'underline', color: '#333333' }}
            onPress={() => Alert.alert('Rules', "Be specific, surprising, and genuine. Generic facts like \"I like music\" won't spark a conversation. Tell us something only you would say.")}
          >
            rules
          </Text>.
        </Text>

        {/* EXAMPLE CARD */}
        <View style={{
          backgroundColor: '#EEF0FB',
          borderRadius: 12,
          padding: 16,
          marginBottom: 28,
          gap: 12,
        }}>
          {/* Weak row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ backgroundColor: '#FDDCDB', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0, marginTop: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#C0392B' }}>Weak</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: '#333333', lineHeight: 20, fontStyle: 'italic' }}>
              I like music / I love to travel / I'm a cat person
            </Text>
          </View>
          {/* Strong row */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <View style={{ backgroundColor: '#DDE3FF', borderRadius: 100, paddingHorizontal: 8, paddingVertical: 3, flexShrink: 0, marginTop: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#000FE1' }}>Strong</Text>
            </View>
            <Text style={{ flex: 1, fontSize: 14, color: '#333333', lineHeight: 20, fontStyle: 'italic' }}>
              I once got stuck in an elevator with a senator/ I trained in circus acrobatics for 3 years
            </Text>
          </View>
        </View>

        {/* FACT INPUTS */}
        {facts.map((text, i) => (
          <View key={i} style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 8 }}>
              {label(i)}
            </Text>
            <TextInput
              ref={el => { inputRefs.current[i] = el; }}
              style={{
                minHeight: 80,
                backgroundColor: '#FFFFFF',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 14,
                fontSize: 16,
                color: '#000000',
                borderWidth: focusedIndex === i ? 1.5 : 1,
                borderColor: focusedIndex === i ? '#000FE1' : '#DDDDDD',
                lineHeight: 24,
                textAlignVertical: 'top',
              }}
              value={text}
              onChangeText={v => setFacts(prev => prev.map((f, idx) => idx === i ? v : f))}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex(null)}
              placeholder="Share something surprising about you..."
              placeholderTextColor="#BBADA5"
              multiline
              textAlignVertical="top"
            />
          </View>
        ))}

        {/* ADD ANOTHER */}
        <TouchableOpacity
          onPress={addFact}
          activeOpacity={0.7}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 }}
        >
          <View style={{
            width: 32, height: 32, borderRadius: 16,
            borderWidth: 1.5, borderColor: '#888888',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 20, color: '#888888', lineHeight: 22 }}>+</Text>
          </View>
          <Text style={{ fontSize: 15, color: '#888888' }}>Add another</Text>
        </TouchableOpacity>

        {/* SOCIAL MEDIA SECTION */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000' }}>Social media</Text>
            <Text style={{ fontSize: 14, color: '#888888' }}>(optional)</Text>
          </View>
          <Text style={{ fontSize: 13, color: '#888888', marginBottom: 16 }}>
            Your links are only visible on your profile card
          </Text>

          {SOCIAL_PLATFORMS.map(({ key, icon, placeholder }) => (
            <View
              key={key}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                borderWidth: 1,
                borderColor: '#DDDDDD',
                borderRadius: 10,
                paddingHorizontal: 14,
                height: 52,
                marginBottom: 10,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Text style={{ fontSize: 20 }}>{icon}</Text>
              <TextInput
                style={{ flex: 1, fontSize: 16, color: '#000000', padding: 0 }}
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

      {/* CTA */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: insets.bottom + 8,
        backgroundColor: '#FFFFFF',
      }}>
        <TouchableOpacity
          onPress={() => {
            if (!canProceed) return;
            setSocialLinks({
              instagram: social.instagram.trim().replace(/^@/, '') || undefined,
              tiktok: social.tiktok.trim().replace(/^@/, '') || undefined,
              facebook: social.facebook.trim().replace(/^@/, '') || undefined,
            });
            if (isEditing) { navigation.goBack(); } else { navigation.navigate('RegistrationInterests'); }
          }}
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

    </KeyboardAvoidingView>
  );
}
