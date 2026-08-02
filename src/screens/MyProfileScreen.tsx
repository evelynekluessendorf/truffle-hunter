import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import ProfileView from '../components/ProfileView';
import { MOCK_PROFILES } from '../data/mockProfiles';

export default function MyProfileScreen({ navigation }: any) {
  const { registrationDraft, conversationCount } = useUser();

  // DEV ONLY — tap the profile name 3× to cycle Amy → Marcus → Sophie → Amy.
  // Remove this (and onTripleTapName below) once the real API is wired up.
  const [mockIndex, setMockIndex] = useState(0);
  const mock = MOCK_PROFILES[mockIndex];

  // Real registration data wins; the mock profile fills any gaps so the
  // screen is demoable before onboarding has been completed.
  const facts = registrationDraft.facts.filter(f => f.trim().length > 0);
  const socials = Object.fromEntries(
    Object.entries(registrationDraft.social).filter(([, v]) => v.trim().length > 0)
  );

  const profile = {
    profilePhoto: registrationDraft.photoUri ? { uri: registrationDraft.photoUri } : mock.profilePhoto,
    name: registrationDraft.displayedName || mock.name,
    year: registrationDraft.year || mock.year,
    major: registrationDraft.major || mock.major,
    recentInteractions: mock.recentInteractions,
    // Mock wins so the dev switcher visibly changes the count (7 / 23 / 42);
    // swap to `conversationCount` once real per-user data exists.
    convoCount: mock.convoCount,
    daySpan: 30,
    interests: registrationDraft.selectedInterests.length
      ? registrationDraft.selectedInterests
      : mock.interests,
    icebreakers: facts.length ? facts : mock.icebreakers,
    socialMedia: Object.keys(socials).length ? socials : mock.socialMedia,
  };

  return (
    <ProfileView
      profile={profile}
      isOwner
      onBack={() => navigation.canGoBack() && navigation.goBack()}
      // Edit re-enters the profile-building flow; those screens write straight
      // back into the shared registration draft this screen reads from.
      onEdit={() => navigation.navigate('Registration4')}
      onSave={() => {
        // TODO: persist to API. Edits currently save themselves into UserContext
        // as they're made in the registration screens, so nothing to flush yet.
      }}
      onTripleTapName={() => setMockIndex(i => (i + 1) % MOCK_PROFILES.length)}
    />
  );
}
