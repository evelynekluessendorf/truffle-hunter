import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { User } from '../types';

interface Props {
  user: User;
  onViewProfile: () => void;
  onDismiss: () => void;
  onNavigate?: () => void;
}

export default function MapProfileCard({ user, onViewProfile, onDismiss, onNavigate }: Props) {
  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
      elevation: 4,
    }}>
      {/* Dismiss */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 12, right: 12, zIndex: 1, padding: 4 }}
        onPress={onDismiss}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
      >
        <Text style={{ fontSize: 14, color: '#AAAAAA' }}>✕</Text>
      </TouchableOpacity>

      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 24, marginBottom: 4 }}>
        {/* Avatar */}
        <View style={{ width: 52, height: 52, borderRadius: 26, overflow: 'hidden', flexShrink: 0 }}>
          {user.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={{ width: '100%', height: '100%' }} />
          ) : (
            <View style={{ width: '100%', height: '100%', backgroundColor: user.avatarColor, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>{user.name.charAt(0)}</Text>
            </View>
          )}
        </View>

        {/* Name + meta */}
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: '#000FE1' }} numberOfLines={1}>
            {user.name}
          </Text>
          <Text style={{ fontSize: 13, color: '#888888' }} numberOfLines={1}>
            {user.year} · {user.major}
          </Text>
          {user.distance && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <Text style={{ fontSize: 12, color: '#8888CC' }}>{user.distance}</Text>
              {onNavigate && (
                <TouchableOpacity
                  onPress={onNavigate}
                  activeOpacity={0.75}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 3,
                    backgroundColor: '#000FE1', borderRadius: 100,
                    paddingHorizontal: 10, paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#FFFFFF' }}>✈</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#FFFFFF' }}>Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Quote */}
      <Text style={{ fontSize: 14, color: '#888888', fontStyle: 'italic', lineHeight: 22, marginBottom: 14, marginTop: 8 }} numberOfLines={3}>
        "{user.iceBreakers[0]}"
      </Text>

      {/* View profile button */}
      <TouchableOpacity
        style={{ height: 48, backgroundColor: '#000FE1', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
        onPress={onViewProfile}
        activeOpacity={0.85}
      >
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 16 }}>View profile</Text>
      </TouchableOpacity>
    </View>
  );
}
