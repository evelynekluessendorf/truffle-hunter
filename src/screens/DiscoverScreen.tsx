import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Dimensions, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing, Radius, FontFamily } from '../constants/theme';
import MapProfileCard from '../components/MapProfileCard';
import UserAvatar from '../components/UserAvatar';
import InterestTag from '../components/InterestTag';
import { nearbyUsers, featuredShoutout, currentUser } from '../data/mockData';

const MOCK_SHOUTOUTS = [
  featuredShoutout,
  { id: '2', authorName: 'Maya', authorYear: 'Junior', authorMajors: 'Psychology', authorColor: '#3B82F6', message: "Anyone want to grab coffee at the student center? I'll be there till 3pm", distance: '120m away', timeAgo: '12 min ago' },
  { id: '3', authorName: 'Jake', authorYear: 'Sophomore', authorMajors: 'Engineering', authorColor: '#10B981', message: "Free notes for Prof. Anderson's midterm — DM me if you want them", distance: '200m away', timeAgo: '18 min ago' },
];

const DRAWER_CLOSED_H = 64;
const DRAWER_OPEN_H = Math.round(Dimensions.get('window').height * 0.50);
import { Ionicons } from '@expo/vector-icons';
import { User, RootTabParamList } from '../types';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type DiscoverRoute = RouteProp<RootTabParamList, 'Discover'>;

const shoutoutUserId = nearbyUsers.find(u => u.name === featuredShoutout.authorName)?.id;

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = 270;
const CARD_APPROX_HEIGHT = 210;
const PIN_CIRCLE = 40;
const PIN_TIP = 8;
const PIN_TOTAL = PIN_CIRCLE + PIN_TIP; // 48 — tip bottom = coordinate anchor point

const CAMPUS = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.003,
  longitudeDelta: 0.003,
};

type FilterKey = 'interest' | 'major' | 'year';
type DistanceKey = '100m' | '200m' | '500m';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'interest', label: 'Same interest' },
  { key: 'major',    label: 'Same major' },
  { key: 'year',     label: 'Same year' },
];

const DISTANCE_OPTIONS: DistanceKey[] = ['100m', '200m', '500m'];

const DISTANCE_DELTA: Record<DistanceKey, number> = {
  '100m': 0.001,
  '200m': 0.002,
  '500m': 0.005,
};

function parseDistanceM(distance?: string): number {
  if (!distance) return Infinity;
  const match = distance.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

function applyFilters(users: User[], active: Set<FilterKey>, maxDistance: DistanceKey | null): User[] {
  return users.filter(u => {
    if (active.has('interest') && !u.interests.some(i => currentUser.interests.includes(i))) return false;
    if (active.has('major')    && u.major !== currentUser.major) return false;
    if (active.has('year')     && u.year  !== currentUser.year)  return false;
    if (maxDistance && parseDistanceM(u.distance) > parseInt(maxDistance, 10)) return false;
    return true;
  });
}

interface UserMarkerProps {
  user: User;
  isSelected: boolean;
  dimmed: boolean;
  shoutoutUserId: string | undefined;
  onPress: () => void;
}

function UserMarker({ user, isSelected, dimmed, shoutoutUserId, onPress }: UserMarkerProps) {
  const [ready, setReady] = useState(!user.photoUri);

  return (
    <Marker
      coordinate={{ latitude: user.latitude!, longitude: user.longitude! }}
      anchor={{ x: 0.5, y: 1.0 }}
      tracksViewChanges={!ready}
      zIndex={isSelected ? 999 : 1}
      onPress={onPress}
    >
      <View style={{ alignItems: 'center' }}>
        <View style={[pinSt.circle, { backgroundColor: user.avatarColor }, dimmed && !isSelected && { opacity: 0.3 }]}>
          {user.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={pinSt.photo} onLoad={() => setReady(true)} />
          ) : (
            <Text style={pinSt.initial}>{user.name.charAt(0)}</Text>
          )}
        </View>
        <View style={[pinSt.tip, { borderTopColor: user.avatarColor, opacity: dimmed && !isSelected ? 0.3 : 1 }]} />
        {shoutoutUserId === user.id && !dimmed && (
          <View style={pinSt.badge}>
            <Text style={pinSt.badgeIcon}>📣</Text>
          </View>
        )}
      </View>
    </Marker>
  );
}

