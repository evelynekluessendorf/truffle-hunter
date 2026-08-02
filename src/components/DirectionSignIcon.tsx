import React from 'react';
import { View, Text } from 'react-native';

const KEYLINE_PURPLE = '#201642';

/**
 * Road-sign direction icon — diamond with rounded corners, keyline purple border,
 * turn arrow inside. `inverted` swaps to white for use on dark/coral button fills.
 */
export const DirectionSignIcon = ({
  size = 28,
  inverted = false,
}: {
  size?: number;
  inverted?: boolean;
}) => {
  const d = size * 0.72;
  const border = size * 0.09;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: d,
          height: d,
          borderRadius: size * 0.14,
          borderWidth: border,
          borderColor: inverted ? '#FFFFFF' : KEYLINE_PURPLE,
          backgroundColor: inverted ? 'transparent' : '#FFFFFF',
          transform: [{ rotate: '45deg' }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: size * 0.34,
            fontWeight: '900',
            color: inverted ? '#FFFFFF' : KEYLINE_PURPLE,
            transform: [{ rotate: '-45deg' }],
            lineHeight: size * 0.44,
            textAlign: 'center',
            marginTop: -size * 0.02,
          }}
        >
          ↱
        </Text>
      </View>
    </View>
  );
};

export default DirectionSignIcon;
