import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useUser } from '../context/UserContext';
import { DEFAULT_PROFILE } from '../data/mockProfiles';
import DirectionSignIcon from '../components/DirectionSignIcon';
import DistanceDrawer from '../components/DistanceDrawer';
import IceBreakersDrawer from '../components/IceBreakersDrawer';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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

const ICONS = {
  filter: require('../assets/icons/Filter.png'),
  hangouts: require('../assets/icons/Hangouts.png'),
  iceBreaker: require('../assets/icons/Ice Breaker.png'),
};

const MAJORS = [
  'Biology',
  'Business Administration',
  'Computer Science',
  'Law',
  'Physical Therapy',
  'Political Science',
  'Psychology',
];

type MapMode = 'default' | 'openers' | 'directions' | 'navigating' | 'shoutout';

/** MOCK — conversations in the last 30d, keyed by user id. All above 5. */
const CONVO_COUNTS: Record<string, number> = {
  '1': 12, '2': 8, '3': 19, '4': 31, '5': 7, '6': 24, '7': 15, '8': 9,
};

const YOU_COORD = { latitude: 37.7760, longitude: -122.4190 };

const INITIAL_REGION = {
  latitude: YOU_COORD.latitude,
  longitude: YOU_COORD.longitude,
  latitudeDelta: 0.008,
  longitudeDelta: 0.008,
};

const USERS = [
  {
    id: '1', name: 'James', initial: 'J', color: COLORS.accentCoral, year: 'Sophomore', major: 'Computer Science', distance: '320m',
    lat: 37.7792, lng: -122.4232,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&q=80',
    iceBreakers: ["I can solve a Rubik's cube in under 30 seconds", 'I once ate a whole jar of peanut butter in one sitting', 'I have never lost a game of chess against a computer on easy mode'],
    interests: ['Tech', 'Gaming', 'Food'],
  },
  {
    id: '2', name: 'Leo', initial: 'L', color: COLORS.keylinePurple, year: 'Senior', major: 'Music & Business', distance: '210m',
    lat: 37.7772, lng: -122.4228,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    hasShout: true, shout: "Anyone taken Prof. Miller before? How's the final?", timeAgo: '4 min ago',
    iceBreakers: ['I once won a contest I didn\'t mean to enter', 'I wrote a musical in high school that got performed', 'I have been to 14 countries but never left my home continent until this year'],
    interests: ['Music', 'Travel', 'Business'],
  },
  {
    id: '3', name: 'Millie', initial: 'M', color: COLORS.piggyPinkBright, year: 'Freshman', major: 'Psychology', distance: '310m',
    lat: 37.7788, lng: -122.4198,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    hasShout: true, shout: "Does anyone want to grab coffee at the student union? I'll be there till 3pm", timeAgo: '9 min ago',
    iceBreakers: ['I once ran into my professor at a party and outdanced them', 'I can identify 40 bird calls by sound', 'I have read the full terms and conditions of every app I\'ve downloaded'],
    interests: ['Psychology', 'Nature', 'Reading'],
  },
  {
    id: '4', name: 'Paul', initial: 'P', color: COLORS.sunnyYellowBright, year: 'Junior', major: 'Chemistry', distance: '70m',
    lat: 37.7755, lng: -122.4232,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    hasShout: true, shout: 'Lost my green hoodie somewhere near the library — anyone seen it?', timeAgo: '12 min ago',
    iceBreakers: ['I once woke up in a different country than I fell asleep in', 'I can solve differential equations in my head', 'I have never watched a single episode of Friends'],
    interests: ['Science', 'Travel', 'Gaming'],
  },
  {
    id: '5', name: 'Sofia', initial: 'S', color: COLORS.piggyPink, year: 'Freshman', major: 'Biology', distance: '180m',
    lat: 37.7745, lng: -122.4235,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    hasShout: true, shout: 'Anyone know a good spot on campus to study that\'s not the library? Somewhere quiet with good wifi', timeAgo: '3 min ago',
    iceBreakers: ['I grew up in 5 different countries across 3 continents', 'I have never lived anywhere for more than 3 years', 'I speak 4 languages but dream in only one'],
    interests: ['Science', 'Travel', 'Languages'],
  },
  {
    id: '6', name: 'Alex', initial: 'A', color: COLORS.accentCoral, year: 'Junior', major: 'Engineering', distance: '250m',
    lat: 37.7740, lng: -122.4202,
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&q=80',
    iceBreakers: ['I built a robot that makes pancakes', 'I once cycled across an entire country in a week', 'I have memorised pi to 50 decimal places'],
    interests: ['Tech', 'Running', 'Food'],
  },
  {
    id: '7', name: 'Nina', initial: 'N', color: COLORS.keylinePurple, year: 'Senior', major: 'Art History', distance: '400m',
    lat: 37.7762, lng: -122.4160,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    hasShout: true, shout: 'Looking for someone to visit the new exhibit at the campus gallery this weekend — free entry on Saturday', timeAgo: '22 min ago',
    iceBreakers: ['I once accidentally walked into a film set and ended up as an extra', 'I collect vintage maps', 'I have never eaten a hamburger'],
    interests: ['Art', 'Film', 'Travel'],
  },
  {
    id: '8', name: 'Omar', initial: 'O', color: COLORS.piggyPinkBright, year: 'Sophomore', major: 'Economics', distance: '150m',
    lat: 37.7732, lng: -122.4155,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    iceBreakers: ['I won a national spelling bee at age 10', 'I once negotiated a lower price on a house just for fun', 'I can read upside down faster than most people can read normally'],
    interests: ['Gaming', 'Reading', 'Travel'],
  },
];

