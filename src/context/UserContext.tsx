import React, { createContext, useContext, useState } from 'react';
import { User, SocialLinks } from '../types';
import { currentUser } from '../data/mockData';

interface UserProfile {
  firstName: string;
}

interface RegistrationDraft {
  email: string;
  photoUri: string | null;
  displayedName: string;
  year: string | null;
  major: string | null;
  facts: string[];
  social: { instagram: string; tiktok: string; facebook: string };
  selectedInterests: string[];
}

interface ActiveShout {
  text: string;
  people: number;
}

interface UserContextType {
  profile: UserProfile;
  setFirstName: (name: string) => void;
  registrationDraft: RegistrationDraft;
  setRegistrationDraft: (draft: Partial<RegistrationDraft>) => void;
  visible: boolean;
  setVisible: (v: boolean) => void;
  activeShout: ActiveShout | null;
  setActiveShout: (shout: ActiveShout | null) => void;
  pendingMeetingUser: User | null;
  setPendingMeetingUser: (user: User | null) => void;
  conversationCount: number;
  incrementConversationCount: () => void;
  iceBreakers: string[];
  setIceBreakers: (items: string[]) => void;
  interests: string[];
  setInterests: (items: string[]) => void;
  socialLinks: SocialLinks;
  setSocialLinks: (links: SocialLinks) => void;
}

const DEFAULT_DRAFT: RegistrationDraft = {
  email: '',
  photoUri: null,
  displayedName: '',
  year: null,
  major: null,
  facts: ['', '', ''],
  social: { instagram: '', tiktok: '', facebook: '' },
  selectedInterests: [],
};

const UserContext = createContext<UserContextType>({
  profile: { firstName: 'Maya' },
  setFirstName: () => {},
  registrationDraft: DEFAULT_DRAFT,
  setRegistrationDraft: () => {},
  visible: false,
  setVisible: () => {},
  activeShout: null,
  setActiveShout: () => {},
  pendingMeetingUser: null,
  setPendingMeetingUser: () => {},
  conversationCount: currentUser.conversationCount ?? 7,
  incrementConversationCount: () => {},
  iceBreakers: currentUser.iceBreakers,
  setIceBreakers: () => {},
  interests: currentUser.interests,
  setInterests: () => {},
  socialLinks: currentUser.socialLinks ?? {},
  setSocialLinks: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({ firstName: 'Maya' });
  const [registrationDraft, setDraft] = useState<RegistrationDraft>(DEFAULT_DRAFT);
  const setRegistrationDraft = (partial: Partial<RegistrationDraft>) =>
    setDraft(prev => ({ ...prev, ...partial }));
  const [visible, setVisible] = useState(false);
  const [activeShout, setActiveShout] = useState<ActiveShout | null>(null);
  const [pendingMeetingUser, setPendingMeetingUser] = useState<User | null>(null);
  const [conversationCount, setConversationCount] = useState(currentUser.conversationCount ?? 7);
  const [iceBreakers, setIceBreakers] = useState<string[]>(currentUser.iceBreakers);
  const [interests, setInterests] = useState<string[]>(currentUser.interests);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(currentUser.socialLinks ?? {});

  const setFirstName = (firstName: string) =>
    setProfile(prev => ({ ...prev, firstName }));

  const incrementConversationCount = () =>
    setConversationCount(n => n + 1);

  return (
    <UserContext.Provider value={{
      profile, setFirstName,
      registrationDraft, setRegistrationDraft,
      visible, setVisible,
      activeShout, setActiveShout,
      pendingMeetingUser, setPendingMeetingUser,
      conversationCount, incrementConversationCount,
      iceBreakers, setIceBreakers,
      interests, setInterests,
      socialLinks, setSocialLinks,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
