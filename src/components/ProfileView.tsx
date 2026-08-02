import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Linking,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const HARD_SHADOW = '3px 3px 0px rgba(32,22,66,0.18)';

const ICONS = {
  back: require('../assets/icons/back-button.png'),
  edit: require('../assets/icons/edit-button.png'),
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const HERO_HEIGHT = Math.round(SCREEN_HEIGHT * 0.52);

/** Emoji per interest — mirrors the list used in the registration flow. */
const INTEREST_EMOJI: Record<string, string> = {
  Music: '🎵', Film: '🎬', Reading: '📖', Food: '🍕', Travel: '✈️',
  Running: '🏃', Gaming: '🎮', Art: '🎨', Nature: '🍀', Psychology: '🧠',
  Sports: '⚽', Tech: '💻', Podcasts: '🎙️', Languages: '🌍', Photography: '📸',
  Photo: '📸', Theatre: '🎭', Science: '🔬', Concerts: '🎸', Wellness: '🧘',
  Writing: '📝',
};

/**
 * Social platforms in display order.
 * NOTE: filenames match the assets folder exactly — "Instargram.png" is
 * spelled that way on disk (typo in the asset, not here).
 */
const SOCIAL_PLATFORMS: { key: string; icon: any }[] = [
  { key: 'instagram', icon: require('../assets/icons/Instargram.png') },
  { key: 'tiktok', icon: require('../assets/icons/Tiktok.png') },
  { key: 'x', icon: require('../assets/icons/X.png') },
  { key: 'facebook', icon: require('../assets/icons/Facebook.png') },
];

/** "https://instagram.com/amysmith" → "instagram.com/amysmith" */
const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

export interface ProfileInteraction {
  id: string;
  avatar: { uri: string } | number;
}

export interface ProfileData {
  profilePhoto: { uri: string } | number | null;
  name: string;
  year: string;
  major: string;
  recentInteractions: ProfileInteraction[];
  convoCount: number;
  daySpan: number;
  interests: string[];
  icebreakers: string[];
  socialMedia: Record<string, string>;
}

interface ProfileViewProps {
  profile: ProfileData;
  isOwner: boolean;
  onBack?: () => void;
  onEdit?: () => void;
  onSave?: () => void;
  onSayHi?: () => void;
  /** DEV ONLY — fired when the name is tapped 3× in quick succession. */
  onTripleTapName?: () => void;
}

export default function ProfileView({
  profile,
  isOwner,
  onBack,
  onEdit,
  onSave,
  onSayHi,
  onTripleTapName,
}: ProfileViewProps) {
  const insets = useSafeAreaInsets();

  const {
    profilePhoto, name, year, major, recentInteractions,
    convoCount, daySpan, interests, icebreakers, socialMedia,
  } = profile;

  // Rendered for EVERY profile — owner and map viewers alike.
  const socials = SOCIAL_PLATFORMS.filter(
    p => typeof socialMedia?.[p.key] === 'string' && socialMedia[p.key].trim().length > 0
  );

  // DEV profile switcher — 3 taps on the name within 800ms of each other.
  const tapCount = useRef(0);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleNameTap = () => {
    if (!onTripleTapName) return;
    tapCount.current += 1;
    if (tapTimer.current) clearTimeout(tapTimer.current);
    if (tapCount.current >= 3) {
      tapCount.current = 0;
      onTripleTapName();
      return;
    }
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 800);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.keylinePurple }}>

      {/* ══ HERO — fixed, does not scroll ══ */}
      <View style={{ width: '100%', height: HERO_HEIGHT, backgroundColor: COLORS.piggyPink }}>
        {profilePhoto ? (
          <Image
            source={profilePhoto}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.accentCoralLight }}>
            <Text style={{ fontSize: 64 }}>📸</Text>
          </View>
        )}

        {/* gradient: transparent → 80% purple → solid, dissolving into the info section */}
        <LinearGradient
          pointerEvents="none"
          colors={['rgba(32, 22, 66, 0)', 'rgba(32, 22, 66, 0.8)', COLORS.keylinePurple]}
          locations={[0, 0.8, 1]}
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: Math.round(HERO_HEIGHT * 0.55) }}
        />

        {/* back / edit — top corners */}
        <View
          style={{
            position: 'absolute', top: insets.top + 8, left: 0, right: 0,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 24,
          }}>
          <TouchableOpacity onPress={onBack} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Image source={ICONS.back} style={{ width: 52, height: 52 }} contentFit="contain" />
          </TouchableOpacity>
          {isOwner ? (
            <TouchableOpacity onPress={onEdit} activeOpacity={0.8} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Image source={ICONS.edit} style={{ width: 52, height: 52 }} contentFit="contain" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 52 }} />
          )}
        </View>

        {/* interaction avatars — centered row, overlapping */}
        {recentInteractions.length > 0 && (
          <View
            style={{
              position: 'absolute', left: 0, right: 0, bottom: 66,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            }}>
            {recentInteractions.slice(0, 5).map((person, i, arr) => {
              const centerIdx = Math.floor(arr.length / 2);
              const isCenter = i === centerIdx;
              const size = isCenter ? 84 : 60;
              return (
                <View
                  key={person.id}
                  style={{
                    width: size, height: size, borderRadius: size / 2,
                    borderWidth: 3, borderColor: COLORS.keylinePurple,
                    backgroundColor: COLORS.piggyPink,
                    overflow: 'hidden',
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: isCenter ? 10 : 5 - Math.abs(i - centerIdx),
                  }}>
                  <Image source={person.avatar} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                </View>
              );
            })}
          </View>
        )}

        {/* convos badge — centered below avatars */}
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: COLORS.accentCoral,
              borderWidth: 2, borderColor: '#FFFFFF',
              borderRadius: 999, paddingHorizontal: 22, paddingVertical: 8,
              boxShadow: HARD_SHADOW,
            } as any}>
            <Text style={{ fontSize: 15, fontFamily: 'Fredoka_600SemiBold', color: '#FFFFFF' }}>
              {convoCount} convos / {daySpan}d
            </Text>
          </View>
        </View>
      </View>

      {/* ══ PROFILE INFO — scrollable ══ */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}>

        {/* 1 — name (triple-tap cycles mock profiles in dev) */}
        <TouchableOpacity activeOpacity={1} onPress={handleNameTap}>
          <Text style={{ fontSize: 44, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>{name}</Text>
        </TouchableOpacity>

        {/* 2 — year + major */}
        <Text style={{ fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.cream, marginTop: 4 }}>
          {[year, major].filter(Boolean).join(' · ')}
        </Text>

        {/* 3 — interest tags: outlined coral pill, keyline purple label */}
        {interests.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 }}>
            {interests.map(interest => (
              <View
                key={interest}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 6,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 2, borderColor: COLORS.accentCoral,
                  borderRadius: 999, paddingHorizontal: 16, paddingVertical: 9,
                }}>
                <Text style={{ fontSize: 14 }}>{INTEREST_EMOJI[interest] ?? '✨'}</Text>
                <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
                  {interest}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 4 + 5 — ice breakers */}
        {icebreakers.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.cream,
                letterSpacing: 1, marginTop: 28, marginBottom: 12,
              }}>
              ICE BREAKERS
            </Text>
            {icebreakers.map((breaker, i) => (
              <View
                key={i}
                style={{
                  backgroundColor: COLORS.cream, borderRadius: 12,
                  paddingHorizontal: 16, paddingVertical: 16, marginBottom: 12,
                }}>
                <Text
                  style={{
                    fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular',
                    color: COLORS.keylinePurple, lineHeight: 20,
                  }}>
                  {breaker}
                </Text>
              </View>
            ))}
          </>
        )}

        {/* 6 — SOCIAL MEDIA: section title + icon/URL links.
               Wraps because a 40px icon + full URL text can't fit 4-across on a phone. */}
        {socials.length > 0 && (
          <>
            <Text
              style={{
                fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.cream,
                letterSpacing: 1, marginTop: 24, marginBottom: 12,
              }}>
              SOCIAL MEDIA
            </Text>
          <View
            style={{
              flexDirection: 'row', flexWrap: 'wrap',
              justifyContent: 'center', alignItems: 'center',
              gap: 12,
            }}>
            {socials.map(platform => {
              const url = socialMedia[platform.key];
              return (
                <Pressable
                  key={platform.key}
                  onPress={() => Linking.openURL(url).catch(() => {})}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    backgroundColor: COLORS.cream, borderRadius: 12,
                    paddingLeft: 6, paddingRight: 14, paddingVertical: 6,
                    opacity: pressed ? 0.7 : 1,
                  })}>
                  <Image source={platform.icon} style={{ width: 40, height: 40 }} contentFit="contain" />
                  <Text style={{ fontSize: 12, fontFamily: 'PlusJakartaSans_400Regular', color: COLORS.keylinePurple }}>
                    {displayUrl(url)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          </>
        )}

        {/* 7 — bottom button */}
        <TouchableOpacity
          onPress={isOwner ? onSave : onSayHi}
          activeOpacity={0.85}
          style={{
            height: 56, borderRadius: 999, backgroundColor: COLORS.accentCoral,
            alignItems: 'center', justifyContent: 'center', marginTop: 24,
            boxShadow: HARD_SHADOW,
          } as any}>
          <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>
            {isOwner ? 'Save' : 'Say Hi!'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