export default function DiscoverScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  // Mirrors TabNavigator's height so drawers sit above the tab bar, not under it.
  const TAB_BAR_HEIGHT =
    78 + (Platform.OS === 'android' ? Math.max(insets.bottom, 16) : insets.bottom);
  const mapRef = useRef<MapView>(null);
  const distanceSheetRef = useRef<BottomSheetModal>(null);
  const iceBreakersSheetRef = useRef<BottomSheetModal>(null);
  const [view, setView] = useState<'map' | 'list'>('map');
  const [mode, setMode] = useState<MapMode>('default');
  const [tappedPinIdx, setTappedPinIdx] = useState<number | null>(null);
  const [openerUser, setOpenerUser] = useState<typeof USERS[0] | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);
  const [popupUser, setPopupUser] = useState<typeof USERS[0] | null>(null);
  const [tick, setTick] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedDistance, setSelectedDistance] = useState<number | null>(null);

  // Going offline locks distance, directions and shout-outs — you can still
  // browse the map and read profiles.
  const { visible, setVisible, registrationDraft } = useUser();
  // Own map pin uses the signed-in user's photo, same as every other pin.
  const myAvatar = registrationDraft.photoUri
    ? { uri: registrationDraft.photoUri }
    : (DEFAULT_PROFILE.profilePhoto as { uri: string });
  const [showLockedModal, setShowLockedModal] = useState(false);
  /** Runs `action` when available, otherwise explains why it's locked. */
  const requireAvailable = (action: () => void) => {
    if (visible) action();
    else setShowLockedModal(true);
  };
  const LOCKED = '🔒';
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [region, setRegion] = useState(INITIAL_REGION);

  const openOpeners = route?.params?.openOpeners;
  const sayHiUser = route?.params?.user;

  const enterDirections = (user: typeof USERS[0] | null) => {
    setMode('directions');
    setRouteInfo(null);
    setPopupUser(null);
    if (!user || !mapRef.current) return;
    const userLat = (user as any).lat ?? YOU_COORD.latitude;
    const userLng = (user as any).lng ?? YOU_COORD.longitude;
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [YOU_COORD, { latitude: userLat, longitude: userLng }],
        { edgePadding: { top: 100, right: 80, bottom: 400, left: 80 }, animated: true }
      );
    }, 300);
  };

  const closeDirections = () => {
    setMode('default');
    setOpenerUser(null);
    setRouteInfo(null);
    setPopupUser(null);
    mapRef.current?.animateToRegion({ ...YOU_COORD, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 600);
  };

  // `mode` is the single source of truth; the sheets follow it.
  useEffect(() => {
    if (mode === 'directions' || mode === 'navigating') {
      iceBreakersSheetRef.current?.dismiss();
      distanceSheetRef.current?.present();
    } else if (mode === 'openers') {
      distanceSheetRef.current?.dismiss();
      iceBreakersSheetRef.current?.present();
    } else {
      distanceSheetRef.current?.dismiss();
      iceBreakersSheetRef.current?.dismiss();
    }
  }, [mode]);

  // When returning from UserProfile via "Say Hi!" — open the distance drawer and zoom to user.
  useEffect(() => {
    if (!openOpeners || !sayHiUser) return;
    setOpenerUser(sayHiUser);
    setMode('directions');
    setView('map');
    setTappedPinIdx(null);
    setPopupUser(null);

    const userLat = sayHiUser.lat ?? YOU_COORD.latitude;
    const userLng = sayHiUser.lng ?? YOU_COORD.longitude;

    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [YOU_COORD, { latitude: userLat, longitude: userLng }],
        { edgePadding: { top: 180, right: 80, bottom: 380, left: 80 }, animated: true }
      );
    }, 400);
  }, [openOpeners, sayHiUser]);

  // Reset popup when switching to map so no pin is pre-selected.
  useEffect(() => {
    if (view === 'map') setTappedPinIdx(null);
  }, [view]);

  // Reset to clean map state every time this screen is focused — but not when arriving via Say Hi!
  useFocusEffect(useCallback(() => {
    if (!openOpeners) {
      setView('map');
      setMode('default');
      setTappedPinIdx(null);
      setOpenerUser(null);
    }
  }, [openOpeners]));

  // Ambient pin drift — slow organic movement, ~1–2m per tick
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1500);
    return () => clearInterval(interval);
  }, []);

  const getDrift = (user: typeof USERS[0], t: number, isSelected: boolean) => {
    const seed = parseInt(user.id) || user.name.charCodeAt(0);
    const phase1 = t * 0.05 + seed;
    const phase2 = t * 0.03 + seed * 1.3;
    const multiplier = isSelected ? 0.5 : 1;
    return {
      driftLat: Math.sin(phase1) * 0.00002 * multiplier,
      driftLng: Math.cos(phase2) * 0.00002 * multiplier,
    };
  };

  // Project the tapped pin's coordinate to screen space synchronously, so the popup
  // renders glued to the pin on the very same frame as the tap (no native round-trip).
  // Linear projection is exact enough at these zoom deltas (<1km span).
  const popupPosition = useMemo(() => {
    if (!popupUser || mode !== 'default' || mapSize.width === 0) return null;
    const { driftLat, driftLng } = getDrift(popupUser, tick, true);
    const lat = popupUser.lat + driftLat;
    const lng = popupUser.lng + driftLng;
    const west = region.longitude - region.longitudeDelta / 2;
    const north = region.latitude + region.latitudeDelta / 2;
    return {
      x: ((lng - west) / region.longitudeDelta) * mapSize.width,
      y: ((north - lat) / region.latitudeDelta) * mapSize.height,
    };
  }, [popupUser, tick, mode, region, mapSize]);

  const handleViewProfile = (user: typeof USERS[0]) => {
    navigation.navigate('UserProfile', {
      user: {
        id: user.id,
        name: user.name,
        year: user.year,
        major: user.major,
        iceBreakers: user.iceBreakers,
        interests: user.interests,
        avatarColor: user.color,
        photoUri: user.photo,
        distance: user.distance + ' away',
        conversationCount: CONVO_COUNTS[user.id] ?? 6,
        lat: user.lat,
        lng: user.lng,
      },
    });
  };

  const sortedUsers = [...USERS].sort((a, b) => parseInt(a.distance) - parseInt(b.distance));

  const filteredUsers = USERS.filter(user => {
    if (selectedMajors.length > 0 && !selectedMajors.includes(user.major)) return false;
    if (selectedDistance !== null && parseInt(user.distance) > selectedDistance) return false;
    return true;
  });

  // Shared header used in both views
  const header = (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12, backgroundColor: COLORS.cream }}>
      <Text style={{ fontSize: 28, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 12 }}>Discover</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: COLORS.keylinePurple, backgroundColor: '#FFFFFF', borderRadius: 100, padding: 3 }}>
          {(['map', 'list'] as const).map(v => (
            <TouchableOpacity key={v} onPress={() => setView(v)}
              style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, backgroundColor: view === v ? COLORS.accentCoral : 'transparent' }}>
              <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: view === v ? '#FFFFFF' : '#999', textTransform: 'capitalize' }}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={ICONS.filter} style={{ width: 26, height: 26, tintColor: COLORS.keylinePurple }} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Shown when an offline user taps a locked action. Rendered in both views.
  const lockedModal = (
    <Modal transparent animationType="fade" visible={showLockedModal} onRequestClose={() => setShowLockedModal(false)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(32,22,66,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View
          style={{
            width: '100%', backgroundColor: COLORS.cream, borderRadius: 20,
            borderWidth: 2, borderColor: COLORS.keylinePurple, padding: 24,
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 22, lineHeight: 26 }}>
            Make yourself available to have access to this information
          </Text>
          <TouchableOpacity
            onPress={() => { setVisible(true); setShowLockedModal(false); }}
            activeOpacity={0.85}
            style={{
              height: 48, borderRadius: 999, backgroundColor: COLORS.accentCoral,
              alignItems: 'center', justifyContent: 'center', marginBottom: 10,
            }}>
            <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>Set myself online</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowLockedModal(false)}
            activeOpacity={0.85}
            style={{
              height: 48, borderRadius: 999, backgroundColor: '#FFFFFF',
              borderWidth: 2, borderColor: COLORS.keylinePurple,
              alignItems: 'center', justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // ─────────────────────────────────────────────────────────
  // MAP VIEW
  // ─────────────────────────────────────────────────────────
  if (view === 'map') {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.cream }}>

        {/* ── HEADER — normal flex element, not absolute ── */}
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12, backgroundColor: COLORS.cream }}>
          <Text style={{ fontSize: 28, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 12 }}>Discover</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: COLORS.keylinePurple, backgroundColor: '#FFFFFF', borderRadius: 100, padding: 3 }}>
              {(['map', 'list'] as const).map(v => (
                <TouchableOpacity key={v} onPress={() => setView(v)}
                  style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, backgroundColor: view === v ? COLORS.accentCoral : 'transparent' }}>
                  <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: view === v ? '#FFFFFF' : '#999', textTransform: 'capitalize' }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              onPress={() => setShowFilters(true)}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={ICONS.filter} style={{ width: 26, height: 26, tintColor: COLORS.keylinePurple }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MAP AREA — flex:1 container below the header ── */}
        <View style={{ flex: 1 }} onLayout={e => setMapSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            initialRegion={INITIAL_REGION}
            onRegionChange={setRegion}
            onRegionChangeComplete={setRegion}
            showsUserLocation={false}
            showsMyLocationButton={false}>

            {/* User markers */}
            {(mode === 'default' || mode === 'openers' || mode === 'directions' || mode === 'navigating') && filteredUsers.map((user) => {
              const isSelected = openerUser?.id === user.id || popupUser?.id === user.id;
              const size = isSelected ? 52 : 44;
              const { driftLat, driftLng } = getDrift(user, tick, isSelected);
              return (
                <Marker
                  key={user.id}
                  coordinate={{ latitude: user.lat + driftLat, longitude: user.lng + driftLng }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  onPress={() => {
                    if (mode !== 'default') return;
                    setPopupUser(popupUser?.id === user.id ? null : user);
                  }}>
                  <View style={{
                    width: size, height: size, borderRadius: size / 2,
                    backgroundColor: '#FFFFFF',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: isSelected ? 4 : 2,
                    borderColor: popupUser?.id === user.id && mode === 'default' ? COLORS.accentCoral : COLORS.keylinePurple,
                    shadowColor: COLORS.keylinePurple, shadowOpacity: isSelected ? 0.3 : 0, shadowRadius: 8,
                    elevation: isSelected ? 6 : 2,
                    overflow: 'hidden',
                  }}>
                    <Image source={{ uri: user.photo }} style={{ width: '100%', height: '100%' }} />
                  </View>
                </Marker>
              );
            })}

            {/* You marker — same photo treatment as everyone else, coral ring to stand out */}
            <Marker coordinate={YOU_COORD} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={{
                width: mode === 'default' ? 48 : 54,
                height: mode === 'default' ? 48 : 54,
                borderRadius: 27,
                backgroundColor: '#FFFFFF',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: mode === 'default' ? 3 : 4, borderColor: COLORS.accentCoral,
                shadowColor: COLORS.keylinePurple, shadowOpacity: 0.3, shadowRadius: 8,
                elevation: 6,
                overflow: 'hidden',
              }}>
                <Image source={myAvatar} style={{ width: '100%', height: '100%' }} />
              </View>
            </Marker>

            {/* Walking directions route */}
            {(mode === 'directions' || mode === 'navigating') && openerUser && (openerUser as any).lat && (
              <MapViewDirections
                origin={YOU_COORD}
                destination={{ latitude: (openerUser as any).lat, longitude: (openerUser as any).lng }}
                apikey={GOOGLE_MAPS_API_KEY}
                mode="WALKING"
                strokeWidth={5}
                strokeColor={COLORS.accentCoral}
                lineDashPattern={[1]}
                onReady={(result) => {
                  setRouteInfo({ distance: result.distance, duration: result.duration });
                }}
                onError={(error) => console.warn('Directions error:', error)}
              />
            )}
          </MapView>

          {/* ── SHOUTOUT BELL — floating over the map, top right.
              right:24 + 44px width keeps it on the same vertical axis as the header filter icon ── */}
          {mode !== 'openers' && mode !== 'directions' && mode !== 'navigating' && (
            <View style={{ position: 'absolute', top: 12, right: 24, zIndex: 30 }}>
              <TouchableOpacity
                onPress={() => requireAvailable(() => {
                  if (mode === 'default') { setMode('shoutout'); setTappedPinIdx(null); }
                  else if (mode === 'shoutout') setMode('default');
                })}
                style={{
                  width: 44, height: 44, borderRadius: 14,
                  backgroundColor: mode === 'shoutout' ? COLORS.keylinePurple : '#FFFFFF',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: '2px 2px 0px rgba(32,22,66,0.15)',
                } as any}>
                <Image
                  source={ICONS.hangouts}
                  style={{ width: 24, height: 24, tintColor: mode === 'shoutout' ? '#FFFFFF' : COLORS.keylinePurple }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              {USERS.filter(u => u.hasShout).length > 0 && (
                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.piggyPinkBright, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 10, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>{USERS.filter(u => u.hasShout).length}</Text>
                </View>
              )}
            </View>
          )}

          {/* ── PIN POPUP — dynamically positioned to stay glued to the tapped pin ── */}
          {popupUser && mode === 'default' && popupPosition && mapSize.width > 0 && (() => {
            const CARD_WIDTH = Math.min(320, mapSize.width - 32);
            const CARD_HEIGHT_ESTIMATE = 230;
            const GAP = 16;
            const spaceBelow = mapSize.height - popupPosition.y;
            const showAbove = spaceBelow < CARD_HEIGHT_ESTIMATE + GAP + 20 && popupPosition.y > CARD_HEIGHT_ESTIMATE + GAP;
            const cardLeft = Math.max(16, Math.min(popupPosition.x - CARD_WIDTH / 2, mapSize.width - CARD_WIDTH - 16));
            const cardTop = showAbove ? popupPosition.y - CARD_HEIGHT_ESTIMATE - GAP : popupPosition.y + GAP;
            const connectorLeft = Math.max(cardLeft + 20, Math.min(popupPosition.x - 8, cardLeft + CARD_WIDTH - 36));
            return (
              <>
                {/* connector — always glued between the card edge and the pin */}
                <View pointerEvents="none" style={{
                  position: 'absolute',
                  left: connectorLeft,
                  top: showAbove ? cardTop + CARD_HEIGHT_ESTIMATE - 8 : cardTop - 8,
                  width: 16, height: 16,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 2, borderColor: COLORS.keylinePurple,
                  transform: [{ rotate: '45deg' }],
                  zIndex: 99,
                }} />
                <View style={{
                  position: 'absolute', left: cardLeft, top: cardTop, width: CARD_WIDTH,
                  backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
                  borderWidth: 2, borderColor: COLORS.keylinePurple,
                  boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
                  zIndex: 100,
                } as any}>
                  {/* close button — floating top-right corner, separate from the distance CTA */}
                  <TouchableOpacity
                    onPress={() => setPopupUser(null)}
                    style={{
                      position: 'absolute', top: -12, right: -12, zIndex: 101,
                      width: 28, height: 28, borderRadius: 14,
                      backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: COLORS.keylinePurple,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                    <Text style={{ fontSize: 14, color: COLORS.keylinePurple }}>×</Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image source={{ uri: popupUser.photo }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, borderWidth: 2, borderColor: COLORS.keylinePurple }} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontFamily: 'Fredoka_700Bold', fontSize: 16, color: COLORS.keylinePurple }}>{popupUser.name}</Text>
                      <Text style={{ color: '#666', fontSize: 13, fontFamily: 'PlusJakartaSans_400Regular' }}>{popupUser.year} · {popupUser.major}</Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={visible ? 1 : 0.8}
                      onPress={() => requireAvailable(() => {})}
                      style={{
                        backgroundColor: visible ? COLORS.accentCoral : '#BBB',
                        borderRadius: 100, paddingHorizontal: 12, paddingVertical: 6,
                      }}>
                      <Text style={{ fontSize: 13, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>
                        {visible ? `📍 ${popupUser.distance}` : `${LOCKED} Distance`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ backgroundColor: COLORS.accentCoralLight, borderRadius: 12, padding: 12, marginTop: 12 }}>
                    <Text style={{ fontSize: 14, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', fontStyle: 'italic', lineHeight: 20 }}>
                      "{popupUser.iceBreakers[0]}"
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => { handleViewProfile(popupUser); setPopupUser(null); }}
                    style={{ backgroundColor: COLORS.accentCoral, padding: 14, borderRadius: 100, marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 15 }}>View Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            );
          })()}

          {/* ── SHOUTOUT DRAWER ── */}
          {mode === 'shoutout' && (
            <View style={{ position: 'absolute', bottom: TAB_BAR_HEIGHT, left: 0, right: 0, backgroundColor: COLORS.cream, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 2, borderColor: COLORS.keylinePurple, paddingTop: 12, paddingBottom: 16, zIndex: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 14 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>Shoutouts nearby</Text>
                <TouchableOpacity onPress={() => setMode('default')} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18, color: '#999' }}>✕</Text>
                </TouchableOpacity>
              </View>
              {USERS.filter(u => u.hasShout).map((u, i) => (
                <View key={u.id} style={{ paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#EEE' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Image source={{ uri: u.photo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, marginTop: 2, borderWidth: 1.5, borderColor: COLORS.keylinePurple }} />
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginRight: 6 }}>{u.name}</Text>
                        <Text style={{ fontSize: 12, color: '#999', fontFamily: 'PlusJakartaSans_400Regular' }}>{u.year} · {u.distance} · {u.timeAgo}</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 20 }}>{u.shout}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { setOpenerUser(u); enterDirections(u); }}
                      style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: COLORS.accentCoral, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DirectionSignIcon size={22} inverted />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── DISTANCE + ICEBREAKERS SHEETS ──
              Both are @gorhom BottomSheetModals driven by `mode`; see the effect above.
              bottomInset lifts them clear of the tab bar. */}
          <DistanceDrawer
            bottomSheetModalRef={distanceSheetRef}
            peer={openerUser as any}
            bottomInset={TAB_BAR_HEIGHT}
            routeInfo={routeInfo}
            isNavigating={mode === 'navigating'}
            available={visible}
            onAvatarPress={() => openerUser && handleViewProfile(openerUser)}
            onChatPress={() => setMode('openers')}
            onStartPress={() => setMode(mode === 'navigating' ? 'directions' : 'navigating')}
            onStepsPress={() => {}}
            onClose={closeDirections}
            onDismiss={() => {
              // Only a swipe-down closes the flow; a programmatic dismiss during a
              // drawer swap has already moved `mode` on.
              if (mode === 'directions' || mode === 'navigating') closeDirections();
            }}
          />

          <IceBreakersDrawer
            bottomSheetModalRef={iceBreakersSheetRef}
            peer={openerUser as any}
            bottomInset={TAB_BAR_HEIGHT}
            available={visible}
            onAvatarPress={() => openerUser && handleViewProfile(openerUser)}
            onDirectionsPress={() => requireAvailable(() => enterDirections(openerUser))}
            onClose={() => { setMode('default'); setOpenerUser(null); }}
            onDismiss={() => {
              if (mode === 'openers') { setMode('default'); setOpenerUser(null); }
            }}
          />

        </View>

        {/* ── FILTER MODAL ── */}
        <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(32,22,66,0.45)', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowFilters(false)} />
            <View style={{ backgroundColor: COLORS.cream, borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 2, borderColor: COLORS.keylinePurple, borderBottomWidth: 0, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 22, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 24, color: '#666' }}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 13, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Major</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                {MAJORS.map(major => {
                  const isSelected = selectedMajors.includes(major);
                  return (
                    <TouchableOpacity
                      key={major}
                      onPress={() => setSelectedMajors(prev => prev.includes(major) ? prev.filter(m => m !== major) : [...prev, major])}
                      style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: isSelected ? COLORS.accentCoral : '#FFFFFF', borderWidth: 1.5, borderColor: isSelected ? COLORS.accentCoral : '#DDDDDD' }}>
                      <Text style={{ color: isSelected ? '#FFFFFF' : COLORS.keylinePurple, fontSize: 13, fontFamily: 'PlusJakartaSans_500Medium' }}>{major}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ fontSize: 13, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Distance</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
                {[100, 150, 200].map(d => {
                  const isSelected = selectedDistance === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setSelectedDistance(isSelected ? null : d)}
                      style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: isSelected ? COLORS.accentCoral : '#FFFFFF', borderWidth: 1.5, borderColor: isSelected ? COLORS.accentCoral : '#DDDDDD' }}>
                      <Text style={{ color: isSelected ? '#FFFFFF' : COLORS.keylinePurple, fontSize: 14, fontFamily: 'PlusJakartaSans_600SemiBold' }}>{d}m</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => { setSelectedMajors([]); setSelectedDistance(null); }}
                style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ color: COLORS.accentCoral, fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>Reset filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {lockedModal}

      </View>
    );
  }

  // ─────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────
  const featuredShout = USERS.find(u => u.hasShout);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {header}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Featured shoutout card — keyline purple border, coral text */}
        {featuredShout && (
          <TouchableOpacity
            onPress={() => requireAvailable(() => handleViewProfile(featuredShout))}
            activeOpacity={0.85}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: COLORS.keylinePurple, boxShadow: '3px 3px 0px rgba(32,22,66,0.18)' } as any}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ position: 'relative', marginRight: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: featuredShout.color, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.keylinePurple }}>
                  <Image source={{ uri: featuredShout.photo }} style={{ width: '100%', height: '100%' }} />
                </View>
                <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.accentCoral, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 8 }}>🎙</Text>
                </View>
              </View>
              <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, flex: 1 }}>
                {featuredShout.name} - {featuredShout.year} - {featuredShout.major}
              </Text>
            </View>
            {visible ? (
              <>
                <Text style={{ fontSize: 15, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 22, marginBottom: 6 }}>{featuredShout.shout}</Text>
                <Text style={{ fontSize: 13, color: '#999', fontFamily: 'PlusJakartaSans_400Regular' }}>Shout {featuredShout.distance} away · {featuredShout.timeAgo}</Text>
              </>
            ) : (
              <Text style={{ fontSize: 15, color: '#999', fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 22 }}>
                {LOCKED} Go available to read shout-outs
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* User cards — photo avatar, whole card tappable */}
        {USERS.map(user => (
          <TouchableOpacity
            key={user.id}
            onPress={() => handleViewProfile(user)}
            activeOpacity={0.85}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: COLORS.keylinePurple, boxShadow: '3px 3px 0px rgba(32,22,66,0.18)' } as any}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ position: 'relative', marginRight: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: user.color, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.keylinePurple }}>
                  <Image source={{ uri: user.photo }} style={{ width: '100%', height: '100%' }} />
                </View>
                {user.hasShout && (
                  <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: COLORS.accentCoral, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 8 }}>🎙</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 16, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>{user.name}</Text>
                  <Text style={{ fontSize: 13, color: visible ? COLORS.accentCoral : '#999', fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                    {visible ? `📍 ${user.distance} from you` : `${LOCKED} Distance`}
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#666', fontFamily: 'PlusJakartaSans_400Regular' }}>{user.year} - {user.major}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', fontStyle: 'italic', lineHeight: 22, marginBottom: 12 }}>
              "{user.iceBreakers[0]}"
            </Text>
            <TouchableOpacity
              onPress={() => handleViewProfile(user)}
              style={{ height: 40, backgroundColor: COLORS.accentCoral, borderRadius: 100, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontFamily: 'Fredoka_700Bold' }}>View Profile</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {lockedModal}
    </View>
  );
}
