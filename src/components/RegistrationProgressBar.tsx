import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/theme';

const TOTAL_STEPS = 6;

export default function RegistrationProgressBar({ step }: { step: number }) {
  const progress = (step + 1) / TOTAL_STEPS;
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${progress * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 3,
    marginHorizontal: Spacing.screen,
    marginTop: 16,
    marginBottom: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.orange,
    borderRadius: 3,
  },
});
