import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STANDARD_MAP_STYLE } from '../theme/forestMapStyle';
import { useTabBarStyle } from '../navigation/TabNavigator';
import { useUser } from '../context/UserContext';
import { DEFAULT_PROFILE } from '../data/mockProfiles';
import DirectionSignIcon from '../components/DirectionSignIcon';

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
  mapToggle: require('../assets/icons/map toggle.png'),
};

type MapStyleName = 'forest' | 'standard';
const MAP_STYLE_KEY = '@truffle/mapStyle';

/** Map avatars: hard drop shadow, offset 2/4, keyline purple at 85%. */
const AVATAR_SHADOW = '2px 4px 0px rgba(32,22,66,0.85)';

/** Segmented toggle geometry, from the asset: 124×280 with its divider 46% down. */
const TOGGLE_W = 44;
const TOGGLE_H = Math.round(TOGGLE_W * (280 / 124)); // 99
const TOGGLE_SPLIT = Math.round(TOGGLE_H * 0.46);    // 46

/** The illustrated map used as Forest View's background. */
const FOREST_BACKGROUND = require('../assets/Screens/Map/Map Viewport.png');
const FOREST_IMAGE_ASPECT = 2496 / 1548;

/**
 * Geographic box the illustration stands for. Everything in Forest View —
 * avatars, the popup, the walking path — is projected through this, so the
 * artwork and the pins stay locked together at any zoom.
 */
const FOREST_REGION = {
  west: -122.4260,
  east: -122.4120,
  south: 37.76705,
  north: 37.78495,
};

const FOREST_MAX_ZOOM = 4;

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

/**
 * Normalises the stored distance to the drawer's phrasing. The value arrives in
 * two shapes: "320m" straight off a map pin, or "320m away" when it came back
 * through a profile via Say Hi. Both render as "320m from you".
 */
const distanceFromYou = (raw?: string) => {
  const m = String(raw ?? '').match(/([\d.]+\s*[a-zA-Z]+)/);
  return m ? `${m[1]} from you` : '';
};

/**
 * Turn someone's unknown fact into something you could actually say to them.
 * Facts are always written first person ("I once…"), so flipping the pronouns
 * gives a clause that drops into an opener frame.
 */
