import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useUser } from '../context/UserContext';
import { ColorPrimitives } from '../theme/tokens';
import { AvailabilityToggle } from '../components/AvailabilityToggle';

const hardShadow = `3px 3px 0px ${ColorPrimitives.keylinePurple}2E`;

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { registrationDraft, setActiveShout } = useUser();
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = async () => {
    if (!isVisible) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsVisible(!isVisible);
  };

  return (
    <AvailabilityToggle
      onViewMap={() => navigation.navigate('Discover')}
      onSettingsPress={() => navigation.navigate('Settings')}
      onShoutPress={() => navigation.navigate('ShoutOut')}
      onWithdrawShout={() => setActiveShout(null)}
    />
  );
}
