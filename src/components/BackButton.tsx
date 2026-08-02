import React from 'react';
import { TouchableOpacity, Image, StyleProp, ViewStyle } from 'react-native';

const BACK_ICON = require('../assets/icons/back-button.png');

/**
 * Shared circular back button. The PNG is a complete button graphic
 * (outline + arrow + shadow), so it is rendered untinted at a fixed size.
 */
export default function BackButton({
  onPress,
  style,
  size = 44,
}: {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  size?: number;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={style}>
      <Image source={BACK_ICON} style={{ width: size, height: size }} resizeMode="contain" />
    </TouchableOpacity>
  );
}
