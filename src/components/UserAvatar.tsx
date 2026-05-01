import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  name: string;
  color: string;
  size?: number;
  photoUri?: string;
  showBadge?: boolean;
  badgeCount?: number;
}

export default function UserAvatar({ name, color, size = 40, photoUri, showBadge, badgeCount }: Props) {
  const initial = name.charAt(0).toUpperCase();
  const fontSize = size * 0.4;

  return (
    <View style={{ width: size, height: size }}>
      {photoUri ? (
        <Image source={{ uri: photoUri }} style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} />
      ) : (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: color }]}>
          <Text style={[styles.initial, { fontSize }]}>{initial}</Text>
        </View>
      )}
      {showBadge && badgeCount !== undefined && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeCount}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: Colors.white,
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.orange,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  badgeText: {
    color: Colors.white,
    fontSize: 9,
    fontWeight: '700',
    paddingHorizontal: 2,
  },
});
