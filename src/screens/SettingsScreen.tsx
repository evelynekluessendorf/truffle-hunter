import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '../context/UserContext';
import { DEFAULT_PROFILE } from '../data/mockProfiles';
import BackButton from '../components/BackButton';

// Truffle Hunter design tokens — .claude/skills/truffle-hunter-design/SKILL.md
const COLORS = {
  piggyPink: '#FFB0C7',
  keylinePurple: '#201642',
  cream: '#FAF9F6',
  accentCoral: '#FF6B35',
};

const HARD_SHADOW = '3px 3px 0px rgba(32,22,66,0.18)';
const DIVIDER = '#EDEDED';

/** Row groups, matching the design. Destinations don't exist yet. */
const GROUPS: { key: string; rows: string[] }[] = [
  { key: 'app', rows: ['Notifications', 'Security', 'Language', 'Account'] },
  { key: 'legal', rows: ['Clear cache', 'Terms & Privacy Policy', 'Contact us'] },
];

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { registrationDraft } = useUser();

  const avatarSource = registrationDraft.photoUri
    ? { uri: registrationDraft.photoUri }
    : DEFAULT_PROFILE.profilePhoto;
  const name = registrationDraft.displayedName || DEFAULT_PROFILE.name;
  const year = registrationDraft.year || DEFAULT_PROFILE.year;
  const major = registrationDraft.major || DEFAULT_PROFILE.major;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>

      {/* ── HEADER ── */}
      <View
        style={{
          paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12,
          flexDirection: 'row', alignItems: 'center',
        }}>
        <BackButton onPress={() => navigation.goBack()} style={{ width: 44 }} />
        <Text
          numberOfLines={1}
          style={{ flex: 1, textAlign: 'center', fontSize: 22, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
          Settings
        </Text>
        {/* mirrors the back button so the title stays optically centered */}
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}>

        {/* ── PROFILE CARD ── */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            flexDirection: 'row', alignItems: 'center', gap: 16,
            paddingHorizontal: 24, paddingVertical: 18,
          }}>
          <View style={{ width: 72, height: 72, borderRadius: 36, overflow: 'hidden', backgroundColor: COLORS.piggyPink }}>
            <Image source={avatarSource} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>{name}</Text>
            <Text style={{ fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.keylinePurple, marginTop: 2 }}>
              {[year, major].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>

        {/* ── ROW GROUPS ── */}
        {GROUPS.map(group => (
          <View key={group.key} style={{ backgroundColor: '#FFFFFF', marginTop: 24 }}>
            {group.rows.map((label, i) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.7}
                // TODO: wire each destination once those screens exist.
                onPress={() => {}}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingHorizontal: 24, paddingVertical: 18,
                  borderTopWidth: i === 0 ? 0 : 1, borderTopColor: DIVIDER,
                }}>
                <Text style={{ fontSize: 16, fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.keylinePurple }}>
                  {label}
                </Text>
                <Text style={{ fontSize: 20, color: '#BBB' }}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

      </ScrollView>

      {/* ── CLOSE ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 12 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={{
            height: 56, borderRadius: 999, backgroundColor: COLORS.accentCoral,
            alignItems: 'center', justifyContent: 'center',
            boxShadow: HARD_SHADOW,
          } as any}>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
