import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import UserAvatar from '../components/UserAvatar';
import InterestTag from '../components/InterestTag';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({ route, navigation }: Props) {
  const { user } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.brand }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: Colors.white }}
      >

        <View style={{ paddingTop: insets.top }}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                {user.photoUri ? (
                  <Image source={{ uri: user.photoUri }} style={styles.photo} />
                ) : (
                  <UserAvatar name={user.name} color={user.avatarColor} size={140} photoUri={user.photoUri} />
                )}
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.name}>{user.name}</Text>
              {user.conversationCount !== undefined && (
                <Text style={styles.conversationCount}>
                  <Text style={styles.convOrange}>{user.conversationCount} conversations</Text>
                  {' '}in the last 30 days
                </Text>
              )}
              <View style={styles.tagsRow}>
                <Text style={styles.metaTag}>⚙ {user.year}</Text>
                <Text style={styles.metaTag}>⊕ {user.major}</Text>
              </View>
              {user.distance && (
                <Text style={styles.distance}>📍 {user.distance}</Text>
              )}

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ICE BREAKERS</Text>
                {user.iceBreakers.map((item, i) => (
                  <View key={i} style={styles.iceBreakerRow}>
                    <Text style={styles.iceBreakerBullet}>·</Text>
                    <Text style={styles.iceBreakerText}>{item}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>INTERESTS</Text>
                <View style={styles.tagsWrap}>
                  {user.interests.map(tag => (
                    <InterestTag key={tag} label={tag} />
                  ))}
                </View>
              </View>

              {user.socialLinks && (Object.values(user.socialLinks).some(Boolean)) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>SOCIAL</Text>
                  <View style={styles.socialList}>
                    {user.socialLinks.instagram && (
                      <TouchableOpacity style={styles.socialRow} onPress={() => Linking.openURL(`https://instagram.com/${user.socialLinks!.instagram}`)}>
                        <Text style={styles.socialIcon}>📸</Text>
                        <Text style={styles.socialHandle}>@{user.socialLinks.instagram}</Text>
                        <Text style={styles.socialArrow}>›</Text>
                      </TouchableOpacity>
                    )}
                    {user.socialLinks.tiktok && (
                      <TouchableOpacity style={styles.socialRow} onPress={() => Linking.openURL(`https://tiktok.com/@${user.socialLinks!.tiktok}`)}>
                        <Text style={styles.socialIcon}>🎵</Text>
                        <Text style={styles.socialHandle}>@{user.socialLinks.tiktok}</Text>
                        <Text style={styles.socialArrow}>›</Text>
                      </TouchableOpacity>
                    )}
                    {user.socialLinks.facebook && (
                      <TouchableOpacity style={styles.socialRow} onPress={() => Linking.openURL(`https://facebook.com/${user.socialLinks!.facebook}`)}>
                        <Text style={styles.socialIcon}>👤</Text>
                        <Text style={styles.socialHandle}>@{user.socialLinks.facebook}</Text>
                        <Text style={styles.socialArrow}>›</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}

              <TouchableOpacity style={styles.blockLink}>
                <Text style={styles.blockText}>Block or Report</Text>
              </TouchableOpacity>
            </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Main', { screen: 'Discover', params: { sayHiUser: user } } as any)}
        >
          <Text style={styles.ctaBtnText}>Say Hi!</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: { paddingHorizontal: Spacing.screen, paddingVertical: 12 },
  backText: { fontSize: FontSize.body, fontWeight: '500', color: Colors.body },
  scroll: { paddingBottom: 24 },
  avatarSection: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  avatarWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  photo: {
    width: 140,
    height: 140,
    borderRadius: 24,
  },
  content: { paddingHorizontal: Spacing.screen },
  name: {
    fontSize: FontSize.displayMedium,
    fontWeight: '700',
    fontFamily: FontFamily.brand,
    color: Colors.body,
    marginBottom: 4,
    letterSpacing: LetterSpacing.displayMedium,
  },
  conversationCount: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.body,
    marginBottom: 8,
  },
  convOrange: {
    color: Colors.orange,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  metaTag: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted },
  distance: { fontSize: FontSize.caption, fontWeight: '400', color: Colors.coral, marginBottom: Spacing.section, letterSpacing: LetterSpacing.caption },
  section: { marginBottom: Spacing.section },
  sectionTitle: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  iceBreakerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  iceBreakerBullet: {
    fontSize: FontSize.body,
    color: Colors.coral,
    lineHeight: 26,
    marginTop: 1,
  },
  iceBreakerText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 26,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  socialList: { gap: 10 },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  socialIcon: { fontSize: FontSize.body },
  socialHandle: { flex: 1, fontSize: FontSize.body, fontWeight: '600', color: Colors.orange },
  socialArrow: { fontSize: FontSize.sectionHeader, color: Colors.muted },
  blockLink: {
    alignItems: 'flex-end',
    marginBottom: Spacing.section,
  },
  blockText: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.orange,
    textDecorationLine: 'underline',
    letterSpacing: LetterSpacing.caption,
  },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingTop: 12,
    backgroundColor: Colors.white,
  },
  ctaBtn: {
    height: 56,
    backgroundColor: Colors.orange,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.body,
    letterSpacing: LetterSpacing.body,
    includeFontPadding: false,
  },
});
