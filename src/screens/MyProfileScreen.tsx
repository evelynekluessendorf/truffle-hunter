import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MyProfileScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>

        {/* Photo with edit button */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          <View style={{ position: 'relative' }}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/300?img=5' }}
              style={{ width: 160, height: 160, borderRadius: 20 }}
            />
            <TouchableOpacity style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#000000', marginBottom: 4 }}>Hanah</Text>

          <Text style={{ fontSize: 14, marginBottom: 6 }}>
            <Text style={{ fontWeight: '700', color: '#000FE1' }}>27 conversations</Text>
            <Text style={{ color: '#555555' }}> in the last 30 days</Text>
          </Text>

          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: '#888888' }}>🎓 Senior</Text>
            <Text style={{ fontSize: 13, color: '#888888' }}>🎓 Law</Text>
          </View>
          <Text style={{ fontSize: 13, color: '#EF4514', marginBottom: 24 }}>📍 180m from you</Text>

          {/* Ice Breakers with edit */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5 }}>ICE BREAKERS</Text>
            <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          {[
            'I won a national debate championship at 16 arguing a position I personally disagreed with. I still won',
            'I interned at a Supreme Court justice office last summer and was not allowed to talk about a single thing I saw',
            'I have read the full terms and conditions of every app I\'ve downloaded. I have declined three of them on principle',
            'I argue both sides of every issue at dinner just to see what happens. My family now eats in shifts',
          ].map((fact, i) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#8888CC', marginRight: 10, marginTop: 2 }}>·</Text>
              <Text style={{ flex: 1, fontSize: 15, color: '#111111', lineHeight: 24 }}>{fact}</Text>
            </View>
          ))}

          {/* Interests with edit */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5 }}>INTERESTS</Text>
            <TouchableOpacity style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 14 }}>✏️</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {['🏛️ Politics', '📚 Reading', '☕ Coffee', '🎙️ Podcasts', '✏️ Writing', '🎭 Theatre'].map((interest, i) => (
              <View key={i} style={{ backgroundColor: '#EEF0FB', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ fontSize: 13, color: '#000FE1', fontWeight: '500' }}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
