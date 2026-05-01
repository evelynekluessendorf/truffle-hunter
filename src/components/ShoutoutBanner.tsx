import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Spacing } from '../constants/theme';
import UserAvatar from './UserAvatar';
import { Shoutout } from '../types';

interface Props {
  shoutout: Shoutout;
}

export default function ShoutoutBanner({ shoutout }: Props) {
  return (
    <View style={styles.container}>
      <View>
        <UserAvatar name={shoutout.authorName} color={shoutout.authorColor} size={36} />
        <View style={styles.megaphoneBadge}>
          <Text style={styles.megaphoneIcon}>📣</Text>
        </View>
      </View>
      <View style={styles.content}>
        <Text style={styles.header}>
          <Text style={styles.bold}>{shoutout.authorName}</Text>
          {' · '}{shoutout.authorYear}{' · '}{shoutout.authorMajors}
        </Text>
        <Text style={styles.message}>{shoutout.message}</Text>
        <Text style={styles.meta}>Shout {shoutout.distance} · {shoutout.timeAgo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.shoutouts,
    borderRadius: 12,
    padding: Spacing.card,
    marginHorizontal: Spacing.screen,
    marginBottom: 8,
    gap: 10,
  },
  content: {
    flex: 1,
  },
  header: {
    fontSize: FontSize.caption,
    fontWeight: '400',
    color: Colors.body,
    letterSpacing: LetterSpacing.caption,
    marginBottom: 2,
  },
  bold: {
    fontWeight: '700',
    letterSpacing: LetterSpacing.caption,
  },
  message: {
    fontSize: FontSize.bodySmall,
    fontWeight: '400',
    color: Colors.body,
    lineHeight: 20,
    marginBottom: 4,
  },
  meta: {
    fontSize: FontSize.micro,
    fontWeight: '400',
    color: Colors.muted,
    letterSpacing: LetterSpacing.micro,
  },
  megaphoneBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: Colors.white,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  megaphoneIcon: {
    fontSize: FontSize.micro,
  },
});
