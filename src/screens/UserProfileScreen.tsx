import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import ProfileView from '../components/ProfileView';
import { DEFAULT_PROFILE, heroUrl, socialsFor } from '../data/mockProfiles';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'UserProfile'>;

export default function UserProfileScreen({ route, navigation }: Props) {
  const { user } = route.params;

  const realSocials = Object.fromEntries(
    Object.entries(user.socialLinks ?? {}).filter(
      ([, v]) => typeof v === 'string' && v.trim().length > 0
    )
  );

  const profile = {
    // Map pins carry a 150px thumbnail — upscale the same photo for the hero.
    profilePhoto: user.photoUri ? { uri: heroUrl(user.photoUri) } : null,
    name: user.name,
    year: user.year ?? '',
    major: user.major ?? '',
    // MOCK — no real interaction history yet; reuse the shared 5-avatar ring.
    recentInteractions: DEFAULT_PROFILE.recentInteractions,
    convoCount: user.conversationCount ?? 6,
    daySpan: 30,
    interests: user.interests ?? [],
    icebreakers: user.iceBreakers ?? [],
    // Map-sourced users carry no socialLinks yet, so fall back to generated
    // handles — the socials section must render on every profile.
    socialMedia: Object.keys(realSocials).length ? realSocials : socialsFor(user.name),
  };

  return (
    <ProfileView
      profile={profile}
      isOwner={false}
      onBack={() => navigation.goBack()}
      // Preserved verbatim from the previous implementation: hands the user back
      // to the map with the openers sheet primed for this person.
      onSayHi={() =>
        navigation.navigate('Main', {
          screen: 'Discover',
          params: { openOpeners: true, user: route.params?.user },
        })
      }
    />
  );
}
