import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DirectionSignIcon from './DirectionSignIcon';
import type { DrawerPeer } from './DistanceDrawer';

const COLORS = {
  keylinePurple: '#201642',
  accentCoral: '#FF6B35',
  cream: '#FAF9F6',
  accentCoralLight: '#FFF0EB',
};

const LOCKED = '🔒';

/**
 * Backend endpoint that turns a peer's "unknown facts" into conversation starters.
 *
 * The Anthropic call MUST happen server-side: an API key shipped in the app bundle
 * (including any EXPO_PUBLIC_* var) is readable by anyone who downloads the app.
 * This component posts the facts to your own endpoint, which holds the key.
 *
 * Expected contract:
 *   POST { facts: string[] }  ->  { starters: string[] }
 *
 * Until this is set, the drawer shows the peer's raw facts (see fallback below).
 * The prompt your backend should send is exported as ICEBREAKER_PROMPT.
 */
const ICEBREAKER_API_URL = process.env.EXPO_PUBLIC_ICEBREAKER_API_URL;

export const ICEBREAKER_PROMPT = (factsString: string) =>
  `Transform these Unknown Facts into ice breaker conversation starters that feel natural and playful.

Unknown Facts:
${factsString}

Generate 2-3 conversation starters that:
- Sound like something a real person would say
- Reference the fact but add a curious or playful twist
- Are 1-2 sentences max
- Invite a genuine response, not just yes/no

Return ONLY the starters as a JSON array with no other text:
["starter 1", "starter 2", "starter 3"]`;

interface IceBreakersDrawerProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  peer: DrawerPeer | null;
  /** Lifts the sheet clear of the tab bar. */
  bottomInset?: number;
  /** Distance is gated behind availability, same as everywhere else. */
  available?: boolean;
  onAvatarPress: () => void;
  /** Back to the distance drawer — the primary action from here. */
  onDirectionsPress: () => void;
  onClose: () => void;
  onDismiss?: () => void;
}

export const IceBreakersDrawer: React.FC<IceBreakersDrawerProps> = ({
  bottomSheetModalRef,
  peer,
  bottomInset = 0,
  available = true,
  onAvatarPress,
  onDirectionsPress,
  onClose,
  onDismiss,
}) => {
  const [generatedStarters, setGeneratedStarters] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoUri = peer?.photoUri ?? peer?.photo;
  const fallbackColor = peer?.avatarColor ?? peer?.color ?? COLORS.accentCoral;

  useEffect(() => {
    if (peer?.iceBreakers && peer.iceBreakers.length > 0) {
      generateIceBreakers(peer.iceBreakers);
    } else {
      setGeneratedStarters([]);
    }
  }, [peer?.id]);

  const generateIceBreakers = async (unknownFacts: string[]) => {
    // No backend configured yet — show the peer's own facts rather than failing.
    if (!ICEBREAKER_API_URL) {
      setGeneratedStarters(unknownFacts.slice(0, 3));
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(ICEBREAKER_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facts: unknownFacts }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const starters: unknown = data?.starters;

      if (!Array.isArray(starters) || starters.length === 0) {
        throw new Error('No starters in API response');
      }

      setGeneratedStarters(starters.filter((s): s is string => typeof s === 'string'));
    } catch (err) {
      console.error('Ice breaker generation error:', err);
      setError('Could not generate ice breakers');
      // Fallback to original facts
      setGeneratedStarters(unknownFacts.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={[500]}
      enableDynamicSizing={false}
      enablePanDownToClose
      bottomInset={bottomInset}
      onDismiss={onDismiss}
      handleIndicatorStyle={{ backgroundColor: '#DDDDDD' }}
      backgroundStyle={{
        backgroundColor: COLORS.cream,
        borderWidth: 2,
        borderColor: COLORS.keylinePurple,
        borderRadius: 20,
      }}
    >
      <BottomSheetScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {peer && (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            {/* avatar → opens the full profile */}
            <TouchableOpacity onPress={onAvatarPress} activeOpacity={0.85}>
              {photoUri ? (
                <Image
                  source={{ uri: photoUri }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    marginRight: 12,
                    borderWidth: 2,
                    borderColor: COLORS.keylinePurple,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    backgroundColor: fallbackColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                    borderWidth: 2,
                    borderColor: COLORS.keylinePurple,
                  }}
                >
                  <Text style={{ color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 18 }}>
                    {peer.name.charAt(0)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 20, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>
                {peer.name}
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: '#666',
                  fontFamily: 'PlusJakartaSans_400Regular',
                  marginTop: 2,
                }}
              >
                {peer.year} · {peer.major}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: '#666', fontFamily: 'PlusJakartaSans_400Regular' }}>
                  {available ? `📍 ${peer.distance}` : `${LOCKED} Distance`}
                </Text>
                {/* directions — the primary action from this drawer */}
                <TouchableOpacity
                  onPress={onDirectionsPress}
                  activeOpacity={0.85}
                  style={{
                    backgroundColor: available ? COLORS.accentCoral : '#BBB',
                    borderRadius: 8,
                    padding: 5,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <DirectionSignIcon size={20} inverted />
                </TouchableOpacity>
              </View>
            </View>

            {/* icebreakers — SELECTED: this is the drawer you're in */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: COLORS.accentCoral,
                backgroundColor: '#FFFFFF',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
            >
              <Image
                source={require('../assets/icons/Ice Breaker.png')}
                style={{ width: 22, height: 22 }}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ fontSize: 22, color: '#999' }}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text
          style={{
            fontSize: 13,
            fontFamily: 'Fredoka_700Bold',
            color: COLORS.keylinePurple,
            letterSpacing: 1,
            marginBottom: 10,
          }}
        >
          ICEBREAKERS
        </Text>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.accentCoral} />
            <Text
              style={{
                marginTop: 12,
                color: '#666',
                fontFamily: 'PlusJakartaSans_400Regular',
              }}
            >
              Generating conversation starters...
            </Text>
          </View>
        ) : (
          <>
            {/* Generation failed — the raw facts below are the fallback. */}
            {error && (
              <Text
                style={{
                  color: COLORS.accentCoral,
                  fontFamily: 'PlusJakartaSans_400Regular',
                  fontSize: 12,
                  marginBottom: 10,
                }}
              >
                {error} — showing their facts instead.
              </Text>
            )}
            {generatedStarters.map((starter, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1.5,
                  borderColor: COLORS.keylinePurple,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: COLORS.keylinePurple,
                    fontFamily: 'PlusJakartaSans_400Regular',
                    lineHeight: 22,
                  }}
                >
                  {starter}
                </Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default IceBreakersDrawer;