const pinSt = StyleSheet.create({
  circle: {
    width: PIN_CIRCLE,
    height: PIN_CIRCLE,
    borderRadius: PIN_CIRCLE / 2,
    borderWidth: 3,
    borderColor: Colors.white,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  photo: { width: '100%', height: '100%' },
  initial: { color: Colors.white, fontWeight: '700', fontSize: 15 },
  tip: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: PIN_TIP,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    marginTop: 2,
  },
  badge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: Colors.white, borderRadius: 10,
    width: 20, height: 20, alignItems: 'center', justifyContent: 'center',
  },
  badgeIcon: { fontSize: 10 },
});

export default function DiscoverScreen() {
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [cardPoint, setCardPoint] = useState<{ x: number; y: number } | null>(null);
  const [sendoffUser, setSendoffUser] = useState<User | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current;
  const [sayHiUser, setSayHiUser] = useState<User | null>(null);
  const [sayHiDrawerOpen, setSayHiDrawerOpen] = useState(false);
  const sayHiAnim = useRef(new Animated.Value(0)).current;

  const closeShoutsDrawer = () => {
    Animated.timing(drawerAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    setDrawerOpen(false);
  };

  const toggleDrawer = () => {
    const toValue = drawerOpen ? 0 : 1;
    if (toValue === 1 && sayHiDrawerOpen) {
      Animated.timing(sayHiAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      setSayHiDrawerOpen(false);
    }
    Animated.spring(drawerAnim, { toValue, useNativeDriver: false, bounciness: 3 }).start();
    setDrawerOpen(o => !o);
  };

  const openSayHiDrawer = (user: User) => {
    if (drawerOpen) closeShoutsDrawer();
    setSayHiUser(user);
    setSayHiDrawerOpen(true);
    Animated.spring(sayHiAnim, { toValue: 1, useNativeDriver: false, bounciness: 3 }).start();
  };

  const toggleSayHiDrawer = () => {
    if (sayHiDrawerOpen) {
      Animated.timing(sayHiAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      setSayHiDrawerOpen(false);
    } else {
      if (drawerOpen) closeShoutsDrawer();
      setSayHiDrawerOpen(true);
      Animated.spring(sayHiAnim, { toValue: 1, useNativeDriver: false, bounciness: 3 }).start();
    }
  };

  const dismissSayHiUser = () => {
    Animated.timing(sayHiAnim, { toValue: 0, duration: 220, useNativeDriver: false }).start(() => {
      setSayHiUser(null);
      setSayHiDrawerOpen(false);
      setDirectionsActive(false);
      setDirectionsUser(null);
    });
  };

  const [directionsActive, setDirectionsActive] = useState(false);
  const [directionsUser, setDirectionsUser] = useState<User | null>(null);

  const startDirections = (user: User) => {
    if (!user.latitude || !user.longitude) return;
    setDirectionsActive(true);
    setDirectionsUser(user);
    Animated.timing(sayHiAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    setSayHiDrawerOpen(false);
    setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        [
          { latitude: CAMPUS.latitude, longitude: CAMPUS.longitude },
          { latitude: user.latitude!, longitude: user.longitude! },
        ],
        { edgePadding: { top: 80, right: 48, bottom: 180, left: 48 }, animated: true },
      );
    }, 250);
  };

  const endDirections = () => { setDirectionsActive(false); setDirectionsUser(null); };

  const SAY_HI_OPEN_H = Math.round(height * 0.48);
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(new Set());
  const [distanceFilter, setDistanceFilter] = useState<DistanceKey | null>(null);
  const mapRef = useRef<MapView>(null);
  const navigation = useNavigation<Nav>();
  const route = useRoute<DiscoverRoute>();

  const filteredUsers = applyFilters(nearbyUsers, activeFilters, distanceFilter);

  const toggleFilter = (key: FilterKey) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const openFilter = () => setFilterOpen(true);

  const selectDistanceFilter = (d: DistanceKey) => {
    const next = distanceFilter === d ? null : d;
    setDistanceFilter(next);
    const delta = next ? DISTANCE_DELTA[next] : CAMPUS.latitudeDelta;
    mapRef.current?.animateToRegion(
      { latitude: CAMPUS.latitude, longitude: CAMPUS.longitude, latitudeDelta: delta, longitudeDelta: delta },
      400,
    );
  };

  const resetFilter = () => {
    setActiveFilters(new Set());
    setDistanceFilter(null);
    mapRef.current?.animateToRegion(CAMPUS, 400);
  };

  useEffect(() => {
    const incoming = route.params?.sendoffUser;
    if (!incoming) return;
    setSendoffUser(incoming);
    if (incoming.latitude && incoming.longitude) {
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: incoming.latitude!,
          longitude: incoming.longitude!,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }, 600);
      }, 300);
    }
  }, [route.params?.sendoffUser]);

  useEffect(() => {
    const target = route.params?.sayHiUser;
    if (!target) return;
    openSayHiDrawer(target);
    if (target.latitude && target.longitude) {
      setTimeout(() => {
        mapRef.current?.animateToRegion({
          latitude: target.latitude!,
          longitude: target.longitude!,
          latitudeDelta: 0.002,
          longitudeDelta: 0.002,
        }, 400);
      }, 200);
    }
  }, [route.params?.sayHiUser]);

  const handlePinPress = async (user: User) => {
    if (sayHiDrawerOpen) {
      Animated.timing(sayHiAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
      setSayHiDrawerOpen(false);
    }
    setSelectedUser(user);
    setCardPoint(null);
    if (user.latitude != null && user.longitude != null && mapRef.current) {
      try {
        const pt = await mapRef.current.pointForCoordinate({
          latitude: user.latitude,
          longitude: user.longitude,
        });
        setCardPoint(pt);
      } catch {}
    }
  };

  const handleDismiss = () => { setSelectedUser(null); setCardPoint(null); };

  const handleViewProfile = (user: User) => {
    handleDismiss();
    navigation.navigate('UserProfile', { user });
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.topBar}>
          <Text style={styles.title}>Discover</Text>
          <View style={styles.toggleRow}>
            <View style={styles.toggle}>
              <TouchableOpacity
                style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}
                onPress={() => setView('map')}
              >
                <Text style={[styles.toggleText, view === 'map' && styles.toggleTextActive]}>Map</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}
                onPress={() => setView('list')}
              >
                <Text style={[styles.toggleText, view === 'list' && styles.toggleTextActive]}>List</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.filterIconBtn} onPress={openFilter} activeOpacity={0.8}>
              <Ionicons name="options" size={22} color={Colors.orange} />
              {activeFilters.size > 0 && (
                <View style={styles.filterDot} />
              )}
            </TouchableOpacity>
          </View>
        </View>
        {(activeFilters.size > 0 || distanceFilter) && (
          <View style={styles.filterBar}>
            <View style={styles.filterActivePills}>
              {Array.from(activeFilters).map(k => (
                <View key={k} style={styles.filterActivePill}>
                  <Text style={styles.filterActivePillText}>
                    {FILTER_OPTIONS.find(o => o.key === k)?.label}
                  </Text>
                </View>
              ))}
              {distanceFilter && (
                <View style={styles.filterActivePill}>
                  <Text style={styles.filterActivePillText}>≤ {distanceFilter}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>

      {view === 'map' ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={CAMPUS}
            onPress={handleDismiss}
          >
            <Marker
              coordinate={{ latitude: CAMPUS.latitude, longitude: CAMPUS.longitude }}
              anchor={{ x: 0.5, y: 1 }}
              onPress={() => (navigation as any).navigate('Profile')}
            >
              <View style={styles.youPinWrapper}>
                <View style={styles.youPinRing}>
                  <View style={styles.youPin}>
                    <Text style={styles.youPinText}>{currentUser.name.charAt(0)}</Text>
                  </View>
                </View>
                <Text style={styles.youLabel}>You</Text>
              </View>
            </Marker>

            {nearbyUsers.map(user => (
              <UserMarker
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id && !drawerOpen}
                dimmed={activeFilters.size > 0 && !filteredUsers.includes(user)}
                shoutoutUserId={shoutoutUserId}
                onPress={() => handlePinPress(user)}
              />
            ))}

            {/* Route polyline */}
            {directionsActive && directionsUser?.latitude && directionsUser?.longitude && (
              <Polyline
                coordinates={[
                  { latitude: CAMPUS.latitude, longitude: CAMPUS.longitude },
                  { latitude: directionsUser.latitude, longitude: directionsUser.longitude },
                ]}
                strokeColor={Colors.orange}
                strokeWidth={4}
                lineDashPattern={[8, 6]}
              />
            )}
          </MapView>

          {/* Pin popup overlay — rendered outside MapView to avoid clipping */}
          {selectedUser && cardPoint && !drawerOpen && (
            <View
              pointerEvents="box-none"
              style={[
                styles.pinCardOverlay,
                {
                  top: cardPoint.y + PIN_TOTAL + 4,
                  left: Math.max(8, Math.min(width - CARD_WIDTH - 8, cardPoint.x - CARD_WIDTH / 2)),
                  width: CARD_WIDTH,
                },
              ]}
            >
              <View style={styles.pinCardArrow} />
              <MapProfileCard
                user={selectedUser}
                onViewProfile={() => handleViewProfile(selectedUser)}
                onDismiss={handleDismiss}
                onNavigate={() => { handleDismiss(); startDirections(selectedUser); }}
              />
            </View>
          )}

          {/* Route banner */}
          {directionsActive && directionsUser && (
            <View style={styles.routeBanner}>
              <View style={styles.routeBannerLeft}>
                <Ionicons name="navigate" size={18} color={Colors.orange} />
                <View>
                  <Text style={styles.routeBannerName}>Navigating to {directionsUser.name}</Text>
                  <Text style={styles.routeBannerDist}>{directionsUser.distance}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.routeEndBtn} onPress={endDirections}>
                <Text style={styles.routeEndText}>End</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Shoutout map button */}
          <TouchableOpacity
            style={[styles.shoutMapBtn, drawerOpen && styles.shoutMapBtnActive, sayHiDrawerOpen && styles.shoutMapBtnDisabled]}
            onPress={sayHiDrawerOpen ? undefined : toggleDrawer}
            activeOpacity={sayHiDrawerOpen ? 1 : 0.85}
          >
            <Ionicons name="megaphone" size={20} color={sayHiDrawerOpen ? Colors.border : drawerOpen ? Colors.white : Colors.orange} />
            {!drawerOpen && (
              <View style={styles.shoutMapBadge}>
                <Text style={styles.shoutMapBadgeText}>{MOCK_SHOUTOUTS.length}</Text>
              </View>
            )}
          </TouchableOpacity>


          {/* Icebreaker map button — visible when a sayHiUser is loaded */}
          {sayHiUser && (
            <TouchableOpacity
              style={[styles.shoutMapBtn, { top: 72 }, sayHiDrawerOpen && styles.shoutMapBtnActive]}
              onPress={toggleSayHiDrawer}
              activeOpacity={0.85}
            >
              <Ionicons name="chatbubbles" size={20} color={sayHiDrawerOpen ? Colors.white : Colors.orange} />
              <View style={[styles.shoutMapBadge, { backgroundColor: sayHiUser.avatarColor }]}>
                <Text style={styles.shoutMapBadgeText}>{sayHiUser.name.charAt(0)}</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Say Hi drawer */}
          {sayHiUser && (
            <Animated.View style={[styles.sayHiDrawer, {
              height: sayHiAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SAY_HI_OPEN_H] }),
            }]}>
              <View style={styles.sayHiHeader}>
                <View style={styles.sayHiHandleBar} />
                <View style={styles.sayHiHeaderRow}>
                  <UserAvatar name={sayHiUser.name} color={sayHiUser.avatarColor} size={40} photoUri={sayHiUser.photoUri} />
                  <View style={styles.sayHiHeaderInfo}>
                    <Text style={styles.sayHiName}>{sayHiUser.name}</Text>
                    <Text style={styles.sayHiMeta}>{sayHiUser.year} · {sayHiUser.major}</Text>
                  </View>
                  {sayHiUser.latitude && sayHiUser.longitude && (
                    <TouchableOpacity
                      style={[styles.directionsBtn, directionsActive && styles.directionsBtnActive]}
                      onPress={() => directionsActive ? endDirections() : startDirections(sayHiUser)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="navigate" size={18} color={Colors.white} />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={dismissSayHiUser} style={styles.sayHiClose}>
                    <Ionicons name="close" size={20} color={Colors.muted} />
                  </TouchableOpacity>
                </View>
              </View>
              <ScrollView style={styles.sayHiList} showsVerticalScrollIndicator={false}>
                <Text style={styles.sayHiSectionLabel}>ICE BREAKERS</Text>
                {sayHiUser.iceBreakers.map((item, i) => (
                  <View key={i} style={[styles.sayHiItem, i === 0 && { borderTopWidth: 0 }]}>
                    <View style={styles.sayHiBullet} />
                    <Text style={styles.sayHiItemText}>{item}</Text>
                  </View>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          {/* Shoutouts drawer — hidden while icebreaker drawer is active */}
          <Animated.View style={[styles.shoutDrawer, {
            height: drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, DRAWER_OPEN_H] }),
            display: sayHiDrawerOpen ? 'none' : 'flex',
          }]}>
            <TouchableOpacity style={styles.shoutDrawerHeader} onPress={toggleDrawer} activeOpacity={0.8}>
              <View style={styles.shoutDrawerHandleBar} />
              <View style={styles.shoutDrawerTitleRow}>
                <Text style={styles.shoutDrawerTitle}>Shout-outs</Text>
                <View style={styles.shoutCountBadge}>
                  <Text style={styles.shoutCountText}>{MOCK_SHOUTOUTS.length}</Text>
                </View>
                <Ionicons name={drawerOpen ? 'chevron-down' : 'chevron-up'} size={16} color={Colors.muted} style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
            <ScrollView style={styles.shoutList} showsVerticalScrollIndicator={false}>
              {MOCK_SHOUTOUTS.map(s => (
                <View key={s.id} style={styles.shoutItem}>
                  <View style={[styles.shoutAvatar, { backgroundColor: s.authorColor }]}>
                    <Text style={styles.shoutAvatarText}>{s.authorName.charAt(0)}</Text>
                  </View>
                  <View style={styles.shoutContent}>
                    <Text style={styles.shoutAuthor}>{s.authorName} · {s.authorYear} · {s.authorMajors}</Text>
                    <Text style={styles.shoutMessage}>{s.message}</Text>
                    <Text style={styles.shoutMeta}>{s.distance} · {s.timeAgo}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        </View>
      ) : (
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {filteredUsers.map(user => (
            <TouchableOpacity
              key={user.id}
              style={styles.listItem}
              onPress={() => navigation.navigate('UserProfile', { user })}
              activeOpacity={0.8}
            >
              <UserAvatar name={user.name} color={user.avatarColor} size={48} photoUri={user.photoUri} />
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{user.name}</Text>
                <Text style={styles.listSub}>{user.year} · {user.major}</Text>
                <Text style={styles.listDistance}>{user.distance}</Text>
              </View>
              <View style={styles.listTags}>
                {user.interests.slice(0, 2).map(tag => (
                  <InterestTag key={tag} label={tag} />
                ))}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <Modal visible={filterOpen} transparent animationType="slide">
        <View style={styles.drawerBg}>
          <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setFilterOpen(false)} />
          <View style={styles.drawer}>
            <View style={styles.drawerHandle} />
            <View style={styles.drawerHeader}>
              <TouchableOpacity onPress={resetFilter}>
                <Text style={styles.drawerReset}>Reset</Text>
              </TouchableOpacity>
              <Text style={styles.drawerTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setFilterOpen(false)}>
                <Text style={styles.drawerClose}>Close</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.filterByLabel}>Filter by</Text>

            <View style={styles.filterPills}>
              {FILTER_OPTIONS.map(({ key, label }) => {
                const selected = activeFilters.has(key);
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.filterPill, selected && styles.filterPillActive]}
                    onPress={() => toggleFilter(key)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, selected && styles.filterPillTextActive]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.filterByLabel}>Distance</Text>

            <View style={styles.filterPills}>
              {DISTANCE_OPTIONS.map(d => {
                const selected = distanceFilter === d;
                return (
                  <TouchableOpacity
                    key={d}
                    style={[styles.filterPill, selected && styles.filterPillActive]}
                    onPress={() => selectDistanceFilter(d)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.filterPillText, selected && styles.filterPillTextActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!sendoffUser} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.sendoffModal}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSendoffUser(null)}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.sendoffTitle}>Go.{'\n'}Meex's job is done.</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSendoffUser(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { backgroundColor: Colors.white, zIndex: 10 },
  topBar: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screen,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 10,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
    fontFamily: FontFamily.brand,
    color: Colors.body,
    letterSpacing: -0.5,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 18,
  },
  toggleActive: {
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleText: {
    fontSize: FontSize.bodySmall,
    color: Colors.muted,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: Colors.body,
  },
  mapContainer: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  pinCardOverlay: {
    position: 'absolute',
    zIndex: 999,
  },
  pinCardArrow: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 10,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderBottomColor: Colors.white,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  youPinWrapper: {
    alignItems: 'center',
  },
  youPinRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: Colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  youPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  youPinText: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: FontSize.body,
  },
  youLabel: {
    marginTop: 3,
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.orange,
    letterSpacing: LetterSpacing.micro,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.screen,
    paddingBottom: 8,
    gap: 8,
  },
  filterActivePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  filterActivePill: {
    backgroundColor: Colors.selected,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  filterActivePillText: {
    fontSize: FontSize.micro,
    color: Colors.orange,
    fontWeight: '600',
    letterSpacing: LetterSpacing.micro,
  },
  filterIconBtn: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.orange,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  drawerBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.screen,
    paddingBottom: 52,
    paddingTop: 12,
  },
  drawerHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  drawerTitle: {
    fontSize: FontSize.sectionHeader,
    fontWeight: '600',
    color: Colors.body,
    letterSpacing: LetterSpacing.sectionHeader,
  },
  drawerReset: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.muted,
  },
  drawerClose: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.muted,
  },
  filterByLabel: {
    fontSize: FontSize.body,
    fontWeight: '600',
    color: Colors.body,
    marginBottom: 14,
    letterSpacing: LetterSpacing.body,
  },
  filterPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    backgroundColor: Colors.white,
  },
  filterPillActive: {
    backgroundColor: Colors.orange,
    borderColor: Colors.orange,
  },
  filterPillText: {
    fontSize: FontSize.bodySmall,
    color: Colors.body,
    fontWeight: '400',
  },
  filterPillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  previewText: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 16,
  },
  filterNowBtn: {
    height: 54,
    backgroundColor: Colors.orange,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  filterNowText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.body,
    letterSpacing: LetterSpacing.body,
  },
  shoutMapBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  shoutMapBtnActive: {
    backgroundColor: Colors.orange,
  },
  shoutMapBtnDisabled: {
    opacity: 0.35,
  },
  shoutMapBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: Colors.coral,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
    paddingHorizontal: 3,
  },
  shoutMapBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  sayHiDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 16,
    overflow: 'hidden',
  },
  sayHiHeader: {
    paddingHorizontal: Spacing.screen,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sayHiHandleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sayHiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sayHiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sayHiAvatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.body,
  },
  sayHiHeaderInfo: { flex: 1 },
  sayHiName: {
    fontSize: FontSize.body,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: LetterSpacing.body,
  },
  sayHiMeta: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.muted,
    marginTop: 1,
  },
  directionsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionsBtnActive: {
    backgroundColor: Colors.coral,
  },
  routeBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 72,
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
    gap: 10,
  },
  routeBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routeBannerName: {
    fontSize: FontSize.bodySmall,
    fontWeight: '700',
    color: Colors.body,
    letterSpacing: LetterSpacing.body,
  },
  routeBannerDist: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    marginTop: 1,
    letterSpacing: LetterSpacing.caption,
  },
  routeEndBtn: {
    backgroundColor: Colors.coral,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  routeEndText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.bodySmall,
    letterSpacing: LetterSpacing.body,
  },
  sayHiClose: {
    padding: 4,
  },
  sayHiList: { flex: 1 },
  sayHiSectionLabel: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.muted,
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.screen,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sayHiItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: Spacing.screen,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  sayHiBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.coral,
    marginTop: 7,
    flexShrink: 0,
  },
  sayHiItemText: {
    flex: 1,
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 26,
  },
  shoutDrawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 14,
    overflow: 'hidden',
  },
  shoutDrawerHeader: {
    paddingHorizontal: Spacing.screen,
    paddingTop: 10,
    paddingBottom: 10,
  },
  shoutDrawerHandleBar: {
    width: 36,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  shoutDrawerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shoutDrawerTitle: {
    fontSize: FontSize.sectionHeader,
    fontWeight: '600',
    color: Colors.body,
    letterSpacing: LetterSpacing.sectionHeader,
  },
  shoutCountBadge: {
    backgroundColor: Colors.coral,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  shoutCountText: {
    fontSize: FontSize.micro,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: LetterSpacing.micro,
  },
  shoutList: {
    flex: 1,
  },
  shoutItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.screen,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 12,
  },
  shoutAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  shoutAvatarText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.bodySmall,
  },
  shoutContent: { flex: 1 },
  shoutAuthor: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    marginBottom: 3,
    letterSpacing: LetterSpacing.caption,
  },
  shoutMessage: {
    fontSize: FontSize.body,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 24,
    marginBottom: 4,
  },
  shoutMeta: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    letterSpacing: LetterSpacing.caption,
  },
  list: { flex: 1 },
  listContent: { padding: Spacing.screen, gap: 12 },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: Spacing.card,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  listInfo: { flex: 1 },
  listName: { fontSize: FontSize.body, fontWeight: '700', color: Colors.body, letterSpacing: LetterSpacing.body },
  listSub: { fontSize: FontSize.bodySmall, fontWeight: '400', color: Colors.muted, marginTop: 2 },
  listDistance: { fontSize: FontSize.caption, fontWeight: '400', color: Colors.coral, marginTop: 2, letterSpacing: LetterSpacing.caption },
  listTags: { flexDirection: 'column', gap: 4, alignItems: 'flex-end' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.screen,
  },
  sendoffModal: {
    backgroundColor: Colors.white,
    borderRadius: Radius.card,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  modalClose: { position: 'absolute', top: 16, right: 16, padding: 4 },
  modalCloseText: { fontSize: 18, color: Colors.muted },
  sendoffTitle: {
    fontSize: FontSize.displayMedium,
    fontWeight: '600',
    fontFamily: FontFamily.brand,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: LetterSpacing.displayMedium,
  },
  closeBtn: {
    backgroundColor: Colors.orange,
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body, letterSpacing: LetterSpacing.body, includeFontPadding: false },
});
