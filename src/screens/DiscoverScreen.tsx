import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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

const YOU_COORD = { latitude: 37.7760, longitude: -122.4190 };

const USERS = [
  {
    id: '1', name: 'James', initial: 'J', color: '#000FE1', year: 'Sophomore', major: 'Computer Science', distance: '320m',
    lat: 37.7792, lng: -122.4232,
    photo: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&q=80',
    iceBreakers: ["I can solve a Rubik's cube in under 30 seconds", 'I once ate a whole jar of peanut butter in one sitting', 'I have never lost a game of chess against a computer on easy mode'],
    interests: ['Tech', 'Gaming', 'Food'],
  },
  {
    id: '2', name: 'Leo', initial: 'L', color: '#C4A000', year: 'Senior', major: 'Music & Business', distance: '210m',
    lat: 37.7772, lng: -122.4228,
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    hasShout: true, shout: "Anyone taken Prof. Miller before? How's the final?", timeAgo: '4 min ago',
    iceBreakers: ['I once won a contest I didn\'t mean to enter', 'I wrote a musical in high school that got performed', 'I have been to 14 countries but never left my home continent until this year'],
    interests: ['Music', 'Travel', 'Business'],
  },
  {
    id: '3', name: 'Millie', initial: 'M', color: '#7B4FBE', year: 'Freshman', major: 'Psychology', distance: '310m',
    lat: 37.7788, lng: -122.4198,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    hasShout: true, shout: "Does anyone want to grab coffee at the student union? I'll be there till 3pm", timeAgo: '9 min ago',
    iceBreakers: ['I once ran into my professor at a party and outdanced them', 'I can identify 40 bird calls by sound', 'I have read the full terms and conditions of every app I\'ve downloaded'],
    interests: ['Psychology', 'Nature', 'Reading'],
  },
  {
    id: '4', name: 'Paul', initial: 'P', color: '#E03060', year: 'Junior', major: 'Chemistry', distance: '70m',
    lat: 37.7755, lng: -122.4232,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    hasShout: true, shout: 'Lost my green hoodie somewhere near the library — anyone seen it?', timeAgo: '12 min ago',
    iceBreakers: ['I once woke up in a different country than I fell asleep in', 'I can solve differential equations in my head', 'I have never watched a single episode of Friends'],
    interests: ['Science', 'Travel', 'Gaming'],
  },
  {
    id: '5', name: 'Sofia', initial: 'S', color: '#26A65B', year: 'Freshman', major: 'Biology', distance: '180m',
    lat: 37.7745, lng: -122.4235,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    hasShout: true, shout: 'Anyone know a good spot on campus to study that\'s not the library? Somewhere quiet with good wifi', timeAgo: '3 min ago',
    iceBreakers: ['I grew up in 5 different countries across 3 continents', 'I have never lived anywhere for more than 3 years', 'I speak 4 languages but dream in only one'],
    interests: ['Science', 'Travel', 'Languages'],
  },
  {
    id: '6', name: 'Alex', initial: 'A', color: '#E74C3C', year: 'Junior', major: 'Engineering', distance: '250m',
    lat: 37.7740, lng: -122.4202,
    photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&q=80',
    iceBreakers: ['I built a robot that makes pancakes', 'I once cycled across an entire country in a week', 'I have memorised pi to 50 decimal places'],
    interests: ['Tech', 'Running', 'Food'],
  },
  {
    id: '7', name: 'Nina', initial: 'N', color: '#888888', year: 'Senior', major: 'Art History', distance: '400m',
    lat: 37.7762, lng: -122.4160,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    hasShout: true, shout: 'Looking for someone to visit the new exhibit at the campus gallery this weekend — free entry on Saturday', timeAgo: '22 min ago',
    iceBreakers: ['I once accidentally walked into a film set and ended up as an extra', 'I collect vintage maps', 'I have never eaten a hamburger'],
    interests: ['Art', 'Film', 'Travel'],
  },
  {
    id: '8', name: 'Omar', initial: 'O', color: '#1ABC9C', year: 'Sophomore', major: 'Economics', distance: '150m',
    lat: 37.7732, lng: -122.4155,
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    iceBreakers: ['I won a national spelling bee at age 10', 'I once negotiated a lower price on a house just for fun', 'I can read upside down faster than most people can read normally'],
    interests: ['Gaming', 'Reading', 'Travel'],
  },
];

