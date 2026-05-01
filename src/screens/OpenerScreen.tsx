import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import UserAvatar from '../components/UserAvatar';
import { RootStackParamList } from '../types';
import { useUser } from '../context/UserContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Opener'>;

export default function OpenerScreen({ route, navigation }: Props) {
  const { user } = route.params;
  const [index, setIndex] = useState(0);
  const { setPendingMeetingUser } = useUser();
  const insets = useSafeAreaInsets();

  const openers = user.openers && user.openers.length > 0
    ? user.openers
    : ["Ask them how they ended up at this campus — everyone has a story."];

  return (
    <View style={{ flex: 1, backgroundColor: Colors.flame }}>
      <View style={{ paddingTop: insets.top }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          tintColor={Colors.white}
        />

        <View style={styles.headerRow}>
          <UserAvatar name={user.name} color={Colors.white} size={48} photoUri={user.photoUri} />
          <View style={styles.headerText}>
            <Text style={styles.headerLabel}>Opening line for</Text>
            <Text style={styles.headerName}>{user.name} · {user.major}</Text>
          </View>
        </View>

        <Text style={styles.subtitle}>Here are some ideas on how you can start a conversation:</Text>

        <View style={styles.card}>
          <Text style={styles.openerText}>{openers[index]}</Text>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={() => setIndex(i => (i + 1) % openers.length)} activeOpacity={0.8}>
          <Text style={styles.nextBtnText}>Show me another</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => {
            setPendingMeetingUser(user);
            navigation.navigate('Main', { screen: 'Discover', params: { sendoffUser: user } } as any);
          }}
        >
          <Text style={styles.ctaBtnText}>Go say hi 👋</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { paddingHorizontal: Spacing.screen, paddingVertical: 12 },
  backText: { fontSize: FontSize.body, fontWeight: '500', color: Colors.white },
  logo: { width: 56, height: 56, alignSelf: 'center', marginBottom: 24, opacity: 0.9 },
  body: { flex: 1, paddingHorizontal: Spacing.screen, alignItems: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20, alignSelf: 'stretch' },
  headerText: { flex: 1 },
  headerLabel: { fontSize: FontSize.caption, fontWeight: '400', color: 'rgba(255,255,255,0.7)', marginBottom: 2, letterSpacing: LetterSpacing.caption },
  headerName: { fontSize: FontSize.bodySmall, fontWeight: '700', color: Colors.white },
  subtitle: { fontSize: FontSize.body, color: 'rgba(255,255,255,0.85)', fontWeight: '400', lineHeight: 24, marginBottom: 24, alignSelf: 'stretch' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.card,
    padding: 24,
    marginBottom: 24,
    alignSelf: 'stretch',
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  openerText: { fontSize: FontSize.body, fontWeight: '400', color: Colors.white, lineHeight: 26, textAlign: 'center' },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  nextBtnText: { fontSize: FontSize.bodySmall, color: Colors.white, fontWeight: '600' },
  footer: { paddingHorizontal: Spacing.screen, paddingTop: 12, backgroundColor: Colors.flame },
  ctaBtn: {
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: { color: Colors.flame, fontWeight: '700', fontSize: FontSize.body, includeFontPadding: false },
});
