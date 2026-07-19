import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Image, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { interestEmojis } from '../data/mockData';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({ route, navigation }: Props) {
  const { user } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>

      {/* BACK */}
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 24 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#000000' }}>{'< Back'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* PHOTO */}
        <View style={{ alignItems: 'center', marginTop: 16, marginBottom: 4 }}>
          {user.photoUri ? (
            <Image
              source={{ uri: user.photoUri }}
              style={{ width: 160, height: 160, borderRadius: 20 }}
            />
          ) : (
            <View style={{
              width: 160, height: 160, borderRadius: 20,
              backgroundColor: '#EF4514',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ fontSize: 64, fontWeight: '700', color: '#FFFFFF' }}>
                {user.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        {/* NAME */}
        <Text style={{
          fontSize: 32, fontWeight: '700', color: '#000000',
          marginTop: 16, paddingHorizontal: 24, marginBottom: 4,
        }}>
          {user.name}
        </Text>

        {/* CONVERSATION COUNT */}
        {user.conversationCount !== undefined && (
          <Text style={{ fontSize: 14, paddingHorizontal: 24, marginBottom: 6 }}>
            <Text style={{ fontWeight: '700', color: '#000FE1' }}>
              {user.conversationCount} conversations
            </Text>
            <Text style={{ fontWeight: '400', color: '#333333' }}> in the last 30 days</Text>
          </Text>
        )}

        {/* YEAR + MAJOR */}
        <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 24, marginBottom: 4 }}>
          <Text style={{ fontSize: 13, color: '#888888' }}>⊙ {user.year}</Text>
          <Text style={{ fontSize: 13, color: '#888888' }}>⊕ {user.major}</Text>
        </View>

        {/* DISTANCE */}
        {user.distance && (
          <Text style={{ fontSize: 13, color: '#EF4514', paddingHorizontal: 24, marginBottom: 4 }}>
            📍 {user.distance}
          </Text>
        )}

        {/* ICE BREAKERS */}
        <Text style={{
          fontSize: 11, fontWeight: '700', color: '#000000',
          letterSpacing: 1.5, paddingHorizontal: 24, marginTop: 20, marginBottom: 12,
        }}>
          ICE BREAKERS
        </Text>
        {user.iceBreakers.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: 24, marginBottom: 16 }}>
            <Text style={{ fontSize: 16, color: 'rgba(0,14,225,0.45)', lineHeight: 24, marginTop: 1 }}>·</Text>
            <Text style={{ flex: 1, fontSize: 15, fontWeight: '400', color: '#000000', lineHeight: 24 }}>
              {item}
            </Text>
          </View>
        ))}

        {/* INTERESTS */}
        {user.interests.length > 0 && (
          <>
            <Text style={{
              fontSize: 11, fontWeight: '700', color: '#000000',
              letterSpacing: 1.5, paddingHorizontal: 24, marginTop: 20, marginBottom: 12,
            }}>
              INTERESTS
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 24 }}>
              {user.interests.map(tag => (
                <View key={tag} style={{
                  backgroundColor: '#F0F1FA',
                  borderRadius: 100,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}>
                  <Text style={{ fontSize: 13, color: '#000FE1', fontWeight: '500' }}>
                    {interestEmojis[tag] || '✨'} {tag}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* SOCIAL */}
        {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
          <>
            <Text style={{
              fontSize: 11, fontWeight: '700', color: '#000000',
              letterSpacing: 1.5, paddingHorizontal: 24, marginTop: 20, marginBottom: 12,
            }}>
              SOCIAL
            </Text>
            <View style={{ paddingHorizontal: 24, gap: 10 }}>
              {user.socialLinks.instagram && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                  onPress={() => Linking.openURL(`https://instagram.com/${user.socialLinks!.instagram}`)}
                >
                  <Text style={{ fontSize: 16 }}>📸</Text>
                  <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#000FE1' }}>
                    @{user.socialLinks.instagram}
                  </Text>
                  <Text style={{ fontSize: 20, color: '#888888' }}>›</Text>
                </TouchableOpacity>
              )}
              {user.socialLinks.tiktok && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                  onPress={() => Linking.openURL(`https://tiktok.com/@${user.socialLinks!.tiktok}`)}
                >
                  <Text style={{ fontSize: 16 }}>🎵</Text>
                  <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#000FE1' }}>
                    @{user.socialLinks.tiktok}
                  </Text>
                  <Text style={{ fontSize: 20, color: '#888888' }}>›</Text>
                </TouchableOpacity>
              )}
              {user.socialLinks.facebook && (
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                  onPress={() => Linking.openURL(`https://facebook.com/${user.socialLinks!.facebook}`)}
                >
                  <Text style={{ fontSize: 16 }}>👤</Text>
                  <Text style={{ flex: 1, fontSize: 16, fontWeight: '600', color: '#000FE1' }}>
                    @{user.socialLinks.facebook}
                  </Text>
                  <Text style={{ fontSize: 20, color: '#888888' }}>›</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}

      </ScrollView>

      {/* CTA */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: insets.bottom + 8,
        backgroundColor: '#FFFFFF',
      }}>
        <TouchableOpacity
          style={{
            height: 56,
            backgroundColor: '#000FE1',
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPress={() => navigation.navigate('Main' as any, { screen: 'Discover', params: { openOpeners: true, user: route.params?.user } } as any)}
          activeOpacity={0.85}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>Say Hi!</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}
