import type { NavigatorScreenParams } from '@react-navigation/native';

export interface SocialLinks {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

export interface User {
  id: string;
  name: string;
  year: string;
  major: string;
  iceBreakers: string[];
  interests: string[];
  openers: string[];
  avatarColor: string;
  photoUri?: string;
  conversationCount?: number;
  distance?: string;
  latitude?: number;
  longitude?: number;
  socialLinks?: SocialLinks;
}

export interface Shoutout {
  id: string;
  authorName: string;
  authorYear: string;
  authorMajors: string;
  authorColor: string;
  message: string;
  distance: string;
  timeAgo: string;
}

export type RootTabParamList = {
  Home: undefined;
  Discover: { openOpeners?: boolean; user?: User; sendoffUser?: User; sayHiUser?: User } | undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  About: undefined;
  Settings: undefined;
  RegistrationConfirmation: undefined;
  Registration1: { mode?: 'login' | 'register' };
  RegistrationVerification: { mode?: 'login' };
  Registration2: { mode?: 'login' } | undefined;
  Registration3: { isEditing?: boolean } | undefined;
  Registration4: undefined;
  Registration5: undefined;
  RegistrationFacts: { isEditing?: boolean } | undefined;
  RegistrationInterests: { isEditing?: boolean } | undefined;
  ShoutOut: undefined;
  Opener: { user: User };
  Login: undefined;
  // Nested so callers can target a specific tab, e.g. navigate('Main', { screen: 'Home' }).
  Main: NavigatorScreenParams<RootTabParamList> | undefined;
  UserProfile: { user: User };
  MeetingSheet: { user: User };
};
