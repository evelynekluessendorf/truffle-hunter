import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const user = route.params?.user;

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingTop: insets.top + 8, paddingHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ fontSize: 16, color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>

        {/* Photo — centered rounded square */}
        <View style={{ alignItems: 'center', marginBottom: 16 }}>
          {user?.photo ? (
            <Image source={{ uri: user.photo }} style={{ width: 160, height: 160, borderRadius: 20 }} />
          ) : (
            <View style={{ width: 160, height: 160, borderRadius: 20, backgroundColor: '#EF4514', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 48, fontWeight: '700', color: '#FFFFFF' }}>{user?.name?.[0]}</Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 24 }}>
          {/* Name */}
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#000000', marginBottom: 4 }}>{user?.name}</Text>

          {/* Conversations */}
          <Text style={{ fontSize: 14, marginBottom: 6 }}>
            <Text style={{ fontWeight: '700', color: '#000FE1' }}>27 conversations</Text>
            <Text style={{ color: '#555555' }}> in the last 30 days</Text>
          </Text>

          {/* Year + Major */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 4 }}>
            <Text style={{ fontSize: 13, color: '#888888' }}>🎓 {user?.year}</Text>
            <Text style={{ fontSize: 13, color: '#888888' }}>🎓 {user?.major}</Text>
          </View>

          {/* Distance */}
          <Text style={{ fontSize: 13, color: '#EF4514', marginBottom: 24 }}>📍 {user?.distance} from you</Text>

          {/* Ice Breakers */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5, marginBottom: 16 }}>ICE BREAKERS</Text>
          {(user?.facts || []).map((fact: string, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 16 }}>
              <Text style={{ fontSize: 16, color: '#8888CC', marginRight: 10, marginTop: 2 }}>·</Text>
              <Text style={{ flex: 1, fontSize: 15, color: '#111111', lineHeight: 24 }}>{fact}</Text>
            </View>
          ))}

          {/* Interests */}
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#000000', letterSpacing: 1.5, marginTop: 8, marginBottom: 16 }}>INTERESTS</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {(user?.interests || ['🏛️ Politics', '📚 Reading', '☕ Coffee', '🎙️ Podcasts', '✏️ Writing', '🎭 Theatre']).map((interest: string, i: number) => (
              <View key={i} style={{ backgroundColor: '#EEF0FB', borderRadius: 100, paddingHorizontal: 14, paddingVertical: 8 }}>
                <Text style={{ fontSize: 13, color: '#000FE1', fontWeight: '500' }}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* CTA — Say Hi */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: insets.bottom + 8, backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ height: 56, borderRadius: 12, backgroundColor: '#000FE1', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>Say Hi!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
