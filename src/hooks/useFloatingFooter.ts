import { useRef, useEffect } from 'react';
import { Animated, Keyboard, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useFloatingFooter() {
  const insets = useSafeAreaInsets();
  const footerBottom = useRef(new Animated.Value(insets.bottom)).current;

  useEffect(() => {
    footerBottom.setValue(insets.bottom);

    const onShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      e => Animated.timing(footerBottom, {
        toValue: e.endCoordinates.height + 16,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: false,
      }).start(),
    );
    const onHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      e => Animated.timing(footerBottom, {
        toValue: insets.bottom,
        duration: Platform.OS === 'ios' ? e.duration : 200,
        useNativeDriver: false,
      }).start(),
    );
    return () => { onShow.remove(); onHide.remove(); };
  }, [insets.bottom]);

  return footerBottom;
}
