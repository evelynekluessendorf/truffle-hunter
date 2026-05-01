import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FontFamily, FontSize, LetterSpacing, Spacing, Radius } from '../constants/theme';
import UserAvatar from '../components/UserAvatar';
import { nearbyUsers, currentUser } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

function GhostIcon({ color }: { color: string }) {
  const W = 52;
  const bodyH = 52;
  const bumpR = 7;
  const bumpCount = 3;
  const sectionW = W / bumpCount;
  const eyeR = 4;
  const eyeY = bodyH * 0.38;
  return (
    <View style={{ width: W, height: bodyH + bumpR }}>
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: bodyH,
        backgroundColor: color,
        borderTopLeftRadius: W / 2,
        borderTopRightRadius: W / 2,
      }} />
      {[0, 1, 2].map(i => (
        <View key={i} style={{
          position: 'absolute',
          bottom: 0,
          left: sectionW * i + (sectionW / 2) - bumpR,
          width: bumpR * 2,
          height: bumpR * 2,
          borderRadius: bumpR,
          backgroundColor: color,
        }} />
      ))}
      {/* Eyes */}
      <View style={{
        position: 'absolute',
        top: eyeY,
        left: W * 0.27 - eyeR,
        width: eyeR * 2, height: eyeR * 2, borderRadius: eyeR,
        backgroundColor: Colors.white,
      }} />
      <View style={{
        position: 'absolute',
        top: eyeY,
        left: W * 0.73 - eyeR,
        width: eyeR * 2, height: eyeR * 2, borderRadius: eyeR,
        backgroundColor: Colors.white,
      }} />
    </View>
  );
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TOGGLE_SIZE = 200;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { profile, visible, setVisible,
          pendingMeetingUser, setPendingMeetingUser, conversationCount, incrementConversationCount,
          registrationDraft } = useUser();
  const [meetingSheet, setMeetingSheet] = useState<'question' | 'celebration' | null>(null);
  const hasShownRef = useRef(false);

  useFocusEffect(useCallback(() => {
    if (pendingMeetingUser && !hasShownRef.current) {
      hasShownRef.current = true;
      setTimeout(() => setMeetingSheet('question'), 400);
    }
    return () => {};
  }, [pendingMeetingUser]));

  const handleWeMet = () => {
    incrementConversationCount();
    setMeetingSheet('celebration');
  };

  const handleCloseCelebration = () => {
    setMeetingSheet(null);
    setPendingMeetingUser(null);
    hasShownRef.current = false;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hey, {profile.firstName}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Main', { screen: 'Profile' } as any)} activeOpacity={0.8}>
            <UserAvatar name={profile.firstName} color={Colors.coral} size={40} photoUri={registrationDraft.photoUri ?? undefined} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.toggleArea}>
            <View style={styles.outerRing}>
              <TouchableOpacity
                style={[styles.toggleBtn, { backgroundColor: visible ? Colors.brand : Colors.secondaryCTA }]}
                onPress={() => {
                  if (!visible) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  } else {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  setVisible(!visible);
                }}
                activeOpacity={0.85}
              >
                {visible ? (
                  <>
                    <Text style={styles.sparkles}>👋</Text>
                    <Text style={styles.toggleLabel}>VISIBLE</Text>
                  </>
                ) : (
                  <>
                    <GhostIcon color={Colors.coral} />
                    <Text style={[styles.toggleLabel, { color: Colors.coral }]}>TAP TO SHOW UP</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.statusTitle}>
              {visible ? "You are visible" : "You're not visible"}
            </Text>
            <Text style={styles.statusSub}>
              {visible
                ? "Anyone nearby will have access to your profile and might want to chat with you."
                : "Toggle on when you're open to meeting someone."}
            </Text>
          </View>

          {visible && (
            <>
              <TouchableOpacity
                style={styles.viewMapBtn}
                onPress={() => navigation.navigate('Main', { screen: 'Discover' } as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.viewMapText}>View map →</Text>
              </TouchableOpacity>

              <View style={[styles.nearbyRow, { marginTop: 112 }]}>
                {nearbyUsers.slice(0, 5).map(u => (
                  <TouchableOpacity key={u.id} onPress={() => navigation.navigate('UserProfile', { user: u })}>
                    <UserAvatar name={u.name} color={u.avatarColor} size={38} photoUri={u.photoUri} />
                  </TouchableOpacity>
                ))}
                <Text style={styles.nearbyCount}>+ {nearbyUsers.length - 5} others nearby</Text>
              </View>

              <View style={{ height: 24 }} />

              <TouchableOpacity
                style={styles.shoutoutCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ShoutOut')}
              >
                <View style={styles.shoutoutLeft}>
                  <Text style={styles.shoutoutIcon}>🎙️</Text>
                  <View>
                    <Text style={styles.shoutoutTitle}>Shout something out!</Text>
                    <Text style={styles.shoutoutSub}>Send an announcement to people nearby</Text>
                  </View>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>

            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={meetingSheet !== null} transparent animationType="slide">
        <View style={styles.sheetBg}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />

            {meetingSheet === 'question' && pendingMeetingUser && (
              <>
                <View style={styles.avatarRow}>
                  <View style={[styles.sheetAvatar, { backgroundColor: currentUser.avatarColor, zIndex: 1 }]}>
                    <Text style={styles.sheetAvatarText}>{currentUser.name.charAt(0)}</Text>
                  </View>
                  <View style={[styles.sheetAvatar, { backgroundColor: pendingMeetingUser.avatarColor, marginLeft: -16 }]}>
                    <Text style={styles.sheetAvatarText}>{pendingMeetingUser.name.charAt(0)}</Text>
                  </View>
                </View>
                <Text style={styles.sheetContext}>
                  Earlier today:{'\n'}{pendingMeetingUser.name} · {pendingMeetingUser.major}
                </Text>
                <Text style={styles.sheetQuestion}>Did you end up meeting?</Text>
                <TouchableOpacity style={styles.metBtn} onPress={handleWeMet}>
                  <Text style={styles.metBtnText}>We met</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.notYetBtn} onPress={() => {
                  setMeetingSheet(null);
                  setPendingMeetingUser(null);
                  hasShownRef.current = false;
                }}>
                  <Text style={styles.notYetText}>Not yet</Text>
                </TouchableOpacity>
              </>
            )}

            {meetingSheet === 'celebration' && pendingMeetingUser && (
              <>
                <View style={styles.avatarRow}>
                  <View style={[styles.sheetAvatar, { backgroundColor: currentUser.avatarColor, zIndex: 1 }]}>
                    <Text style={styles.sheetAvatarText}>{currentUser.name.charAt(0)}</Text>
                  </View>
                  <View style={[styles.sheetAvatar, { backgroundColor: pendingMeetingUser.avatarColor, marginLeft: -16 }]}>
                    <Text style={styles.sheetAvatarText}>{pendingMeetingUser.name.charAt(0)}</Text>
                  </View>
                </View>
                <Text style={styles.howCool}>How cool!</Text>
                <Text style={styles.interactionText}>
                  This is your {ordinal(conversationCount)} interaction in the last 30 days!
                </Text>
                <TouchableOpacity style={styles.metBtn} onPress={handleCloseCelebration}>
                  <Text style={styles.metBtnText}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingTop: 8,
    paddingBottom: 4,
  },
  greeting: {
    fontSize: FontSize.displayLarge,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: LetterSpacing.displayLarge,
    fontFamily: FontFamily.brand,
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 100,
  },
  toggleArea: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
    paddingHorizontal: Spacing.screen,
  },
  outerRing: {
    width: TOGGLE_SIZE + 24,
    height: TOGGLE_SIZE + 24,
    borderRadius: (TOGGLE_SIZE + 24) / 2,
    borderWidth: 2,
    borderColor: Colors.coral + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  toggleBtn: {
    width: TOGGLE_SIZE,
    height: TOGGLE_SIZE,
    borderRadius: TOGGLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sparkles: { fontSize: 32, color: '#FFD700' },
  sunglasses: { fontSize: 48 },
  toggleLabel: {
    fontSize: FontSize.displayLarge,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: LetterSpacing.displayLarge,
    textAlign: 'center',
    fontFamily: FontFamily.brand,
  },
  statusTitle: {
    fontSize: FontSize.sectionHeader,
    fontWeight: '600',
    color: Colors.body,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: LetterSpacing.sectionHeader,
  },
  statusSub: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  viewMapBtn: {
    backgroundColor: Colors.selected,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginBottom: 0,
    borderWidth: 1.5,
    borderColor: Colors.brand,
  },
  viewMapText: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.brand,
    letterSpacing: LetterSpacing.body,
  },
  nearbyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: Spacing.screen,
  },
  nearbyCount: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    marginLeft: 4,
    letterSpacing: LetterSpacing.caption,
  },
  incomingShout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.shoutouts,
    borderRadius: Radius.card,
    padding: Spacing.card,
    marginHorizontal: Spacing.screen,
    marginBottom: 10,
    gap: 10,
    width: '100%',
    maxWidth: 380,
  },
  incomingContent: { flex: 1 },
  incomingAuthor: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.body,
    marginBottom: 2,
    letterSpacing: LetterSpacing.caption,
  },
  bold: { fontWeight: '700' },
  incomingMessage: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.body,
    marginBottom: 4,
    lineHeight: 20,
  },
  incomingMeta: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    letterSpacing: LetterSpacing.caption,
  },
  liveShoutCard: {
    backgroundColor: Colors.secondaryCTA,
    borderRadius: Radius.card,
    padding: Spacing.card,
    marginHorizontal: Spacing.screen,
    width: '100%',
    maxWidth: 380,
  },
  liveShoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveShoutTitle: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: 0.8,
  },
  withdrawLink: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.muted,
    textDecorationLine: 'underline',
  },
  liveShoutText: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 24,
    marginBottom: 8,
  },
  liveShoutMeta: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    letterSpacing: LetterSpacing.caption,
  },
  shoutoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.secondaryCTA,
    borderRadius: 14,
    padding: Spacing.card,
    marginHorizontal: Spacing.screen,
    width: '100%',
    maxWidth: 380,
  },
  shoutoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  shoutoutIcon: { fontSize: 22 },
  shoutoutTitle: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.body,
    marginBottom: 2,
    letterSpacing: LetterSpacing.body,
  },
  shoutoutSub: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.muted,
  },
  chevron: { fontSize: 22, color: Colors.muted },
  sheetBg: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.screen,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
    minHeight: '55%',
    justifyContent: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
    alignSelf: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  sheetAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
  sheetAvatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.sectionHeader,
    letterSpacing: LetterSpacing.sectionHeader,
  },
  sheetContext: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.muted,
    textAlign: 'left',
    lineHeight: 24,
    alignSelf: 'flex-start',
  },
  sheetQuestion: {
    fontSize: FontSize.displayMedium,
    fontWeight: '600',
    color: Colors.body,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: LetterSpacing.displayMedium,
    lineHeight: 36,
  },
  metBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.body,
    letterSpacing: LetterSpacing.body,
    includeFontPadding: false,
  },
  notYetBtn: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.selected,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.brand,
  },
  notYetText: {
    color: Colors.brand,
    fontWeight: '600',
    fontSize: FontSize.body,
    letterSpacing: LetterSpacing.body,
    includeFontPadding: false,
  },
  howCool: {
    fontSize: FontSize.displayMedium,
    fontWeight: '600',
    color: Colors.body,
    textAlign: 'center',
    letterSpacing: LetterSpacing.displayMedium,
  },
  interactionText: {
    fontSize: FontSize.displayMedium,
    fontWeight: '600',
    color: Colors.body,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 16,
    letterSpacing: LetterSpacing.displayMedium,
  },
});
