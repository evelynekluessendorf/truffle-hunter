import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const POPUP_CARD_HEIGHT = 210;

const USERS = [
  { id: '1', name: 'James', year: 'Sophomore', major: 'Computer Science', distance: '320m', color: '#000FE1', photo: 'https://i.pravatar.cc/150?img=11', lat: 37.7765, lng: -122.4195, facts: ['I can solve a Rubik\'s cube in under 30 seconds.', 'I once ate an entire pizza in under 4 minutes.', 'I have never lost a game of chess against a computer on easy mode.'] },
  { id: '2', name: 'Leo', year: 'Senior', major: 'Music & Business', distance: '210m', color: '#C4A000', photo: 'https://i.pravatar.cc/150?img=12', lat: 37.7770, lng: -122.4185, hasShout: true, shout: 'Anyone taken Prof. Miller before? How\'s the final?', shoutInfo: 'Shout 300m away · 4 min ago.', facts: ['I once won a contest I didn\'t mean to enter.', 'I have been to 14 countries but never left my home continent until this year.', 'I wrote a musical in high school that actually got performed.'] },
  { id: '3', name: 'Millie', year: 'Freshman', major: 'Psychology', distance: '310m', color: '#7B4FBE', photo: 'https://i.pravatar.cc/150?img=13', lat: 37.7758, lng: -122.4200, facts: ['I once ran into my professor at a party and outdanced them.', 'I can identify 40+ bird calls.', 'I have read the full terms and conditions of every app I\'ve downloaded.'] },
  { id: '4', name: 'Paul', year: 'Junior', major: 'Chemistry', distance: '70m', color: '#E03060', photo: 'https://i.pravatar.cc/150?img=14', lat: 37.7762, lng: -122.4188, facts: ['I once woke up in a different country than I fell asleep in.', 'I can solve differential equations in my head.', 'I have never watched a single episode of Friends.'] },
];

type Mode = 'none' | 'popup' | 'openers' | 'directions' | 'shoutout';