// Road-sign direction icon — diamond with rounded corners, black border, turn arrow inside.
// inverted=true: white background used on dark button backgrounds.
const DirectionSignIcon = ({ size = 28, inverted = false }: { size?: number; inverted?: boolean }) => {
  const d = size * 0.72;
  const border = size * 0.09;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: d, height: d,
        borderRadius: size * 0.14,
        borderWidth: border,
        borderColor: inverted ? '#FFFFFF' : '#000000',
        backgroundColor: inverted ? 'transparent' : '#FFFFFF',
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          fontSize: size * 0.34,
          fontWeight: '900',
          color: inverted ? '#FFFFFF' : '#000000',
          transform: [{ rotate: '-45deg' }],
          lineHeight: size * 0.44,
          textAlign: 'center',
          marginTop: -size * 0.02,
        }}>↱</Text>
      </View>
    </View>
  );
};

export default function DiscoverScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
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

  // When returning from UserProfile via "Say Hi!" — open openers sheet and zoom to user.
  useEffect(() => {
    if (!openOpeners || !sayHiUser) return;
    setOpenerUser(sayHiUser);
    setMode('openers');
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
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 34, fontWeight: '800', color: '#000000', marginBottom: 12 }}>Discover</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 100, padding: 3 }}>
          {(['map', 'list'] as const).map(v => (
            <TouchableOpacity key={v} onPress={() => setView(v)}
              style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, backgroundColor: view === v ? '#FFFFFF' : 'transparent' }}>
              <Text style={{ fontSize: 14, fontWeight: view === v ? '700' : '400', color: view === v ? '#111111' : '#888888', textTransform: 'capitalize' }}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity>
          <Text style={{ fontSize: 22, color: '#888888' }}>⊞</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─────────────────────────────────────────────────────────
  // MAP VIEW
  // ─────────────────────────────────────────────────────────
  if (view === 'map') {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000' }}>

        {/* ── HEADER — normal flex element, not absolute ── */}
        <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12, backgroundColor: '#FFFFFF' }}>
          <Text style={{ fontSize: 34, fontWeight: '800', color: '#000000', marginBottom: 12 }}>Discover</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 100, padding: 3 }}>
              {(['map', 'list'] as const).map(v => (
                <TouchableOpacity key={v} onPress={() => setView(v)}
                  style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, backgroundColor: view === v ? '#FFFFFF' : 'transparent' }}>
                  <Text style={{ fontSize: 14, fontWeight: view === v ? '700' : '400', color: view === v ? '#111111' : '#888888', textTransform: 'capitalize' }}>{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {/* Filter icon */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  onPress={() => setShowFilters(true)}
                  style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: '#FFFFFF',
                    elevation: 4,
                    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Text style={{ fontSize: 20 }}>⚙️</Text>
                </TouchableOpacity>
                {(selectedMajors.length > 0 || selectedDistance !== null) && (
                  <View style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#000FE1', borderWidth: 1.5, borderColor: '#FFFFFF' }} />
                )}
              </View>
              {/* Shoutout icon */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  onPress={() => {
                    if (mode === 'default') { setMode('shoutout'); setTappedPinIdx(null); }
                    else if (mode === 'shoutout') setMode('default');
                  }}
                  disabled={mode === 'openers' || mode === 'directions' || mode === 'navigating'}
                  style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: mode === 'shoutout' ? '#000FE1' : '#FFFFFF',
                    elevation: 4,
                    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
                    alignItems: 'center', justifyContent: 'center',
                    opacity: (mode === 'openers' || mode === 'directions' || mode === 'navigating') ? 0.4 : 1,
                  }}>
                  <Text style={{ fontSize: 22 }}>📢</Text>
                </TouchableOpacity>
                <View style={{ position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: '#FF6B00', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4, borderWidth: 1.5, borderColor: '#FFFFFF' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>{USERS.filter(u => u.hasShout).length}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ── MAP AREA — flex:1 container below the header ── */}
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            initialRegion={{ latitude: YOU_COORD.latitude, longitude: YOU_COORD.longitude, latitudeDelta: 0.008, longitudeDelta: 0.008 }}
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
                  onPress={() => mode === 'default' ? setPopupUser(popupUser?.id === user.id ? null : user) : undefined}>
                  <View style={{
                    width: size, height: size, borderRadius: size / 2,
                    backgroundColor: popupUser?.id === user.id && mode === 'default' ? '#111111' : user.color,
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: isSelected ? 4 : 2, borderColor: '#FFFFFF',
                    shadowColor: '#000', shadowOpacity: isSelected ? 0.3 : 0, shadowRadius: 8,
                    elevation: isSelected ? 6 : 2,
                  }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: isSelected ? 18 : 16 }}>{user.initial}</Text>
                  </View>
                </Marker>
              );
            })}

            {/* You marker */}
            <Marker coordinate={YOU_COORD} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={{
                width: mode === 'default' ? 48 : 54,
                height: mode === 'default' ? 48 : 54,
                borderRadius: 27,
                backgroundColor: '#EF4514',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: mode === 'default' ? 3 : 4, borderColor: '#FFFFFF',
                shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 8,
                elevation: 6,
              }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>You</Text>
              </View>
            </Marker>

            {/* Walking directions route */}
            {(mode === 'directions' || mode === 'navigating') && openerUser && (openerUser as any).lat && (
              <>
                {(console.log('Drawing route:', { mode, origin: YOU_COORD, destination: { lat: (openerUser as any).lat, lng: (openerUser as any).lng }, apiKey: GOOGLE_MAPS_API_KEY?.substring(0, 10) + '...' }) as any)}
                <MapViewDirections
                origin={YOU_COORD}
                destination={{ latitude: (openerUser as any).lat, longitude: (openerUser as any).lng }}
                apikey={GOOGLE_MAPS_API_KEY}
                mode="WALKING"
                strokeWidth={5}
                strokeColor="#000FE1"
                lineDashPattern={[1]}
                onReady={(result) => {
                  setRouteInfo({ distance: result.distance, duration: result.duration });
                }}
                onError={(error) => console.warn('Directions error:', error)}
              />
              </>
            )}
          </MapView>

          {/* ── PIN POPUP ── */}
          {popupUser && mode === 'default' && (
            <View style={{
              position: 'absolute', top: 12, left: 16, right: 16,
              backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
              shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 }, elevation: 8, zIndex: 100,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Image source={{ uri: popupUser.photo }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 16, color: '#000000' }}>{popupUser.name}</Text>
                  <Text style={{ color: '#666666', fontSize: 13 }}>{popupUser.year} · {popupUser.major}</Text>
                  <Text style={{ color: '#000FE1', fontSize: 13, marginTop: 2, fontWeight: '600' }}>{popupUser.distance} away</Text>
                </View>
                <TouchableOpacity onPress={() => setPopupUser(null)} style={{ paddingHorizontal: 8 }}>
                  <Text style={{ fontSize: 20, color: '#999999' }}>×</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => { handleViewProfile(popupUser); setPopupUser(null); }}
                style={{ backgroundColor: '#000FE1', padding: 12, borderRadius: 12, marginTop: 12, alignItems: 'center' }}>
                <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 15 }}>View Profile</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── SHOUTOUT DRAWER ── */}
          {mode === 'shoutout' && (
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingBottom: insets.bottom + 16, elevation: 12, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, zIndex: 20 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 14 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 8 }}>
                <Text style={{ fontSize: 17, fontWeight: '700', color: '#000000' }}>Shoutouts nearby</Text>
                <TouchableOpacity onPress={() => setMode('default')} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18, color: '#888888' }}>✕</Text>
                </TouchableOpacity>
              </View>
              {USERS.filter(u => u.hasShout).map((u, i) => (
                <View key={u.id} style={{ paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: i === 0 ? 0 : 1, borderColor: '#F0F0F0' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Image source={{ uri: u.photo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, marginTop: 2 }} />
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#000000', marginRight: 6 }}>{u.name}</Text>
                        <Text style={{ fontSize: 12, color: '#AAAAAA' }}>{u.year} · {u.distance} · {u.timeAgo}</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: '#333333', lineHeight: 20 }}>{u.shout}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => { setOpenerUser(u); enterDirections(u); }}
                      style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <DirectionSignIcon size={22} inverted />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── ICEBREAKERS BOTTOM SHEET ── */}
          {mode === 'openers' && openerUser && (() => {
            const photoUri = openerUser.photoUri ?? openerUser.photo;
            const fallbackColor = openerUser.avatarColor ?? openerUser.color ?? '#000FE1';
            const distanceLabel = openerUser.distance ?? '';
            const iceBreakers: string[] = Array.isArray(openerUser.iceBreakers) ? openerUser.iceBreakers : [];
            return (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 20, elevation: 12, zIndex: 20 }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
                  ) : (
                    <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: fallbackColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>{openerUser.name.charAt(0)}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#000000' }}>{openerUser.name}</Text>
                    <Text style={{ fontSize: 13, color: '#888888' }}>{openerUser.year} · {openerUser.major}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <Text style={{ fontSize: 13, color: '#8888CC' }}>📍 {distanceLabel}</Text>
                      <TouchableOpacity
                        onPress={() => enterDirections(openerUser)}
                        style={{ backgroundColor: '#000FE1', borderRadius: 8, padding: 6, alignItems: 'center', justifyContent: 'center' }}>
                        <DirectionSignIcon size={22} inverted />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => { setMode('default'); setOpenerUser(null); }} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18, color: '#888888' }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#888888', letterSpacing: 1, marginBottom: 10 }}>ICEBREAKERS</Text>
                {iceBreakers.slice(0, 3).map((breaker, i) => (
                  <TouchableOpacity key={i} activeOpacity={0.75}
                    style={{ backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <Text style={{ fontSize: 14, color: '#333333', lineHeight: 22 }}>{breaker}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {/* ── DIRECTIONS BOTTOM SHEET ── */}
          {(mode === 'directions' || mode === 'navigating') && (() => {
            const photoUri = openerUser?.photoUri ?? openerUser?.photo;
            const fallbackColor = openerUser?.avatarColor ?? openerUser?.color ?? '#000FE1';
            const distanceLabel = openerUser?.distance ?? '';
            const isNavigating = mode === 'navigating';
            const closeDirections = () => {
              setMode('default');
              setOpenerUser(null);
              setRouteInfo(null);
              setPopupUser(null);
              mapRef.current?.animateToRegion({ ...YOU_COORD, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 600);
            };
            return (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 12, paddingHorizontal: 20, paddingBottom: insets.bottom + 20, elevation: 12, zIndex: 20 }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
                {openerUser && (
                  <>
                    {/* Back link */}
                    <TouchableOpacity
                      onPress={() => {
                        setMode('openers');
                        if (openerUser && mapRef.current) {
                          const userLat = (openerUser as any).lat ?? YOU_COORD.latitude;
                          const userLng = (openerUser as any).lng ?? YOU_COORD.longitude;
                          setTimeout(() => {
                            mapRef.current?.fitToCoordinates(
                              [YOU_COORD, { latitude: userLat, longitude: userLng }],
                              { edgePadding: { top: 180, right: 80, bottom: 380, left: 80 }, animated: true }
                            );
                          }, 200);
                        }
                      }}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, marginBottom: 12 }}>
                      <Text style={{ fontSize: 16, color: '#000FE1', marginRight: 4 }}>‹</Text>
                      <Text style={{ fontSize: 14, color: '#000FE1', fontWeight: '600' }}>Back to Icebreakers</Text>
                    </TouchableOpacity>
                    {/* User info row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
                      ) : (
                        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: fallbackColor, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>{openerUser.name.charAt(0)}</Text>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 17, fontWeight: '700', color: '#000000' }}>{openerUser.name}</Text>
                        <Text style={{ fontSize: 13, color: '#888888' }}>{openerUser.year} · {openerUser.major}</Text>
                        <Text style={{ fontSize: 13, color: '#8888CC', marginTop: 2 }}>📍 {distanceLabel}</Text>
                        {routeInfo && (
                          <Text style={{ fontSize: 13, color: '#666666', marginTop: 2 }}>
                            {routeInfo.duration.toFixed(0)} min walk · {(routeInfo.distance * 1000).toFixed(0)}m
                          </Text>
                        )}
                      </View>
                      <TouchableOpacity onPress={closeDirections} style={{ padding: 4 }}>
                        <Text style={{ fontSize: 22, color: '#888888' }}>×</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => setMode(isNavigating ? 'directions' : 'navigating')}
                    style={{ flex: 1, height: 52, borderRadius: 100, backgroundColor: isNavigating ? '#CC3300' : '#000FE1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16, color: '#FFFFFF' }}>{isNavigating ? '■' : '▲'}</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>{isNavigating ? 'Stop' : 'Start'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, height: 52, borderRadius: 100, backgroundColor: '#EEF0FB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>☰</Text>
                    <Text style={{ color: '#000FE1', fontSize: 16, fontWeight: '600' }}>Steps</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}

        </View>

        {/* ── FILTER MODAL ── */}
        <Modal visible={showFilters} transparent animationType="slide" onRequestClose={() => setShowFilters(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setShowFilters(false)} />
            <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Text style={{ fontSize: 22, fontWeight: '700', color: '#000000' }}>Filters</Text>
                <TouchableOpacity onPress={() => setShowFilters(false)} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 24, color: '#666666' }}>×</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 13, fontWeight: '700', color: '#000000', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Major</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                {MAJORS.map(major => {
                  const isSelected = selectedMajors.includes(major);
                  return (
                    <TouchableOpacity
                      key={major}
                      onPress={() => setSelectedMajors(prev => prev.includes(major) ? prev.filter(m => m !== major) : [...prev, major])}
                      style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: isSelected ? '#000FE1' : '#F0F0F5' }}>
                      <Text style={{ color: isSelected ? '#FFFFFF' : '#333333', fontSize: 13, fontWeight: '500' }}>{major}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={{ fontSize: 13, fontWeight: '700', color: '#000000', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Distance</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
                {[100, 150, 200].map(d => {
                  const isSelected = selectedDistance === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setSelectedDistance(isSelected ? null : d)}
                      style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: isSelected ? '#000FE1' : '#F0F0F5' }}>
                      <Text style={{ color: isSelected ? '#FFFFFF' : '#333333', fontSize: 14, fontWeight: '600' }}>{d}m</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                onPress={() => { setSelectedMajors([]); setSelectedDistance(null); }}
                style={{ alignItems: 'center', paddingVertical: 12 }}>
                <Text style={{ color: '#000FE1', fontSize: 16, fontWeight: '600' }}>Reset filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </View>
    );
  }

  // ─────────────────────────────────────────────────────────
  // LIST VIEW
  // ─────────────────────────────────────────────────────────
  const featuredShout = USERS.find(u => u.hasShout);

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
      {header}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Featured shoutout card — blue border, gold text */}
        {featuredShout && (
          <TouchableOpacity
            onPress={() => handleViewProfile(featuredShout)}
            activeOpacity={0.85}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: '#000FE1' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ position: 'relative', marginRight: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: featuredShout.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>{featuredShout.name.charAt(0)}</Text>
                </View>
                <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E07000', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 8 }}>🎙</Text>
                </View>
              </View>
              <Text style={{ fontSize: 15, fontWeight: '800', color: featuredShout.color, flex: 1 }}>
                {featuredShout.name} - {featuredShout.year} - {featuredShout.major}
              </Text>
            </View>
            <Text style={{ fontSize: 15, color: featuredShout.color, lineHeight: 22, marginBottom: 6 }}>{featuredShout.shout}</Text>
            <Text style={{ fontSize: 13, color: '#AAAAAA' }}>Shout {featuredShout.distance} away · {featuredShout.timeAgo}</Text>
          </TouchableOpacity>
        )}

        {/* User cards — colored initial avatar, no photo, whole card tappable */}
        {USERS.map(user => (
          <TouchableOpacity
            key={user.id}
            onPress={() => handleViewProfile(user)}
            activeOpacity={0.85}
            style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E0E0E0' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ position: 'relative', marginRight: 12 }}>
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: user.color, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 18 }}>{user.name.charAt(0)}</Text>
                </View>
                {user.hasShout && (
                  <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: '#E07000', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 8 }}>🎙</Text>
                  </View>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#000000' }}>{user.name}</Text>
                  <Text style={{ fontSize: 13, color: '#EF4514' }}>📍 {user.distance} from you</Text>
                </View>
                <Text style={{ fontSize: 13, color: '#000FE1' }}>{user.year} - {user.major}</Text>
              </View>
            </View>
            <Text style={{ fontSize: 14, color: '#555555', fontStyle: 'italic', lineHeight: 22, marginBottom: 12 }}>
              "{user.iceBreakers[0]}"
            </Text>
            <TouchableOpacity
              onPress={() => handleViewProfile(user)}
              style={{ height: 36, backgroundColor: '#000FE1', borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>View Profile</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
