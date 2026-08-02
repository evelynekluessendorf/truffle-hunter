import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

// Truffle Hunter colors
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

type Props = NativeStackScreenProps<RootStackParamList, 'RegistrationConfirmation'>;

export default function RegistrationConfirmationScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { registrationDraft } = useUser();
  const { photoUri, displayedName, year, major, facts, selectedInterests } = registrationDraft;
  const displayedFacts = facts.filter(f => f.trim().length > 0);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: insets.top + 32 }}
        showsVerticalScrollIndicator={false}>

        <Text style={{ fontSize: 28, fontWeight: '800', color: COLORS.keylinePurple, textAlign: 'center', marginBottom: 6 }}>
          You're all set!
        </Text>
        <Text style={{ fontSize: 15, color: '#999', textAlign: 'center', marginBottom: 28 }}>
          Here's how your profile looks
        </Text>

        {photoUri ? (
          <Image source={{ uri: photoUri }} style={{ width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 16 }} />
        ) : (
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.accentCoralLight, alignSelf: 'center', marginBottom: 16, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 36 }}>📸</Text>
          </View>
        )}

        <Text style={{ fontSize: 22, fontWeight: '700', color: COLORS.keylinePurple, textAlign: 'center', marginBottom: 2 }}>
          {displayedName}
        </Text>
        <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 28 }}>
          {[year, major].filter(Boolean).join(' • ')}
        </Text>

        {displayedFacts.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.keylinePurple, marginBottom: 12 }}>About you</Text>
            {displayedFacts.map((fact, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#DDDDDD',
                  borderRadius: 10,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  marginBottom: 10,
                }}>
                <Text style={{ fontSize: 14, color: COLORS.keylinePurple, lineHeight: 20 }}>{fact}</Text>
              </View>
            ))}
          </View>
        )}

        {selectedInterests.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.keylinePurple, marginBottom: 12 }}>Interests</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {selectedInterests.map(label => (
                <View
                  key={label}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 100,
                    backgroundColor: COLORS.accentCoralLight,
                    borderWidth: 1.5,
                    borderColor: COLORS.accentCoral,
                  }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.accentCoral }}>{label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ flex: 1 }} />
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: COLORS.cream }}>
        <TouchableOpacity
          onPress={() => navigation.replace('Main')}
          activeOpacity={0.85}
          style={{ height: 56, borderRadius: 28, backgroundColor: COLORS.accentCoral, alignItems: 'center', justifyContent: 'center', boxShadow: '3px 3px 0px rgba(32,22,66,0.18)' } as any}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Let's go →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