export default function DiscoverScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'map' | 'list'>('map');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [mode, setMode] = useState<Mode>('none');
  const [popupTop, setPopupTop] = useState<number | null>(null);
  const mapRef = useRef<MapView>(null);

  const handleMarkerPress = async (user: any) => {
    setSelectedUser(user);
    setMode('popup');
    if (mapRef.current) {
      const point = await (mapRef.current as any).pointForCoordinate({ latitude: user.lat, longitude: user.lng });
      // place card above the marker with a 60px gap (marker height + arrow gap)
      const top = Math.max(8, point.y - POPUP_CARD_HEIGHT - 60);
      setPopupTop(top);
    }
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile', { user: selectedUser });
  };

  const handleSayHi = () => {
    setMode('openers');
  };

  const handleDirections = () => {
    setMode('directions');
  };

  const handleShoutoutToggle = () => {
    if (mode === 'none') {
      setMode('shoutout');
    } else if (mode === 'shoutout') {
      setMode('none');
    }
    // Do nothing if popup, openers or directions are open
  };

  const handleClose = () => {
    setSelectedUser(null);
    setMode('none');
    setPopupTop(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, paddingBottom: 12, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 34, fontWeight: '800', color: '#000000', marginBottom: 12 }}>Discover</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', backgroundColor: '#F0F0F0', borderRadius: 100, padding: 3 }}>
            {(['map', 'list'] as const).map(v => (
              <TouchableOpacity key={v} onPress={() => setView(v)} style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100, backgroundColor: view === v ? '#FFFFFF' : 'transparent' }}>
                <Text style={{ fontSize: 14, fontWeight: view === v ? '700' : '400', color: view === v ? '#111111' : '#888888', textTransform: 'capitalize' }}>{v}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity>
            <Text style={{ fontSize: 22, color: '#888888' }}>⊞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* MAP VIEW */}
      {view === 'map' && (
        <View style={{ flex: 1 }}>
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            initialRegion={{ latitude: 37.7762, longitude: -122.4192, latitudeDelta: 0.008, longitudeDelta: 0.008 }}>

            {/* Current user marker */}
            <Marker coordinate={{ latitude: 37.7762, longitude: -122.4192 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#EF4514', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF' }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>You</Text>
              </View>
            </Marker>

            {/* Other user markers */}
            {USERS.map(user => (
              <Marker key={user.id} coordinate={{ latitude: user.lat, longitude: user.lng }} onPress={() => handleMarkerPress(user)}>
                <View style={{ position: 'relative' }}>
                  <Image source={{ uri: user.photo }} style={{ width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' }} />
                  {user.hasShout && (
                    <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: user.color, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9 }}>🎙</Text>
                    </View>
                  )}
                </View>
              </Marker>
            ))}

            {/* Directions polyline */}
            {mode === 'directions' && selectedUser && (
              <Polyline
                coordinates={[
                  { latitude: 37.7762, longitude: -122.4192 },
                  { latitude: selectedUser.lat, longitude: selectedUser.lng },
                ]}
                strokeColor="#000FE1"
                strokeWidth={3}
                lineDashPattern={[8, 6]}
              />
            )}
          </MapView>

          {/* Megaphone button — disabled when popup/openers/directions active */}
          <TouchableOpacity
            onPress={handleShoutoutToggle}
            style={{ position: 'absolute', top: 16, right: 16, backgroundColor: mode === 'shoutout' ? '#000FE1' : '#FFFFFF', borderRadius: 12, width: 52, height: 52, alignItems: 'center', justifyContent: 'center', elevation: 4, opacity: (mode === 'popup' || mode === 'openers' || mode === 'directions') ? 0.4 : 1 }}>
            <Text style={{ fontSize: 22 }}>📢</Text>
            <View style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: '#EF4514', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '700' }}>3</Text>
            </View>
          </TouchableOpacity>

          {/* SHOUTOUT DRAWER */}
          {mode === 'shoutout' && (
            <View style={{ position: 'absolute', top: 70, right: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, width: 260, elevation: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#000000', marginBottom: 4 }}>Active shoutouts nearby</Text>
              {USERS.filter(u => u.hasShout).map(u => (
                <TouchableOpacity key={u.id} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderTopWidth: 1, borderColor: '#F0F0F0' }}>
                  <Image source={{ uri: u.photo }} style={{ width: 36, height: 36, borderRadius: 18, marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#000FE1' }}>{u.name}</Text>
                    <Text style={{ fontSize: 13, color: '#555555', lineHeight: 18 }}>{u.shout}</Text>
                    <Text style={{ fontSize: 11, color: '#AAAAAA', marginTop: 2 }}>{u.shoutInfo}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* PROFILE POPUP — anchored above the tapped marker */}
          {mode === 'popup' && selectedUser && (
            <View style={{ position: 'absolute', top: popupTop ?? 80, left: 16, right: 16, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Image source={{ uri: selectedUser.photo }} style={{ width: 52, height: 52, borderRadius: 26, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#000FE1' }}>{selectedUser.name}</Text>
                  <Text style={{ fontSize: 13, color: '#888888' }}>{selectedUser.year} · {selectedUser.major}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 13, color: '#8888CC', marginRight: 8 }}>📍 {selectedUser.distance} from you</Text>
                    <TouchableOpacity onPress={handleDirections} style={{ backgroundColor: '#000FE1', borderRadius: 100, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>✈ Directions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={handleClose} style={{ padding: 4 }}>
                  <Text style={{ fontSize: 18, color: '#888888' }}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 14, color: '#555555', fontStyle: 'italic', lineHeight: 22, marginBottom: 12 }}>"{selectedUser.facts[0]}"</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={handleViewProfile} style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1.5, borderColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#000FE1', fontSize: 14, fontWeight: '600' }}>View profile</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSayHi} style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>Say Hi 👋</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* AI OPENERS BOTTOM SHEET */}
          {mode === 'openers' && selectedUser && (
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: insets.bottom + 20, elevation: 12 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Image source={{ uri: selectedUser.photo }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#000000' }}>{selectedUser.name}</Text>
                  <Text style={{ fontSize: 13, color: '#888888' }}>☆ {selectedUser.year}  ⊕ {selectedUser.major}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={{ fontSize: 13, color: '#8888CC', marginRight: 8 }}>📍 {selectedUser.distance} from you</Text>
                    <TouchableOpacity onPress={handleDirections} style={{ backgroundColor: '#000FE1', borderRadius: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14 }}>➡</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <TouchableOpacity onPress={handleViewProfile}>
                  <Text style={{ fontSize: 13, color: '#000FE1', textDecorationLine: 'underline' }}>View profile</Text>
                </TouchableOpacity>
              </View>
              {selectedUser.facts.map((fact: string, i: number) => (
                <TouchableOpacity key={i} style={{ backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                  <Text style={{ fontSize: 14, color: '#333333', lineHeight: 22 }}>{fact}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity onPress={handleClose} style={{ alignItems: 'center', marginTop: 8 }}>
                <Text style={{ fontSize: 14, color: '#888888' }}>Close</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* DIRECTIONS BOTTOM SHEET */}
          {mode === 'directions' && selectedUser && (
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: insets.bottom + 20, elevation: 12 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#DDDDDD', borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                <Image source={{ uri: selectedUser.photo }} style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: '#000000' }}>{selectedUser.name}</Text>
                  <Text style={{ fontSize: 13, color: '#888888' }}>☆ {selectedUser.year}  ⊕ {selectedUser.major}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Text style={{ fontSize: 13, color: '#8888CC', marginRight: 8 }}>📍 {selectedUser.distance} from you</Text>
                    <View style={{ backgroundColor: '#000FE1', borderRadius: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14 }}>➡</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity style={{ flex: 1, height: 52, borderRadius: 100, backgroundColor: '#000FE1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>▲</Text>
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Start</Text>
                </TouchableOpacity>
                <TouchableOpacity style={{ flex: 1, height: 52, borderRadius: 100, backgroundColor: '#EEF0FB', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 16 }}>☰</Text>
                  <Text style={{ color: '#000FE1', fontSize: 16, fontWeight: '600' }}>Steps</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* LIST VIEW */}
      {view === 'list' && (
        <ScrollView style={{ flex: 1, backgroundColor: '#F5F5F5' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
          {USERS.map(user => (
            <TouchableOpacity key={user.id} onPress={() => navigation.navigate('Profile', { user })}
              style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, borderWidth: user.hasShout ? 1.5 : 1, borderColor: user.hasShout ? '#000FE1' : '#DDDDDD' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <View style={{ position: 'relative', marginRight: 12 }}>
                  <Image source={{ uri: user.photo }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                  {user.hasShout && (
                    <View style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: user.color, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9 }}>🎙</Text>
                    </View>
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  {user.hasShout
                    ? <Text style={{ fontSize: 14, fontWeight: '700', color: '#000FE1' }}>{user.name} - {user.year} - {user.major}</Text>
                    : <><Text style={{ fontSize: 15, fontWeight: '700', color: '#000000' }}>{user.name}</Text>
                       <Text style={{ fontSize: 13, color: '#000FE1' }}>{user.year} - {user.major}</Text></>
                  }
                </View>
                {!user.hasShout && <Text style={{ fontSize: 13, color: '#EF4514' }}>📍 {user.distance} from you</Text>}
              </View>
              {user.hasShout
                ? <><Text style={{ fontSize: 15, color: '#8B5E3C', lineHeight: 22, marginBottom: 4 }}>{user.shout}</Text>
                   <Text style={{ fontSize: 12, color: '#AAAAAA' }}>{user.shoutInfo}</Text></>
                : <Text style={{ fontSize: 14, color: '#555555', fontStyle: 'italic', lineHeight: 22 }}>"{user.facts[0]}"</Text>
              }
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

    </View>
  );
}
