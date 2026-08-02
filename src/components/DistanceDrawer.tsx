import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import DirectionSignIcon from './DirectionSignIcon';

const COLORS = {
  keylinePurple: '#201642',
  accentCoral: '#FF6B35',
  cream: '#FAF9F6',
};

const HARD_SHADOW = '3px 3px 0px rgba(32,22,66,0.18)';
const LOCKED = '🔒';

export interface DrawerPeer {
  id: string;
  name: string;
  year: string;
  major: string;
  distance: string;
  photo?: string;
  photoUri?: string;
  color?: string;
  avatarColor?: string;
  iceBreakers: string[];
}

interface DistanceDrawerProps {
  bottomSheetModalRef: React.RefObject<BottomSheetModal | null>;
  peer: DrawerPeer | null;
  /** Lifts the sheet clear of the tab bar. */
  bottomInset?: number;
  /** Walking route summary, once Google Directions resolves it. */
  routeInfo?: { distance: number; duration: number } | null;
  isNavigating?: boolean;
  /** Distance is gated behind availability, same as everywhere else. */
  available?: boolean;
  onAvatarPress: () => void;
  onChatPress: () => void;
  onStartPress: () => void;
  onStepsPress: () => void;
  onClose: () => void;
  onDismiss?: () => void;
}

export const DistanceDrawer: React.FC<DistanceDrawerProps> = ({
  bottomSheetModalRef,
  peer,
  bottomInset = 0,
  routeInfo,
  isNavigating = false,
  available = true,
  onAvatarPress,
  onChatPress,
  onStartPress,
  onStepsPress,
  onClose,
  onDismiss,
}) => {
  const photoUri = peer?.photoUri ?? peer?.photo;
  const fallbackColor = peer?.avatarColor ?? peer?.color ?? COLORS.accentCoral;

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      snapPoints={[350]}
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
      <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 4 }}>
        {peer && (
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
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
                {/* directions — SELECTED: this is the drawer you're in */}
                <View
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderWidth: 2,
                    borderColor: COLORS.accentCoral,
                    borderRadius: 8,
                    padding: 4,
                  }}
                >
                  <DirectionSignIcon size={20} />
                </View>
              </View>
              {routeInfo && (
                <Text
                  style={{
                    fontSize: 13,
                    color: COLORS.accentCoral,
                    fontFamily: 'Fredoka_700Bold',
                    marginTop: 4,
                  }}
                >
                  {routeInfo.duration.toFixed(0)} min walk · {(routeInfo.distance * 1000).toFixed(0)}m
                </Text>
              )}
            </View>

            {/* icebreakers — active as secondary, swaps to the icebreakers drawer */}
            <TouchableOpacity
              onPress={onChatPress}
              activeOpacity={0.85}
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: COLORS.keylinePurple,
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
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Text style={{ fontSize: 22, color: '#999' }}>×</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={onStartPress}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 100,
              backgroundColor: isNavigating ? COLORS.keylinePurple : COLORS.accentCoral,
              borderWidth: 2.5,
              borderColor: COLORS.keylinePurple,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: HARD_SHADOW,
            } as any}
          >
            <Text style={{ fontSize: 16, color: '#FFFFFF' }}>{isNavigating ? '■' : '▲'}</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>
              {isNavigating ? 'Stop' : 'Start'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onStepsPress}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 100,
              backgroundColor: '#FFFFFF',
              borderWidth: 2,
              borderColor: COLORS.keylinePurple,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text style={{ fontSize: 16 }}>☰</Text>
            <Text style={{ color: COLORS.keylinePurple, fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>
              Steps
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default DistanceDrawer;
