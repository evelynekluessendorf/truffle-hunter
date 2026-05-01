import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { FontSize, LetterSpacing, Radius } from '../constants/theme';
import { interestEmojis } from '../data/mockData';

interface Props {
  label: string;
  onPress?: () => void;
}

export default function InterestTag({ label, onPress }: Props) {
  const emoji = interestEmojis[label] || '✨';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <View style={styles.tag}>
        <Text style={styles.text}>{emoji} {label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.selected,
    borderRadius: Radius.tag,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    fontSize: FontSize.caption,
    color: Colors.brand,
    fontWeight: '500',
    letterSpacing: LetterSpacing.caption,
  },
});
