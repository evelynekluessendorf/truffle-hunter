import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Radius } from '../constants/theme';
import { User } from '../types';

interface Props {
  user: User;
  onViewProfile: () => void;
  onDismiss: () => void;
  onNavigate?: () => void;
}

export default function MapProfileCard({ user, onViewProfile, onDismiss, onNavigate }: Props) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.closeBtn} onPress={onDismiss} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <View style={[styles.photoWrap, { borderColor: user.avatarColor }]}>
          {user.photoUri ? (
            <Image source={{ uri: user.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photoFallback, { backgroundColor: user.avatarColor }]}>
              <Text style={styles.initial}>{user.name.charAt(0)}</Text>
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
          <Text style={styles.sub} numberOfLines={1}>{user.year} · {user.major}</Text>
          {user.distance && (
            <View style={styles.distanceRow}>
              <Text style={styles.distance}>{user.distance}</Text>
              {onNavigate && (
                <TouchableOpacity onPress={onNavigate} style={styles.navBtn} activeOpacity={0.75}>
                  <Ionicons name="navigate" size={11} color={Colors.white} />
                  <Text style={styles.navBtnText}>Directions</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <Text style={styles.quote} numberOfLines={3}>"{user.iceBreakers[0]}"</Text>

      <TouchableOpacity style={styles.btn} onPress={onViewProfile} activeOpacity={0.85}>
        <Text style={styles.btnText}>View profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
    padding: 4,
  },
  closeText: {
    fontSize: FontSize.bodySmall,
    color: Colors.muted,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: 24,
    marginBottom: 10,
  },
  photoWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    overflow: 'hidden',
    flexShrink: 0,
  },
  photo: { width: '100%', height: '100%' },
  photoFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { color: Colors.white, fontWeight: '700', fontSize: FontSize.body },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: FontSize.bodySmall,
    fontWeight: '700',
    color: Colors.brand,
    letterSpacing: LetterSpacing.body,
  },
  sub: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    letterSpacing: LetterSpacing.caption,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  distance: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.muted,
    letterSpacing: LetterSpacing.caption,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.brand,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  navBtnText: {
    fontSize: FontSize.micro,
    fontWeight: '600',
    color: Colors.white,
    includeFontPadding: false,
  },
  quote: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.body,
    fontStyle: 'italic',
    lineHeight: 20,
    marginBottom: 14,
  },
  btn: {
    height: 42,
    backgroundColor: Colors.brand,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: FontSize.body,
    includeFontPadding: false,
  },
});
