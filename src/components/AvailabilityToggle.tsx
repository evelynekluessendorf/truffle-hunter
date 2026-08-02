import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Image as ExpoImage } from 'expo-image';
import { useUser } from '../context/UserContext';
const { width } = Dimensions.get('window');

const ICONS = {
  settings: require('../assets/icons/Settings.png'),
};

/** Design system: hard, unblurred offset shadow — never a soft drop shadow. */
const HARD_SHADOW = '3px 3px 0px rgba(32,22,66,0.18)';

// Truffle Hunter color palette
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

interface AvailabilityToggleProps {
  onStateChange?: (isVisible: boolean) => void;
  onViewMap?: () => void;
  onSettingsPress?: () => void;
  onShoutPress?: () => void;
  onWithdrawShout?: () => void;
}

export const AvailabilityToggle: React.FC<AvailabilityToggleProps> = ({
  onStateChange,
  onViewMap,
  onSettingsPress,
  onShoutPress,
  onWithdrawShout,
}) => {
  // Availability lives in context so other screens (e.g. Discover) can gate on it.
  const { visible: isVisible, setVisible: setIsVisible, activeShout } = useUser();
  const [isPressed, setIsPressed] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const playTokenRef = useRef(0);

  // Time left on the live shout, rounded to the nearest sensible unit.
  const expiresInLabel = (() => {
    if (!activeShout) return '';
    const elapsed = Date.now() - new Date(activeShout.timestamp).getTime();
    const remainingMs = Math.max(0, activeShout.expiresIn - elapsed);
    const mins = Math.round(remainingMs / 60000);
    if (mins <= 0) return 'moments';
    if (mins < 60) return `${mins}m`;
    return `${Math.round(mins / 60)}h`;
  })();

  useEffect(() => {
    let isMounted = true;

    Audio.Sound.createAsync(
      require('../assets/sounds/zapsplat_animals_pig_grunt_designed_005_51354.mp3')
    ).then(({ sound }) => {
      if (isMounted) {
        soundRef.current = sound;
      } else {
        sound.unloadAsync();
      }
    });

    return () => {
      isMounted = false;
      soundRef.current?.unloadAsync();
    };
  }, []);

  const playOink = async (fadeOut: boolean) => {
    const sound = soundRef.current;
    if (!sound) return;

    const token = ++playTokenRef.current;
    await sound.setVolumeAsync(1.0);
    await sound.setPositionAsync(0);
    await sound.playAsync();

    if (!fadeOut) return;

    const fadeDurationMs = 500;
    const stepMs = 50;
    const steps = fadeDurationMs / stepMs;

    for (let i = 1; i <= steps; i++) {
      await new Promise(resolve => setTimeout(resolve, stepMs));
      if (playTokenRef.current !== token) return;
      await sound.setVolumeAsync(Math.max(0, 1 - i / steps));
    }
  };

  const handleToggle = () => {
    const newState = !isVisible;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playOink(!newState);
    setIsVisible(newState);
    onStateChange?.(newState);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hey, Maya</Text>
        <TouchableOpacity
          onPress={onSettingsPress}
          disabled={!onSettingsPress}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.settingsButton}>
          {/* asset is pure white on transparent — tint it to stay visible on cream */}
          <ExpoImage
            source={ICONS.settings}
            style={{ width: 28, height: 28 }}
            contentFit="contain"
            tintColor={COLORS.keylinePurple}
          />
        </TouchableOpacity>
      </View>

      {/* Main Toggle Circle */}
      <View style={styles.toggleSection}>
        <TouchableOpacity
          onPress={handleToggle}
          onPressIn={() => setIsPressed(true)}
          onPressOut={() => setIsPressed(false)}
          activeOpacity={0.85}
        >
          <View style={styles.toggleWrapper}>
            <View
              style={[
                isVisible ? styles.outerRingOn : styles.outerRingOff,
                isPressed && styles.outerRingPressed,
              ]}
            />
            <Image
              source={
                isVisible
                  ? require('../assets/illustrations/Group 5.png')
                  : require('../assets/illustrations/sleeping-pig.png')
              }
              style={isVisible ? styles.toggleImageOn : styles.toggleImageOff}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Status Text */}
      <View style={styles.statusSection}>
        <Text style={styles.statusTitle}>
          {isVisible ? "You're set as visible" : "You're not visible"}
        </Text>
        <Text style={styles.statusSubtitle}>
          {isVisible
            ? "If you're visible, you're open. Anyone nearby can see your profile and get a conversation starter."
            : "Toggle on whenever you're open to meeting someone."}
        </Text>
      </View>

      {/* Visible State Extra Content */}
      {isVisible && (
        <View style={styles.visibleContent}>
          {/* View Map CTA */}
          <TouchableOpacity
            onPress={onViewMap}
            activeOpacity={0.85}
            style={styles.viewMapButton}
          >
            <Text style={styles.viewMapText}>View Map</Text>
          </TouchableOpacity>

          {/* Nearby People */}
          <View style={styles.nearbySection}>
            <View style={styles.avatarRow}>
              <View style={[styles.avatar, { backgroundColor: COLORS.accentCoral }]}>
                <Text style={styles.avatarText}>M</Text>
              </View>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: COLORS.keylinePurple, marginLeft: -12 },
                ]}
              >
                <Text style={[styles.avatarText, { color: 'white' }]}>J</Text>
              </View>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: COLORS.piggyPinkBright, marginLeft: -12 },
                ]}
              >
                <Text style={styles.avatarText}>A</Text>
              </View>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: COLORS.sunnyYellow, marginLeft: -12 },
                ]}
              >
                <Text style={styles.avatarText}>L</Text>
              </View>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: COLORS.piggyPink, marginLeft: -12 },
                ]}
              >
                <Text style={styles.avatarText}>S</Text>
              </View>
            </View>
            <Text style={styles.nearbyText}>+ 12 others nearby</Text>
          </View>

          {/* Shout Box — live shout, or a prompt to create one */}
          {activeShout ? (
            <TouchableOpacity
              onPress={onShoutPress}
              activeOpacity={0.85}
              style={styles.shoutBox}>
              <View style={styles.shoutHeader}>
                <Text style={styles.shoutLabel}>YOUR SHOUT IS LIVE</Text>
                <TouchableOpacity onPress={onWithdrawShout} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={styles.withdrawLink}>Withdraw</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.shoutMessage}>"{activeShout.text}"</Text>
              <Text style={styles.shoutMeta}>
                Seen by {activeShout.seenBy} people nearby. Expires in {expiresInLabel}.
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onShoutPress} activeOpacity={0.85} style={styles.shoutCtaButton}>
              <Text style={styles.shoutCtaText}>Shout out to nearby folks</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.keylinePurple,
    fontFamily: 'AsapCondensed-Bold',
  },
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  toggleSection: {
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'visible',
  },
  toggleWrapper: {
    width: 250,
    height: 250,
  },
  outerRingOn: {
    position: 'absolute',
    top: 25,
    left: 25,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.cream,
    boxShadow: [
      { offsetX: -6, offsetY: -6, blurRadius: 10, color: 'rgba(255,255,255,0.7)' },
      { offsetX: 6, offsetY: 6, blurRadius: 12, color: 'rgba(13,39,80,0.2)' },
    ],
    elevation: 6,
  } as any,
  outerRingOff: {
    position: 'absolute',
    top: 22,
    left: 28,
    width: 194,
    height: 206,
    borderRadius: 100,
    backgroundColor: COLORS.cream,
    boxShadow: [
      { offsetX: -6, offsetY: -6, blurRadius: 10, color: 'rgba(255,255,255,0.7)' },
      { offsetX: 6, offsetY: 6, blurRadius: 12, color: 'rgba(13,39,80,0.2)' },
    ],
    elevation: 6,
  } as any,
  outerRingPressed: {
    boxShadow: [
      { offsetX: -3, offsetY: -3, blurRadius: 6, color: 'rgba(255,255,255,0.5)', inset: true },
      { offsetX: 3, offsetY: 3, blurRadius: 6, color: 'rgba(13,39,80,0.2)', inset: true },
    ],
    elevation: 2,
  } as any,
  toggleImageOn: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 220,
    height: 220,
  },
  toggleImageOff: {
    position: 'absolute',
    top: -5,
    left: 18,
    width: 230,
    height: 243,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 24,
    color: COLORS.keylinePurple,
    marginBottom: 6,
    fontFamily: 'Fredoka_700Bold',
  },
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_400Regular',
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  visibleContent: {
    marginTop: 4,
  },
  viewMapButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.accentCoral,
    borderWidth: 2,
    borderColor: COLORS.keylinePurple,
    borderRadius: 999,
    paddingHorizontal: 32,
    paddingVertical: 15,
    marginBottom: 14,
    boxShadow: HARD_SHADOW,
  } as any,
  viewMapText: {
    fontSize: 16,
    fontFamily: 'Fredoka_700Bold',
    color: '#FFFFFF',
  },
  nearbySection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.keylinePurple,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.keylinePurple,
  },
  nearbyText: {
    fontSize: 12,
    color: '#666',
  },
  shoutBox: {
    backgroundColor: COLORS.sunnyYellow,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.keylinePurple,
    padding: 14,
    boxShadow: HARD_SHADOW,
  } as any,
  shoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shoutLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.keylinePurple,
    letterSpacing: 0.5,
  },
  withdrawLink: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.accentCoral,
  },
  shoutMessage: {
    fontSize: 14,
    color: COLORS.keylinePurple,
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '500',
  },
  shoutMeta: {
    fontSize: 11,
    color: '#999',
  },
  shoutCtaButton: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.keylinePurple,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
    boxShadow: HARD_SHADOW,
  } as any,
  shoutCtaText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.keylinePurple,
  },
});