const toSecondPerson = (fact: string) =>
  fact
    .replace(/\bI'm\b/g, "you're")
    .replace(/\bI am\b/g, 'you are')
    .replace(/\bI was\b/g, 'you were')
    .replace(/\bI've\b/g, "you've")
    .replace(/\bI'd\b/g, "you'd")
    .replace(/\bI\b/g, 'you')
    .replace(/\bmyself\b/g, 'yourself')
    .replace(/\bmy\b/g, 'your')
    .replace(/\bme\b/g, 'you');

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const STARTER_FRAMES: ((clause: string) => string)[] = [
  c => `Okay, I have to ask — ${c}?`,
  c => `Wait, ${c}? You're going to have to explain that one.`,
  c => `So ${c} — how did that happen?`,
  c => `${capitalise(c)}? There has to be a story there.`,
  c => `I need the details on this one: ${c}?`,
];

/**
 * Seeded on the person, then stepped by index — so one profile's openers walk
 * through distinct frames instead of repeating "Wait…" three times, and the
 * same person always gets the same set.
 */
const starterFrom = (fact: string, i: number, who: string) => {
  const h = [...who].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return STARTER_FRAMES[(h + i) % STARTER_FRAMES.length](toSecondPerson(fact));
};

type Coord = { latitude: number; longitude: number };

/** Compass bearing from → to, in degrees, so navigation can face the route. */
const bearingBetween = (from: Coord, to: Coord) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const deg = (r: number) => (r * 180) / Math.PI;
  const dLng = rad(to.longitude - from.longitude);
  const y = Math.sin(dLng) * Math.cos(rad(to.latitude));
  const x =
    Math.cos(rad(from.latitude)) * Math.sin(rad(to.latitude)) -
    Math.sin(rad(from.latitude)) * Math.cos(rad(to.latitude)) * Math.cos(dLng);
  return (deg(Math.atan2(y, x)) + 360) % 360;
};

const INITIAL_REGION = {
  latitude: YOU_COORD.latitude,
  longitude: YOU_COORD.longitude,
  // Wider opening view — 2.5× the previous 0.008 span, so every peer is on
  // screen at once with margin rather than filling the frame edge to edge.
  // Pinch to zoom still works normally from here.
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
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
    iceBreakers: ['I once won a contest I didn\'t mean to enter', 'I wrote a musical in high school that got performed', 'I have been to 14 countries but never left my home continent until this year', 'I busked in three cities to pay for a summer abroad', 'I can usually name a song from its first two notes'],
    interests: ['Music', 'Travel', 'Business'],
  },
  {
    id: '3', name: 'Millie', initial: 'M', color: COLORS.piggyPinkBright, year: 'Freshman', major: 'Psychology', distance: '310m',
    lat: 37.7788, lng: -122.4198,
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    hasShout: true, shout: "Does anyone want to grab coffee at the student union? I'll be there till 3pm", timeAgo: '9 min ago',
    iceBreakers: ['I once ran into my professor at a party and outdanced them', 'I can identify 40 bird calls by sound', 'I have read the full terms and conditions of every app I\'ve downloaded', 'I have filled six dream journals since I was fourteen'],
    interests: ['Psychology', 'Nature', 'Reading'],
  },
  {
    id: '4', name: 'Paul', initial: 'P', color: COLORS.sunnyYellowBright, year: 'Junior', major: 'Chemistry', distance: '70m',
    lat: 37.7755, lng: -122.4232,
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
    hasShout: true, shout: 'Lost my green hoodie somewhere near the library — anyone seen it?', timeAgo: '12 min ago',
    iceBreakers: ['I once woke up in a different country than I fell asleep in', 'I can solve differential equations in my head', 'I have never watched a single episode of Friends', 'I named a lab rat after my high school chemistry teacher', 'I once set off the fire alarm trying to make caramel', 'I can guess a drink\'s strength by smell alone'],
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
    iceBreakers: ['I built a robot that makes pancakes', 'I once cycled across an entire country in a week', 'I have memorised pi to 50 decimal places', 'I run before sunrise every morning, including in the snow'],
    interests: ['Tech', 'Running', 'Food'],
  },
  {
    id: '7', name: 'Nina', initial: 'N', color: COLORS.keylinePurple, year: 'Senior', major: 'Art History', distance: '400m',
    lat: 37.7762, lng: -122.4160,
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    hasShout: true, shout: 'Looking for someone to visit the new exhibit at the campus gallery this weekend — free entry on Saturday', timeAgo: '22 min ago',
    iceBreakers: ['I once accidentally walked into a film set and ended up as an extra', 'I collect vintage maps', 'I have never eaten a hamburger', 'I can date a painting to the decade from its frame alone', 'I have seen the same film in four different countries'],
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

  // Going offline locks distance, directions and shout-outs — you can still
  // browse the map and read profiles.
  const { visible, setVisible, registrationDraft } = useUser();
  // Own map pin uses the signed-in user's photo, same as every other pin.
  const myAvatar = registrationDraft.photoUri
    ? { uri: registrationDraft.photoUri }
    : (DEFAULT_PROFILE.profilePhoto as { uri: string });
  /** Wording for the "you're offline" gate, per action being blocked. */
  const LOCKED_DEFAULT = {
    message: 'Make yourself available to have access to this information',
    confirmLabel: 'Set myself online',
  };
  const LOCKED_PROFILE = {
    message: "You must be set as visible to be able to see people's profile",
    confirmLabel: 'Set as Visible',
  };
  const [lockedPrompt, setLockedPrompt] = useState<typeof LOCKED_DEFAULT | null>(null);
  /** Runs `action` when available, otherwise explains why it's locked. */
  const requireAvailable = (action: () => void, prompt = LOCKED_DEFAULT) => {
    if (visible) action();
    else setLockedPrompt(prompt);
  };
  const LOCKED = '🔒';
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [region, setRegion] = useState(INITIAL_REGION);

  // Forest View is the default; the choice is restored from disk on mount.
  // Only `customMapStyle` changes, so the camera is untouched when toggling.
  const [mapStyleName, setMapStyleName] = useState<MapStyleName>('forest');
  useEffect(() => {
    AsyncStorage.getItem(MAP_STYLE_KEY)
      .then(saved => {
        if (saved === 'forest' || saved === 'standard') setMapStyleName(saved);
      })
      .catch(() => {}); // first run / storage unavailable — keep the default
  }, []);
  const selectMapStyle = (next: MapStyleName) => {
    if (next === mapStyleName) return;
    setMapStyleName(next);
    AsyncStorage.setItem(MAP_STYLE_KEY, next).catch(() => {});
  };
  const isForest = mapStyleName === 'forest';

  // A drawer covers the tab bar rather than sitting above it. A tab screen
  // can't paint over its own navigator's tab bar, so the bar is hidden while
  // a drawer is open — the screen then extends to the bottom of the display
  // and the drawer, anchored at bottom: 0, takes that space.
  const tabBarStyle = useTabBarStyle();
  const drawerOpen = mode !== 'default';
  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: drawerOpen ? { display: 'none' } : tabBarStyle,
    });
  }, [drawerOpen, navigation]);

  /** Drawers now reach the display edge, so they clear the home indicator themselves. */
  const drawerPadBottom = insets.bottom;

  /**
   * Drawer toggles share the map shout-out button's treatment: a 44pt rounded
   * square with a hard shadow — keyline-purple fill and white glyph when it's
   * the drawer you're in, white fill and purple glyph otherwise.
   */
  const toggleButton = (selected: boolean) => ({
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: selected ? COLORS.keylinePurple : '#FFFFFF',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    boxShadow: '2px 2px 0px rgba(32,22,66,0.15)',
  });
  const toggleGlyph = (selected: boolean) => ({
    width: 24,
    height: 24,
    tintColor: selected ? '#FFFFFF' : COLORS.keylinePurple,
  });

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

  /** Frames you plus every peer, with breathing room at the edges. */
  const fitAllPeers = () => {
    mapRef.current?.fitToCoordinates(
      [YOU_COORD, ...USERS.map(u => ({ latitude: u.lat, longitude: u.lng }))],
      { edgePadding: { top: 80, right: 50, bottom: 80, left: 50 }, animated: true }
    );
  };

  /**
   * Frame everyone once, on first landing.
   *
   * onMapReady alone isn't enough: it can fire before the map has been laid
   * out, and fitToCoordinates against a zero-sized map silently does nothing.
   * Waiting for a measured mapSize as well means the fit always has real
   * dimensions to work with.
   *
   * Skipped when arriving via Say Hi — enterDirections is already framing you
   * and that one peer, and two fits would fight.
   */
  const [mapReady, setMapReady] = useState(false);
  const didInitialFit = useRef(false);
  useEffect(() => {
    if (didInitialFit.current || !mapReady || mapSize.width === 0) return;
    didInitialFit.current = true;
    if (openOpeners) return;
    const t = setTimeout(fitAllPeers, 250);
    return () => clearTimeout(t);
  }, [mapReady, mapSize.width, openOpeners]);

  /**
   * Start → navigation camera: close in on you, tilt, and face the destination
   * so the route runs "up" the screen. Your position is fixed mock data, so
   * this is a heading-up view of the route rather than live turn-by-turn.
   */
  const startNavigating = (peer: any) => {
    setMode('navigating');
    if (!peer?.lat) return;
    const dest = { latitude: peer.lat, longitude: peer.lng };
    mapRef.current?.animateCamera(
      { center: YOU_COORD, heading: bearingBetween(YOU_COORD, dest), pitch: 55, zoom: 18 },
      { duration: 900 }
    );
  };

  /** Stop → back to the flat, north-up overview of the whole route. */
  const stopNavigating = (peer: any) => {
    setMode('directions');
    mapRef.current?.animateCamera({ heading: 0, pitch: 0 }, { duration: 400 });
    if (!peer?.lat) return;
    const dest = { latitude: peer.lat, longitude: peer.lng };
    setTimeout(() => {
      mapRef.current?.fitToCoordinates([YOU_COORD, dest], {
        edgePadding: { top: 100, right: 80, bottom: 400, left: 80 },
        animated: true,
      });
    }, 420);
  };

  /** Tears down the directions/icebreakers state without deciding what comes next. */
  const resetDirections = () => {
    setOpenerUser(null);
    setRouteInfo(null);
    setPopupUser(null);
    mapRef.current?.animateToRegion({ ...YOU_COORD, latitudeDelta: 0.008, longitudeDelta: 0.008 }, 600);
  };

  const closeDirections = () => {
    setMode('default');
    resetDirections();
  };

  /**
   * Close whatever drawer is open without touching the map camera — used when
   * tapping straight from one peer's drawer onto another peer's pin, where
   * recentring would pull the map away from the pin you just tapped.
   */
  const dismissDrawers = () => {
    setMode('default');
    setOpenerUser(null);
    setRouteInfo(null);
  };

  /**
   * Filters take over the screen, so any open drawer is dismissed first —
   * one panel at a time. Only the map-route modes need their state torn down;
   * shout-outs just close, with no map animation.
   */
  const openFilters = () => {
    if (mode === 'directions' || mode === 'navigating' || mode === 'openers') {
      resetDirections();
    }
    setMode('default');
    setShowFilters(true);
  };


  // Returning from UserProfile via "Say Hi!" — same entry as every other route
  // into directions, so the map framing is identical whichever way you arrived.
  useEffect(() => {
    if (!openOpeners || !sayHiUser) return;
    setView('map');
    setTappedPinIdx(null);
    setOpenerUser(sayHiUser);
    enterDirections(sayHiUser);
  }, [openOpeners, sayHiUser]);

  // Reset popup when switching to map so no pin is pre-selected.
  useEffect(() => {
    if (view === 'map') setTappedPinIdx(null);
  }, [view]);

  // NOTE: this screen deliberately keeps its state across focus changes.
  // Opening someone's profile pushes a screen on top; coming back must land
  // on exactly what you left — the same drawer open, the same map region.
  // A reset here would clear `mode` on every focus and close the drawer.

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
  /**
   * Forest View transform.
   *
   * There is no pan state at all — the illustration is locked to the framing
   * that shows every peer, and zoom only ever grows from there. That framing is
   * both the starting point and the floor: pinch in to get closer, pinch back
   * out and you stop exactly where you began.
   */
  const forestFit = useMemo(() => {
    if (mapSize.width === 0 || mapSize.height === 0) return null;
    const pts = [YOU_COORD, ...USERS.map(u => ({ latitude: u.lat, longitude: u.lng }))].map(pt => ({
      u: (pt.longitude - FOREST_REGION.west) / (FOREST_REGION.east - FOREST_REGION.west),
      v: (FOREST_REGION.north - pt.latitude) / (FOREST_REGION.north - FOREST_REGION.south),
    }));
    const uMin = Math.min(...pts.map(p => p.u)), uMax = Math.max(...pts.map(p => p.u));
    const vMin = Math.min(...pts.map(p => p.v)), vMax = Math.max(...pts.map(p => p.v));

    // widest image that still leaves the map's usual 80/50 padding on each axis
    const byW = Math.max(1, mapSize.width - 50 * 2) / Math.max(uMax - uMin, 1e-6);
    const byH =
      Math.max(1, mapSize.height - 80 * 2) / (Math.max(vMax - vMin, 1e-6) * FOREST_IMAGE_ASPECT);

    return {
      zoom: Math.min(byW, byH) / mapSize.width,
      cu: (uMin + uMax) / 2,
      cv: (vMin + vMax) / 2,
    };
  }, [mapSize.width, mapSize.height]);

  /** Extra zoom past the fit, 1 = fully zoomed out. Never goes below 1. */
  const [forestZoomFactor, setForestZoomFactor] = useState(1);
  const forestZoom = (forestFit?.zoom ?? 1) * forestZoomFactor;

  const forestImage = useMemo(() => {
    const width = mapSize.width * forestZoom;
    return { width, height: width * FOREST_IMAGE_ASPECT };
  }, [mapSize.width, forestZoom]);

  /**
   * Pan is derived, not stored: the peer group's centre stays pinned to the
   * middle of the container at every zoom, so nothing can drift off-frame.
   */
  const forestPan = useMemo(() => {
    if (!forestFit) return { x: 0, y: 0 };
    return {
      x: mapSize.width / 2 - forestFit.cu * forestImage.width,
      y: mapSize.height / 2 - forestFit.cv * forestImage.height,
    };
  }, [forestFit, forestImage, mapSize.width, mapSize.height]);

  /**
   * Pinch only. The responder refuses single-touch moves, so dragging the map
   * does nothing — and the zoom factor is clamped at 1, so pinching out can
   * never go wider than the starting frame.
   */
  const pinch = useRef({ dist: 0, factor: 1 });
  const forestPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: e => e.nativeEvent.touches.length >= 2,
        onPanResponderGrant: () => {
          pinch.current.dist = 0;
          pinch.current.factor = forestZoomFactor;
        },
        onPanResponderMove: e => {
          const touches = e.nativeEvent.touches;
          if (touches.length < 2) return;
          const [a, b] = touches;
          const dist = Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY);
          if (pinch.current.dist === 0) {
            pinch.current.dist = dist;
            pinch.current.factor = forestZoomFactor;
            return;
          }
          const next = pinch.current.factor * (dist / pinch.current.dist);
          setForestZoomFactor(Math.min(FOREST_MAX_ZOOM, Math.max(1, next)));
        },
        onPanResponderRelease: () => {
          pinch.current.dist = 0;
        },
      }),
    [forestZoomFactor]
  );

  /**
   * lat/lng → screen point inside the map container.
   *
   * Standard View projects through the live map region; Forest View projects
   * through the illustration's own box and transform. Everything downstream —
   * avatars, the pin popup, the walking path — goes through this one function,
   * so both modes stay consistent without duplicated positioning code.
   */
  const project = (lat: number, lng: number) => {
    if (isForest) {
      const u = (lng - FOREST_REGION.west) / (FOREST_REGION.east - FOREST_REGION.west);
      const v = (FOREST_REGION.north - lat) / (FOREST_REGION.north - FOREST_REGION.south);
      return { x: forestPan.x + u * forestImage.width, y: forestPan.y + v * forestImage.height };
    }
    const west = region.longitude - region.longitudeDelta / 2;
    const north = region.latitude + region.latitudeDelta / 2;
    return {
      x: ((lng - west) / region.longitudeDelta) * mapSize.width,
      y: ((north - lat) / region.latitudeDelta) * mapSize.height,
    };
  };


  const popupPosition = useMemo(() => {
    if (!popupUser || mode !== 'default' || mapSize.width === 0) return null;
    const { driftLat, driftLng } = getDrift(popupUser, tick, true);
    return project(popupUser.lat + driftLat, popupUser.lng + driftLng);
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
          onPress={openFilters}
          style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={ICONS.filter} style={{ width: 26, height: 26, tintColor: COLORS.keylinePurple }} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Shown when an offline user taps a locked action. Rendered in both views.
  const lockedModal = (
    <Modal transparent animationType="fade" visible={lockedPrompt !== null} onRequestClose={() => setLockedPrompt(null)}>
      <View style={{ flex: 1, backgroundColor: 'rgba(32,22,66,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <View
          style={{
            width: '100%', backgroundColor: COLORS.cream, borderRadius: 20,
            borderWidth: 2, borderColor: COLORS.keylinePurple, padding: 24,
            boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
          } as any}>
          <Text style={{ fontSize: 18, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginBottom: 22, lineHeight: 26 }}>
            {lockedPrompt?.message}
          </Text>
          <TouchableOpacity
            onPress={() => { setVisible(true); setLockedPrompt(null); }}
            activeOpacity={0.85}
            style={{
              height: 48, borderRadius: 999, backgroundColor: COLORS.accentCoral,
              alignItems: 'center', justifyContent: 'center', marginBottom: 10,
            }}>
            <Text style={{ fontSize: 15, fontFamily: 'Fredoka_700Bold', color: '#FFFFFF' }}>
              {lockedPrompt?.confirmLabel}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setLockedPrompt(null)}
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
              onPress={openFilters}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Image source={ICONS.filter} style={{ width: 26, height: 26, tintColor: COLORS.keylinePurple }} resizeMode="contain" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── MAP AREA — flex:1 container below the header ── */}
        <View style={{ flex: 1 }} onLayout={e => setMapSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
          {/* ══ FOREST VIEW — the illustration is the map. Pinch to zoom, drag
               to pan; avatars, popup and path all project through the same
               transform so they stay locked to the artwork. ══ */}
          {isForest && (
            <View
              // The illustration is taller than the map area and its offset is
              // negative, so without clipping it spills up over the Discover
              // title, the Map/List toggle and the filter icon. RN defaults
              // overflow to visible on iOS, hence this.
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden' }}
              {...forestPanResponder.panHandlers}>
              <Image
                source={FOREST_BACKGROUND}
                style={{
                  position: 'absolute',
                  left: forestPan.x, top: forestPan.y,
                  width: forestImage.width, height: forestImage.height,
                }}
                resizeMode="stretch"
              />

              {/* Walking path — a routed line rather than a straight one, so it
                  reads like the map view's directions. Two turns, staircase
                  style, seeded per peer so the same person always gets the
                  same route. Drawn as dots, matching the design. */}
              {(mode === 'directions' || mode === 'navigating') && openerUser && (openerUser as any).lat && (() => {
                const a = project(YOU_COORD.latitude, YOU_COORD.longitude);
                const b = project((openerUser as any).lat, (openerUser as any).lng);
                if (!Math.hypot(b.x - a.x, b.y - a.y)) return null;

                // deterministic per peer — no reshuffling between renders
                const seed = [...String((openerUser as any).id ?? '')].reduce(
                  (h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7
                );
                const r1 = ((seed % 1000) / 1000) * 0.3 + 0.35; // 0.35–0.65
                const r2 = (((seed >> 8) % 1000) / 1000) * 0.3 + 0.35;
                const verticalFirst = ((seed >> 4) & 1) === 1;

                const midX = a.x + (b.x - a.x) * r1;
                const midY = a.y + (b.y - a.y) * r2;
                const pts = verticalFirst
                  ? [a, { x: a.x, y: midY }, { x: midX, y: midY }, { x: midX, y: b.y }, b]
                  : [a, { x: midX, y: a.y }, { x: midX, y: midY }, { x: b.x, y: midY }, b];

                // walk the polyline, dropping a dot every SPACING px
                const SPACING = 13;
                const dots: { x: number; y: number }[] = [];
                for (let i = 0; i < pts.length - 1; i++) {
                  const p0 = pts[i], p1 = pts[i + 1];
                  const segLen = Math.hypot(p1.x - p0.x, p1.y - p0.y);
                  const n = Math.floor(segLen / SPACING);
                  for (let k = 0; k < n; k++) {
                    const t = k / Math.max(n, 1);
                    dots.push({ x: p0.x + (p1.x - p0.x) * t, y: p0.y + (p1.y - p0.y) * t });
                  }
                }
                dots.push(b);

                return dots.map((d, i) => (
                  <View
                    key={i}
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: d.x - 4, top: d.y - 4,
                      width: 8, height: 8, borderRadius: 4,
                      backgroundColor: COLORS.accentCoral,
                    }}
                  />
                ));
              })()}

              {/* peers */}
              {filteredUsers.map(user => {
                const isSelected = openerUser?.id === user.id || popupUser?.id === user.id;
                const size = isSelected ? 52 : 44;
                const pt = project(user.lat, user.lng);
                return (
                  <TouchableOpacity
                    key={user.id}
                    activeOpacity={0.9}
                    onPress={() => {
                      // tapping a pin while a drawer is open swaps straight to
                      // that peer's chipbox
                      if (mode !== 'default') {
                        dismissDrawers();
                        setPopupUser(user);
                        return;
                      }
                      setPopupUser(popupUser?.id === user.id ? null : user);
                    }}
                    style={{
                      position: 'absolute',
                      left: pt.x - size / 2, top: pt.y - size / 2,
                      width: size, height: size, borderRadius: size / 2,
                      boxShadow: AVATAR_SHADOW,
                    } as any}>
                    <View style={{
                      width: '100%', height: '100%', borderRadius: size / 2,
                      backgroundColor: '#FFFFFF', overflow: 'hidden',
                      borderWidth: isSelected ? 4 : 2, borderColor: '#FFFFFF',
                    }}>
                      <Image source={{ uri: user.photo }} style={{ width: '100%', height: '100%' }} />
                    </View>
                  </TouchableOpacity>
                );
              })}

              {/* you */}
              {(() => {
                const size = mode === 'default' ? 48 : 54;
                const pt = project(YOU_COORD.latitude, YOU_COORD.longitude);
                return (
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: pt.x - size / 2, top: pt.y - size / 2,
                      width: size, height: size, borderRadius: size / 2,
                      boxShadow: AVATAR_SHADOW,
                    } as any}>
                    <View style={{
                      width: '100%', height: '100%', borderRadius: size / 2,
                      backgroundColor: '#FFFFFF', overflow: 'hidden',
                      borderWidth: mode === 'default' ? 3 : 4, borderColor: COLORS.accentCoral,
                    }}>
                      <Image source={myAvatar} style={{ width: '100%', height: '100%' }} />
                    </View>
                  </View>
                );
              })()}
            </View>
          )}

          {/* ══ STANDARD MAP — live Google Maps, unchanged ══ */}
          {!isForest && (
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            customMapStyle={STANDARD_MAP_STYLE}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            initialRegion={INITIAL_REGION}
            onMapReady={() => setMapReady(true)}
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
                    // tapping a pin while a drawer is open swaps straight to
                    // that peer's chipbox
                    if (mode !== 'default') {
                      dismissDrawers();
                      setPopupUser(user);
                      return;
                    }
                    setPopupUser(popupUser?.id === user.id ? null : user);
                  }}>
                  {/* shadow sits on the outer view — the inner one clips the photo
                      to a circle, and overflow:hidden would swallow the shadow */}
                  <View style={{ width: size, height: size, borderRadius: size / 2, boxShadow: AVATAR_SHADOW } as any}>
                    <View style={{
                      width: '100%', height: '100%', borderRadius: size / 2,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: isSelected ? 4 : 2,
                      borderColor: '#FFFFFF',
                      overflow: 'hidden',
                    }}>
                      <Image source={{ uri: user.photo }} style={{ width: '100%', height: '100%' }} />
                    </View>
                  </View>
                </Marker>
              );
            })}

            {/* You marker — coral ring, so you read as distinct from the white-ringed peers */}
            <Marker coordinate={YOU_COORD} anchor={{ x: 0.5, y: 0.5 }}>
              {(() => {
                const size = mode === 'default' ? 48 : 54;
                return (
                  <View style={{ width: size, height: size, borderRadius: size / 2, boxShadow: AVATAR_SHADOW } as any}>
                    <View style={{
                      width: '100%', height: '100%', borderRadius: size / 2,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center', justifyContent: 'center',
                      borderWidth: mode === 'default' ? 3 : 4, borderColor: COLORS.accentCoral,
                      overflow: 'hidden',
                    }}>
                      <Image source={myAvatar} style={{ width: '100%', height: '100%' }} />
                    </View>
                  </View>
                );
              })()}
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
          )}

          {/* ── SHOUTOUT BELL — floating over the map, top right.
              right:24 + 44px width keeps it on the same vertical axis as the header filter icon ── */}
          {/* Always visible — while any drawer is open it acts as the dismiss control. */}
          <View style={{ position: 'absolute', top: 12, right: 24, zIndex: 30 }}>
            <TouchableOpacity
              onPress={() => {
                if (mode === 'shoutout') {
                  // already here — toggle back off
                  setMode('default');
                } else {
                  // From the map, or from any open drawer: the drawer is torn
                  // down and replaced by the shout-out list. Gated first, so a
                  // blocked tap leaves the current drawer untouched.
                  requireAvailable(() => {
                    resetDirections();
                    setMode('shoutout');
                    setTappedPinIdx(null);
                  });
                }
              }}
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

            {/* ── MAP STYLE TOGGLE — the segmented pill asset: map on top
                (Standard), truffle below (Forest). The artwork's divider sits
                46% down, so the tap zones and the active tint split there.
                Only customMapStyle + the ground overlay change, so the camera
                is never reset. ── */}
            <View
              style={{
                marginTop: 10,
                width: TOGGLE_W, height: TOGGLE_H, borderRadius: 14,
                overflow: 'hidden',
                boxShadow: '2px 2px 0px rgba(32,22,66,0.15)',
              } as any}>
              <Image source={ICONS.mapToggle} style={{ width: TOGGLE_W, height: TOGGLE_H }} resizeMode="contain" />
              {/* active segment */}
              <View
                pointerEvents="none"
                style={{
                  position: 'absolute', left: 0, right: 0,
                  top: isForest ? TOGGLE_SPLIT : 0,
                  height: isForest ? TOGGLE_H - TOGGLE_SPLIT : TOGGLE_SPLIT,
                  backgroundColor: COLORS.accentCoral,
                  opacity: 0.28,
                }}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Standard Map"
                onPress={() => selectMapStyle('standard')}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: TOGGLE_SPLIT }}
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Forest View"
                onPress={() => selectMapStyle('forest')}
                style={{ position: 'absolute', top: TOGGLE_SPLIT, left: 0, right: 0, bottom: 0 }}
              />
            </View>
          </View>

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
                    {/* distance pill → walks you there, same as the shout-out list's sign icon */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => requireAvailable(() => {
                        const peer = popupUser;
                        setOpenerUser(peer);
                        enterDirections(peer);
                      })}
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
                    onPress={() => requireAvailable(() => {
                      handleViewProfile(popupUser);
                      setPopupUser(null);
                    }, LOCKED_PROFILE)}
                    style={{ backgroundColor: COLORS.accentCoral, padding: 14, borderRadius: 100, marginTop: 12, alignItems: 'center' }}>
                    <Text style={{ color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 15 }}>View Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            );
          })()}

          {/* ── SHOUTOUT DRAWER ── */}
          {mode === 'shoutout' && (
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.cream, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 2, borderColor: COLORS.keylinePurple, paddingTop: 12, paddingBottom: 16 + drawerPadBottom, zIndex: 20 }}>
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
                    {/* avatar → profile */}
                    <TouchableOpacity onPress={() => handleViewProfile(u)} activeOpacity={0.85}>
                      <Image source={{ uri: u.photo }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12, marginTop: 2, borderWidth: 1.5, borderColor: COLORS.keylinePurple }} />
                    </TouchableOpacity>
                    {/* the shout itself → profile */}
                    <TouchableOpacity
                      onPress={() => handleViewProfile(u)}
                      activeOpacity={0.85}
                      style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontSize: 14, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, marginRight: 6 }}>{u.name}</Text>
                        <Text style={{ fontSize: 12, color: '#999', fontFamily: 'PlusJakartaSans_400Regular' }}>{u.year} · {u.distance} · {u.timeAgo}</Text>
                      </View>
                      <Text style={{ fontSize: 14, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 20 }}>{u.shout}</Text>
                    </TouchableOpacity>
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

          {/* ── ICEBREAKERS BOTTOM SHEET ── */}
          {mode === 'openers' && openerUser && (() => {
            const peer = openerUser as any;
            const photoUri = peer.photoUri ?? peer.photo;
            const fallbackColor = peer.avatarColor ?? peer.color ?? COLORS.accentCoral;
            const distanceLabel = peer.distance ?? '';
            const iceBreakers: string[] = Array.isArray(peer.iceBreakers) ? peer.iceBreakers : [];
            return (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.cream, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 2, borderColor: COLORS.keylinePurple, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 20 + drawerPadBottom, zIndex: 20 }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
                  {/* avatar → opens the full profile */}
                  <TouchableOpacity onPress={() => handleViewProfile(peer)} activeOpacity={0.85}>
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12, borderWidth: 2, borderColor: COLORS.keylinePurple }} />
                    ) : (
                      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: fallbackColor, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 2, borderColor: COLORS.keylinePurple }}>
                        <Text style={{ color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 18 }}>{peer.name.charAt(0)}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>{peer.name}</Text>
                    <Text style={{ fontSize: 13, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 }}>
                      {peer.year} · {peer.major}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 4 }}>
                      {visible ? `📍 ${distanceFromYou(distanceLabel)}` : `${LOCKED} Distance`}
                    </Text>
                  </View>
                  {/* drawer toggles — icebreakers is the one you're in */}
                  <TouchableOpacity
                    onPress={() => requireAvailable(() => enterDirections(openerUser))}
                    activeOpacity={0.85}
                    style={[toggleButton(false), { marginRight: 8 }] as any}>
                    <DirectionSignIcon size={24} />
                  </TouchableOpacity>
                  <View style={[toggleButton(true), { marginRight: 8 }] as any}>
                    <Image source={ICONS.iceBreaker} style={toggleGlyph(true)} resizeMode="contain" />
                  </View>
                  <TouchableOpacity onPress={() => { setMode('default'); setOpenerUser(null); }} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18, color: '#999' }}>✕</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 13, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple, letterSpacing: 1, marginBottom: 10 }}>ICEBREAKERS</Text>
                {iceBreakers.map((breaker, i) => (
                  <TouchableOpacity key={i} activeOpacity={0.75}
                    style={{ backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: COLORS.keylinePurple, borderRadius: 12, padding: 14, marginBottom: 10 }}>
                    {/* the opener, not the raw fact — the fact itself lives on their profile */}
                    <Text style={{ fontSize: 14, color: COLORS.keylinePurple, fontFamily: 'PlusJakartaSans_400Regular', lineHeight: 22 }}>{starterFrom(breaker, i, peer.name)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })()}

          {/* ── DIRECTIONS BOTTOM SHEET ── */}
          {(mode === 'directions' || mode === 'navigating') && (() => {
            const peer = openerUser as any;
            const photoUri = peer?.photoUri ?? peer?.photo;
            const fallbackColor = peer?.avatarColor ?? peer?.color ?? COLORS.accentCoral;
            const distanceLabel = peer?.distance ?? '';
            const isNavigating = mode === 'navigating';
            // TEMP DIAGNOSTIC — console.log so it lands in the Metro log without
            // throwing a LogBox overlay over the drawer being inspected.
            console.log(
              '[dbg] directions drawer:',
              JSON.stringify({
                visible,
                rawDistance: peer?.distance ?? null,
                rendered: distanceFromYou(distanceLabel),
                hasLatLng: !!(peer?.lat && peer?.lng),
              })
            );
            return (
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLORS.cream, borderTopLeftRadius: 20, borderTopRightRadius: 20, borderWidth: 2, borderColor: COLORS.keylinePurple, paddingTop: 12, paddingHorizontal: 20, paddingBottom: 20 + drawerPadBottom, zIndex: 20 }}>
                <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
                {openerUser && (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
                    {/* avatar → opens the full profile */}
                    <TouchableOpacity onPress={() => handleViewProfile(peer)} activeOpacity={0.85}>
                      {photoUri ? (
                        <Image source={{ uri: photoUri }} style={{ width: 56, height: 56, borderRadius: 28, marginRight: 12, borderWidth: 2, borderColor: COLORS.keylinePurple }} />
                      ) : (
                        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: fallbackColor, alignItems: 'center', justifyContent: 'center', marginRight: 12, borderWidth: 2, borderColor: COLORS.keylinePurple }}>
                          <Text style={{ color: '#FFFFFF', fontFamily: 'Fredoka_700Bold', fontSize: 18 }}>{peer.name.charAt(0)}</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 20, fontFamily: 'Fredoka_700Bold', color: COLORS.keylinePurple }}>{peer.name}</Text>
                      <Text style={{ fontSize: 13, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 2 }}>
                        {peer.year} · {peer.major}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#666', fontFamily: 'PlusJakartaSans_400Regular', marginTop: 4 }}>
                        {visible ? `📍 ${distanceFromYou(distanceLabel)}` : `${LOCKED} Distance`}
                      </Text>
                      {routeInfo && (
                        <Text style={{ fontSize: 13, color: COLORS.accentCoral, fontFamily: 'Fredoka_700Bold', marginTop: 4 }}>
                          {routeInfo.duration.toFixed(0)} min walk · {(routeInfo.distance * 1000).toFixed(0)}m
                        </Text>
                      )}
                    </View>
                    {/* drawer toggles — directions is the one you're in */}
                    <View style={[toggleButton(true), { marginRight: 8 }] as any}>
                      <DirectionSignIcon size={24} inverted />
                    </View>
                    <TouchableOpacity
                      onPress={() => setMode('openers')}
                      activeOpacity={0.85}
                      style={[toggleButton(false), { marginRight: 8 }] as any}>
                      <Image source={ICONS.iceBreaker} style={toggleGlyph(false)} resizeMode="contain" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={closeDirections} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 22, color: '#999' }}>×</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <TouchableOpacity
                    onPress={() => (isNavigating ? stopNavigating(peer) : startNavigating(peer))}
                    style={{
                      flex: 1, height: 52, borderRadius: 100,
                      backgroundColor: isNavigating ? COLORS.keylinePurple : COLORS.accentCoral,
                      borderWidth: 2.5, borderColor: COLORS.keylinePurple,
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                      boxShadow: '3px 3px 0px rgba(32,22,66,0.18)',
                    } as any}>
                    <Text style={{ fontSize: 16, color: '#FFFFFF' }}>{isNavigating ? '■' : '▲'}</Text>
                    <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>{isNavigating ? 'Stop' : 'Start'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, height: 52, borderRadius: 100, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: COLORS.keylinePurple, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 16 }}>☰</Text>
                    <Text style={{ color: COLORS.keylinePurple, fontSize: 15, fontFamily: 'Fredoka_700Bold' }}>Steps</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}

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
